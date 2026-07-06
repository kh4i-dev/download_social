import React from "react";
import { Navigation } from "../../components/navigation";
import { ToolCard } from "../../../components/tools/ToolCard";
import { Footer } from "../../components/footer";

export const metadata = {
  title: "Đổi định dạng đa phương tiện - kh4idev Media Tools",
  description: "Chuyển đổi định dạng tệp ảnh, âm thanh và video an toàn trực tuyến.",
};

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
            Chuyển đổi ảnh, video và âm thanh (MP4 sang MP3, WebP, HEIC) trực tiếp trên trình duyệt.
          </p>
        </div>

        {/* Dynamic Tool Card Placeholder */}
        <ToolCard
          title="Đổi định dạng tệp"
          description="Chuyển đổi phần mở rộng của các tệp tin đa phương tiện chất lượng cao."
        >
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#0d0d12]/40 border border-zinc-850 rounded-2xl p-8">
            <div className="p-4 bg-zinc-900 border border-zinc-850 text-zinc-500 rounded-full">
              {/* FileText inline SVG */}
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">Tính năng đang được phát triển</h3>
              <p className="text-xs text-zinc-500 max-w-xs font-sans">
                Chuyển đổi hình ảnh HEIC/PNG/JPG và âm thanh video MP4 sang MP3 trực tiếp bằng tài nguyên CPU trình duyệt.
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
