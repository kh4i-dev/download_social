import React from "react";

export function Footer() {
  return (
    <footer className="w-full max-w-xl mx-auto mt-20 pb-8 text-center border-t border-zinc-900/60 pt-6">
      <p className="text-[10px] leading-relaxed text-zinc-600">
        Công cụ này kết nối an toàn tới các máy chủ Cobalt từ xa. Tất cả quá trình chuyển đổi và xử lý được thực hiện trên nút từ xa. Không có tệp video hoặc dữ liệu người dùng nào được lưu trữ trên máy chủ proxy này.
      </p>
      <div className="mt-4 flex justify-center gap-4 text-[10px] text-zinc-500">
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
