"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navigation } from "../../components/navigation";
import { ToolCard } from "../../../components/tools/ToolCard";
import { Footer } from "../../components/footer";

// Disable Server-Side Rendering (SSR) for browser-only WASM dependencies
const VideoTrimmer = dynamic(
  () => import("../../../components/tools/VideoTrimmer").then((mod) => mod.VideoTrimmer),
  { ssr: false }
);

export default function VideoTrimmerPage() {
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
            Cắt <span className="text-[#ff5e3a]">Video</span> Trực Tuyến
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Biên tập và trích xuất đoạn phim tùy chỉnh trực tiếp trên trình duyệt bằng công nghệ WebAssembly.
          </p>
        </div>

        {/* Dynamic Tool Card */}
        <ToolCard
          title="Cắt video của bạn"
          description="Chọn video từ máy (tối đa 200MB), kéo thanh trượt để chọn đoạn phim cần cắt và bắt đầu trích xuất đoạn phim mong muốn."
        >
          <VideoTrimmer />
        </ToolCard>

      </div>

      <Footer />
    </main>
  );
}
