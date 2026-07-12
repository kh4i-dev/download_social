"use client";

import React, { useState, useEffect } from "react";
import { ClipboardText, DownloadSimple, ArrowCounterClockwise, WarningCircle, CheckCircle, VideoCamera } from "@phosphor-icons/react";
import { ApiResponse } from "../types";

export function DownloadForm() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<"mp3" | "720" | "1080" | "1440" | "2160" | "4320" | "max">("1080");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const getYoutubeVideoId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    const cleanUrl = urlStr.trim();
    
    if (cleanUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }

    try {
      const urlObj = new URL(cleanUrl);
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        if (urlObj.hostname.includes("youtu.be")) {
          const id = urlObj.pathname.substring(1).split(/[?#]/)[0].substring(0, 11);
          if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
        }
        const v = urlObj.searchParams.get("v");
        if (v) {
          const id = v.substring(0, 11);
          if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
        }
        if (urlObj.pathname.startsWith("/shorts/")) {
          const id = urlObj.pathname.split("/")[2].substring(0, 11);
          if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
        }
        if (urlObj.pathname.startsWith("/embed/")) {
          const id = urlObj.pathname.split("/")[2].substring(0, 11);
          if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
        }
      }
    } catch {
      // Fallback
    }

    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = cleanUrl.match(regExp);
    if (match) {
      return match[1];
    }

    return null;
  };

  const youtubeId = getYoutubeVideoId(url);

  // Sync thumbnail URL when youtube ID changes
  useEffect(() => {
    if (youtubeId) {
      // Attempt to load standard high-quality thumbnail
      setImgSrc(`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`);
    } else {
      setImgSrc(null);
    }
  }, [youtubeId]);

  // Handle image load error (e.g. video is private, deleted, or network issues)
  const handleImageError = () => {
    setImgSrc(null);
  };

  // Simulate progress bar playhead values
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + 15;
          if (prev < 75) return prev + 8;
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 250);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError(null);
    } catch {
      setError("Không thể tự động dán. Bạn hãy dán liên kết bằng tay nhé.");
    }
  };

  const handleReset = () => {
    setUrl("");
    setSuccess(false);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Bạn hãy dán liên kết video vào ô nhập liệu nhé.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setDownloadUrl(null);

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
        throw new Error(result.error || "Không tìm thấy video, kiểm tra lại link nhé.");
      }

      setProgress(100);
      setSuccess(true);
      
      if (result.data?.url) {
        setDownloadUrl(result.data.url);
        // Attempt to open dynamically, fail silently if blocked by browser
        try {
          window.open(result.data.url, "_blank", "noopener,noreferrer");
        } catch {
          console.log("Automatic popup blocked, waiting for manual button click.");
        }
      } else {
        throw new Error("Không thể trích xuất liên kết tải xuống.");
      }
    } catch (err: any) {
      setError(err.message || "Không kết nối được dịch vụ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const showPreviewColumn = url.trim().length > 0;

  return (
    <div className={`glass-panel border border-[#232332] bg-[#161622] rounded-2xl relative overflow-hidden transition-all duration-500 shadow-[0_30px_100px_rgba(0,0,0,0.6)] hover-scale-effect p-6 md:p-8 ${
      showPreviewColumn ? "max-w-4xl w-full" : "max-w-xl w-full"
    }`}>
      <div className={`grid grid-cols-1 ${showPreviewColumn ? "md:grid-cols-12 gap-8" : "gap-6"} items-start`}>
        
        {/* Left Column: Form Fields */}
        <div className={showPreviewColumn ? "md:col-span-7 space-y-6" : "space-y-6"}>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-100 font-display">Tải Video</h2>
            <p className="text-xs text-zinc-400 mt-1">Dán liên kết bên dưới và chọn chất lượng tải về mong muốn.</p>
          </div>

          <form onSubmit={handleDownload} className="space-y-5">
            {/* Input container */}
            <div className="space-y-2">
              <label htmlFor="video-url" className="block text-xs font-semibold text-zinc-300">
                Dán link video tại đây
              </label>
              <div className="relative flex items-center">
                <input
                  id="video-url"
                  type="url"
                  placeholder="YouTube, Facebook, TikTok, Instagram..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full bg-[#0d0d12]/80 border border-zinc-800/80 focus:outline-none focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a]/30 text-zinc-100 rounded-xl px-4 py-3.5 pr-24 text-sm placeholder:text-zinc-650 outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={isLoading || success}
                  className="absolute right-3 px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all outline-none focus:outline-none active-press disabled:opacity-50"
                  title="Dán từ khay nhớ tạm"
                >
                  <ClipboardText size={14} />
                  Dán
                </button>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="space-y-2">
              <label htmlFor="quality" className="block text-xs font-semibold text-zinc-300">
                Chọn chất lượng tải về
              </label>
              <div className="relative">
                <select
                  id="quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  disabled={isLoading || success}
                  className="w-full bg-[#0d0d12]/80 border border-zinc-800/80 focus:outline-none focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a]/30 text-zinc-100 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50"
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

            {/* Action Button Area */}
            {success && downloadUrl ? (
              <div className="space-y-3 animate-in zoom-in-95 duration-200">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{
                    background: "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                  }}
                  className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 text-zinc-950 shadow-[0_4px_20px_rgba(255,94,58,0.15)] transition-all duration-300 active-press outline-none cursor-pointer text-center btn-hover-shine"
                >
                  <DownloadSimple size={18} weight="bold" />
                  <span>Tải xuống ngay</span>
                </a>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all active-press cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowCounterClockwise size={14} />
                  <span>Tải video khác</span>
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: isLoading
                    ? undefined
                    : "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                }}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 active-press outline-none cursor-pointer relative overflow-hidden group/btn ${
                  isLoading
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/20"
                    : "text-zinc-950 shadow-[0_4px_20px_rgba(255,94,58,0.15)] btn-hover-shine"
                }`}
              >
                {/* Shine overlay */}
                {!isLoading && (
                  <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-120%] group-hover/btn:translate-x-[120%] transition-transform duration-1000 ease-out pointer-events-none" />
                )}

                {isLoading ? (
                  <>
                    <ArrowCounterClockwise className="animate-spin" size={18} />
                    <span>Đang trích xuất liên kết...</span>
                  </>
                ) : (
                  <>
                    <DownloadSimple size={18} weight="bold" />
                    <span>Bắt đầu tải xuống</span>
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Preview Cell & Scrubber (Rendered dynamically only when URL is active) */}
        {showPreviewColumn && (
          <div className="md:col-span-5 space-y-5 flex flex-col justify-between h-full border-t md:border-t-0 md:border-l border-zinc-800/80 pt-6 md:pt-0 md:pl-6">
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-3">Xem trước & tiến trình</span>
              
              {/* 35mm Film Frame Cell Wrapper (Sprocket holes ONLY here) */}
              <div className="sprocket-border relative overflow-hidden bg-zinc-950 border border-zinc-850/80 shadow-md">
                <div className="film-sprockets-top" />
                
                <div className="relative aspect-video w-full flex items-center justify-center bg-zinc-900">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt="Bản xem trước video"
                      onError={handleImageError}
                      className="w-full h-full object-cover opacity-85 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-650 py-6">
                      <VideoCamera size={32} weight="thin" />
                      <span className="text-[10px]">Đang trích xuất thông tin video...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent pointer-events-none" />
                  {/* Active playhead line overlay */}
                  <div className="absolute left-0 right-0 h-[1.5px] bg-[#ff5e3a]/40 shadow-[0_0_8px_#ff5e3a] top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                
                <div className="film-sprockets-bottom" />
              </div>
            </div>

            {/* Progress Scrubber (Scrubber bar with Playhead) */}
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>Trạng thái</span>
                <span>{isLoading ? `${progress}%` : success ? "100%" : "Đang chờ"}</span>
              </div>
              
              {/* Video Scrubber track */}
              <div className="relative h-6 flex items-center">
                <div className="w-full h-1 bg-zinc-800 rounded-full relative">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: isLoading ? `${progress}%` : success ? "100%" : "0%",
                      background: "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                    }}
                  />
                </div>
                
                {/* Scrubber Playhead (Small orange triangle) */}
                <div
                  className="absolute top-[-2px] -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                  style={{ left: isLoading ? `${progress}%` : success ? "100%" : "0%" }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#ff5e3a]" />
                  <div className="w-[1px] h-3 bg-[#ff5e3a]/50 mt-[-1px]" />
                </div>
              </div>

              {/* Lavender sub-accent dot (exactly one spot) */}
              {isLoading && (
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                  <span>Đang tách âm thanh & giải mã luồng video...</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
