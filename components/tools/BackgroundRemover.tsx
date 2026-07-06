"use client";

import React, { useState, useEffect } from "react";
import { UploadSimple, DownloadSimple, ArrowCounterClockwise, WarningCircle, Image, Sparkle } from "@phosphor-icons/react";
import { removeBackground } from "@imgly/background-removal";

export function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<string>("Đang khởi tạo...");
  const [error, setError] = useState<string | null>(null);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WebP).");
      return;
    }
    
    // Limit to 15MB for browser safety
    if (file.size > 15 * 1024 * 1024) {
      setError("Tệp ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 15MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResultUrl(null);
    
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setProgress(15);
    setProgressStage("Đang gửi ảnh lên API xử lý...");

    try {
      // 1. Try the official remove.bg API first
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setProgress(100);
        return;
      }

      // If API fails (e.g. key limit, quota exceeded, or network issue), fall back to client-side WASM
      const errorJson = await response.json().catch(() => ({}));
      const reason = errorJson.error || "Hết lượt dùng thử API";
      console.warn(`API separation failed: ${reason}. Falling back to local WebAssembly...`);
      
      setProgress(40);
      setProgressStage("Đang nạp mô hình AI chạy cục bộ (WASM)...");

      // 2. Client-side fallback processing
      const blob = await removeBackground(selectedFile, {
        progress: (key, current, total) => {
          const percentage = 40 + Math.round((current / total) * 60); // Scale 40% to 100%
          setProgress(percentage);
          
          if (key.includes("fetch")) {
            setProgressStage(`Tải mô hình AI cục bộ...`);
          } else if (key.includes("onnx")) {
            setProgressStage(`Khởi tạo AI Engine...`);
          } else {
            setProgressStage(`Tách nền cục bộ: ${percentage}%`);
          }
        },
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError("Không thể xử lý tách nền. Vui lòng thử lại với ảnh khác.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !selectedFile) return;
    
    const link = document.createElement("a");
    link.href = resultUrl;
    const originalName = selectedFile.name;
    const dotIndex = originalName.lastIndexOf(".");
    const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    link.download = `${baseName}_nobg.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: File Drop-zone & Actions */}
        <div className="md:col-span-6 space-y-6">
          {!selectedFile ? (
            /* Drag and Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-zinc-800/80 hover:border-[#ff5e3a]/40 bg-[#0d0d12]/40 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group/drop"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-zinc-900/60 rounded-full border border-zinc-800 text-zinc-400 group-hover/drop:text-[#ff5e3a] group-hover/drop:border-[#ff5e3a]/30 transition-colors">
                  <UploadSimple size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-200">Kéo thả ảnh vào đây</p>
                  <p className="text-xs text-zinc-500">hoặc nhấp chuột để chọn ảnh từ máy của bạn</p>
                </div>
                <p className="text-[10px] text-zinc-650">Hỗ trợ PNG, JPG, WebP tối đa 15MB</p>
              </div>
            </div>
          ) : (
            /* Selected File Card Details & Action Button */
            <div className="space-y-5 bg-[#0d0d12]/60 border border-zinc-850 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400">
                    <Image size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all outline-none focus:outline-none cursor-pointer"
                  title="Chọn ảnh khác"
                >
                  <ArrowCounterClockwise size={16} />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <WarningCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              {!resultUrl ? (
                <button
                  onClick={handleRemoveBackground}
                  disabled={isLoading}
                  style={{
                    background: isLoading ? undefined : "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                  }}
                  className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 active-press outline-none cursor-pointer relative overflow-hidden group/btn ${
                    isLoading
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/20"
                      : "text-zinc-950 shadow-[0_4px_20px_rgba(255,94,58,0.15)] btn-hover-shine"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <ArrowCounterClockwise className="animate-spin" size={18} />
                      <span>{progressStage}</span>
                    </>
                  ) : (
                    <>
                      <Sparkle size={18} weight="bold" />
                      <span>Bắt đầu tách nền</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  style={{
                    background: "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                  }}
                  className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 text-zinc-950 shadow-[0_4px_20px_rgba(255,94,58,0.15)] transition-all duration-300 active-press outline-none cursor-pointer btn-hover-shine"
                >
                  <DownloadSimple size={18} weight="bold" />
                  <span>Tải xuống ảnh PNG</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Comparative Film-cell View */}
        <div className="md:col-span-6 space-y-5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-3">
            {!resultUrl ? "Ảnh gốc" : "Ảnh kết quả (PNG Trong suốt)"}
          </span>

          {/* Film Cell Frame (Single sprocket-border container) */}
          <div className="sprocket-border relative overflow-hidden bg-zinc-950 border border-zinc-850/80 shadow-md">
            <div className="film-sprockets-top" />
            
            <div className="relative aspect-video w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
              {resultUrl ? (
                /* Transparent Checkerboard Pattern Background for transparent output preview */
                <div className="w-full h-full bg-checkerboard flex items-center justify-center">
                  <img
                    src={resultUrl}
                    alt="Ảnh đã xóa nền"
                    className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500"
                  />
                </div>
              ) : originalUrl ? (
                <img
                  src={originalUrl}
                  alt="Ảnh gốc"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-650 py-6">
                  <Image size={32} weight="thin" />
                  <span className="text-[10px]">Chưa tải ảnh lên</span>
                </div>
              )}
              
              {isLoading && (
                <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <ArrowCounterClockwise className="animate-spin text-[#ff5e3a] mx-auto" size={32} />
                    <p className="text-xs text-zinc-300 font-medium font-mono">{progress}%</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="film-sprockets-bottom" />
          </div>

          {/* Progress Playhead Scrubber (visible when processing) */}
          {isLoading && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>Tiến độ xử lý</span>
                <span>{progress}%</span>
              </div>
              
              <div className="relative h-6 flex items-center">
                <div className="w-full h-1 bg-zinc-800 rounded-full relative">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                    }}
                  />
                </div>
                
                <div
                  className="absolute top-[-2px] -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${progress}%` }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#ff5e3a]" />
                  <div className="w-[1px] h-3 bg-[#ff5e3a]/50 mt-[-1px]" />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
