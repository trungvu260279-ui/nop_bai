import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CẤU HÌNH RATE LIMIT ---
// Lưu trữ lịch sử request trong bộ nhớ tạm (Lưu ý: Sẽ reset khi Serverless Function khởi động lại)
// Để bền vững hơn cho production, bạn nên dùng Vercel KV hoặc Redis.
const requestHistory = new Map();
const RATE_LIMIT = 10; // Cho phép tối đa 10 tin nhắn
const WINDOW_MS = 60 * 1000; // Trong vòng 60 giây (1 phút)

export default async function handler(req, res) {
  // Chỉ chấp nhận method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. KIỂM TRA RATE LIMIT (Dựa trên IP)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Lấy danh sách thời gian các request trước đó của IP này
  const userRequests = requestHistory.get(ip) || [];
  
  // Lọc bỏ các request đã cũ (quá 1 phút trước)
  const recentRequests = userRequests.filter(time => now - time < WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  // Ghi nhận request mới vào lịch sử
  recentRequests.push(now);
  requestHistory.set(ip, recentRequests);

  // 2. XỬ LÝ GỌI GEMINI AI
  try {
    const { prompt } = req.body;

    // Lấy key từ biến môi trường
    const apiKeys = (process.env.GEMINI_API_KEY || '').split(',').filter(k => k.trim());

    if (apiKeys.length === 0) {
      return res.status(500).json({ error: 'Server config: Missing GEMINI_API_KEY' });
    }

    // Logic xoay vòng key: Thử lần lượt các key cho đến khi thành công
    let lastError = null;

    for (const apiKey of apiKeys) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return res.status(200).json({ text });
      } catch (error) {
        console.error(`Key ...${apiKey.slice(-4)} failed:`, error.message);
        lastError = error;
        continue; // Thử key tiếp theo
      }
    }

    throw lastError || new Error("All API keys failed");

  } catch (error) {
    console.error("API Handler Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
