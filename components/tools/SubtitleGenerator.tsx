"use client";

import React, { useState, useEffect } from "react";
import { UploadSimple, DownloadSimple, ArrowCounterClockwise, WarningCircle, FileText, YoutubeLogo, Copy, ArrowsLeftRight } from "@phosphor-icons/react";

export function SubtitleGenerator() {
  const [sourceType, setSourceType] = useState<"youtube" | "file">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // SRT Outputs
  const [originalSrt, setOriginalSrt] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState("");
  const [syncedSrt, setSyncedSrt] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError("Tệp tin quá lớn. Giới hạn upload tệp cho Whisper API là 25MB.");
        return;
      }
      setSelectedFile(file);
      setOriginalSrt(null);
      setSyncedSrt(null);
      setError(null);
    }
  };

  // Simulate progress bar during Groq Whisper API calls
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && sourceType === "file") {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + 12;
          if (prev < 75) return prev + 6;
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isLoading, sourceType]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOriginalSrt(null);
    setSyncedSrt(null);
    setTranslatedText("");

    try {
      if (sourceType === "youtube") {
        if (!youtubeUrl.trim()) {
          setError("Vui lòng nhập đường dẫn video YouTube.");
          setIsLoading(false);
          return;
        }
        setProgress(30);
        setProgressStage("Đang cào dữ liệu phụ đề từ YouTube...");
        
        const response = await fetch("/api/subtitle-yt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: youtubeUrl }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Không thể tìm thấy phụ đề cho video này.");
        }

        setProgress(100);
        setOriginalSrt(result.srt);
      } else {
        if (!selectedFile) {
          setError("Vui lòng chọn một tệp âm thanh/video.");
          setIsLoading(false);
          return;
        }
        setProgress(15);
        setProgressStage("Đang nén và gửi tệp tin tới Whisper AI...");

        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || "Lỗi xử lý chuyển giọng nói thành văn bản.");
        }

        const srtText = await response.text();
        setProgress(100);
        setOriginalSrt(srtText);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi hệ thống khi sinh phụ đề.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!originalSrt) return;
    
    // Extract only plain text from SRT blocks for easy translation
    const blocks = originalSrt.split("\n\n").filter(b => b.trim());
    const plainText = blocks.map(block => {
      const lines = block.split("\n");
      return lines.slice(2).join(" ");
    }).join("\n");

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncTranslation = () => {
    if (!originalSrt || !translatedText.trim()) return;

    const origBlocks = originalSrt.split("\n\n").filter(b => b.trim());
    const transLines = translatedText.split("\n").map(l => l.trim()).filter(l => l !== "");

    let synced = "";
    origBlocks.forEach((block, index) => {
      const lines = block.split("\n");
      if (lines.length >= 3) {
        const blockNum = lines[0];
        const timestamp = lines[1];
        // Use translated line if matched index exists, otherwise fallback to original
        const text = transLines[index] || lines.slice(2).join("\n");
        synced += `${blockNum}\n${timestamp}\n${text}\n\n`;
      }
    });

    setSyncedSrt(synced);
  };

  const handleDownload = (isSynced: boolean) => {
    const srtContent = isSynced ? syncedSrt : originalSrt;
    if (!srtContent) return;

    const blob = new Blob([srtContent], { type: "text/srt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const baseName = sourceType === "youtube" ? "youtube_subtitles" : selectedFile?.name.split(".")[0] || "audio_subtitles";
    link.download = isSynced ? `${baseName}_vi.srt` : `${baseName}_original.srt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setYoutubeUrl("");
    setSelectedFile(null);
    setOriginalSrt(null);
    setSyncedSrt(null);
    setTranslatedText("");
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Source Type Selector */}
      <div className="flex bg-[#0d0d12]/60 border border-zinc-850 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => { setSourceType("youtube"); handleReset(); }}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            sourceType === "youtube" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <YoutubeLogo size={14} />
          Link YouTube
        </button>
        <button
          onClick={() => { setSourceType("file"); handleReset(); }}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            sourceType === "file" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UploadSimple size={14} />
          Tải file lên
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Inputs */}
        <div className="md:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            {sourceType === "youtube" ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">Nhập link video YouTube</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-[#0d0d12]/80 border border-zinc-800/80 focus:outline-none focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a]/30 text-zinc-100 rounded-xl px-4 py-3.5 text-sm placeholder:text-zinc-600 outline-none transition-all duration-200"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">Chọn tệp âm thanh hoặc video</label>
                {!selectedFile ? (
                  <div
                    className="border-2 border-dashed border-zinc-800/80 hover:border-[#ff5e3a]/40 bg-[#0d0d12]/40 rounded-xl p-8 text-center cursor-pointer transition-all duration-300"
                    onClick={() => document.getElementById("audio-file-upload")?.click()}
                  >
                    <input
                      id="audio-file-upload"
                      type="file"
                      accept="audio/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadSimple size={20} className="mx-auto text-zinc-500 mb-2" />
                    <p className="text-xs font-medium text-zinc-300">Nhấp chọn tệp tin</p>
                    <p className="text-[9px] text-zinc-600 mt-1">MP3, WAV, M4A, MP4 tối đa 25MB</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-xl">
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-zinc-200 truncate max-w-[180px]">{selectedFile.name}</p>
                      <p className="text-[9px] text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400"
                    >
                      <ArrowCounterClockwise size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <WarningCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!originalSrt && (
              <button
                type="submit"
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
                    <span>{sourceType === "youtube" ? "Đang lấy phụ đề..." : progressStage}</span>
                  </>
                ) : (
                  <>
                    <FileText size={18} weight="bold" />
                    <span>Trích xuất phụ đề</span>
                  </>
                )}
              </button>
            )}
          </form>

          {/* Reset button once SRT is loaded */}
          {originalSrt && (
            <button
              onClick={handleReset}
              className="w-full py-3.5 px-6 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowCounterClockwise size={14} />
              <span>Làm mới & Tạo phụ đề khác</span>
            </button>
          )}
        </div>

        {/* Right Column: SRT Sync Editor (shown when original SRT is ready) */}
        <div className="md:col-span-7 space-y-6">
          {isLoading && (
            /* Progress Playhead Scrubber during generation */
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 space-y-3">
              <span className="text-[10px] font-semibold text-zinc-400 block">Đang trích xuất phụ đề video...</span>
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

          {!originalSrt && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#0d0d12]/40 border border-zinc-850 rounded-2xl p-8">
              <FileText size={36} weight="thin" className="text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-500">Chưa nạp nội dung phụ đề</p>
            </div>
          )}

          {originalSrt && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Dual Sync Box Editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Box 1: Original Subtitles */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-zinc-400">Phụ đề gốc (SRT)</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <Copy size={12} />
                      <span>{copied ? "Đã sao chép!" : "Sao chép dịch"}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={originalSrt}
                    className="w-full h-64 bg-zinc-950/80 border border-zinc-850/80 text-zinc-400 text-xs font-mono p-3 rounded-xl focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => handleDownload(false)}
                    className="w-full py-2 px-3 border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <DownloadSimple size={12} />
                    Tải phụ đề gốc (.srt)
                  </button>
                </div>

                {/* Box 2: Translated Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-zinc-400">Bản dịch tiếng Việt</span>
                    <span className="text-[9px] text-zinc-600">Dán câu dịch (mỗi câu 1 dòng)</span>
                  </div>
                  <textarea
                    placeholder="Dán nội dung bản dịch đã dịch từ AI vào đây. Mỗi dòng tương ứng với 1 đoạn gốc."
                    value={translatedText}
                    onChange={(e) => setTranslatedText(e.target.value)}
                    className="w-full h-64 bg-zinc-950/80 border border-zinc-850/80 text-zinc-200 text-xs p-3 rounded-xl focus:outline-none focus:border-[#ff5e3a] resize-none placeholder:text-zinc-700"
                  />
                  
                  <button
                    onClick={handleSyncTranslation}
                    disabled={!translatedText.trim()}
                    className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active-press"
                  >
                    <ArrowsLeftRight size={12} />
                    Đồng bộ thời gian dịch
                  </button>
                </div>

              </div>

              {/* Step instructions */}
              <div className="bg-[#ff5e3a]/5 border border-[#ff5e3a]/15 p-4 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-[#ff8a5c]">💡 Mẹo dịch phụ đề nhanh chóng:</p>
                <ol className="text-[10px] text-zinc-400 list-decimal list-inside space-y-1">
                  <li>Click <b>"Sao chép dịch"</b> ở khung phụ đề gốc để lấy toàn bộ dòng chữ (không chứa timestamp).</li>
                  <li>Dán văn bản này vào Gemini/ChatGPT và yêu cầu: <i>"Dịch sang tiếng Việt, giữ nguyên số dòng."</i></li>
                  <li>Sao chép bản dịch tiếng Việt, dán vào khung bên phải và nhấn <b>"Đồng bộ thời gian dịch"</b>.</li>
                </ol>
              </div>

              {/* Final Synced SRT Download */}
              {syncedSrt && (
                <div className="p-4 bg-zinc-900 border border-[#232332] rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Đã đồng bộ thời gian hoàn tất!</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Bản dịch tiếng Việt đã được đồng bộ chuẩn khớp giây.</p>
                  </div>
                  <button
                    onClick={() => handleDownload(true)}
                    style={{
                      background: "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                    }}
                    className="py-2.5 px-4 rounded-lg font-bold text-xs text-zinc-950 flex items-center gap-1.5 transition-all active-press btn-hover-shine"
                  >
                    <DownloadSimple size={14} weight="bold" />
                    Tải phụ đề Việt (.srt)
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
