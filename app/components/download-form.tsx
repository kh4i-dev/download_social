"use client";

import React, { useState } from "react";
import { ClipboardText, DownloadSimple, ArrowCounterClockwise, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { ApiResponse } from "../types";

export function DownloadForm() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<"mp3" | "720" | "1080" | "max">("1080");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError(null);
    } catch {
      setError("Không thể truy cập khay nhớ tạm. Vui lòng dán thủ công.");
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Vui lòng nhập một đường liên kết hợp lệ.");
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
        throw new Error(result.error || "Không thể xử lý yêu cầu tải xuống.");
      }

      setSuccess(true);
      
      if (result.data?.url) {
        window.open(result.data.url, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("Không tìm thấy đường liên kết tải xuống trực tiếp.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi lấy liên kết tải xuống.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">Cổng Truyền Tải</h3>
        <p className="text-xs text-zinc-500 mt-1">Cấu hình các tùy chọn và lấy liên kết tải xuống.</p>
      </div>

      <form onSubmit={handleDownload} className="space-y-6">
        {/* Input box section */}
        <div className="space-y-2">
          <label htmlFor="video-url" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Đường liên kết Video
          </label>
          <div className="relative flex items-center">
            <input
              id="video-url"
              type="url"
              placeholder="Dán liên kết YouTube hoặc Facebook tại đây..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full bg-zinc-950/80 border border-zinc-800/80 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 text-zinc-100 rounded-xl px-4 py-3.5 pr-24 text-sm placeholder:text-zinc-700 outline-none transition-all duration-200"
              required
            />
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="absolute right-3 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-emerald-400 active-press text-zinc-400 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all outline-none"
              title="Dán từ khay nhớ tạm"
            >
              <ClipboardText size={14} />
              Dán
            </button>
          </div>
        </div>

        {/* Quality select section */}
        <div className="space-y-2">
          <label htmlFor="quality" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Độ phân giải mục tiêu
          </label>
          <div className="relative">
            <select
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              disabled={isLoading}
              className="w-full bg-zinc-950/80 border border-zinc-800/80 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 text-zinc-100 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="mp3" className="bg-zinc-950 text-zinc-200">Âm thanh MP3 (320kbps)</option>
              <option value="720" className="bg-zinc-950 text-zinc-200">Video HD 720p</option>
              <option value="1080" className="bg-zinc-950 text-zinc-200">Video Full HD 1080p</option>
              <option value="max" className="bg-zinc-950 text-zinc-200">Chất lượng tối đa sẵn có</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2.5 transition-all duration-200 active-press outline-none cursor-pointer ${
            isLoading
              ? "bg-zinc-800/60 text-zinc-500 cursor-not-allowed border border-zinc-800/20"
              : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.25)]"
          }`}
        >
          {isLoading ? (
            <>
              <ArrowCounterClockwise className="animate-spin" size={18} />
              <span>Đang kết nối Cobalt...</span>
            </>
          ) : (
            <>
              <DownloadSimple size={18} weight="bold" />
              <span>Tải xuống ngay</span>
            </>
          )}
        </button>
      </form>

      {/* Info display states */}
      <div className="min-h-[56px] transition-all duration-200">
        {isLoading && (
          <div className="w-full bg-zinc-900/40 border border-zinc-900/60 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-zinc-400">Đang thương thảo với máy chủ từ xa. Vui lòng đợi.</span>
          </div>
        )}

        {error && (
          <div className="w-full bg-red-950/10 border border-red-900/20 rounded-xl p-4 flex items-start gap-3">
            <WarningCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-400">Yêu cầu thất bại</p>
              <p className="text-[11px] leading-relaxed text-red-500/80">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="w-full bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" size={18} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-400">Đã kích hoạt tải xuống</p>
              <p className="text-[11px] leading-relaxed text-emerald-500/80">
                Nếu quá trình tải xuống không tự động bắt đầu, vui lòng cho phép cửa sổ bật lên (pop-up) cho trang web này.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
