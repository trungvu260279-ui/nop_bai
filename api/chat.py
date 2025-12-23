from flask import Flask, request, jsonify, Response
import google.generativeai as genai
import os
from dotenv import load_dotenv
import time
from collections import OrderedDict
import faiss
import pickle
import numpy as np

# Tải biến môi trường
load_dotenv()

app = Flask(__name__)

# --- CẤU HÌNH TỐI ƯU ---

# 1. Bộ nhớ đệm (Cache) để lưu các câu trả lời đã có
# Dùng OrderedDict để dễ dàng quản lý và xóa entry cũ nhất (LRU Cache)
response_cache = OrderedDict()
CACHE_MAX_SIZE = 100

# 2. Rate Limiting để chống spam
request_history = {}
RATE_LIMIT = 15  # Số request tối đa
WINDOW_MS = 60 * 1000  # Trong 1 phút (60,000 ms)

# 3. Lấy danh sách API keys, cho phép xoay vòng nếu 1 key bị lỗi
# Vercel sẽ đọc biến môi trường này. Ở local, nó sẽ đọc từ file .env
GEMINI_API_KEYS = [key.strip() for key in (os.getenv("GEMINI_API_KEY") or "").split(',') if key.strip()]

# --- 4. TẢI DATABASE VECTOR (FAISS) ---
try:
    # Vercel sẽ copy các file này vào /var/task/ khi build
    # Cần đảm bảo các file này nằm ở thư mục gốc của dự án
    current_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(current_dir, '..', 'luat_vn.index')
    pkl_path = os.path.join(current_dir, '..', 'luat_vn.pkl')
    
    faiss_index = faiss.read_index(index_path)
    with open(pkl_path, "rb") as f:
        faiss_documents = pickle.load(f)
    print("✅ Đã tải thành công FAISS index và documents.")
except Exception as e:
    faiss_index = None
    faiss_documents = None
    print(f"⚠️ Lỗi khi tải FAISS index: {e}. Chức năng tìm kiếm luật sẽ bị ảnh hưởng.")

# --- KẾT THÚC CẤU HÌNH ---

# --- CÁC HÀM HỖ TRỢ ---

def search_faiss(query, k=5, score_threshold=0.6):
    """Tìm kiếm trong DB vector cục bộ với FAISS."""
    if not faiss_index or not faiss_documents or not GOOGLE_KEYS:
        return None
    try:
        genai.configure(api_key=GEMINI_API_KEYS[0])
        result = genai.embed_content(model="models/text-embedding-004", content=query, task_type="retrieval_query")
        q_embed = np.array([result['embedding']]).astype('float32')
        faiss.normalize_L2(q_embed)
        
        scores, indices = faiss_index.search(q_embed, k)
        
        relevant_docs = []
        if len(scores) > 0 and len(indices) > 0:
            for i, score in enumerate(scores[0]):
                if score >= score_threshold:
                    relevant_docs.append(faiss_documents[indices[0][i]])
        
        if relevant_docs:
            return "\n---\n".join(relevant_docs)
    except Exception as e:
        print(f"Lỗi khi tìm kiếm FAISS: {e}")
    return None

def classify_intent(text):
    """Phân loại ý định: True (Xã giao), False (Hỏi luật)."""
    text_lower = text.lower().strip()
    word_count = len(text_lower.split())
    social_keywords = ["hi", "hello", "chào", "cảm ơn", "bạn là ai", "tạm biệt", "tên gì", "khỏe không"]
    traffic_keywords = ["luật", "phạt", "biển báo", "tốc độ", "nồng độ cồn", "xe máy", "ô tô", "đèn đỏ"]
    
    if any(k in text_lower for k in traffic_keywords): return False
    if any(k in text_lower for k in social_keywords) and word_count < 6: return True
    if word_count > 15: return False # Câu dài thường là hỏi nghiêm túc
    return True # Mặc định câu ngắn là xã giao

