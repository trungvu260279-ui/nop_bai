import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MousePointerClick } from 'lucide-react'; // Thêm icon click cho sinh động

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [textVisible, setTextVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Chỉ tự động hiện chữ sau 0.5s, KHÔNG tự động tắt nữa
    const textTimer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(textTimer);
  }, []);

  // Hàm xử lý khi người dùng click vào màn hình
  const handleClick = () => {
    setIsExiting(true); // Bắt đầu hiệu ứng mờ dần
    
    // Đợi 0.5s cho hiệu ứng mờ chạy xong thì mới gỡ bỏ component
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div 
      onClick={handleClick} // Bắt sự kiện click toàn màn hình
      className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center">
        
        {/* ROBOT LOTTIE - Bên trái */}
        <div className="w-1/2 h-full flex items-center justify-center animate-in slide-in-from-left duration-1000">
          <DotLottieReact
            src="https://lottie.host/59e70cde-8f82-4ca3-a737-463fa2de7766/762YXfRWJu.lottie"
            loop
            autoplay
            className="w-full h-full scale-125"
          />
        </div>

        {/* CHỮ CHÀO MỪNG - Bên phải chéo */}
        <div className={`absolute left-1/2 top-1/3 transition-all duration-1000 ease-out z-10 ${
          textVisible 
            ? 'opacity-100 translate-x-0 -rotate-6' // Hiện & Nghiêng
            : 'opacity-0 translate-x-20 rotate-0'   // Ẩn
        }`}>
          <div className="bg-white p-6 md:p-8 rounded-3xl rounded-bl-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-red-500 relative">
            {/* Tam giác hội thoại */}
            <div className="absolute top-full left-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[30px] border-t-red-500 border-r-[0px] border-r-transparent transform translate-x-8 -translate-y-[2px]"></div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight whitespace-nowrap">
              WELCOME TO <br/>
              <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                TRAFFIC SAFE VN
              </span>
            </h1>
            <p className="mt-3 text-slate-500 font-medium text-xl">
              Đồng hành cùng bạn trên mọi nẻo đường
            </p>
          </div>
        </div>

      </div>

      {/* DÒNG CHỮ NHẮC NHỞ CLICK (Nhấp nháy dưới cùng) */}
      <div className="absolute bottom-12 animate-bounce flex flex-col items-center gap-2 text-slate-400 group-hover:text-red-500 transition-colors">
        <MousePointerClick size={32} />
        <span className="text-sm font-bold uppercase tracking-widest">
          Chạm vào màn hình để bắt đầu
        </span>
      </div>
    </div>
  );
};

export default WelcomeScreen;