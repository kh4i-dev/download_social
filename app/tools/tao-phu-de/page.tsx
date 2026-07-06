import React from "react";
import { Navigation } from "../../components/navigation";
import { ToolCard } from "../../../components/tools/ToolCard";
import { Footer } from "../../components/footer";

export const metadata = {
  title: "Tạo phụ đề video - kh4idev Media Tools",
  description: "Trích xuất giọng nói và sinh phụ đề video SRT tự động.",
};

export default function SubtitleGeneratorPage() {
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
            Tạo <span className="text-[#ff5e3a]">Phụ Đề</span> Tự Động
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Sinh file phụ đề SRT đồng bộ chính xác bằng công nghệ Speech-to-Text Whisper AI.
          </p>
        </div>

        {/* Dynamic Tool Card Placeholder */}
        <ToolCard
          title="Tạo phụ đề video"
          description="Trích xuất âm thanh từ liên kết YouTube hoặc file của bạn để tạo phụ đề."
        >
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#0d0d12]/40 border border-zinc-850 rounded-2xl p-8">
            <div className="p-4 bg-zinc-900 border border-zinc-850 text-zinc-500 rounded-full">
              {/* Audio/Text inline SVG */}
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">Tính năng đang được phát triển</h3>
              <p className="text-xs text-zinc-500 max-w-xs font-sans">
                Sử dụng API Groq Whisper AI siêu tốc để chuyển giọng nói trong video thành văn bản phụ đề kèm timestamp đầy đủ.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ff5e3a]/10 border border-[#ff5e3a]/25 text-[#ff5e3a] rounded-full text-[10px] font-bold">
              {/* Spinner SVG */}
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sắp ra mắt</span>
            </div>
          </div>
        </ToolCard>

      </div>

      <Footer />
    </main>
  );
}
