"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navigation } from "../../components/navigation";
import { ToolCard } from "../../../components/tools/ToolCard";
import { Footer } from "../../components/footer";

import { FileText } from "@phosphor-icons/react";

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
            Chuyển đổi hình ảnh hoặc tách nhạc MP3 từ video trực tiếp trong trình duyệt.
          </p>
        </div>

        {/* Dynamic Tool Card */}
        <ToolCard
          title="Đổi định dạng tệp đa phương tiện"
          description="Tính năng đang được tối ưu hóa hiệu năng."
        >
          <div className="flex flex-col items-center justify-center text-center py-12 px-6 space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500">
              <FileText size={32} />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Công cụ đang phát triển</h3>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Tính năng chuyển đổi định dạng tệp đa phương tiện đang được nâng cấp để tối ưu hóa khả năng tách âm thanh trên hạ tầng trình duyệt.
            </p>
          </div>
        </ToolCard>

      </div>

      <Footer />
    </main>
  );
}
