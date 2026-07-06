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

      {/* Floating Navigation */}
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
                className="w-3.5 h-3.5 opacity-60 hover:opacity-100 transition-all duration-300"
                style={{ filter: "brightness(1.15)" }}
                loading="lazy"
              />
            ))}
          </div>
        </nav>
      </header>

      {/* Main content container */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full px-4 pt-32 pb-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-3 mb-8 w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-100 leading-tight font-display">
            kh4idev <span className="text-[#ff5e3a]">Stream</span> Client
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Giải mã và lưu trữ video yêu thích từ YouTube, Facebook, TikTok và Instagram trực tiếp về máy của bạn chỉ trong vài giây.
          </p>
        </div>

        {/* Downloader Card - Centered Focus */}
        <DownloadForm />

        {/* Bottom Platform Info */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-[11px] text-zinc-500">
            Nền tảng được hỗ trợ kết nối:
          </p>
          <div className="flex justify-center gap-6 text-xs text-zinc-400">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                <img
                  src={`https://cdn.simpleicons.org/${platform.slug}/9ca3af`}
                  alt={platform.name}
                  className="w-3 h-3"
                  style={{ filter: "brightness(1.15)" }}
                />
                <span className="text-[10px] font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
