import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Search, Cpu, Loader2, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { Translation, ChatMessage } from '../types';
import { CHAT_LESSONS } from '../constants'; 
import vectorDb from '../luat_vector_db.json'; // Import kho vector vừa tạo
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatWidgetProps {
  t: Translation['chat'] & { thinking_steps?: { searching: string; analyzing: string; generating: string } };
}

// --- SUB-COMPONENT: TYPEWRITER EFFECT (Puper.js simulation) ---
const Typewriter = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText('');
    
    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, 20); // Tốc độ gõ phím (ms)
    return () => clearInterval(timer);
  }, [text]);

  return <>{displayedText}</>;
};

// --- HELPER: TÍNH TOÁN VECTOR (Cosine Similarity) ---
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Hàm tìm kiếm ngữ nghĩa trên kho vector
const searchVectorDB = async (query: string): Promise<{ context: string; topScore: number }> => {
  try {
    // --- ĐỌC API KEY TỪ BIẾN MÔI TRƯỜNG ---
    // Vite chỉ expose các biến có tiền tố VITE_ ra phía client
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      console.error("Lỗi: Vui lòng tạo file .env và thêm VITE_GEMINI_API_KEY vào đó.");
      return { context: "Lỗi cấu hình: API Key chưa được thiết lập phía client.", topScore: 0 };
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

    // 1. Tạo vector cho câu hỏi
    const result = await model.embedContent(query);
    const queryVector = result.embedding.values;

    // 2. So sánh với kho dữ liệu
    const scoredDocs = vectorDb.map((doc: any) => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.embedding)
    }));

    // 3. Lấy Top 3 đoạn giống nhất
    const topDocs = scoredDocs.sort((a: any, b: any) => b.score - a.score).slice(0, 3);
    
    return { context: topDocs.map((d: any) => d.content).join('\n\n---\n\n'), topScore: topDocs[0]?.score || 0 };
  } catch (e) {
    console.error("Vector search error:", e);
    return { context: "", topScore: 0 };
  }
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>('');
  const queryCache = useRef<Record<string, string>>({}); // Cache cho câu hỏi
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Khởi tạo âm thanh (Base64 cho tiếng "pop" nhẹ)
  useEffect(() => {
    // Âm thanh "pop" ngắn gọn, nhẹ nhàng
    const popSound = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; 
    // Lưu ý: Chuỗi base64 trên là ví dụ ngắn, tôi sẽ dùng một chuỗi đầy đủ hơn trong thực tế hoặc bạn có thể thay thế bằng link mp3 nếu muốn.
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"); // Sử dụng link online ổn định cho tiếng pop
  }, []);

  // Danh sách tên các bài học để hiển thị nút
  const lessonOptions = CHAT_LESSONS.map(l => l.title);

  useEffect(() => {
    // Tin nhắn chào mừng mặc định hiển thị 6 lựa chọn
    setMessages([{
      id: 'init',
      role: 'model',
      text: t.welcome,
      timestamp: new Date(),
      options: lessonOptions
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingStep]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
  };

  // --- HÀM SEARCH INTERNET (SỬ DỤNG GEMINI AI) ---
  const searchInternet = async (query: string) => {
    // Check cache first
    const cachedResponse = queryCache.current[query.toLowerCase()];
    if (cachedResponse) {
      setThinkingStep(t.thinking_steps?.generating || "Đang tạo câu trả lời...");
      await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập thời gian lấy từ cache
      setThinkingStep('');
      return cachedResponse;
    }

    // Bước 1: Phân tích
    setThinkingStep(t.thinking_steps?.analyzing || "Đang phân tích...");
    
    try {
      // Bước 2: Gọi API Serverless (Thay vì gọi trực tiếp Gemini)
      setThinkingStep(t.thinking_steps?.generating || "Đang tạo câu trả lời...");
      
      // Lấy 5 tin nhắn gần nhất để làm ngữ cảnh
      const last5Messages = messages.slice(-5);
      const conversationHistory = last5Messages.map(msg => `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.text}`).join('\n');

      const { context: lawContext, topScore } = await searchVectorDB(query);
      let prompt = '';

      // Nếu tìm thấy thông tin liên quan (độ tương đồng > 0.5), dùng prompt chuyên gia luật
      if (topScore > 0.5) {
        prompt = `Dựa vào đoạn hội thoại trước đó và kiến thức của bạn, hãy trả lời câu hỏi của người dùng.
---
HỘI THOẠI TRƯỚC:
${conversationHistory}
---
Bạn là chuyên gia tư vấn luật giao thông Việt Nam.
Dưới đây là một số điều luật có thể liên quan:
---
${lawContext}
---

HƯỚNG DẪN:
1. Trả lời NGẮN GỌN, SÚC TÍCH, ĐẦY ĐỦ ý chính.
2. Dùng ICON (✅, ⛔, ⚠️, 💡...) đầu dòng cho sinh động.
3. Trích nguồn ngắn gọn (VD: NĐ 168/2024).
4. Nếu không chắc chắn, hãy nói "Tôi không tìm thấy thông tin chính xác về vấn đề này".
5. KHÔNG sử dụng dấu ** để in đậm.

Câu hỏi mới: "${query}"`;
      } else {
        // Nếu không, dùng prompt "ChatGPT" cho thông tin chung
        prompt = `Dựa vào đoạn hội thoại trước đó và kiến thức của bạn, hãy trả lời câu hỏi của người dùng.
---
HỘI THOẠI TRƯỚC:
${conversationHistory}
---
Bạn là một trợ lý AI thân thiện và am hiểu. Hãy trả lời câu hỏi của người dùng về đời sống hoặc pháp luật chung tại Việt Nam một cách gần gũi, dễ hiểu và đi thẳng vào vấn đề. Sử dụng giọng văn tự nhiên như đang trò chuyện với một người bạn. KHÔNG sử dụng dấu ** để in đậm.

Câu hỏi mới: "${query}"`;
      }
      
      // Gọi về Serverless Function
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi kết nối server');
      
      // Lưu vào cache
      queryCache.current[query.toLowerCase()] = data.text;

      setThinkingStep('');
      return data.text;
    } catch (error: any) {
      console.error("Lỗi khi gọi API:", error);
      setThinkingStep('');
      
      // Xử lý lỗi Rate Limit từ server
      if (error.message && error.message.includes('Too many requests')) {
        return "⛔ Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi một chút trước khi thử lại.";
      }

      return "Xin lỗi, hệ thống đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau.";
    }
  };

  // Hàm xử lý logic chính
  const processResponse = async (userInput: string) => {
    // TRƯỜNG HỢP 1: Người dùng chọn trực tiếp từ Menu (khớp tiêu đề bài học)
    const selectedLesson = CHAT_LESSONS.find(l => l.title === userInput);
    if (selectedLesson) {
      return {
        text: selectedLesson.content,
        options: lessonOptions // Hiển thị lại menu chính sau khi xem bài học
      };
    }

    // TRƯỜNG HỢP 2: Các trường hợp khác -> Dùng AI Search với ngữ cảnh
    const searchResult = await searchInternet(userInput);
    return {
      text: searchResult,
      options: lessonOptions // Vẫn hiển thị lại các lựa chọn bài học sau mỗi câu trả lời của AI
    };
  };

  const handleCopy = (text: string, id: string) => {
    if (copiedMessageId === id) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // 1. Thêm tin nhắn của User
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    playSound(); // Âm thanh khi gửi
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // 2. Xử lý phản hồi của Bot
    // setTimeout removed, using async/await for search simulation
    const response = await processResponse(textToSend);
    
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.text.replace(/\*\*/g, ''),
      timestamp: new Date(),
      options: response.options
    };
    
    setMessages(prev => [...prev, botMsg]);
    playSound(); // Âm thanh khi nhận
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'} absolute bottom-0 right-0 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-lg flex items-center justify-center`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div className={`${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'} transition-all duration-500 ease-in-out origin-bottom-right absolute bottom-0 right-0 ${isEnlarged ? 'w-[600px] h-[700px]' : 'w-[380px] h-[550px]'} bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot size={18} />
            </div>
            <h3 className="font-semibold text-sm">{t.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEnlarged(!isEnlarged)} className="hover:bg-white/20 p-1 rounded-full transition-colors" title={isEnlarged ? "Thu nhỏ" : "Phóng to"}>
              {isEnlarged ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors" title="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
          {messages.map((msg) =>
            msg.role === 'user' ? (
              // User Message
              <div key={msg.id} className="flex justify-end w-full">
                <div className="relative group max-w-[85%]">
                  <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-br-none text-sm leading-relaxed whitespace-pre-line shadow-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            ) : (
              // Model Message
              <div key={msg.id} className="flex items-start gap-2.5 w-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="flex flex-col gap-1 w-full max-w-[85%]">
                  <div className="relative group">
                    <div className="bg-white text-slate-800 border border-slate-200 p-3 rounded-2xl rounded-bl-none text-sm leading-relaxed whitespace-pre-line shadow-sm">
                      {/* Hiệu ứng gõ chữ cho tin nhắn mới nhất của Bot */}
                      {msg.id === messages[messages.length - 1].id && !isLoading ? (
                        <Typewriter text={msg.text} />
                      ) : (
                        msg.text
                      )}
                    </div>
                    {/* NÚT COPY (chỉ cho bot và không phải tin nhắn chào mừng) */}
                    {msg.id !== 'init' && (
                      <button 
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="absolute top-1 right-1 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                        title="Copy text"
                      >
                        {copiedMessageId === msg.id 
                          ? <Check size={12} className="text-green-600" /> 
                          : <Copy size={12} className="text-slate-500" />
                        }
                      </button>
                    )}
                  </div>
                  {/* Hiển thị Options (Nút bấm) nếu có */}
                  {msg.options && (
                    <div className="mt-1 flex flex-wrap gap-2 animate-fadeIn">
                      {msg.options.map((opt, idx) => (
                        <button key={idx} onClick={() => handleSend(opt)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium py-1.5 px-3 rounded-full border border-blue-200 transition-colors">
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          
          {/* THANH TRẠNG THÁI AI (AI STATUS BAR) */}
          {thinkingStep ? (
            <div className="flex justify-start w-full animate-pulse">
              <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 flex items-center gap-2 text-xs text-indigo-600 font-medium shadow-sm">
                {thinkingStep.includes("tìm") ? <Search size={14} className="animate-spin-slow" /> : 
                 thinkingStep.includes("phân tích") ? <Cpu size={14} className="animate-pulse" /> : 
                 <Loader2 size={14} className="animate-spin" />}
                {thinkingStep}
              </div>
            </div>
          ) : isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200 focus-within:border-blue-400 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent border-none outline-none text-sm px-1 text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;