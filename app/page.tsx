import React from "react";
import { DownloadForm } from "./components/download-form";
import { SupportedPlatforms } from "./components/supported-platforms";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 z-0 pointer-events-none" />
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />

      {/* Main content grid */}
      <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full px-4 md:px-8 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto">
          {/* Left Column: Branding and Info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cổng Điều Khiển Hoạt Động
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-100 leading-tight">
                kh4idev <br />
                <span className="text-emerald-400">Stream Client</span>
              </h1>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-md">
                Giải mã và tải xuống các luồng truyền thông từ mạng xã hội trực tiếp vào trình duyệt của bạn với tốc độ băng thông gốc. Tối ưu hóa hoàn toàn cho Vercel.
              </p>
            </div>

            {/* List of supported platforms, integrated into side panel */}
            <SupportedPlatforms />
          </div>

          {/* Right Column: Interactive App */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group">
              {/* Inner glowing top-border */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              
              <DownloadForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
