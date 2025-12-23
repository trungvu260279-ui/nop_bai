import { Translation, StatData, CauseData, ComicSeries, VideoItem, LessonContent } from './types';

// --- 1. DỮ LIỆU ĐA NGÔN NGỮ ---
export const TRANSLATIONS: Record<'en' | 'vi', Translation> = {
  en: {
    nav: {
      home: "Home",
      stats: "Statistics",
      comics: "Comics",
      videos: "Videos",
      chat: "Safety Assistant",
    },
    hero: {
      title: "Drive Safe, Stay Safe",
      subtitle: "Join us in making Vietnam's roads safer for everyone through education, awareness, and responsible driving.",
      cta: "Explore Statistics",
    },
    stats: {
      title: "Traffic Safety Statistics in Vietnam",
      accidents: "Total Accidents",
      fatalities: "Fatalities",
      injuries: "Injuries",
      chartTitle: "Annual Accident Trends",
      causeTitle: "Primary Causes of Accidents",
    },
    comics: {
      title: "Traffic Safety Library",
      subtitle: "Select a book to start learning about road safety.",
      readNow: "Read Now",
      page: "Page",
      close: "Close",
    },
    videos: {
      title: "Educational Videos",
      subtitle: "Watch and learn essential driving skills and safety tips.",
    },
    chat: {
      placeholder: "Ask about traffic laws in Vietnam...",
      welcome: "Hello! This is the Traffic Safety knowledge support system. Which topic would you like to learn about?",
      thinking: "Thinking...",
      send: "Send",
      title: "Safety Assistant",
      thinking_steps: {
        searching: "Searching the internet...",
        analyzing: "Analyzing data...",
        generating: "Generating response...",
      }
    },
  },
  vi: {
    nav: {
      home: "Trang chủ",
      stats: "Thống kê",
      comics: "Truyện tranh",
      videos: "Video",
      chat: "Trợ lý an toàn",
    },
    hero: {
      title: "An toàn giao thông là hạnh phúc",
      subtitle: "Chung tay xây dựng văn hóa giao thông an toàn tại Việt Nam thông qua giáo dục và ý thức trách nhiệm.",
      cta: "Xem thống kê",
    },
    stats: {
      title: "Thống kê An toàn Giao thông Việt Nam",
      accidents: "Số vụ tai nạn",
      fatalities: "Người tử vong",
      injuries: "Người bị thương",
      chartTitle: "Xu hướng tai nạn hàng năm",
      causeTitle: "Nguyên nhân chính gây tai nạn",
    },
    comics: {
      title: "Thư Viện Truyện Tranh",
      subtitle: "Chọn một cuốn truyện để bắt đầu tìm hiểu luật giao thông.",
      readNow: "Đọc ngay",
      page: "Trang",
      close: "Đóng",
    },
    videos: {
      title: "Video Giáo dục",
      subtitle: "Xem và học các kỹ năng lái xe an toàn.",
    },
    chat: {
      placeholder: "Hỏi về luật giao thông...",
      welcome: "``Hello, Tôi là hệ thống hỗ trợ kiến thức về ATGT. Bạn muốn tìm hiểu chủ đề nào?",
      thinking: "Đang suy nghĩ...",
      send: "Gửi",
      title: "Trợ lý ảo",
      thinking_steps: {
        searching: "Đang tìm kiếm trên internet...",
        analyzing: "Đang phân tích dữ liệu...",
        generating: "Đang tạo câu trả lời...",
      }
    },
  },
};

// --- 2. DỮ LIỆU THỐNG KÊ ---
export const ACCIDENT_STATS: StatData[] = [
  { year: '2019', accidents: 17626, fatalities: 7624, injuries: 13624 },
  { year: '2020', accidents: 14510, fatalities: 6700, injuries: 10804 },
  { year: '2021', accidents: 11495, fatalities: 5799, injuries: 8018 },
  { year: '2022', accidents: 11457, fatalities: 6397, injuries: 7804 },
  { year: '2023', accidents: 22067, fatalities: 11628, injuries: 15292 },
  { year: '2024', accidents: 23484, fatalities: 10944, injuries: 17342 },
  { year: '2025', accidents: 15251, fatalities: 8515, injuries: 10204 },
];