# Hàm xử lý CORS
@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    header['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    return response


@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def handle_chat():
    if request.method == 'OPTIONS':
        return '', 204

    # --- KIỂM TRA RATE LIMIT ---
    ip = request.headers.get('x-forwarded-for', request.remote_addr)
    now = int(time.time() * 1000)
    user_requests = request_history.get(ip, [])
    
    # Lọc ra các request trong khoảng thời gian WINDOW_MS
    recent_requests = [t for t in user_requests if now - t < WINDOW_MS]
    
    if len(recent_requests) >= RATE_LIMIT:
        return jsonify({"error": "Bạn đang hỏi quá nhanh, vui lòng thử lại sau giây lát."}), 429
    
    recent_requests.append(now)
    request_history[ip] = recent_requests
    
    # --- XỬ LÝ REQUEST ---
    if not GEMINI_API_KEYS:
        return jsonify({"error": "API Key chưa được cấu hình trên server."}), 500

    try:
        data = request.get_json()
        user_prompt = data.get('prompt')
        history = data.get('history', [])

        if not user_prompt:
            return jsonify({"error": "Không có prompt nào được cung cấp."}), 400

        clean_prompt = user_prompt.strip().lower()

        # --- KIỂM TRA CACHE ---
        if clean_prompt in response_cache:
            print(f"⚡️ Cache Hit cho IP: {ip}")
            response_cache.move_to_end(clean_prompt)
            def generate_cached():
                yield response_cache[clean_prompt]
            return Response(generate_cached(), mimetype='text/plain; charset=utf-8')

        print(f"⚠️ Cache Miss. Gọi API cho IP: {ip}")

        # --- PHÂN LOẠI & TÌM KIẾM ---
        is_social = classify_intent(user_prompt)
        if not is_social:
            context = search_faiss(user_prompt) or "Không tìm thấy thông tin trong cơ sở dữ liệu luật."
            system_prompt = f"""
            Bạn là Trợ lý Giao thông 2025, một chuyên gia luật. Dựa vào DỮ LIỆU THAM KHẢO và LỊCH SỬ CHAT để trả lời câu hỏi của người dùng.
            QUY TẮC:
            1. Trả lời NGẮN GỌN, SÚC TÍCH, đi thẳng vào vấn đề.
            2. Dùng ICON (✅, ⛔, ⚠️, 💡...) đầu dòng cho sinh động.
            3. Nếu có mức phạt, hãy nêu rõ theo NĐ 168/2024.
            4. Nếu không chắc chắn, hãy nói "Tôi không tìm thấy thông tin chính xác về vấn đề này".
            5. KHÔNG sử dụng dấu ** để in đậm.
            ---
            DỮ LIỆU THAM KHẢO: {context}
            """
        else:
            system_prompt = "Bạn là một trợ lý AI vui tính, hài hước, trẻ trung (Gen Z). Hãy trả lời người dùng một cách thân thiện, ngắn gọn và 'tưng tửng' dễ thương. Đừng quá nghiêm túc."

        conversation_history = "\n".join([f'{msg["role"]}: {msg["text"]}' for msg in history[-5:]])
        full_prompt = f"{system_prompt}\n\nLỊCH SỬ CHAT:\n{conversation_history}\n\nCâu hỏi mới: \"{user_prompt}\""

        def generate_stream():
            full_response_text = ""
            for api_key in GEMINI_API_KEYS:
                try:
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel(model_name="gemini-1.5-flash-latest")
                    stream = model.generate_content(full_prompt, stream=True)
                    for chunk in stream:
                        if chunk.text:
                            full_response_text += chunk.text
                            yield chunk.text
                    
                    response_cache[clean_prompt] = full_response_text
                    if len(response_cache) > CACHE_MAX_SIZE:
                        response_cache.popitem(last=False)
                    return
                except Exception as e:
                    print(f"Lỗi với API key: {e}")
                    continue
            yield "Xin lỗi, hệ thống đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau."

        return Response(generate_stream(), mimetype='text/plain; charset=utf-8')

    except Exception as e:
        error_message = str(e)
        print(f"Lỗi nghiêm trọng: {error_message}")
        # Xử lý lỗi cụ thể từ Google AI
        if "API_KEY_INVALID" in error_message:
             return jsonify({"error": "Một hoặc nhiều API Key không hợp lệ."}), 500
        if "rate limit" in error_message.lower():
             return jsonify({"error": "API của Google đang bị quá tải, vui lòng thử lại sau."}), 429
        
        return jsonify({"error": "Lỗi máy chủ nội bộ, không thể xử lý yêu cầu."}), 500
