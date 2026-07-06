"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadSimple, DownloadSimple, ArrowCounterClockwise, WarningCircle, Scissors, Video } from "@phosphor-icons/react";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "../../lib/ffmpeg/ffmpeg-client";

export function VideoTrimmer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [videoSrc, resultUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Vui lòng chọn một tệp video hợp lệ.");
      return;
    }
    
    // Limit to 200MB as specified in plan
    if (file.size > 200 * 1024 * 1024) {
      setError("Tệp video quá lớn. Vui lòng chọn tệp nhỏ hơn 200MB để xử lý mượt mà trên trình duyệt.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResultUrl(null);
    setStartTime(0);
    
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoSrc(URL.createObjectURL(file));
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(videoDuration);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    
    const parts = [
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0")
    ];
    if (h > 0) {
      parts.unshift(h.toString().padStart(2, "0"));
    }
    return `${parts.join(":")}.${ms}`;
  };

  const handleTrim = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setProgress(10);
    setProgressStage("Đang khởi động bộ xử lý video (WASM)...");

    try {
      const ffmpeg = await getFFmpeg();
      
      setProgress(25);
      setProgressStage("Đang tải dữ liệu tệp vào bộ nhớ tạm...");
      
      // Load file into ffmpeg virtual FS
      await ffmpeg.writeFile("input.mp4", await fetchFile(selectedFile));
      
      setProgress(50);
      setProgressStage("Đang trích xuất đoạn phim (cắt không nén)...");

      // Bind progress event
      ffmpeg.on("progress", ({ progress: p }) => {
        // Map progress from 50% to 90%
        const currentProgress = 50 + Math.round(p * 40);
        setProgress(currentProgress);
      });

      // Format time options for ffmpeg command line: -ss offset, -t duration
      const durationToCut = endTime - startTime;
      
      // Execute trimming command using -c copy for instant split without transcoding
      await ffmpeg.exec([
        "-ss", startTime.toFixed(3),
        "-i", "input.mp4",
        "-t", durationToCut.toFixed(3),
        "-c", "copy",
        "output.mp4"
      ]);

      setProgress(95);
      setProgressStage("Đang xuất tệp kết quả...");

      const data = await ffmpeg.readFile("output.mp4");
      
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const outputBlob = new Blob([data as any], { type: selectedFile.type || "video/mp4" });
      const url = URL.createObjectURL(outputBlob);
      
      setResultUrl(url);
      setProgress(100);
      
      // Cleanup virtual FS files
      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");
    } catch (err: any) {
      console.error(err);
      setError("Có lỗi xảy ra trong quá trình cắt video. Vui lòng thử lại.");
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
    const extension = dotIndex !== -1 ? originalName.substring(dotIndex) : ".mp4";
    
    link.download = `${baseName}_trimmed${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setVideoSrc(null);
    setResultUrl(null);
    setError(null);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setProgress(0);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const val = parseFloat(e.target.value);
    if (isStart) {
      const newStart = Math.min(val, endTime - 0.5); // Minimum 0.5s segment
      setStartTime(newStart);
      if (videoRef.current) videoRef.current.currentTime = newStart;
    } else {
      const newEnd = Math.max(val, startTime + 0.5);
      setEndTime(newEnd);
      if (videoRef.current) videoRef.current.currentTime = newEnd;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Trimming Range */}
        <div className="md:col-span-6 space-y-6">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-zinc-800/80 hover:border-[#ff5e3a]/40 bg-[#0d0d12]/40 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group/drop"
              onClick={() => document.getElementById("video-upload")?.click()}
            >
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-zinc-900/60 rounded-full border border-zinc-800 text-zinc-400 group-hover/drop:text-[#ff5e3a] group-hover/drop:border-[#ff5e3a]/30 transition-colors">
                  <UploadSimple size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-200">Kéo thả video vào đây</p>
                  <p className="text-xs text-zinc-500">hoặc nhấp chuột để chọn tệp từ máy của bạn</p>
                </div>
                <p className="text-[10px] text-zinc-650">Hỗ trợ MP4, WebM, MKV tối đa 200MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5 bg-[#0d0d12]/60 border border-zinc-850 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400">
                    <Video size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {formatTime(duration)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all outline-none focus:outline-none cursor-pointer"
                  title="Chọn video khác"
                >
                  <ArrowCounterClockwise size={16} />
                </button>
              </div>

              {/* Scrubber Handles */}
              {duration > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400">Điểm đầu (Start)</label>
                      <div className="bg-zinc-900/80 border border-zinc-850 px-3 py-2 rounded-lg text-xs font-mono text-zinc-200 text-center">
                        {formatTime(startTime)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400">Điểm cuối (End)</label>
                      <div className="bg-zinc-900/80 border border-zinc-850 px-3 py-2 rounded-lg text-xs font-mono text-zinc-200 text-center">
                        {formatTime(endTime)}
                      </div>
                    </div>
                  </div>

                  {/* Range Sliders */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-zinc-500">
                        <span>Kéo chọn điểm đầu</span>
                        <span>{((startTime / duration) * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={startTime}
                        onChange={(e) => handleRangeChange(e, true)}
                        className="w-full accent-[#ff5e3a] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-zinc-500">
                        <span>Kéo chọn điểm cuối</span>
                        <span>{((endTime / duration) * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={endTime}
                        onChange={(e) => handleRangeChange(e, false)}
                        className="w-full accent-[#ff5e3a] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <WarningCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              {!resultUrl ? (
                <button
                  onClick={handleTrim}
                  disabled={isLoading || duration === 0}
                  style={{
                    background: isLoading ? undefined : "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                  }}
                  className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 active-press outline-none cursor-pointer relative overflow-hidden group/btn ${
                    isLoading || duration === 0
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
                      <Scissors size={18} weight="bold" />
                      <span>Cắt và trích xuất video</span>
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
                  <span>Tải video đã cắt</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Video Playback Preview */}
        <div className="md:col-span-6 space-y-5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-3">
            {!resultUrl ? "Xem trước video gốc" : "Xem đoạn video đã cắt"}
          </span>

          {/* Film Cell Frame for Video Player */}
          <div className="sprocket-border relative overflow-hidden bg-zinc-950 border border-zinc-850/80 shadow-md">
            <div className="film-sprockets-top" />
            
            <div className="relative aspect-video w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
              {resultUrl ? (
                <video
                  src={resultUrl}
                  controls
                  className="w-full h-full object-contain animate-in zoom-in-95 duration-500"
                />
              ) : videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onLoadedMetadata={handleLoadedMetadata}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-650 py-6">
                  <Video size={32} weight="thin" />
                  <span className="text-[10px]">Chưa tải video lên</span>
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

          {/* Scrubber Playhead (visible when cutting) */}
          {isLoading && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>Tiến trình cắt</span>
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
