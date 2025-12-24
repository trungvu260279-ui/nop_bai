import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { Translation, ChatMessage } from '../types';
import { CHAT_LESSONS } from '../constants'; 

interface ChatWidgetProps {
  t: Translation['chat'] & { thinking_steps?: { searching: string; analyzing: string; generating: string } };
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lessonOptions = CHAT_LESSONS.map(l => l.title);

  // --- LOGIC: KEEP-ALIVE RENDER SERVER ---
  // Tự động gửi tín hiệu đánh thức server ngay khi người dùng vào web
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await fetch('https://python-deloy.onrender.com', { method: 'GET', mode: 'no-cors' });
        console.log("Đã gửi tín hiệu đánh thức Server Render");
      } catch (e) { /* Bỏ qua lỗi kết nối ngầm */ }
    };
    wakeUpServer();
  }, []);
  // ---------------------------------------

  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'model',
      text: "Chào bạn. Tôi là hệ thống tư vấn pháp luật giao thông. Bạn cần tra cứu về chủ đề nào dưới đây?",
      timestamp: new Date(),
      options: lessonOptions
    }]);
  }, [lessonOptions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    // 1. Hiển thị tin nhắn người dùng
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    // 2. Tạo tin nhắn chờ của Bot
    const botMsgId = `bot-${Date.now()}`;
    const newBotMsg: ChatMessage = {
      id: botMsgId,
      role: 'model',
      text: 'Đang tra cứu dữ liệu pháp luật...', 
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, newBotMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 3. Gọi API Backend trên Render
      const response = await fetch('https://python-deloy.onrender.com/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      if (!response.ok) throw new Error(`Lỗi máy chủ: ${response.status}`);

      // 4. Nhận kết quả JSON (Quan trọng: Không dùng stream)
      const result = await response.json(); 

      // 5. Xử lý dữ liệu an toàn (Fallback logic)
      // Ưu tiên lấy 'answer', nếu không có thì lấy 'text', 'content' hoặc thông báo lỗi
      const botResponse = result.answer || result.text || result.content || "Xin lỗi, tôi không tìm thấy thông tin phù hợp trong cơ sở dữ liệu luật.";

      // 6. Cập nhật tin nhắn Bot
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: botResponse } : msg
      ));

    } catch (error: any) {
      console.error("Lỗi kết nối:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: "⚠️ Máy chủ đang khởi động lại. Vui lòng thử lại sau 30 giây." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} absolute bottom-0 right-0 transition-all bg-blue-700 text-white p-3.5 rounded-full shadow-lg hover:bg-blue-800`}
      >
        <MessageCircle size={24} />
      </button>

      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} transition-all absolute bottom-0 right-0 ${isEnlarged ? 'w-[600px] h-[700px]' : 'w-[380px] h-[550px]'} bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden`}>
        {/* Header */}
        <div className="bg-blue-800 p-3 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <Bot size={18} />
            <h3 className="font-semibold text-sm">Cố vấn Giao thông 24/7</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEnlarged(!isEnlarged)} className="p-1 hover:bg-blue-700 rounded">
              {isEnlarged ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-blue-700 rounded">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`relative max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                
                {/* Nội dung tin nhắn */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Nút copy cho Bot */}
                {msg.role === 'model' && msg.id !== 'init' && (
                  <button onClick={() => handleCopy(msg.text, msg.id)} className="absolute -top-2 -right-2 p-1.5 bg-white border rounded-full shadow-sm hover:bg-slate-100 transition-colors">
                    {copiedMessageId === msg.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-slate-400" />}
                  </button>
                )}

                {/* Các nút tùy chọn (Gợi ý) */}
                {msg.options && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.options.map((opt, i) => (
                      <button key={i} onClick={() => handleSend(opt)} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span>AI đang phân tích luật...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi (VD: Lỗi vượt đèn đỏ phạt bao nhiêu?)..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()} 
              className={`p-2 rounded-lg transition-all ${isLoading || !input.trim() ? 'text-slate-400' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
