import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# --- CẤU HÌNH ---
# Tải các biến môi trường từ file .env ở thư mục gốc
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Đọc API Key từ biến môi trường
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Lỗi: Không tìm thấy GEMINI_API_KEY. Vui lòng kiểm tra file .env của bạn.")

genai.configure(api_key=GEMINI_API_KEY)

def create_vector_db():
    """
    Đọc file luật, chia nhỏ, tạo vector embedding và lưu thành file JSON.
    """
    try:
        # Lấy đường dẫn thư mục chứa script hiện tại (components/)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Lấy đường dẫn thư mục gốc dự án (cha của components/)
        project_root = os.path.dirname(script_dir)
        
        # 1. Đọc file luật
        with open(os.path.join(project_root, "data_luat_vn.txt"), "r", encoding="utf-8") as f:
            text = f.read()

        # 2. Chia nhỏ văn bản (Chunking) theo dấu '==='
        sections = [s.strip() for s in text.split("===") if s.strip()]
        print(f"Phát hiện được {len(sections)} đoạn luật. Bắt đầu xử lý...")

        database = []
        # 3. Tạo Embedding (Vector hóa) cho từng đoạn
        for i, content in enumerate(sections):
            try:
                # Lấy dòng đầu làm title
                title = content.split('\n')[0]
                
                # Gọi Google AI để tạo vector
                result = genai.embed_content(
                    model="models/text-embedding-004", # Model chuyên dùng để tạo vector
                    content=content,
                    task_type="retrieval_document",
                    title=title
                )
                
                database.append({
                    "id": i,
                    "title": title,
                    "content": content,
                    "embedding": result['embedding'] # Đây là chuỗi số vector
                })
                print(f"✅ Đã vector hóa đoạn {i+1}/{len(sections)}: {title[:50]}...")
            except Exception as e:
                print(f"❌ Lỗi khi xử lý đoạn {i}: {e}")

        # 4. Lưu thành file JSON để Web sử dụng
        output_path = os.path.join(project_root, "luat_vector_db.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(database, f, ensure_ascii=False, indent=2)

        print(f"\n🎉 Hoàn tất! Đã lưu kho vector vào: {output_path}")
        print("Bây giờ bạn có thể chạy lại ứng dụng web.")

    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file 'data_luat_vn.txt' tại thư mục gốc dự án.")
    except Exception as e:
        print(f"Đã xảy ra lỗi không mong muốn: {e}")

if __name__ == "__main__":
    create_vector_db()