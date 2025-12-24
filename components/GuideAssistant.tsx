import React, { useState, useEffect } from 'react';
import { X, MapPin, ChevronRight, Lightbulb, Volume2, VolumeX } from 'lucide-react';

const TIPS = [
  { id: 'home', text: '👋 Chào bạn! Tôi là Hướng dẫn viên ảo. Cuộn xuống để khám phá các số liệu thống kê ATGT nhé!', target: 'home' },
  { id: 'stats', text: '📊 Đây là biểu đồ thống kê tai nạn. Bạn có thể rê chuột vào cột để xem chi tiết tăng giảm.', target: 'stats' },
  { id: 'comics', text: '📚 Thư viện truyện tranh ATGT rất bổ ích. Hãy chọn một tập để đọc thử ngay!', target: 'comics' },
  { id: 'word', text: '📝 Tại đây có các tài liệu bài học chi tiết (PDF). Bạn có thể xem trực tiếp hoặc tải về.', target: 'word' },
  { id: 'videos', text: '🎬 Xem video tình huống thực tế giúp bạn có thêm kinh nghiệm xử lý khi lái xe.', target: 'videos' },
];

const LOCAL_BANTER_LIST = [
  "Bạn có biết? Đội mũ bảo hiểm giảm 69% nguy cơ chấn thương sọ não đấy!",
  "Đèn vàng không phải là 'cố lên', mà là 'chậm lại' nhé bạn ơi!",
  "Uống rượu bia thì đừng lái xe, gọi xe ôm cho an toàn nhé!",
  "Xi-nhan là để báo hiệu, không phải để trang trí đâu nha!",
  "Đi bộ qua đường nhớ tìm vạch kẻ đường dành cho người đi bộ nhé.",
  "Lái xe an toàn là bảo vệ chính mình và người thân.",
  "Đừng vừa lái xe vừa nhắn tin, nguy hiểm lắm đó!",
  "Thắt dây an toàn khi đi ô tô là thói quen của người văn minh.",
  "Nhường đường cho người đi bộ là nét đẹp văn hóa giao thông.",
  "Chạy quá tốc độ là con đường ngắn nhất đến... bệnh viện.",
  "Mệt mỏi thì dừng lại nghỉ ngơi, đừng cố lái xe nhé!",
  "Không đi ngược chiều, vừa nguy hiểm vừa bị phạt nặng đấy.",
  "Nhớ mang theo giấy tờ xe đầy đủ khi ra đường nhé.",
  "Gặp đèn đỏ được rẽ phải không? Nhớ nhìn biển báo nha!",
];

// --- CẤU HÌNH ẢNH ĐỘNG (GIF) ---
// Bạn hãy tìm link ảnh GIF trên Pinterest/Google và dán vào đây nhé!
// --- CẤU HÌNH ẢNH ĐỘNG LOCAL (CAPOO) ---
const ANIMATED_AVATARS = {
  // Thêm /xe_dap vào trước tên file
  happy: "public/capoo_1.gif",       
  serious: "/xe_dap/bugcat-capoo.gif" 
};

