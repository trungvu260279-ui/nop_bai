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

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

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
      const response = await fetch('https://python-deloy.onrender.com/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      if (!response.ok) throw new Error('Kết nối thất bại');

      // Nhận JSON duy nhất từ Python (Bỏ hoàn toàn Reader/Stream cũ)
      const result = await response.json(); 

      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: result.answer } : msg
      ));

    } catch (error: any) {
      console.error("Error calling API:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: "Lỗi kết nối. Máy chủ đang khởi động, vui lòng thử lại sau 30 giây." } : msg
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
        className={`${isOpen ? 'scale-0' : 'scale-100'} absolute bottom-0 right-0 transition-all bg-blue-700 text-white p-3.5 rounded-full shadow-lg`}
      >
        <MessageCircle size={24} />
      </button>

      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} transition-all absolute bottom-0 right-0 ${isEnlarged ? 'w-[600px] h-[700px]' : 'w-[380px] h-[550px]'} bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden`}>
        {/* Header */}
        <div className="bg-blue-800 p-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Bot size={18} />
            <h3 className="font-semibold text-sm">Cố vấn Giao thông 24/7</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEnlarged(!isEnlarged)}>{isEnlarged ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`relative max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                {msg.text}
                {msg.role === 'model' && msg.id !== 'init' && (
                  <button onClick={() => handleCopy(msg.text, msg.id)} className="absolute -top-2 -right-2 p-1 bg-white border rounded-full shadow-sm hover:bg-slate-50">
                    {copiedMessageId === msg.id ? <Check size={10} className="text-green-600" /> : <Copy size={10} />}
                  </button>
                )}
                {msg.options && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.options.map((opt, i) => (
                      <button key={i} onClick={() => handleSend(opt)} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded-full border border-blue-200 hover:bg-blue-100">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && <Loader2 size={20} className="animate-spin text-blue-600 mx-auto" />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập nội dung cần tra cứu luật..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800"
            />
            <button onClick={() => handleSend()} disabled={isLoading} className="text-blue-600"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
