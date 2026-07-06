import React from "react";

export function SupportedPlatforms() {
  const platforms = [
    {
      name: "YouTube",
      slug: "youtube",
      description: "Video + Audio (Tất cả chất lượng)",
      status: "Online",
    },
    {
      name: "Facebook",
      slug: "facebook",
      description: "Reels & Video công khai",
      status: "Online",
    },
    {
      name: "TikTok",
      slug: "tiktok",
      description: "Video & Âm thanh (Không logo)",
      status: "Online",
    },
    {
      name: "Instagram",
      slug: "instagram",
      description: "Bài viết, Reels & IGTV",
      status: "Online",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
          Luồng truyền tải hỗ trợ
        </h3>
        <p className="text-[10px] text-zinc-500 mt-1">Đường ống kết nối băng thông cao đến máy chủ CDN.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="flex items-center justify-between p-3.5 bg-zinc-900/10 border border-zinc-900/60 rounded-xl hover:border-emerald-500/20 hover:bg-zinc-900/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8.5 h-8.5 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-950/80 border border-zinc-900 group-hover:border-zinc-800 transition-colors">
                <img
                  src={`https://cdn.simpleicons.org/${platform.slug}/71717a`}
                  alt={platform.name}
                  className="w-4.5 h-4.5 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                  style={{ filter: "brightness(1.15)" }}
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors">{platform.name}</span>
                <span className="text-[9.5px] text-zinc-500 group-hover:text-zinc-400 transition-colors truncate">{platform.description}</span>
              </div>
            </div>
            
            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-400/90 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              {platform.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
