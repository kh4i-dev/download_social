"use client";

import React, { useState, useEffect } from "react";
import { UploadSimple, DownloadSimple, ArrowCounterClockwise, WarningCircle, FileText, Image as ImageIcon, MusicNotes } from "@phosphor-icons/react";
import { fetchFile } from "@ffmpeg/util";
import heic2any from "heic2any";
import { getFFmpeg } from "../../lib/ffmpeg/ffmpeg-client";

export function FormatConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (fileSrc) URL.revokeObjectURL(fileSrc);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [fileSrc, resultUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isImage = file.type.startsWith("image/") || ["heic", "heif"].includes(ext || "");
    const isVideo = file.type.startsWith("video/") || ["mp4", "mkv", "mov", "avi"].includes(ext || "");

    if (!isImage && !isVideo) {
      setError("Vui lòng chọn một tệp hình ảnh hoặc video hợp lệ.");
      return;
    }

    if (isVideo && file.size > 200 * 1024 * 1024) {
      setError("Tệp video quá lớn. Vui lòng chọn tệp dưới 200MB để đảm bảo chuyển đổi mượt mà.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResultUrl(null);

    if (isImage) {
      setFileType("image");
      setTargetFormat("jpeg"); // Default target image format
    } else {
      setFileType("video");
      setTargetFormat("mp3"); // Default target audio format
    }

    if (fileSrc) URL.revokeObjectURL(fileSrc);
    // Create preview URL if supported
    if (file.type.startsWith("image/") && !["heic", "heif"].includes(ext || "")) {
      setFileSrc(URL.createObjectURL(file));
    } else {
      setFileSrc(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !fileType) return;

    setIsLoading(true);
    setError(null);
    setProgress(10);
    setProgressStage("Đang khởi tạo công cụ chuyển đổi...");

    try {
      if (fileType === "image") {
        const ext = selectedFile.name.split(".").pop()?.toLowerCase();
        
        // Handle HEIC image conversion using heic2any client-side library
        if (["heic", "heif"].includes(ext || "")) {
          setProgressStage("Đang giải mã ảnh HEIC bằng Web Workers...");
          setProgress(40);
          
          const conversionResult = await heic2any({
            blob: selectedFile,
            toType: targetFormat === "png" ? "image/png" : "image/jpeg",
            quality: 0.85
          });
          
          const outputBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultUrl(URL.createObjectURL(outputBlob));
          setProgress(100);
        } else {
          // Standard image conversion using HTML5 Canvas API
          setProgressStage("Đang chuyển đổi hệ màu ảnh...");
          setProgress(50);
          
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setResultUrl(URL.createObjectURL(blob));
                  setProgress(100);
                } else {
                  setError("Lỗi xử lý hình ảnh.");
                  setIsLoading(false);
                }
              }, `image/${targetFormat}`, 0.90);
            }
          };
          img.onerror = () => {
            setError("Không thể đọc định dạng hình ảnh.");
            setIsLoading(false);
          };
          img.src = URL.createObjectURL(selectedFile);
        }
      } else {
        // Video to MP3 conversion using ffmpeg.wasm singleton client
        setProgressStage("Nạp bộ biên dịch âm thanh (WASM)...");
        setProgress(20);
        
        const ffmpeg = await getFFmpeg();
        
        setProgress(35);
        setProgressStage("Đang nạp file video vào bộ nhớ ảo...");
        await ffmpeg.writeFile("input_video", await fetchFile(selectedFile));
        
        setProgress(50);
        setProgressStage("Đang trích xuất và mã hóa âm thanh sang MP3...");

        ffmpeg.on("progress", ({ progress: p }) => {
          const currentProgress = 50 + Math.round(p * 45); // Scale 50% to 95%
          setProgress(currentProgress);
        });

        // Run conversion command (no video, audio codec mp3)
        await ffmpeg.exec([
          "-i", "input_video",
          "-vn",
          "-acodec", "libmp3lame",
          "-ab", "256k",
          "output.mp3"
        ]);

        setProgress(95);
        setProgressStage("Đang xuất tệp âm thanh MP3...");
        
        const data = await ffmpeg.readFile("output.mp3");
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const outputBlob = new Blob([data as any], { type: "audio/mp3" });
        setResultUrl(URL.createObjectURL(outputBlob));
        setProgress(100);

        // Cleanup virtual FS files
        await ffmpeg.deleteFile("input_video");
        await ffmpeg.deleteFile("output.mp3");
      }
    } catch (err: any) {
      console.error(err);
      setError("Có lỗi xảy ra khi chuyển đổi định dạng. Vui lòng kiểm tra lại tệp.");
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
    const extension = fileType === "image" ? `.${targetFormat}` : ".mp3";
    
    link.download = `${baseName}_converted${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileSrc) URL.revokeObjectURL(fileSrc);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFileSrc(null);
    setResultUrl(null);
    setFileType(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: File Details & Target Settings */}
        <div className="md:col-span-6 space-y-6">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-zinc-800/80 hover:border-[#ff5e3a]/40 bg-[#0d0d12]/40 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group/drop"
              onClick={() => document.getElementById("convert-upload")?.click()}
            >
              <input
                id="convert-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-zinc-900/60 rounded-full border border-zinc-800 text-zinc-400 group-hover/drop:text-[#ff5e3a] group-hover/drop:border-[#ff5e3a]/30 transition-colors">
                  <UploadSimple size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-200">Kéo thả ảnh hoặc video vào đây</p>
                  <p className="text-xs text-zinc-500">hoặc nhấp chuột để chọn tệp từ máy của bạn</p>
                </div>
                <p className="text-[10px] text-zinc-650">Hỗ trợ HEIC, JPG, PNG, WebP, MP4, WebM (tối đa 200MB)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 bg-[#0d0d12]/60 border border-zinc-850 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400">
                    {fileType === "image" ? <ImageIcon size={18} /> : <MusicNotes size={18} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {fileType === "image" ? "Hình ảnh" : "Video"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all outline-none focus:outline-none cursor-pointer"
                  title="Chọn tệp khác"
                >
                  <ArrowCounterClockwise size={16} />
                </button>
              </div>

              {/* Target Format Selector */}
              <div className="space-y-2">
                <label htmlFor="target-format" className="block text-xs font-semibold text-zinc-300">
                  Chọn định dạng đích
                </label>
                <div className="relative">
                  <select
                    id="target-format"
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[#0d0d12]/80 border border-zinc-800/80 focus:outline-none focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a]/30 text-zinc-100 rounded-xl px-4 py-3.5 pr-10 text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {fileType === "image" ? (
                      <>
                        <option value="jpeg" className="bg-zinc-900 text-zinc-200">Định dạng JPG / JPEG</option>
                        <option value="png" className="bg-zinc-900 text-zinc-200">Định dạng PNG</option>
                        <option value="webp" className="bg-zinc-900 text-zinc-200">Định dạng WebP tối giản</option>
                      </>
                    ) : (
                      <>
                        <option value="mp3" className="bg-zinc-900 text-zinc-200">Âm thanh MP3 chất lượng cao (256kbps)</option>
                      </>
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
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
                  onClick={handleConvert}
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
                      <FileText size={18} weight="bold" />
                      <span>Bắt đầu chuyển đổi</span>
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
                  <span>Tải xuống kết quả</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Comparative Preview Cell */}
        <div className="md:col-span-6 space-y-5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-3">
            {!resultUrl ? "Xem trước ảnh gốc" : "Xem tệp tin kết quả"}
          </span>

          {/* Film Cell Frame */}
          <div className="sprocket-border relative overflow-hidden bg-zinc-950 border border-zinc-850/80 shadow-md">
            <div className="film-sprockets-top" />
            
            <div className="relative aspect-video w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
              {resultUrl ? (
                fileType === "image" ? (
                  <img
                    src={resultUrl}
                    alt="Ảnh đã chuyển đổi"
                    className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-400 py-6 animate-in zoom-in-95 duration-500">
                    <MusicNotes size={40} className="text-[#ff5e3a]" />
                    <span className="text-xs font-semibold text-zinc-200">Trích xuất âm thanh thành công!</span>
                    <audio src={resultUrl} controls className="mt-2 w-[80%]" />
                  </div>
                )
              ) : fileSrc ? (
                <img
                  src={fileSrc}
                  alt="Ảnh gốc"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-650 py-6">
                  <FileText size={32} weight="thin" />
                  <span className="text-[10px]">Chưa nạp tệp đa phương tiện</span>
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

          {/* Progress Playhead Scrubber */}
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
