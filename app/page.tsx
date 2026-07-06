import React from "react";
import { DownloadForm } from "./components/download-form";
import { SupportedPlatforms } from "./components/supported-platforms";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen flex flex-col relative">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 z-0 pointer-events-none" />
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />

      {/* Floating Glass Navigation */}
      <header className="fixed top-6 inset-x-4 z-50 max-w-6xl mx-auto px-4">
        <nav className="glass-panel backdrop-blur-lg bg-zinc-950/40 border border-zinc-900/60 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-zinc-100 uppercase">kh4idev.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-semibold uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              Node: Online
            </span>
          </div>
        </nav>
      </header>

      {/* Bento Grid layout */}
      <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full px-4 md:px-8 pt-28 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full my-auto">
          
          {/* Card 1: Hero & Identity (Top-Left: 8 Cols) */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-semibold uppercase tracking-wider w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cổng Điều Khiển Hoạt Động
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight">
                kh4idev <span className="text-emerald-400">Stream Client</span>
              </h1>
              
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Giải mã và tải xuống các luồng truyền thông từ mạng xã hội trực tiếp vào trình duyệt của bạn với tốc độ băng thông gốc. Hệ thống hoàn toàn không có quảng cáo và tối ưu hóa Vercel Serverless.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-zinc-500 font-mono">
              <div>GIAO THỨC: <span className="text-zinc-300">HTTPS / SECURE</span></div>
              <span className="text-zinc-800">•</span>
              <div>BĂNG THÔNG: <span className="text-zinc-300">UNLIMITED</span></div>
              <span className="text-zinc-800">•</span>
              <div>PHIÊN BẢN: <span className="text-zinc-300">v1.2.0</span></div>
            </div>
          </div>

          {/* Card 2: System Monitor (Top-Right: 4 Cols) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
            
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Màn Hình Hệ Thống</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NODE: ONLINE
              </span>
            </div>

            <div className="space-y-3 font-mono py-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Độ trễ máy chủ:</span>
                <span className="text-emerald-400">~42ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Trạng thái Proxy:</span>
                <span className="text-emerald-400">Đã kích hoạt</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Vùng hoạt động:</span>
                <span className="text-zinc-300">Global (Edge)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Mã hóa kết nối:</span>
                <span className="text-zinc-300">TLS 1.3</span>
              </div>
            </div>

            <div className="text-[9px] text-zinc-600 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
              Hệ thống tự động phát hiện và chuyển tuyến đến các nút tải khả dụng gần bạn nhất.
            </div>
          </div>

          {/* Card 3: Downloader Panel (Bottom-Left: 7 Cols) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group/form hover:border-emerald-500/20 transition-colors duration-300">
            {/* Top lighting gradient border */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            
            <DownloadForm />
          </div>

          {/* Card 4: Platform capabilities list (Bottom-Right: 5 Cols) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-colors duration-300">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            
            <SupportedPlatforms />
          </div>

        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