const GuideAssistant = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // --- State cho trợ lý ---
  const [position, setPosition] = useState({ top: '75%', left: '2%' });
  const [banter, setBanter] = useState('');
  const [isBantering, setIsBantering] = useState(false);
  const [mood, setMood] = useState<'happy' | 'serious'>('happy');
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  // Tự động phát hiện phần đang xem (Scroll Detection)
  useEffect(() => {
    const handleScroll = () => {
      setIsBantering(false); 
      setMood('happy');
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (let i = TIPS.length - 1; i >= 0; i--) {
        const element = document.getElementById(TIPS[i].target);
        if (element && element.offsetTop <= scrollPosition) {
          setCurrentTipIndex(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Tự động di chuyển vị trí (Floating Movement) ---
  useEffect(() => {
    if (!isVisible) return;
    const moveInterval = setInterval(() => {
      const newTop = `${Math.random() * 60 + 20}%`;
      const newLeft = `${Math.random() * 70 + 5}%`;
      setPosition({ top: newTop, left: newLeft });
    }, 10000); 

    return () => clearInterval(moveInterval);
  }, [isVisible]);

  // --- Logic nói chuyện vui nhộn ---
  useEffect(() => {
    if (!isVisible) return;

    const analyzeMood = (text: string) => {
      const seriousKeywords = ['tai nạn', 'chết', 'phạt', 'nguy hiểm', 'cấm', 'rượu', 'bia', 'bệnh viện', 'cảnh báo', 'thương vong'];
      const isSerious = seriousKeywords.some(k => text.toLowerCase().includes(k));
      setMood(isSerious ? 'serious' : 'happy');
    };

    const triggerLocalBanter = () => {
      const randomText = LOCAL_BANTER_LIST[Math.floor(Math.random() * LOCAL_BANTER_LIST.length)];
      setBanter(randomText);
      setIsBantering(true);
      analyzeMood(randomText);
    };

    const banterInterval = setInterval(triggerLocalBanter, 35000);
    const initialTimeout = setTimeout(triggerLocalBanter, 10000);

    return () => {
      clearInterval(banterInterval);
      clearTimeout(initialTimeout);
    };
  }, [isVisible]);

  // --- Text-to-Speech ---
  useEffect(() => {
    if (!isVisible || !isSoundEnabled) return;
    const textToSpeak = isBantering ? banter : TIPS[currentTipIndex].text;
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  }, [banter, currentTipIndex, isBantering, isVisible, isSoundEnabled]);

  const scrollToNext = () => {
    const nextIndex = (currentTipIndex + 1) % TIPS.length;
    const targetId = TIPS[nextIndex].target;
    const element = document.getElementById(targetId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // --- LOGIC CHỌN AVATAR ĐỘNG ---
  const avatarUrl = mood === 'happy' ? ANIMATED_AVATARS.happy : ANIMATED_AVATARS.serious;

  if (!isVisible) return (
    <button 
      onClick={() => setIsVisible(true)}
      className="fixed bottom-24 left-4 z-40 bg-white p-3 rounded-full shadow-lg border-2 border-yellow-400 hover:scale-110 transition-transform group"
      title="Bật hướng dẫn"
    >
      <Lightbulb className="text-yellow-500 group-hover:text-yellow-600" size={24} />
    </button>
  );

  return (
    <div 
      className="fixed z-40 flex items-end gap-3 animate-in slide-in-from-left duration-500 font-sans pointer-events-none transition-all ease-in-out"
      style={{ top: position.top, left: position.left, transitionDuration: '2000ms' }}
    >
      {/* Avatar Nhân vật */}
      <div className="relative group cursor-pointer pointer-events-auto" onClick={scrollToNext}>
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-2 border-yellow-400 shadow-xl overflow-hidden hover:scale-105 transition-transform">
           {/* Dùng object-cover để ảnh GIF lấp đầy khung tròn */}
           <img 
             src={avatarUrl} 
             alt="Trợ lý hướng dẫn" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>

      {/* Bong bóng thoại */}
      <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-xl border border-slate-100 max-w-[220px] md:max-w-[280px] relative pointer-events-auto">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={16} />
        </button>

        <button 
          onClick={() => {
            if (isSoundEnabled) window.speechSynthesis.cancel();
            setIsSoundEnabled(!isSoundEnabled);
          }}
          className="absolute top-2 right-8 text-slate-300 hover:text-blue-500 transition-colors"
          title={isSoundEnabled ? "Tắt giọng nói" : "Bật giọng nói"}
        >
          {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        
        <h4 className="font-bold text-yellow-600 text-sm mb-1 flex items-center gap-1">
          <MapPin size={14} /> Hướng dẫn viên
        </h4>
        <p className="text-slate-600 text-sm leading-relaxed">
          {isBantering ? banter : TIPS[currentTipIndex].text}
        </p>
        
        {!isBantering && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Mẹo {currentTipIndex + 1}/{TIPS.length}
            </span>
            <button 
              onClick={scrollToNext}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition-colors"
            >
              Tiếp theo <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideAssistant;
