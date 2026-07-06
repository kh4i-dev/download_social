import React from "react";
import { Navigation } from "../../components/navigation";
import { ToolCard } from "../../../components/tools/ToolCard";
import { BackgroundRemover } from "../../../components/tools/BackgroundRemover";
import { Footer } from "../../components/footer";

export const metadata = {
  title: "Xóa nền ảnh - kh4idev Media Tools",
  description: "Trích tách nền hình ảnh tự động và hoàn toàn trực tuyến trên trình duyệt bằng AI thông minh.",
};

export default function BackgroundRemoverPage() {
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
            Xoá <span className="text-[#ff5e3a]">Nền</span> Ảnh
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Trích tách nền hình ảnh tự động 100% trong trình duyệt. Không gửi file lên server, bảo mật hoàn toàn.
          </p>
        </div>

        {/* Dynamic Tool Card */}
        <ToolCard
          title="Xóa nền hình ảnh"
          description="Kéo thả hình ảnh (PNG, JPG, WebP) và nhấn nút tách nền để xóa phông nền bằng mô hình AI cục bộ."
        >
          <BackgroundRemover />
        </ToolCard>

      </div>

      <Footer />
    </main>
  );
}
