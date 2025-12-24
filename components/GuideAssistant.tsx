import React, { useState, useEffect } from 'react';
import { X, MapPin, ChevronRight, Lightbulb, Volume2, VolumeX } from 'lucide-react';

const TIPS = [
  { id: 'home', text: 'Chào bạn! Tôi là Trợ lý số liệu. Hãy cuộn xuống để xem các báo cáo thống kê ATGT.', target: 'home' },
  { id: 'stats', text: 'Biểu đồ này thống kê tai nạn theo quý. Rê chuột vào từng cột để xem số liệu cụ thể.', target: 'stats' },
  { id: 'comics', text: 'Thư viện truyện tranh giáo dục: Các tình huống được mô phỏng sinh động và trực quan.', target: 'comics' },
  { id: 'word', text: 'Hệ thống văn bản pháp luật: Bạn có thể tra cứu trực tiếp các Nghị định và Thông tư mới nhất.', target: 'word' },
  { id: 'videos', text: 'Phim tư liệu tình huống: Phân tích các lỗi vi phạm thường gặp để rút kinh nghiệm.', target: 'videos' },
];

// Thay thế các câu đùa bằng thông tin pháp luật nghiêm túc
const FALLBACK_BANTER = [
  "Theo Nghị định 168/2024, vi phạm nồng độ cồn mức cao nhất có thể bị phạt tới 40 triệu đồng.",
  "Đội mũ bảo hiểm đúng quy cách giúp giảm 69% nguy cơ chấn thương sọ não nặng.",
  "Mức phạt không đội mũ bảo hiểm cho người đi xe gắn máy hiện nay là từ 400.000 đến 600.000 VNĐ.",
  "Sử dụng điện thoại khi lái xe máy sẽ bị xử phạt từ 800.000 đến 1.000.000 VNĐ.",
  "Khoảng cách an toàn giữa các xe khi chạy với tốc độ 60km/h tối thiểu là 35 mét.",
  "Học sinh từ đủ 16 tuổi đến dưới 18 tuổi chỉ được điều khiển xe gắn máy dưới 50cm3.",
  "Vượt đèn đỏ đối với xe máy sẽ bị phạt từ 800.000 VNĐ đến 1.000.000 VNĐ và tước GPLX.",
];

const GuideAssistant = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [position, setPosition] = useState({ top: '75%', left: '2%' });
  const [banter, setBanter] = useState('');
  const [isBantering, setIsBantering] = useState(false);
  const [mood, setMood] = useState<'happy' | 'serious'>('serious'); 
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsBantering(false);
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

  useEffect(() => {
    if (!isVisible) return;
    const moveInterval = setInterval(() => {
      const newTop = `${Math.random() * 60 + 20}%`;
      const newLeft = `${Math.random() * 70 + 5}%`;
      setPosition({ top: newTop, left: newLeft });
    }, 15000); 
    return () => clearInterval(moveInterval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const fetchBanter = async () => {
      try {
        const response = await fetch('https://python-deloy.onrender.com/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: "Hãy đưa ra một điều luật hoặc mức phạt giao thông ngắn gọn từ Nghị định 168/2024." 
          })
        });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        // Sửa data.text thành data.answer để khớp với Backend
        setBanter(data.answer); 
        setIsBantering(true);
        setMood('serious');
      } catch (error) {
        const randomBanter = FALLBACK_BANTER[Math.floor(Math.random() * FALLBACK_BANTER.length)];
        setBanter(randomBanter);
        setIsBantering(true);
      }
    };

    const banterInterval = setInterval(fetchBanter, 40000);
    const initialTimeout = setTimeout(fetchBanter, 5000);

    return () => {
      clearInterval(banterInterval);
      clearTimeout(initialTimeout);
    };
  }, [isVisible]);

  const scrollToNext = () => {
    const nextIndex = (currentTipIndex + 1) % TIPS.length;
    const targetId = TIPS[nextIndex].target;
    const element = document.getElementById(targetId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const avatarUrl = "public/ai_vui_nhon.png"; 

  if (!isVisible) return (
    <button 
      onClick={() => setIsVisible(true)}
      className="fixed bottom-24 left-4 z-40 bg-white p-3 rounded-full shadow-lg border-2 border-blue-400 hover:scale-110 transition-transform"
    >
      <Lightbulb className="text-blue-500" size={24} />
    </button>
  );

  return (
    <div 
      className="fixed z-40 flex items-end gap-3 animate-in slide-in-from-left duration-500 font-sans pointer-events-none transition-all ease-in-out"
      style={{ top: position.top, left: position.left, transitionDuration: '2000ms' }}
    >
      <div className="relative group cursor-pointer pointer-events-auto" onClick={scrollToNext}>
        <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-blue-400 p-1 shadow-xl overflow-hidden">
           <img src={avatarUrl} alt="Trợ lý" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-xl border border-slate-100 max-w-[250px] relative pointer-events-auto">
        <button onClick={() => setIsVisible(false)} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500"><X size={16} /></button>
        <h4 className="font-bold text-blue-700 text-sm mb-1 flex items-center gap-1"><MapPin size={14} /> Cố vấn Pháp luật</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{isBantering ? banter : TIPS[currentTipIndex].text}</p>
      </div>
    </div>
  );
};

export default GuideAssistant;
