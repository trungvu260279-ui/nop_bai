import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Image as ImageIcon, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- 1. CẤU HÌNH DỮ LIỆU GIẢ LẬP (RICH MEDIA & QUIZ) ---

// Map từ khóa -> Hình ảnh minh họa
const KEYWORD_IMAGES: Record<string, string> = {
  "đội mũ": "https://img.freepik.com/free-vector/helmet-safety-instructions_23-2148689087.jpg", // Thay bằng ảnh thật của bạn
  "biển báo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vietnam_road_sign_W207.svg/1200px-Vietnam_road_sign_W207.svg.png",
  "tốc độ": "https://luatvietnam.vn/SaoChep/2020/1/1/toc-do-xe-may-2020_20200101092928.jpg",
  "nồng độ cồn": "https://cdn.thuvienphapluat.vn/uploads/tintuc/2023/10/17/muc-phat-nong-do-con.jpg",
};

// Dữ liệu câu hỏi trắc nghiệm (Quiz)
const QUIZ_DATA = [
  {
    question: "Trong tình huống này, xe nào được quyền đi trước?",
    image: "https://hoclaixemoto.com/wp-content/uploads/2020/06/meo-thi-bang-lai-xe-a1-1.jpg", // Thay bằng ảnh sa hình của bạn
    options: ["Xe tải", "Xe con", "Xe lam"],
    correct: "Xe lam",
    explanation: "Xe lam là xe ưu tiên nên được đi trước."
  },
  {
    question: "Biển báo nào cấm xe mô tô đi vào?",
    image: "https://hoclaixemoto.com/wp-content/uploads/2019/09/bien-bao-cam-xe-may.jpg",
    options: ["Biển 1", "Biển 2", "Biển 3"],
    correct: "Biển 1",
    explanation: "Biển 1 (P.104) là biển cấm xe mô tô."
  },
  {
    question: "Người điều khiển xe máy không đội mũ bảo hiểm bị phạt bao nhiêu?",
    options: ["100k - 200k", "400k - 600k", "800k - 1 triệu"],
    correct: "400k - 600k",
    explanation: "Theo Nghị định 100/2019/NĐ-CP, mức phạt là 400.000đ - 600.000đ."
  }
];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Feature 1: Ảnh minh họa
  options?: string[]; // Feature 2: Các lựa chọn cho Quiz
  isQuiz?: boolean;   // Đánh dấu đây là tin nhắn Quiz
  correctAnswer?: string; // Lưu đáp án đúng (ẩn)
  explanation?: string;   // Giải thích sau khi chọn
}

interface ChatWidgetProps {
  t: any;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: t.welcome }
  ]);
  const [currentQuiz, setCurrentQuiz] = useState<ChatMessage | null>(null); // Lưu trạng thái quiz hiện tại
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- FEATURE 2: LOGIC QUIZ ---
  const startQuiz = () => {
    const randomQuiz = QUIZ_DATA[Math.floor(Math.random() * QUIZ_DATA.length)];
    
    const quizMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'model',
      text: `🧠 **THỬ TÀI GIAO THÔNG**\n\n${randomQuiz.question}`,
      image: randomQuiz.image,
      options: randomQuiz.options,
      isQuiz: true,
      correctAnswer: randomQuiz.correct,
      explanation: randomQuiz.explanation
    };

    setMessages(prev => [...prev, quizMessage]);
    setCurrentQuiz(quizMessage);
  };

  const handleOptionClick = (option: string) => {
    if (!currentQuiz) return;

    const isCorrect = option === currentQuiz.correctAnswer;
    
    // 1. Hiển thị lựa chọn của user
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: option };
    
    // 2. Bot phản hồi kết quả
    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: isCorrect 
        ? `🎉 **CHÍNH XÁC!**\n\n${currentQuiz.explanation}`
        : `❌ **SAI RỒI!**\n\nĐáp án đúng là: **${currentQuiz.correctAnswer}**.\n\n${currentQuiz.explanation}`
    };

    setMessages(prev => [...prev, userMsg, botResponse]);
    setCurrentQuiz(null); // Kết thúc quiz này
  };

  // --- LOGIC GỬI TIN NHẮN & FEATURE 1 (RICH MEDIA) ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Cấu hình Prompt cho phép Markdown
      const systemPrompt = `Bạn là trợ lý ảo giao thông. Hãy trả lời ngắn gọn, thân thiện. 
      QUAN TRỌNG: Sử dụng định dạng Markdown (in đậm **text**, gạch đầu dòng - item) để trình bày đẹp mắt. 
      Nếu hỏi về luật, hãy nêu rõ mức phạt.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${systemPrompt}\nUser: ${input}` }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Lỗi kết nối');

      // --- FEATURE 1: TỰ ĐỘNG CHÈN ẢNH DỰA TRÊN TỪ KHÓA ---
      let detectedImage = undefined;
      const lowerText = data.text.toLowerCase();
      for (const [keyword, imgUrl] of Object.entries(KEYWORD_IMAGES)) {
        if (lowerText.includes(keyword)) {
          detectedImage = imgUrl;
          break; // Lấy ảnh đầu tiên khớp
        }
      }

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: data.text,
        image: detectedImage // Gắn ảnh vào tin nhắn nếu tìm thấy
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: '⚠️ Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right border border-slate-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">{t.title}</h3>
              <span className="flex items-center gap-1 text-xs text-red-100">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={startQuiz} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Thử tài giao thông">
              <HelpCircle size={20} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}>
                {/* --- FEATURE 3: MARKDOWN RENDERING --- */}
                <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                  {msg.role === 'model' ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({node, ...props}) => <span className="font-bold text-red-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="marker:text-red-500" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 underline hover:text-blue-800" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* --- FEATURE 1: IMAGE RENDERING --- */}
                {msg.image && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 group cursor-pointer">
                    <img 
                      src={msg.image} 
                      alt="Minh họa" 
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                      onClick={() => window.open(msg.image, '_blank')}
                    />
                    <div className="bg-slate-50 px-2 py-1 text-[10px] text-slate-500 flex items-center gap-1">
                      <ImageIcon size={10} /> Ảnh minh họa
                    </div>
                  </div>
                )}

                {/* --- FEATURE 2: QUIZ OPTIONS --- */}
                {msg.options && (
                  <div className="mt-3 flex flex-col gap-2">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={!currentQuiz} // Disable nếu đã trả lời xong
                        className="text-left text-sm px-3 py-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-transparent transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {String.fromCharCode(65 + idx)}. {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-none p-3 border border-slate-100 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{t.thinking}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shadow-lg shadow-red-200"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;