export const CAUSE_STATS: CauseData[] = [
  { name: 'Speeding (Quá tốc độ)', value: 35 },
  { name: 'Wrong Lane (Sai làn)', value: 25 },
  { name: 'Alcohol (Rượu bia)', value: 15 },
  { name: 'Overtaking (Vượt ẩu)', value: 10 },
  { name: 'Others (Khác)', value: 15 },
];

// --- 3. DỮ LIỆU TRUYỆN TRANH ---
export const COMIC_SERIES: ComicSeries[] = [
  {
    id: 1,
    title: "Tập 1: Ngã Rẽ Định Mệnh",
    coverUrl: "/img/img_1.jpg",
    description: "Những bài học vỡ lòng cho các bạn học sinh khi tham gia giao thông.",
    pages: ["/img/img_2.jpg", "/img/img_3.jpg","/img/img_4.jpg","/img/img_5.jpg","/img/img_6.jpg","/img/img_7.jpg","/img/img_8.jpg","/img/img_9.jpg","/img/img_10.jpg","/img/img_11.jpg","/img/img_12.jpg","/img/img_13.jpg","/img/img_14.jpg","/img/img_15.jpg","/img/img_16.jpg"] 
  },
  {
    id: 2,
    title: "Tập 2: TẦM QUAN TRỌNG CỦA VIỆC TUÂN THỦ CÁC QUY TẮC AN TOÀN GIAO THÔNG ĐƯỜNG BỘ",
    coverUrl: "/bai_2/bai_2_1.jpg",
    description: "Việc tuân thủ an toàn giao thông để bảo vệ chính mình và cộng đồng.",
    pages: ["/bai_2/bai_2_2.jpg", "/bai_2/bai_2_3.jpg", "/bai_2/bai_2_4.jpg", "/bai_2/bai_2_5.jpg", "/bai_2/bai_2_6.jpg", "/bai_2/bai_2_7.jpg", "/bai_2/bai_2_8.jpg", "/bai_2/bai_2_9.jpg", "/bai_2/bai_2_10.jpg", "/bai_2/bai_2_11.jpg", "/bai_2/bai_2_12.jpg", "/bai_2/bai_2_13.jpg", "/bai_2/bai_2_14.jpg", "/bai_2/bai_2_15.jpg"]
  },
  {
    id: 3,
    title: "Tập 3: HỆ THỐNG BÁO HIỆU GIAO THÔNG ĐƯỜNG BỘ",
    coverUrl: "/bai_3/bai_3_1.jpg",
    description: "Giới thiệu các loại báo hiệu giao thông đường bộ và vai trò của chúng trong việc đảm bảo an toàn khi tham gia giao thông.",
    pages: ["/bai_3/bai_3_2.jpg", "/bai_3/bai_3_3.jpg", "/bai_3/bai_3_4.jpg", "/bai_3/bai_3_5.jpg", "/bai_3/bai_3_6.jpg", "/bai_3/bai_3_7.jpg", "/bai_3/bai_3_8.jpg", "/bai_3/bai_3_9.jpg", "/bai_3/bai_3_10.jpg", "/bai_3/bai_3_11.jpg", "/bai_3/bai_3_12.jpg", "/bai_3/bai_3_13.jpg", "/bai_3/bai_3_14.jpg", "/bai_3/bai_3_15.jpg", "/bai_3/bai_3_16.jpg", "/bai_3/bai_3_17.jpg", "/bai_3/bai_3_18.jpg", "/bai_3/bai_3_19.jpg", "/bai_3/bai_3_20.jpg"]
  },
  {
    id: 4,
    title: "Tập 4: DỰ ĐOÁN VÀ PHÒNG TRÁNH NGUY HIỂM",
    coverUrl: "/xe_dap/xe_dap_1.jpg",
    description: "Giới thiệu cách nhận biết, dự đoán và phòng tránh các nguy hiểm khi tham gia giao thông, giúp bảo đảm an toàn cho bản thân và người khác.",
    pages: ["/xe_dap/xe_dap_2.jpg", "/xe_dap/xe_dap_3.jpg", "/xe_dap/xe_dap_4.jpg", "/xe_dap/xe_dap_5.jpg", "/xe_dap/xe_dap_6.jpg", "/xe_dap/xe_dap_7.jpg", "/xe_dap/xe_dap_8.jpg", "/xe_dap/xe_dap_9.jpg", "/xe_dap/xe_dap_10.jpg", "/xe_dap/xe_dap_11.jpg", "/xe_dap/xe_dap_12.jpg", "/xe_dap/xe_dap_13.jpg", "/xe_dap/xe_dap_14.jpg" ]
  },
  {
    id: 5,
    title: "Tập 5: CÁCH ĐI XE ĐẠP, XE ĐẠP ĐIỆN AN TOÀN VÀ TRANG PHỤC KHI THAM GIA GIAO THÔNG",
    coverUrl: "/chu_quan/tai_nan_1.jpg",
    description: "Lựa chọn trang phục phù hợp để tự bảo vệ mình và góp phần xây dựng một môi trường giao thông văn minh, an toàn cho tất cả.",
    pages: ["/chu_quan/tai_nan_2.jpg", "/chu_quan/tai_nan_3.jpg", "/chu_quan/tai_nan_4.jpg", "/chu_quan/tai_nan_5.jpg", "/chu_quan/tai_nan_6.jpg", "/chu_quan/tai_nan_7.jpg", "/chu_quan/tai_nan_8.jpg", "/chu_quan/tai_nan_9.jpg", "/chu_quan/tai_nan_10.jpg", "/chu_quan/tai_nan_11.jpg", "/chu_quan/tai_nan_12.jpg"]
  },
  {
    id: 6,
    title: "Tập 6: CHUẨN BỊ ĐIỀU KHIỂN XE MÔ TÔ, XE GẮN MÁY AN TOÀN",
    coverUrl: "/bai_5/bai_5_1.jpg",
    description: "Chuẩn bị đầy đủ để lái xe an toàn.",
    pages: ["/bai_5/bai_5_2.jpg", "/bai_5/bai_5_3.jpg", "/bai_5/bai_5_4.jpg", "/bai_5/bai_5_5.jpg", "/bai_5/bai_5_6.jpg", "/bai_5/bai_5_7.jpg", "/bai_5/bai_5_8.jpg", "/bai_5/bai_5_9.jpg", "/bai_5/bai_5_10.jpg", "/bai_5/bai_5_11.jpg", "/bai_5/bai_5_12.jpg", "/bai_5/bai_5_13.jpg"]
  },
  {
    id: 7,
    title: "Tập 7: AN TOÀN GIAO THÔNG ĐƯỜNG SẮT VÀ ĐƯỜNG THỦY",
    coverUrl: "/bai_6/bai_6_1.jpg",
    description: "Những quy tắc cần nhớ để an toàn khi tham gia giao thông đường sắt và đường thủy.",
    pages: ["/bai_6/bai_6_2.jpg", "/bai_6/bai_6_3.jpg", "/bai_6/bai_6_4.jpg", "/bai_6/bai_6_5.jpg", "/bai_6/bai_6_6.jpg", "/bai_6/bai_6_7.jpg", "/bai_6/bai_6_8.jpg", "/bai_6/bai_6_9.jpg", "/bai_6/bai_6_10.jpg", "/bai_6/bai_6_11.jpg", "/bai_6/bai_6_12.jpg", "/bai_6/bai_6_13.jpg", "/bai_6/bai_6_14.jpg", "/bai_6/bai_6_15.jpg", "/bai_6/bai_6_16.jpg", "/bai_6/bai_6_17.jpg"]
  },
];

