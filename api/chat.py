from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
import time
from collections import OrderedDict

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

# --- KẾT THÚC CẤU HÌNH ---

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
        prompt = data.get('prompt')

        if not prompt:
            return jsonify({"error": "Không có prompt nào được cung cấp."}), 400

        # Chuẩn hóa prompt để tăng khả năng cache hit
        clean_prompt = prompt.strip().lower()

        # --- KIỂM TRA CACHE ---
        if clean_prompt in response_cache:
            print(f"⚡️ Cache Hit cho IP: {ip}")
            response_cache.move_to_end(clean_prompt) # Đánh dấu là mới sử dụng
            return jsonify({"text": response_cache[clean_prompt]})

        print(f"⚠️ Cache Miss. Gọi API cho IP: {ip}")
        last_error = None

        # --- GỌI API (xoay vòng key nếu cần) ---
        for api_key in GEMINI_API_KEYS:
            try:
                genai.configure(api_key=api_key)
                
                # Sử dụng model flash mới nhất, tiết kiệm và nhanh
                model = genai.GenerativeModel(model_name="gemini-1.5-flash-latest")
                
                response = model.generate_content(prompt)
                text_response = response.text

                # --- LƯU VÀO CACHE ---
                response_cache[clean_prompt] = text_response
                # Nếu cache đầy, xóa entry cũ nhất
                if len(response_cache) > CACHE_MAX_SIZE:
                    response_cache.popitem(last=False)

                return jsonify({"text": text_response})

            except Exception as e:
                print(f"Lỗi với API key: {e}")
                last_error = e
                continue # Thử key tiếp theo

        # Nếu tất cả các key đều lỗi
        raise last_error or Exception("Tất cả các API key đều không hoạt động.")

    except Exception as e:
        error_message = str(e)
        print(f"Lỗi nghiêm trọng: {error_message}")
        # Xử lý lỗi cụ thể từ Google AI
        if "API_KEY_INVALID" in error_message:
             return jsonify({"error": "Một hoặc nhiều API Key không hợp lệ."}), 500
        if "rate limit" in error_message.lower():
             return jsonify({"error": "API của Google đang bị quá tải, vui lòng thử lại sau."}), 429
        
        return jsonify({"error": "Lỗi máy chủ nội bộ, không thể xử lý yêu cầu."}), 500
