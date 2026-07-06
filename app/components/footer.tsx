import React from "react";

export function Footer() {
  return (
    <footer className="w-full mt-12 pb-8 flex flex-col items-center gap-4 px-4">
      <div className="flex items-center justify-center">
        {/* N Logo */}
        <span className="w-6 h-6 flex items-center justify-center font-mono font-bold text-xs text-orange-400 bg-zinc-900 border border-zinc-800 rounded hover:border-orange-500/20 transition-colors shadow-lg">
          N
        </span>
      </div>

      <p className="text-[10px] leading-relaxed text-zinc-500 text-center max-w-md">
        Công cụ này kết nối trực tiếp đến các máy chủ Cobalt công cộng. Tất cả dữ liệu truyền tải đều được xử lý ẩn danh trên máy chủ từ xa và không lưu giữ bất kỳ tập tin nào trên proxy này.
      </p>

      <div className="flex justify-center gap-4 text-[10px] text-zinc-500">
        <a
          href="https://github.com/imputnet/cobalt"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-400 transition-colors"
        >
          Hỗ trợ bởi Cobalt
        </a>
        <span className="text-zinc-700">•</span>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-400 transition-colors"
        >
          Triển khai trên Vercel
        </a>
      </div>
    </footer>
  );
}