// --- 4. DỮ LIỆU BÀI HỌC CHO CHATBOT (Chi tiết cao & Chia nhỏ ý) ---
export const CHAT_LESSONS: LessonContent[] = [
  {
    id: 1,
    key: "tầm quan trọng",
    title: "Bài 1: Tầm quan trọng",
    content: "🛡️ BÀI 1: TẦM QUAN TRỌNG CỦA VIỆC TUÂN THỦ ATGT\n\nBạn cần biết những con số và quy định quan trọng sau:\n\n1. Hậu quả của tai nạn (Thống kê 2023):\n- Trung bình mỗi ngày Việt Nam có khoảng 17 người tử vong vì TNGT.\n- 70% số vụ tai nạn liên quan đến xe mô tô, xe gắn máy.\n\n2. Ba lợi ích cốt lõi khi tuân thủ:\n- Bảo vệ tính mạng: Giảm 60% nguy cơ chấn thương sọ não nếu đội mũ bảo hiểm đúng cách.\n- Tiết kiệm tiền bạc: Tránh bị phạt tiền (từ vài trăm nghìn đến hàng chục triệu đồng).\n- Tránh rắc rối pháp lý: Không bị giữ xe, không bị tước bằng lái.\n\n3. Trách nhiệm pháp lý:\n- Người gây tai nạn có thể bị phạt tù từ 3 năm đến 15 năm tùy mức độ nghiêm trọng.\n- Phải bồi thường thiệt hại dân sự (tiền thuốc men, sửa xe, thu nhập bị mất) cho nạn nhân."
  },
  {
    id: 2,
    key: "báo hiệu",
    title: "Bài 2: Hệ thống báo hiệu",
    content: "🚦 BÀI 2: HỆ THỐNG BÁO HIỆU ĐƯỜNG BỘ\n\nChi tiết các nhóm tín hiệu bạn thường gặp:\n\n1. Hiệu lệnh Cảnh sát giao thông (Ưu tiên số 1):\n- Tay giơ thẳng đứng: Tất cả các hướng dừng lại.\n- Hai tay dang ngang: Trước/Sau dừng lại; Trái/Phải được đi.\n\n2. Đèn tín hiệu và Mức phạt vượt đèn:\n- Đèn Đỏ/Vàng: Phải dừng trước vạch.\n- Mức phạt vượt đèn đỏ xe máy: 800.000đ - 1.000.000đ (+ Tước bằng 1-3 tháng).\n- Mức phạt vượt đèn đỏ ô tô: 4.000.000đ - 6.000.000đ (+ Tước bằng 1-3 tháng).\n\n3. Biển báo quan trọng:\n⛔ Biển Cấm (Tròn, viền đỏ): Cấm rẽ trái (P.123), Cấm đi ngược chiều (P.102), Đường cấm (P.101).\n⚠️ Biển Nguy hiểm (Tam giác vàng): Giao nhau với đường ưu tiên (W.208), Đường trơn (W.222).\n🔵 Biển Hiệu lệnh (Tròn xanh): Các xe chỉ được đi thẳng (R.301a)."
  },
  {
    id: 3,
    key: "dự đoán",
    title: "Bài 3: Phòng tránh nguy hiểm",
    content: "👀 BÀI 3: KỸ NĂNG DỰ ĐOÁN & PHÒNG TRÁNH NGUY HIỂM\n\nCác tình huống cụ thể và cách xử lý:\n\n1. Điểm mù của xe lớn (Container, Xe buýt):\n- Vị trí nguy hiểm: Ngay trước mũi xe, ngay sau đuôi xe, và hai bên hông xe.\n- Quy tắc: Nếu bạn không nhìn thấy tài xế qua gương chiếu hậu của họ, họ cũng không thấy bạn. Hãy tránh xa.\n\n2. Khoảng cách an toàn (Quy tắc 3 giây):\n- Tốc độ 60km/h: Giữ khoảng cách tối thiểu 35 mét.\n- Tốc độ 80km/h: Giữ khoảng cách tối thiểu 55 mét.\n\n3. Dấu hiệu nguy hiểm cần giảm tốc ngay:\n- Bóng người hoặc quả bóng lăn ra đường.\n- Xe phía trước đi lạng lách hoặc phanh gấp.\n- Mặt đường có vệt dầu loang hoặc cát sỏi (dễ trượt ngã)."
  },
  {
    id: 4,
    key: "xe đạp",
    title: "Bài 4: Xe đạp & Xe điện",
    content: "🚲 BÀI 4: AN TOÀN VỚI XE ĐẠP & XE ĐẠP ĐIỆN\n\nQuy định cụ thể và mức phạt:\n\n1. Quy tắc bắt buộc:\n- Mũ bảo hiểm: Bắt buộc đội với xe máy điện và xe đạp điện. Không đội phạt 400.000đ - 600.000đ.\n- Đi đúng làn: Xe thô sơ phải đi sát lề đường bên phải.\n\n2. Các hành vi CẤM và Mức phạt (với xe đạp/xe điện):\n- Đi dàn hàng ngang (từ 3 xe trở lên): Phạt 80.000đ - 100.000đ.\n- Sử dụng ô (dù), điện thoại: Phạt 80.000đ - 100.000đ.\n- Buông cả hai tay, đi bằng một bánh: Cực kỳ nguy hiểm và bị cấm hoàn toàn.\n\n3. Chuyển hướng an toàn:\n- Giảm tốc độ.\n- Quan sát kỹ phía sau.\n- Giơ tay xin đường (xe đạp) hoặc bật xi nhan (xe điện) trước ít nhất 30m."
  },
  {
    id: 5,
    key: "xe máy",
    title: "Bài 5: Xe mô tô, gắn máy",
    content: "🛵 BÀI 5: CHUẨN BỊ ĐIỀU KHIỂN XE MÁY\n\nDanh sách kiểm tra và mức phạt liên quan:\n\n1. Kiểm tra Giấy tờ (Bắt buộc mang theo):\n- Đăng ký xe (Cà vẹt).\n- Giấy phép lái xe (GPLX).\n- Bảo hiểm TNDS bắt buộc (Không có phạt 100k-200k).\n- Căn cước công dân (hoặc VNeID mức 2).\n\n2. Kiểm tra Kỹ thuật xe:\n- Gương chiếu hậu: Phải có gương bên TRÁI. (Không có gương trái phạt 300.000đ - 400.000đ).\n- Lốp xe: Không quá mòn, áp suất lốp đủ chuẩn.\n- Đèn: Phải bật đèn chiếu sáng từ 19h tối đến 5h sáng (theo luật cũ) hoặc quy định mới là bật khi trời tối/sương mù.\n\n3. Trang bị an toàn:\n- Mũ bảo hiểm: Phải cài quai đúng quy cách. (Không đội phạt 400.000đ - 600.000đ).\n- Giày: Nên đi giày hoặc dép có quai hậu, tránh đi dép lê dễ trượt chân."
  },
  {
    id: 6,
    key: "đường sắt",
    title: "Bài 6: Đường sắt & Thủy",
    content: "🚂 BÀI 6: GIAO THÔNG ĐƯỜNG SẮT & ĐƯỜNG THỦY\n\nNhững quy tắc sống còn:\n\n1. Khi đi qua đường ngang đường sắt:\n- Nguyên tắc vàng: Tàu hỏa không thể phanh gấp. Tàu luôn có quyền ưu tiên tuyệt đối.\n- Khi có tín hiệu dừng (đèn đỏ/chuông/thanh chắn): Dừng lại ngay cách đường ray tối thiểu 5 mét.\n- Mức phạt vượt rào chắn: Lên tới 5.000.000đ và tước bằng lái.\n\n2. Khi tham gia giao thông đường thủy (Phà, Đò):\n- Áo phao: Bắt buộc mặc áo phao hoặc cầm dụng cụ nổi cá nhân. (Không mặc có thể bị từ chối phục vụ).\n- Lên xuống đò: Chờ đò cập bến hẳn, được buộc dây cố định mới lên xuống.\n- Tuyệt đối không: Chen lấn, xô đẩy, hoặc ngồi lên thành tàu/đò."
  }
];

