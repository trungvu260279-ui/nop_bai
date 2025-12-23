export type Language = 'en' | 'vi';

export interface Translation {
  nav: {
    home: string;
    stats: string;
    comics: string;
    videos: string;
    chat: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  stats: {
    title: string;
    accidents: string;
    fatalities: string;
    injuries: string;
    chartTitle: string;
    causeTitle: string;
  };
  comics: {
    title: string;
    subtitle: string;
    readNow: string; // Mới: Nút Đọc ngay
    page: string;    // Mới: Chữ Trang
    close: string;   // Mới: Đóng
  };
  videos: {
    title: string;
    subtitle: string;
  };
  chat: {
    placeholder: string;
    welcome: string;
    thinking: string;
    send: string;
    title: string;
  };
}

export interface StatData {
  year: string;
  accidents: number;
  fatalities: number;
  injuries: number;
}

export interface CauseData {
  name: string;
  value: number;
  [key: string]: any;
}

// CẤU TRÚC MỚI CHO TRUYỆN TRANH
export interface ComicSeries {
  id: number;
  title: string;
  coverUrl: string;       // Ảnh bìa
  description: string;    // Mô tả ngắn
  pages: string[];        // Danh sách các trang truyện (link ảnh)
}

export interface VideoItem {
  id: number;
  title: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
}
// ... (Các interface cũ giữ nguyên)

export interface VideoItem {
  id: number;
  title: string;
  videoUrl: string;       // Link video
  posterUrl: string;      // Ảnh chờ trước khi bấm play
  duration: string;
  source: string;         // Nguồn ghi bên dưới (VD: VTV, Youtube...)
  watermark: string;      // Chữ bay bay trong video (VD: TrafficSafeVN)
  endPosters: string[];   // Mảng chứa các ảnh poster hiện ra khi hết video
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  options?: string[]; // Thêm trường này để hiện nút bấm
}

// Interface cho dữ liệu bài học chat
export interface LessonContent {
  id: number;
  key: string;      // Từ khóa để nhận diện
  title: string;
  content: string;  // Nội dung trả lời chi tiết
}