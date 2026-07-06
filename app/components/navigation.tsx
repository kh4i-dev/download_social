"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CaretDown, Video, Image, Scissors, FileText } from "@phosphor-icons/react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const platforms = [
    { name: "YouTube", slug: "youtube" },
    { name: "Facebook", slug: "facebook" },
    { name: "TikTok", slug: "tiktok" },
    { name: "Instagram", slug: "instagram" },
  ];

  const tools = [
    { name: "Tải Video", href: "/", icon: Video },
    { name: "Xoá nền ảnh", href: "/tools/xoa-nen", icon: Image },
    { name: "Cắt video", href: "/tools/cat-video", icon: Scissors, comingSoon: true },
    { name: "Đổi định dạng", href: "/tools/doi-dinh-dang", icon: FileText, comingSoon: true },
    { name: "Tạo phụ đề", href: "/tools/tao-phu-de", icon: FileText, comingSoon: true },
    { name: "Chuyển đổi tài liệu", href: "/tools/chuyen-doi-tai-lieu", icon: FileText },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-6 inset-x-4 z-50 max-w-4xl mx-auto px-4">
      <nav className="glass-panel backdrop-blur-lg bg-zinc-950/40 border border-[#232332] rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        
        {/* Left Side: Brand & Tools Dropdown */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-black tracking-widest text-zinc-100 uppercase font-display select-none">
            kh4idev.
          </Link>
          
          <span className="text-zinc-800">|</span>
          
          {/* Tools Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-zinc-300 hover:text-[#ff5e3a] transition-colors outline-none cursor-pointer"
            >
              <span>Công cụ</span>
              <CaretDown size={12} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-3.5 w-52 bg-zinc-950/95 border border-[#232332] rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  if (tool.comingSoon) {
                    return (
                      <div
                        key={tool.name}
                        className="flex items-center justify-between gap-2.5 px-3 py-2 text-xs text-zinc-650 cursor-not-allowed rounded-xl"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={14} className="text-zinc-800" />
                          <span className="font-medium">{tool.name}</span>
                        </div>
                        <span className="text-[8px] scale-90 px-1 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-600 font-medium whitespace-nowrap">
                          Đang phát triển
                        </span>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:text-[#ff5e3a] hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer"
                    >
                      <Icon size={14} />
                      <span className="font-medium">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Supported platform status logos */}
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
  );
}
