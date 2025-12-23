import React, { useState, useEffect } from 'react';
import { X, MapPin, ChevronRight, Lightbulb, Volume2, VolumeX } from 'lucide-react';

const TIPS = [
  { id: 'home', text: '👋 Chào bạn! Tôi là Hướng dẫn viên ảo. Cuộn xuống để khám phá các số liệu thống kê ATGT nhé!', target: 'home' },
  { id: 'stats', text: '📊 Đây là biểu đồ thống kê tai nạn. Bạn có thể rê chuột vào cột để xem chi tiết tăng giảm.', target: 'stats' },
  { id: 'comics', text: '📚 Thư viện truyện tranh ATGT rất bổ ích. Hãy chọn một tập để đọc thử ngay!', target: 'comics' },
  { id: 'word', text: '📝 Tại đây có các tài liệu bài học chi tiết (PDF). Bạn có thể xem trực tiếp hoặc tải về.', target: 'word' },
  { id: 'videos', text: '🎬 Xem video tình huống thực tế giúp bạn có thêm kinh nghiệm xử lý khi lái xe.', target: 'videos' },
];

const FALLBACK_BANTER = [
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
];

const GuideAssistant = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  // --- START: Thêm state cho trợ lý tinh nghịch ---
  const [position, setPosition] = useState({ top: '75%', left: '2%' });
  const [banter, setBanter] = useState('');
  const [isBantering, setIsBantering] = useState(false);
  const [mood, setMood] = useState<'happy' | 'serious'>('happy'); // Trạng thái cảm xúc
  const [isSoundEnabled, setIsSoundEnabled] = useState(false); // Mặc định tắt để tránh làm phiền
  // --- END: Thêm state ---

  // Tự động phát hiện phần đang xem
  useEffect(() => {
    const handleScroll = () => {
      setIsBantering(false); // Khi người dùng cuộn, ưu tiên hiển thị tip hướng dẫn
      setMood('happy'); // Mặc định vui vẻ khi hướng dẫn
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      // Tìm section đang hiển thị
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

  // --- FEATURE: Tự động di chuyển tinh nghịch ---
  useEffect(() => {
    if (!isVisible) return;
    const moveInterval = setInterval(() => {
      const newTop = `${Math.random() * 60 + 20}%`; // Di chuyển trong khoảng 20% -> 80% chiều cao
      const newLeft = `${Math.random() * 70 + 5}%`; // Di chuyển trong khoảng 5% -> 75% chiều rộng
      setPosition({ top: newTop, left: newLeft });
    }, 10000); // Di chuyển mỗi 20 giây

    return () => clearInterval(moveInterval);
  }, [isVisible]);

  // --- FEATURE: Gọi API để nói chuyện vui nhộn ---
  useEffect(() => {
    if (!isVisible) return;

    // Hàm phân tích cảm xúc dựa trên từ khóa
    const analyzeMood = (text: string) => {
      const seriousKeywords = ['tai nạn', 'chết', 'phạt', 'nguy hiểm', 'cấm', 'rượu', 'bia', 'bệnh viện', 'cảnh báo', 'thương vong'];
      const isSerious = seriousKeywords.some(k => text.toLowerCase().includes(k));
      setMood(isSerious ? 'serious' : 'happy');
    };

    const fetchBanter = async () => {
      try {
        const prompt = "Bạn là một trợ lý ảo vui tính. Hãy nói MỘT câu ngắn gọn, hài hước hoặc một sự thật thú vị về an toàn giao thông. Ví dụ: 'Bạn có biết xi-nhan không tự tắt đâu nhé!' hoặc 'Đèn vàng là để đi chậm lại, không phải để tăng tốc đâu!'. Chỉ trả về câu nói, không thêm lời chào.";
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        setBanter(data.text);
        setIsBantering(true); // Hiển thị câu nói vui nhộn
        analyzeMood(data.text); // Cập nhật cảm xúc
      } catch (error) {
        console.error("Failed to fetch banter:", error);
        // Fallback khi lỗi API
        const randomBanter = FALLBACK_BANTER[Math.floor(Math.random() * FALLBACK_BANTER.length)];
        setBanter(randomBanter);
        setIsBantering(true);
        analyzeMood(randomBanter); // Cập nhật cảm xúc
      }
    };

    const banterInterval = setInterval(fetchBanter, 35000); // Lấy câu nói mới mỗi 35 giây
    const initialTimeout = setTimeout(fetchBanter, 10000); // Lần đầu nói sau 10s

    return () => {
      clearInterval(banterInterval);
      clearTimeout(initialTimeout);
    };
  }, [isVisible]);

  // --- FEATURE: Text-to-Speech (Giọng nói) ---
  useEffect(() => {
    if (!isVisible || !isSoundEnabled) return;

    const textToSpeak = isBantering ? banter : TIPS[currentTipIndex].text;
    if (!textToSpeak) return;

    // Ngắt lời cũ và đọc lời mới
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'vi-VN'; // Thiết lập giọng đọc tiếng Việt
    window.speechSynthesis.speak(utterance);
  }, [banter, currentTipIndex, isBantering, isVisible, isSoundEnabled]);

  const scrollToNext = () => {
    const nextIndex = (currentTipIndex + 1) % TIPS.length;
    const targetId = TIPS[nextIndex].target;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // URL Avatar thay đổi theo cảm xúc (Sử dụng DiceBear Bottts)
  const avatarUrl = mood === 'happy' 
    ? "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&mouth=smile01,smile02&eyes=eva" // Vui: Cười, mắt long lanh
    : "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&mouth=grimace,square01&eyes=frame1,frame2"; // Nghiêm túc: Nhăn mặt, mắt kính

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
      {/* Avatar Nhân vật - Pointer events auto để click được */}
      <div className="relative group cursor-pointer pointer-events-auto" onClick={scrollToNext}>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-yellow-100 border-2 border-yellow-400 p-1 shadow-xl overflow-hidden hover:scale-105 transition-transform">
           <img 
             src={avatarUrl} 
             alt="Trợ lý hướng dẫn" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>

      {/* Bong bóng thoại - Pointer events auto */}
      <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-xl border border-slate-100 max-w-[220px] md:max-w-[280px] relative pointer-events-auto">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={16} />
        </button>

        <button 
          onClick={() => {
            if (isSoundEnabled) window.speechSynthesis.cancel(); // Tắt tiếng ngay lập tức
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
