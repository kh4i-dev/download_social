import React from "react";
import { DownloadForm } from "./components/download-form";
import { Navigation } from "./components/navigation";
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

      {/* Shared Dropdown Navigation */}
      <Navigation />

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
