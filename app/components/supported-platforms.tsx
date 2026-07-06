import React from "react";

export function SupportedPlatforms() {
  const platforms = [
    {
      name: "YouTube",
      slug: "youtube",
      color: "FF0000",
      description: "Video & Âm thanh",
    },
    {
      name: "Facebook",
      slug: "facebook",
      color: "1877F2",
      description: "Reels & Video công khai",
    },
    {
      name: "TikTok",
      slug: "tiktok",
      color: "000000",
      description: "Không có hình mờ",
    },
    {
      name: "Instagram",
      slug: "instagram",
      color: "E1306C",
      description: "Bài viết & Reels",
    },
  ];

  return (
    <div className="pt-6 border-t border-zinc-900">
      <h2 className="text-xs font-semibold text-zinc-500 tracking-wider uppercase mb-4">
        Luồng truyền tải hỗ trợ
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="flex items-center gap-3 p-3 bg-zinc-900/20 border border-zinc-900/60 rounded-xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-200"
          >
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-950 border border-zinc-900">
              <img
                src={`https://cdn.simpleicons.org/${platform.slug}/71717a`}
                alt={platform.name}
                className="w-4.5 h-4.5 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                style={{ filter: "brightness(1.15)" }}
                loading="lazy"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-300 truncate">{platform.name}</span>
              <span className="text-[10px] text-zinc-600 truncate">{platform.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
