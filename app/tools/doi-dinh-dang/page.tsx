"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navigation } from "../../components/navigation";
import { ToolCard } from "../../../components/tools/ToolCard";
import { Footer } from "../../components/footer";

// Disable Server-Side Rendering (SSR) for browser-only WASM/canvas dependencies
const FormatConverter = dynamic(
  () => import("../../../components/tools/FormatConverter").then((mod) => mod.FormatConverter),
  { ssr: false }
);

export default function FormatConverterPage() {
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
            Đổi <span className="text-[#ff5e3a]">Định Dạng</span> Tệp
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Chuyển đổi hình ảnh HEIC/PNG/JPG/WebP hoặc tách nhạc MP3 từ video trực tiếp trong trình duyệt.
          </p>
        </div>

        {/* Dynamic Tool Card */}
        <ToolCard
          title="Đổi định dạng tệp đa phương tiện"
          description="Nạp hình ảnh hoặc video của bạn để chuyển đổi định dạng và chất lượng tệp tin mong muốn."
        >
          <FormatConverter />
        </ToolCard>

      </div>

      <Footer />
    </main>
  );
}