// --- 5. DỮ LIỆU VIDEO ---
export const VIDEOS: VideoItem[] = [
  {
    id: 1,
    title: "video 1",
    videoUrl: "/video/video_1.mp4", 
    posterUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop",
    duration: "0:31",
    source: "Nguồn: https://t.me/hongbien_ez and facebook.com",
    watermark: "hongbien_ez",
    endPosters: [
      "/poster/poster_1.jpg", 
      "/poster/poster_2.jpg", 
      "/poster/poster_3.jpg"
    ]
  },
  {
    id: 2,
    title: "video 2",
    videoUrl: "/video/video_2.mp4",
    posterUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop",
    duration: "0:18",
    source: "Nguồn: https://t.me/hongbien_ez and facebook.com",
    watermark: "hongbien_ez",
    endPosters: [
      "/poster/poster_4.jpg",
      "/poster/poster_5.jpg",
      "/poster/poster_6.jpg"
    ]
  },
  {
    id: 3,
    title: "video 3",
    videoUrl: "/video/video_3.mp4",
    posterUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop",
    duration: "0:16",
    source: "Nguồn: https://t.me/hongbien_ez and facebook.com",
    watermark: "hongbien_ez",
    endPosters: [
      "/poster/poster_7.jpg",
      "/poster/poster_8.jpg",
      "/poster/poster_9.jpg"
    ]
  }
];