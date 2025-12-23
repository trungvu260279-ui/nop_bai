import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from 'recharts';
import { Shield, AlertTriangle, BookOpen, Video, Globe, X, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

import { TRANSLATIONS, ACCIDENT_STATS, CAUSE_STATS, COMIC_SERIES, VIDEOS, CHAT_LESSONS } from './constants';
import { Language } from './types';
import VideoPlayer from './components/ui/VideoPlayer';
import ChatWidget from './components/ChatWidget';
import GuideAssistant from './components/GuideAssistant';

// Cấu hình worker cho react-pdf (Bắt buộc để thư viện hoạt động)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

const Header = ({ lang, setLang, t }: { lang: Language, setLang: (l: Language) => void, t: any }) => (
  <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="w-8 h-8 text-red-600" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-blue-700">
          TrafficSafe VN
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-base font-medium text-slate-600">
        <a href="#home" className="hover:text-red-600 transition-colors">{t.nav.home}</a>
        <a href="#stats" className="hover:text-red-600 transition-colors">{t.nav.stats}</a>
        <a href="#comics" className="hover:text-red-600 transition-colors">{t.nav.comics}</a>
        <a href="#word" className="hover:text-red-600 transition-colors">{lang === 'en' ? 'Materials' : 'Tài liệu'}</a>
        <a href="#videos" className="hover:text-red-600 transition-colors">{t.nav.videos}</a>
      </nav>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:border-red-500 hover:text-red-600 transition-all text-sm font-medium"
        >
          <Globe size={16} />
          {lang.toUpperCase()}
        </button>
      </div>
    </div>
  </header>
);

const Hero = ({ t }: { t: any }) => (
  <section id="home" className="relative h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop" 
        alt="Traffic background" 
        className="w-full h-full object-cover opacity-30"
      />
    </div>
    <div className="relative z-10 container mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
        {t.hero.title}
      </h1>
      <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10">
        {t.hero.subtitle}
      </p>
      <a 
        href="#stats"
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-transform hover:scale-105 shadow-lg"
      >
        <AlertTriangle size={20} />
        {t.hero.cta}
      </a>
    </div>
  </section>
);

const PromotionalComicSection = ({ t, openSeries }: { t: any, openSeries: (id: number) => void }) => {
  // Duplicate comics for a seamless loop
  const extendedComics = [...COMIC_SERIES, ...COMIC_SERIES];

  const animationStyles = `
    @keyframes bobbing {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-12px);
      }
    }

    @keyframes marquee {
      0% {
        transform: translateX(-50%);
      }
      100% {
        transform: translateX(0%);
      }
    }

    @keyframes shimmer {
      0% { transform: translateX(-150%) skewX(-20deg); }
      100% { transform: translateX(150%) skewX(-20deg); }
    }

    .animate-bobbing {
      animation: bobbing 4s ease-in-out infinite;
    }
    
    .animate-marquee {
      animation: marquee 80s linear infinite;
    }

    .animate-shimmer {
      animation: shimmer 2.5s infinite;
    }
  `;

  return (
    <section className="py-16 bg-slate-100/70 overflow-hidden border-y border-slate-200">
      <style>{animationStyles}</style>
      
      {/* 1. Tăng chiều cao khung chứa từ h-96 lên h-[600px] */}
      <div className="relative w-full h-[230px] flex items-center group">
        <div className="absolute left-0 flex animate-marquee group-hover:[animation-play-state:paused]">
          {extendedComics.map((series, index) => (
            <div
              key={`${series.id}-${index}`}
              // 2. Tăng chiều rộng (w-80) và khoảng cách (mx-8)
              className="group/item relative w-60 mx-8 flex-shrink-0 animate-bobbing"
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); openSeries(series.id); }} 
                className="block rounded-lg overflow-hidden shadow-lg hover:shadow-red-300/50 transition-all duration-300 transform hover:!scale-110 hover:!-translate-y-2 border-2 border-white relative cursor-pointer"
              >
                <img src={series.coverUrl} alt={series.title} className="w-full h-full object-cover aspect-[3/4]" />
                
                {series.id === 1 && (
                  // 3. Chỉnh lại dải ruy băng cho cân đối với ảnh to
                  // top-3 -> top-5 | -right-8 -> -right-12 | w-24 -> w-36 | text-[9px] -> text-xs
                  <div className="absolute top-5 -right-12 w-36 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs uppercase font-bold py-1.5 text-center rotate-45 shadow-lg z-10 border-y border-white/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    <span className="relative z-10">Nổi bật</span>
                  </div>
                )}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatsSection = ({ t }: { t: any }) => {
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#94a3b8'];

  // Xử lý dữ liệu để tính toán phần trăm thay đổi số vụ tai nạn so với năm trước
  const processedAccidentStats = ACCIDENT_STATS.map((current, index, array) => {
    if (index === 0) {
      return { ...current, change: null }; // Không có thay đổi cho năm đầu tiên
    }
    const previous = array[index - 1];
    if (previous.accidents === 0) {
      return { ...current, change: current.accidents > 0 ? Infinity : 0 };
    }
    const change = ((current.accidents - previous.accidents) / previous.accidents) * 100;
    return { ...current, change };
  });

  // Component label tùy chỉnh để hiển thị % tăng/giảm
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value, payload } = props;

    if (!payload) {
      return null;
    }

    const { change } = payload;
    if (change === null || !isFinite(change)) {
      return null;
    }

    const isPositive = change > 0;
    // Sử dụng icon mũi tên và làm tròn số
    const changeText = `${isPositive ? '▲' : '▼'} ${Math.abs(change).toFixed(0)}%`;
    const textColor = isPositive ? '#dc2626' : '#16a34a'; // Màu đỏ cho tăng, xanh lá cho giảm

    return (
      <text x={x + width / 2} y={y} fill={textColor} textAnchor="middle" dy={-6} fontSize={11} fontWeight="bold">
        {changeText}
      </text>
    );
  };

  return (
    <section id="stats" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-slate-900">{t.stats.title}</h2>
        <div className="w-20 h-1 bg-red-600 mx-auto mb-16 rounded-full"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Main Trend Chart */}
          <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
            <h3 className="text-xl font-semibold mb-6 text-slate-700 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-sm"></span>
              {t.stats.chartTitle}
            </h3>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedAccidentStats} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="accidents" name={t.stats.accidents} fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1000}>
                    <LabelList dataKey="change" content={renderCustomBarLabel} />
                  </Bar>
                  <Bar dataKey="injuries" name={t.stats.injuries} fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} animationBegin={200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Causes Chart */}
          <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
             <h3 className="text-xl font-semibold mb-6 text-slate-700 flex items-center gap-2">
              <span className="w-2 h-6 bg-orange-500 rounded-sm"></span>
              {t.stats.causeTitle}
            </h3>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CAUSE_STATS}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={800}
                  >
                    {CAUSE_STATS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ComicSection = ({ t, openSeries }: { t: any, openSeries: (id: number) => void }) => {
  return (
    <section id="comics" className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.comics.title}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">{t.comics.subtitle}</p>
        </div>

        {/* LIBRARY GRID VIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {COMIC_SERIES.map((series) => (
            <div 
              key={series.id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-slate-100 flex flex-col h-full"
              onClick={() => openSeries(series.id)}
            >
              {/* Cover Image with Book Spine Effect */}
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 z-10"></div>
                <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-white/20 z-10"></div>
                
                <img 
                  src={series.coverUrl} 
                  alt={series.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Read Now Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">
                     {t.comics.readNow}
                   </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-red-600 transition-colors line-clamp-1">
                  {series.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {series.description}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100">
                  <BookOpen size={14} />
                  {series.pages.length} {t.comics.page}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LessonMaterialsSection = ({ openLesson }: { openLesson: (lesson: typeof CHAT_LESSONS[0]) => void }) => {
  return (
    <section id="word" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Tài liệu Bài học (Word)</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Xem và tải xuống nội dung chi tiết các bài học về An toàn Giao thông
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CHAT_LESSONS.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
            >
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-100 to-transparent -mr-8 -mt-8 rounded-bl-3xl group-hover:from-blue-200 transition-colors"></div>

              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-700 line-clamp-1" title={lesson.title}>
                    {lesson.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    .PDF
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                {lesson.content}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">Nhấn để xem</span>
                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:underline">
                  Mở tài liệu <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Thêm style cho hiệu ứng lật giấy và watermark vào đầu file hoặc file CSS
const customStyles = `
  @keyframes float-around {
    0% { top: 10%; left: 10%; opacity: 0.3; }
    25% { top: 10%; left: 80%; opacity: 0.5; }
    50% { top: 80%; left: 80%; opacity: 0.3; }
    75% { top: 80%; left: 10%; opacity: 0.5; }
    100% { top: 10%; left: 10%; opacity: 0.3; }
  }
  
  .animate-float-watermark {
    animation: float-around 20s linear infinite;
  }

  @keyframes flip-in {
    0% { transform: rotateY(-90deg); opacity: 0; }
    100% { transform: rotateY(0deg); opacity: 1; }
  }

  .animate-flip-page {
    animation: flip-in 0.6s cubic-bezier(0.455, 0.030, 0.515, 0.955) both;
    transform-origin: left center;
  }
`;

const VideoSection = ({ t }: { t: any }) => {
  const [currentVideo, setCurrentVideo] = useState(VIDEOS[0]);
  const [isEnded, setIsEnded] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Reset trạng thái khi đổi video
  const handleSelectVideo = (video: typeof VIDEOS[0]) => {
    setCurrentVideo(video);
    setIsEnded(false);
    setPosterIndex(0);
    // Tự động play khi chọn video mới (tùy chọn)
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleVideoEnded = () => {
    setIsEnded(true);
  };

  const handleNextPoster = () => {
    // Chuyển sang poster tiếp theo (vòng tròn)
    setPosterIndex((prev) => (prev + 1) % currentVideo.endPosters.length);
  };

  const handleReplay = () => {
    setIsEnded(false);
    setPosterIndex(0);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section id="videos" className="py-20 bg-slate-900 text-white relative">
      <style>{customStyles}</style>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t.videos.title}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">{t.videos.subtitle}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* MAIN PLAYER AREA (Chiếm 2/3) */}
          <div className="flex-1">
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 aspect-video group">
              
              {!isEnded ? (
                <>
                  {/* VIDEO PLAYER */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    poster={currentVideo.posterUrl}
                    onEnded={handleVideoEnded}
                    src={currentVideo.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* WATERMARK (Bay bay mờ mờ) */}
                  <div className="absolute px-4 py-2 pointer-events-none animate-float-watermark z-10 select-none">
                    <span className="text-white font-bold text-2xl uppercase tracking-widest bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1">
                      {currentVideo.watermark}
                    </span>
                  </div>
                </>
              ) : (
                /* END SCREEN (Poster & Message) */
                <div 
                  className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                  onClick={handleNextPoster}
                >
                  <div 
                    key={posterIndex} // Key thay đổi để trigger animation lại
                    className="relative w-full h-full flex items-center justify-center p-4 animate-flip-page"
                  >
                     {/* Background mờ phía sau */}
                     <div 
                        className="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
                        style={{ backgroundImage: `url(${currentVideo.endPosters[posterIndex]})` }}
                     />
                     
                     {/* Ảnh chính */}
                     <img 
                       src={currentVideo.endPosters[posterIndex]} 
                       alt="End Poster" 
                       className="relative max-h-[80%] max-w-[90%] object-contain shadow-2xl rounded-lg border-4 border-white/10"
                     />

                     <div className="absolute bottom-4 text-slate-300 text-sm bg-black/60 px-4 py-2 rounded-full backdrop-blur-md animate-bounce">
                        👆 Nhấn để xem tiếp thông điệp ({posterIndex + 1}/{currentVideo.endPosters.length})
                     </div>
                  </div>

                  {/* Nút Xem lại */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleReplay(); }}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold z-20 flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <Video size={16} /> Xem lại
                  </button>
                </div>
              )}
            </div>

            {/* SOURCE INFO */}
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{currentVideo.title}</h3>
                <p className="text-slate-400 text-sm italic">{currentVideo.source}</p>
              </div>
              <div className="text-slate-500 text-xs font-mono px-2 py-1 bg-slate-900 rounded">
                ID: {currentVideo.id}
              </div>
            </div>
          </div>

          {/* SIDEBAR PLAYLIST (Chiếm 1/3) */}
          <div className="lg:w-96 flex flex-col h-[500px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <BookOpen size={20} className="text-red-500" />
                Danh sách bài học
              </h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
              {VIDEOS.map((video) => (
                <div 
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className={`p-3 rounded-lg flex gap-3 cursor-pointer transition-all duration-200 group ${currentVideo.id === video.id ? 'bg-red-600/20 border border-red-500/50' : 'hover:bg-slate-700 border border-transparent'}`}
                >
                  {/* Thumbnail nhỏ */}
                  <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-black">
                     <img src={video.posterUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     {currentVideo.id === video.id && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                       </div>
                     )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className={`text-sm font-medium mb-1 line-clamp-2 ${currentVideo.id === video.id ? 'text-red-400' : 'text-slate-200'}`}>
                      {video.title}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                       <span>{video.duration}</span>
                       <span>•</span>
                       <span className="truncate max-w-[100px]">{video.watermark}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 py-12">
    <div className="container mx-auto px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-red-600" />
        <span className="text-lg font-bold text-white">TrafficSafe VN</span>
      </div>
      <div className="flex justify-center gap-6 mb-8 text-sm">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Contact</a>
      </div>
      <p className="text-xs">&copy; {new Date().getFullYear()} TrafficSafe Vietnam. All rights reserved.</p>
    </div>
  </footer>
);

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi');
  const t = TRANSLATIONS[lang];
  
  // State and logic for Comic Reader Modal (lifted up)
  const [activeSeriesId, setActiveSeriesId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeLesson, setActiveLesson] = useState<typeof CHAT_LESSONS[0] | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfWidth, setPdfWidth] = useState(800);

  // Cập nhật chiều rộng PDF khi thay đổi kích thước màn hình để hiển thị to rõ nhất
  useEffect(() => {
    const updateWidth = () => {
      // Tính toán chiều rộng dựa trên kích thước modal (80vw trên desktop)
      const isDesktop = window.innerWidth >= 768;
      const containerWidth = isDesktop ? window.innerWidth * 0.8 : window.innerWidth;
      setPdfWidth(containerWidth - 64); // Trừ đi padding (khoảng 64px) để không bị thanh cuộn ngang
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const activeSeries = COMIC_SERIES.find(s => s.id === activeSeriesId);

  const openSeries = (id: number) => {
    setActiveSeriesId(id);
    setCurrentPage(0);
  };

  const closeReader = () => {
    setActiveSeriesId(null);
  };

  const nextPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeSeries && currentPage < activeSeries.pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeSeries) return;
      if (e.key === 'Escape') closeReader();
      if (e.key === 'ArrowRight') {
        if (currentPage < activeSeries.pages.length - 1) setCurrentPage(p => p + 1);
      }
      if (e.key === 'ArrowLeft') {
        if (currentPage > 0) setCurrentPage(p => p - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSeries, currentPage]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>
      <Header lang={lang} setLang={setLang} t={t} />
      <main>
        <Hero t={t} />
        <PromotionalComicSection t={t} openSeries={openSeries} />
        <StatsSection t={t} />
        <ComicSection t={t} openSeries={openSeries} />
        <LessonMaterialsSection openLesson={setActiveLesson} />
        <VideoSection t={t} />
      </main>
      <Footer />
      <ChatWidget t={t.chat} />
      <GuideAssistant />

      {/* READER MODAL */}
      {activeSeries && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center" onClick={closeReader}>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center text-white z-50 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-bold text-lg md:text-xl drop-shadow-md pl-2">{activeSeries.title}</h3>
            <button onClick={closeReader} className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2">
              <span className="hidden md:inline text-sm font-medium">{t.comics.close}</span>
              <X size={28} />
            </button>
          </div>

          {/* Viewer */}
          <div className="relative w-full h-full flex items-center justify-center p-2 md:p-8" onClick={(e) => e.stopPropagation()}>
            <button className={`absolute left-2 md:left-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all transform hover:scale-110 z-50 ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={prevPage}>
              <ChevronLeft size={32} />
            </button>
            <div className="relative max-h-full max-w-5xl shadow-2xl rounded-lg overflow-hidden bg-white">
               <img src={activeSeries.pages[currentPage]} alt={`Page ${currentPage + 1}`} className="max-h-[80vh] md:max-h-[90vh] w-auto object-contain select-none" />
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-md shadow-lg border border-white/10">
                 {t.comics.page} {currentPage + 1} / {activeSeries.pages.length}
               </div>
            </div>
            <button className={`absolute right-2 md:right-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all transform hover:scale-110 z-50 ${currentPage === activeSeries.pages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={nextPage}>
              <ChevronRight size={32} />
            </button>
          </div>
          
          {/* Pagination Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 p-2 overflow-x-auto z-50 pointer-events-none">
             {activeSeries.pages.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentPage ? 'bg-red-500 w-8' : 'bg-white/40 w-2'}`} />
             ))}
          </div>
        </div>
      )}

      {/* LESSON VIEWER MODAL (WORD STYLE) */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveLesson(null)}>
          <div 
            className="bg-white w-full md:w-[80vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{activeLesson.title}</h3>
                  <p className="text-xs text-slate-500">Tài liệu giáo dục ATGT</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Download Button */}
                <a 
                  href={`/word_text/BÀI ${activeLesson.id}.pdf`} 
                  download
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  title="Tải về file gốc"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Tải về .pdf</span>
                </a>
                <button 
                  onClick={() => setActiveLesson(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Viewer (React-PDF) */}
            <div className="flex-1 bg-slate-200 overflow-y-auto p-4 flex justify-center">
              <Document
                file={`/word_text/BÀI ${activeLesson.id}.pdf`}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div className="flex items-center gap-2 text-slate-500 mt-10"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div> Đang tải tài liệu...</div>}
                error={<div className="text-red-500 mt-10">Không thể tải tài liệu. Vui lòng kiểm tra lại file.</div>}
                className="flex flex-col gap-4"
              >
                {numPages && Array.from(new Array(numPages), (_, index) => (
                  <Page 
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-lg"
                    width={pdfWidth}
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;