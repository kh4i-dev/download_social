import React from "react";

export function Footer() {
  return (
    <footer className="w-full mt-16 pt-6 border-t border-zinc-900/60 flex flex-col items-center gap-4">
      <div className="flex items-center justify-center">
        {/* N Logo */}
        <span className="w-7 h-7 flex items-center justify-center font-mono font-bold text-sm text-emerald-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-emerald-500/30 transition-colors shadow-lg">
          N
        </span>
      </div>

      <p className="text-[10px] leading-relaxed text-zinc-600 text-center max-w-xl">
        Công cụ này kết nối an toàn tới các máy chủ Cobalt từ xa. Tất cả quá trình chuyển đổi và xử lý được thực hiện trên nút từ xa. Không có tệp video hoặc dữ liệu người dùng nào được lưu trữ trên máy chủ proxy này.
      </p>

      <div className="flex justify-center gap-4 text-[10px] text-zinc-500">
        <a
          href="https://github.com/imputnet/cobalt"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 transition-colors"
        >
          Hỗ trợ bởi Cobalt
        </a>
        <span className="text-zinc-700">•</span>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 transition-colors"
        >
          Triển khai trên Vercel
        </a>
      </div>
    </footer>
  );
}
