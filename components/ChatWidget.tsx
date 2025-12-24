import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Translation, ChatMessage } from '../types';
import { CHAT_LESSONS } from '../constants'; 

interface ChatWidgetProps {
  t: Translation['chat'] & { thinking_steps?: { searching: string; analyzing: string; generating: string } };
}

// --- DANH SÁCH CÁC CÂU "GIẢ VỜ" SUY NGHĨ ---
const THINKING_STEPS = [
  "🔍 Đang quét dữ liệu luật...",
  "📡 Đang kết nối hệ thống giao thông...",
  "⚖️ Đang phân tích hành vi...",
  "🧠 Đang tổng hợp mức phạt...",
  "✍️ Đang soạn câu trả lời chi tiết..."
];

const ChatWidget: React.FC<ChatWidgetProps> = ({ t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState(THINKING_STEPS[0]); 
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lessonOptions = CHAT_LESSONS.map(l => l.title);

  // --- 1. AUTO WAKE-UP SERVER ---
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await fetch('https://python-deloy.onrender.com', { method: 'GET', mode: 'no-cors' });
        console.log("🔔 Đã gửi tín hiệu đánh thức Server");
      } catch (e) { 
        console.log("Không thể kết nối server lúc khởi động");
      }
    };
    wakeUpServer();
  }, []);

  // --- 2. HIỆU ỨNG CHỮ CHẠY CHẠY ---
  useEffect(() => {
    if (!isLoading) return;

    let stepIndex = 0;
    // Cứ 2 giây đổi câu một lần
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % THINKING_STEPS.length;
      setThinkingText(THINKING_STEPS[stepIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // --- 3. TIN NHẮN CHÀO MỪNG ---
  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'model',
      sender: 'bot',
      text: "Chào bạn! 🚗 Tôi là Trợ lý Luật Giao thông (Nghị định 100 & 123).\n\nBạn cần tra cứu mức phạt, biển báo hay muốn tâm sự gì không?",
      timestamp: new Date(),
      options: lessonOptions
    }]);
  }, []); 

  // --- 4. AUTO SCROLL ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, thinkingText]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  // --- 5. HÀM GỬI TIN NHẮN (CORE LOGIC) ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend?.trim()) return;

    setInput('');

    // A. Hiển thị tin nhắn User
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { 
      id: userMsgId, 
      text: textToSend, 
      sender: 'user', 
      role: 'user',
      timestamp: new Date()
    }]);

    // B. Hiển thị tin nhắn chờ
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { 
      id: botMsgId, 
      text: 'Thinking...', 
      sender: 'bot', 
      role: 'model', 
      isThinking: true,
      timestamp: new Date()
    }]);
    
    setIsLoading(true);
    setThinkingText(THINKING_STEPS[0]); 

    // --- C. HẸN GIỜ CẢNH BÁO SERVER NGỦ (ĐÃ SỬA LÊN 12 GIÂY) ---
    // Chỉ khi nào đợi quá 12s mới hiện thông báo ngủ đông
    const slowServerTimer = setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { 
              ...msg, 
              text: "SLEEPING_MODE", // Kích hoạt chế độ ngủ
              isThinking: true 
            } 
          : msg
      ));
    }, 12000); // <--- ĐÃ TĂNG LÊN 12000ms (12 giây)

    try {
      console.log("🚀 Client gửi:", textToSend);
      
      const response = await fetch('https://python-deloy.onrender.com/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      // Nếu Server trả lời (dù nhanh hay chậm) thì HỦY cái hẹn giờ đi ngay
      clearTimeout(slowServerTimer);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Server trả về:", data);

      const botResponse = data.answer || data.text || "Hệ thống không có phản hồi.";

      // Cập nhật lại tin nhắn Bot
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: botResponse, isThinking: false } 
          : msg
      ));

    } catch (error) {
      clearTimeout(slowServerTimer);
      console.error("❌ Lỗi Client:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: "⚠️ Lỗi kết nối! Server có thể đang khởi động hoặc mạng yếu. Vui lòng thử lại sau 30 giây.", isThinking: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} absolute bottom-0 right-0 transition-all bg-blue-700 text-white p-3.5 rounded-full shadow-lg hover:bg-blue-800 hover:scale-110 duration-300`}
      >
        <MessageCircle size={24} />
      </button>

      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} transition-all duration-300 origin-bottom-right absolute bottom-0 right-0 ${isEnlarged ? 'w-[90vw] h-[80vh] md:w-[600px] md:h-[700px]' : 'w-[90vw] h-[600px] md:w-[380px] md:h-[550px]'} bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-3 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Trợ lý Luật Giao thông</h3>
              <p className="text-[10px] text-blue-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online 24/7
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEnlarged(!isEnlarged)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              {isEnlarged ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/80 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mr-2 flex-shrink-0 self-start mt-1">
                  <Bot size={16} className="text-blue-600" />
                </div>
              )}

              <div className={`relative max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                
                {msg.isThinking ? (
                  msg.text === "SLEEPING_MODE" ? (
                    // 1. Chỉ hiện khi đợi quá 12s
                    <div className="flex items-start gap-2 text-slate-500 italic">
                      <Loader2 size={16} className="animate-spin mt-1 text-orange-500 flex-shrink-0" />
                      <span>😴 Server đang 'ngủ đông'. Đang đánh thức (khoảng 30-50s), bạn đợi chút nha! 🐢</span>
                    </div>
                  ) : (
                    // 2. Bình thường hiện cái này
                    <div className="flex items-center gap-2 text-blue-600 font-medium animate-pulse">
                      <Loader2 size={14} className="animate-spin" />
                      <span>{thinkingText}</span>
                    </div>
                  )
                ) : (
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white prose-headings:text-white prose-strong:text-white' : 'text-slate-700'}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({node, ...props}) => <span className="font-bold text-blue-700 dark:text-blue-300" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                        li: ({node, ...props}) => <li className="marker:text-blue-500" {...props} />,
                        h1: ({node, ...props}) => <h3 className="text-base font-bold text-red-600 mt-2 mb-1 uppercase" {...props} />,
                        h2: ({node, ...props}) => <h4 className="text-sm font-bold text-blue-800 mt-2 mb-1" {...props} />,
                        h3: ({node, ...props}) => <strong className="block text-slate-900 mt-2 font-bold" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-500 hover:underline font-medium" target="_blank" {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}

                {msg.role === 'model' && msg.id !== 'init' && !msg.isThinking && (
                  <button onClick={() => handleCopy(msg.text, msg.id || '')} className="absolute -top-2 -right-2 p-1.5 bg-white border rounded-full shadow-sm hover:bg-slate-100 transition-colors z-10">
                    {copiedMessageId === msg.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-slate-400" />}
                  </button>
                )}

                {msg.options && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(opt)} 
                        className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all text-left shadow-sm active:scale-95"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()} 
              className={`p-2 rounded-lg transition-all duration-200 ${
                isLoading || !input.trim() 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-[10px] text-center text-slate-400 mt-2 select-none">
            AI Traffic Assistant v2.0 - Powered by Hybrid OpenAI & Gemini
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
