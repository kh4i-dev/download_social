"use client";

import React, { useState } from "react";
import { ClipboardText, DownloadSimple, ArrowCounterClockwise, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { ApiResponse } from "../types";

export function DownloadForm() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<"mp3" | "720" | "1080" | "1440" | "2160" | "4320" | "max">("1080");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const getYoutubeVideoId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlStr.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError(null);
    } catch {
      setError("Không thể truy cập khay nhớ tạm. Bạn hãy dán liên kết bằng tay nhé.");
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Vui lòng dán một đường liên kết video hợp lệ.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, quality }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể tải video này về. Hãy kiểm tra lại liên kết.");
      }

      setSuccess(true);
      
      if (result.data?.url) {
        window.open(result.data.url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("Không tìm thấy tệp tải về trực tiếp.");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi chuẩn bị tệp tải về.");
    } finally {
      setIsLoading(false);
    }
  };

  const youtubeId = getYoutubeVideoId(url);

  return (
    <div className="w-full space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-zinc-100 font-display">Tải Video</h2>
        <p className="text-xs text-zinc-400 mt-1">Dán liên kết và chọn chất lượng bạn mong muốn.</p>
      </div>

      <form onSubmit={handleDownload} className="space-y-5">
        {/* URL Input */}
        <div className="space-y-2">
          <label htmlFor="video-url" className="block text-xs font-medium text-zinc-300">
            Dán link video
          </label>
          <div className="relative flex items-center">
            <input
              id="video-url"
              type="url"
              placeholder="YouTube, Facebook, TikTok, Instagram..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 text-zinc-100 rounded-xl px-4 py-3.5 pr-24 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
              required
            />
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="absolute right-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all outline-none active-press"
              title="Dán từ khay nhớ tạm"
            >
              <ClipboardText size={14} />
              Dán
            </button>
          </div>
        </div>

        {/* Quality select */}
        <div className="space-y-2">
          <label htmlFor="quality" className="block text-xs font-medium text-zinc-300">
            Chọn chất lượng tải về
          </label>
          <div className="relative">
            <select
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              disabled={isLoading}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 text-zinc-100 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="mp3" className="bg-zinc-900 text-zinc-200">Chỉ lấy âm thanh MP3 (320kbps)</option>
              <option value="720" className="bg-zinc-900 text-zinc-200">Video HD 720p</option>
              <option value="1080" className="bg-zinc-900 text-zinc-200">Video Full HD 1080p</option>
              <option value="1440" className="bg-zinc-900 text-zinc-200">Video 2K QHD 1440p</option>
              <option value="2160" className="bg-zinc-900 text-zinc-200">Video 4K UHD 2160p</option>
              <option value="4320" className="bg-zinc-900 text-zinc-200">Video 8K UHD 4320p</option>
              <option value="max" className="bg-zinc-900 text-zinc-200">Chất lượng tốt nhất có sẵn</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dynamic Video Frame Thumbnail Preview (Signature Element) */}
        {youtubeId && (
          <div className="film-strip-reel overflow-hidden my-4 relative border border-zinc-800/60">
            <div className="film-sprockets-top" />
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 flex items-center justify-center group/thumb">
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                alt="Bản xem trước video"
                className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-90 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
              {/* Animated scanner overlay */}
              <div className="absolute left-0 right-0 h-[2px] bg-orange-500/40 shadow-[0_0_8px_#ff5e3a] animate-pulse top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="film-sprockets-bottom" />
          </div>
        )}

        {/* Action Button with Premium Orange Shine Sweep Effect */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2.5 transition-all duration-300 active-press outline-none cursor-pointer relative overflow-hidden group/btn ${
            isLoading
              ? "bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800/20"
              : "bg-gradient-to-r from-orange-500 to-rose-500 text-zinc-950 hover:opacity-95 shadow-[0_4px_20px_rgba(255,94,58,0.15)]"
          }`}
        >
          {/* Animated Shine Layer */}
          {!isLoading && (
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-120%] group-hover/btn:translate-x-[120%] transition-transform duration-1000 ease-out pointer-events-none" />
          )}

          {isLoading ? (
            <>
              <ArrowCounterClockwise className="animate-spin" size={18} />
              <span>Đang kết nối luồng tải...</span>
            </>
          ) : (
            <>
              <DownloadSimple size={18} weight="bold" className="group-hover/btn:scale-110 transition-transform" />
              <span className="font-semibold text-zinc-950">Bắt đầu tải xuống</span>
            </>
          )}
        </button>
      </form>

      {/* Info display states */}
      <div className="min-h-[56px] transition-all duration-200">
        {isLoading && (
          <div className="w-full bg-zinc-900/40 border border-zinc-850/60 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs text-zinc-400">Đang khởi tạo kết nối. Vui lòng đợi trong giây lát.</span>
          </div>
        )}

        {error && (
          <div className="w-full bg-rose-950/10 border border-rose-900/20 rounded-xl p-4 flex items-start gap-3">
            <WarningCircle className="text-rose-400 mt-0.5 flex-shrink-0" size={18} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-rose-400">Không thể tải về</p>
              <p className="text-[11px] leading-relaxed text-rose-500/80">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="w-full bg-orange-950/10 border border-orange-900/20 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="text-orange-400 mt-0.5 flex-shrink-0" size={18} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-orange-400 font-display">Chuẩn bị hoàn tất</p>
              <p className="text-[11px] leading-relaxed text-orange-500/80">
                Nếu quá trình tải xuống không tự động bắt đầu, hãy cấp quyền mở cửa sổ bật lên (pop-up) cho trang web.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
