import React from "react";
import { DownloadForm } from "./components/download-form";
import { Footer } from "./components/footer";

export default function Home() {
  const platforms = [
    { name: "YouTube", slug: "youtube" },
    { name: "Facebook", slug: "facebook" },
    { name: "TikTok", slug: "tiktok" },
    { name: "Instagram", slug: "instagram" },
  ];

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen flex flex-col relative justify-between">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 z-0 pointer-events-none" />
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />

      {/* Floating Glass Navigation */}
      <header className="fixed top-6 inset-x-4 z-50 max-w-4xl mx-auto px-4">
        <nav className="glass-panel backdrop-blur-lg bg-zinc-950/40 border border-zinc-900/60 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-zinc-100 uppercase font-display">kh4idev.</span>
          </div>
          <div className="flex items-center gap-3">
            {platforms.map((platform) => (
              <img
                key={platform.name}
                src={`https://cdn.simpleicons.org/${platform.slug}/9ca3af`}
                alt={platform.name}
                title={`Hỗ trợ ${platform.name}`}
                className="w-3.5 h-3.5 opacity-60 hover:opacity-100 hover:scale-105 transition-all duration-300"
                style={{ filter: "brightness(1.15)" }}
                loading="lazy"
              />
            ))}
          </div>
        </nav>
      </header>

      {/* Main content grid */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-3xl mx-auto w-full px-4 pt-32 pb-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-10 w-full">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-100 leading-tight font-display">
            kh4idev <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Stream Client</span>
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Giải mã và tải xuống các video yêu thích từ mạng xã hội về máy của bạn chỉ trong vài giây. Không quảng cáo, không giới hạn.
          </p>
        </div>

        {/* Downloader Card - Centered Focus */}
        <div className="w-full">
          <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group/form hover:border-orange-500/25 transition-all duration-500 shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
            {/* Top lighting gradient border */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
            
            <DownloadForm />
          </div>
        </div>

        {/* Minimal Supported Platforms Description Row */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-[11px] text-zinc-500">
            Dịch vụ hoạt động hoàn toàn trực tiếp trên trình duyệt của bạn.
          </p>
          <div className="flex justify-center gap-1.5 text-[10px] text-zinc-600">
            <span>Không chứa quảng cáo độc hại</span>
            <span>•</span>
            <span>Không lưu trữ thông tin</span>
            <span>•</span>
            <span>Không nén lại video gốc</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
