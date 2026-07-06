"use client";

import React, { useState, useEffect } from "react";
import { UploadSimple, DownloadSimple, ArrowCounterClockwise, WarningCircle, FileText, ClipboardText, X, Info } from "@phosphor-icons/react";
import { marked } from "marked";
import mammoth from "mammoth";
import TurndownService from "turndown";
import * as pdfjsLib from "pdfjs-dist";

// Set worker Src for pdfjs client-side execution
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function DocConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isWriteMdMode, setIsWriteMdMode] = useState(false);
  const [markdownInput, setMarkdownInput] = useState(
    "# Tiêu đề Tài liệu\n\nĐây là công cụ chuyển đổi Markdown sang Word trực tuyến.\n\n### Hỗ trợ định dạng:\n- **Chữ in đậm**, *chữ in nghiêng*\n- Danh sách không thứ tự\n- Đoạn mã code `console.log('kh4idev')`\n\n```javascript\n// Khối mã lệnh\nconst suite = 'kh4idev Media Suite';\nconsole.log(suite);\n```\n\n> Hãy thử viết hoặc tải tài liệu của bạn vào đây."
  );

  const [inputFormat, setInputFormat] = useState<"md" | "docx" | "pdf" | "">("");
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Output States
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke object URLs
  useEffect(() => {
    return () => {
      // Cleanup
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setError(null);
    setResultText(null);
    setResultBlob(null);
    setTargetFormat("");

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "md") {
      setInputFormat("md");
    } else if (ext === "docx") {
      setInputFormat("docx");
    } else if (ext === "pdf") {
      setInputFormat("pdf");
    } else {
      setError("Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp tin .md, .docx hoặc .pdf");
      return;
    }

    setSelectedFile(file);
    setIsWriteMdMode(false);
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

  const handleStartMdMode = () => {
    handleReset();
    setInputFormat("md");
    setIsWriteMdMode(true);
  };

  const handleConvert = async () => {
    let fileToUpload = selectedFile;
    if (isWriteMdMode) {
      fileToUpload = new File([markdownInput], "soan_thao.md", { type: "text/markdown" });
    }

    if (!fileToUpload || !inputFormat || !targetFormat) return;

    setIsLoading(true);
    setError(null);
    setResultText(null);
    setResultBlob(null);
    setProgress(10);
    setProgressStage("Đang chuẩn bị tệp tin...");

    try {
      // 1. Try CloudConvert API first
      setProgress(20);
      setProgressStage("Khởi tạo phiên kết nối CloudConvert...");
      
      const initResponse = await fetch("/api/convert/create-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetFormat }),
      });

      const initResult = await initResponse.json();
      
      if (initResponse.ok && initResult.success) {
        const { uploadForm, exportTaskId } = initResult;
        
        setProgress(40);
        setProgressStage("Đang tải tệp tin lên máy chủ CloudConvert...");
        
        const uploadData = new FormData();
        Object.entries(uploadForm.parameters).forEach(([key, val]) => {
          uploadData.append(key, val as string);
        });
        uploadData.append("file", fileToUpload);
        
        const uploadResponse = await fetch(uploadForm.url, {
          method: "POST",
          body: uploadData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Lỗi tải tệp tin lên CloudConvert.");
        }

        setProgress(60);
        setProgressStage("Đang chuyển đổi định dạng tệp tin (CloudConvert)...");

        let statusResult;
        let attempts = 0;
        const maxAttempts = 30; // Max 45 seconds
        
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          attempts++;
          
          const statusResponse = await fetch(`/api/convert/check-status?taskId=${exportTaskId}`);
          statusResult = await statusResponse.json();

          if (!statusResponse.ok || !statusResult.success) {
            throw new Error(statusResult.error || "Không thể kiểm tra trạng thái chuyển đổi.");
          }

          if (statusResult.status === "finished") {
            setProgress(100);
            setProgressStage("Đang nhận tệp tin kết quả...");
            const fileUrl = statusResult.url;
            
            // Fetch content back to browser
            const response = await fetch(fileUrl);
            if (targetFormat === "docx" || targetFormat === "pdf") {
              const fileBlob = await response.blob();
              setResultBlob(fileBlob);
            } else {
              const textContent = await response.text();
              setResultText(textContent);
            }
            return; // Success!
          }

          if (statusResult.status === "error") {
            throw new Error(statusResult.error || "Chuyển đổi thất bại.");
          }

          setProgress((prev) => Math.min(prev + 1, 90));
        }
        
        throw new Error("Thời gian chờ chuyển đổi vượt quá giới hạn.");
      } else {
        console.warn("CloudConvert API is not configured or failed. Falling back to local offline processing:", initResult.error);
      }

      // 2. Local fallback offline processing (runs 100% client-side)
      setProgressStage("Đang chạy bộ xử lý cục bộ offline (WASM/Canvas)...");
      setProgress(50);

      if (inputFormat === "md") {
        if (targetFormat === "docx") {
          const htmlContent = await marked.parse(markdownInput);
          const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
              <meta charset="utf-8">
              <title>Tài liệu chuyển đổi</title>
              <style>
                body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333333; }
                h1 { font-size: 20pt; font-weight: bold; color: #ff5e3a; margin-top: 18pt; margin-bottom: 8pt; border-bottom: 1px solid #eeeeee; padding-bottom: 4pt; }
                h2 { font-size: 15pt; font-weight: bold; color: #232332; margin-top: 14pt; margin-bottom: 6pt; }
                h3 { font-size: 12pt; font-weight: bold; color: #555555; margin-top: 10pt; margin-bottom: 4pt; }
                p { margin-bottom: 8pt; text-align: justify; }
                ul, ol { margin-left: 20pt; margin-bottom: 8pt; }
                li { margin-bottom: 3pt; }
                code { font-family: Consolas, monospace; background-color: #f4f4f6; color: #ff5e3a; padding: 2px 4px; font-size: 9.5pt; border-radius: 3px; }
                pre { font-family: Consolas, monospace; background-color: #0d0d12; color: #f4f4f6; padding: 12px; border: 1px solid #232332; font-size: 9.5pt; margin-bottom: 8pt; border-radius: 6px; }
                blockquote { border-left: 3px solid #ff5e3a; padding-left: 12pt; color: #666666; margin-left: 0; margin-bottom: 8pt; font-style: italic; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; }
                th, td { border: 1px solid #dddddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f6; font-weight: bold; }
              </style>
            </head>
            <body>
          `;
          const footer = "</body></html>";
          const fullHtml = header + htmlContent + footer;
          const blob = new Blob(["\ufeff" + fullHtml], { type: "application/msword;charset=utf-8" });
          setResultBlob(blob);
          setProgress(100);
        } else {
          throw new Error("Tách offline hiện chỉ hỗ trợ chuyển sang định dạng Word (.doc). Vui lòng thêm CloudConvert API key để chuyển sang PDF.");
        }
      } 
      else if (inputFormat === "docx") {
        if (targetFormat === "md") {
          const arrayBuffer = await fileToUpload.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const turndownService = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
          const markdown = turndownService.turndown(result.value);
          setResultText(markdown);
          setProgress(100);
        } else {
          throw new Error("Chuyển đổi offline của Word hiện chỉ hỗ trợ sang Markdown (.md).");
        }
      } 
      else if (inputFormat === "pdf") {
        if (targetFormat === "txt") {
          const arrayBuffer = await fileToUpload.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;
          let textResult = "";

          for (let i = 1; i <= numPages; i++) {
            setProgressStage(`Đang đọc chữ trang ${i}/${numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            textResult += `--- TRANG ${i} / ${numPages} ---\n${pageText}\n\n`;
            setProgress(50 + Math.round((i / numPages) * 50));
          }

          setResultText(textResult);
          setProgress(100);
        } else {
          throw new Error("Tách chữ PDF offline hiện chỉ hỗ trợ xuất file văn bản thô (.txt).");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể thực hiện chuyển đổi định dạng.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    let blob: Blob | null = null;
    let filename = "";

    if (resultBlob) {
      blob = resultBlob;
      // Identify extension from content type or guess
      const isPdf = resultBlob.type.includes("pdf");
      const isDocx = resultBlob.type.includes("word") || resultBlob.type.includes("officedocument");
      filename = isPdf ? "document_converted.pdf" : isDocx ? "document_converted.docx" : "document_converted.doc";
    } else if (resultText) {
      blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
      filename = targetFormat === "md" ? "document_converted.md" : "document_text_extracted.txt";
    }

    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsWriteMdMode(false);
    setInputFormat("");
    setTargetFormat("");
    setResultText(null);
    setResultBlob(null);
    setError(null);
    setProgress(0);
  };

  // Helper format sizing
  const getFileSizeStr = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFormatLabel = (fmt: string) => {
    if (fmt === "md") return "Markdown Document";
    if (fmt === "docx") return "DOCX Document";
    if (fmt === "pdf") return "PDF Document";
    return "";
  };

  // Render Target options based on input format
  const renderFormatOptions = () => {
    if (inputFormat === "md") {
      return (
        <>
          <option value="">Chọn định dạng</option>
          <option value="docx">Word (.docx)</option>
          <option value="pdf">PDF (.pdf)</option>
          <option value="html">Webpage (.html)</option>
        </>
      );
    }
    if (inputFormat === "docx") {
      return (
        <>
          <option value="">Chọn định dạng</option>
          <option value="md">Markdown (.md)</option>
          <option value="pdf">PDF (.pdf)</option>
          <option value="txt">Văn bản thô (.txt)</option>
        </>
      );
    }
    if (inputFormat === "pdf") {
      return (
        <>
          <option value="">Chọn định dạng</option>
          <option value="docx">Word (.docx)</option>
          <option value="md">Markdown (.md)</option>
          <option value="txt">Văn bản thô (.txt)</option>
        </>
      );
    }
    return <option value="">Select Format</option>;
  };

  const isFileActive = selectedFile || isWriteMdMode;

  return (
    <div className="space-y-6">
      
      {/* 1. Empty Dropzone State */}
      {!isFileActive && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-zinc-800/80 hover:border-[#ff5e3a]/40 bg-[#0d0d12]/40 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group/drop"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".md,.docx,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-zinc-900/60 rounded-full border border-zinc-800 text-zinc-400 group-hover/drop:text-[#ff5e3a] group-hover/drop:border-[#ff5e3a]/30 transition-colors">
              <UploadSimple size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">Kéo thả tệp tin vào đây</p>
              <p className="text-xs text-zinc-500">hoặc nhấp chuột để chọn tệp tin từ máy tính</p>
            </div>
            <p className="text-[10px] text-zinc-650">Hỗ trợ định dạng .md, .docx, .pdf tối đa 15MB</p>
            
            <span className="text-[10px] text-zinc-600">— Hoặc —</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleStartMdMode(); }}
              className="px-4 py-2 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 text-zinc-400 rounded-xl text-xs font-semibold transition-all active-press"
            >
              Tự soạn thảo văn bản Markdown
            </button>
          </div>
        </div>
      )}

      {/* 2. File Row Visual Display (Matches CloudConvert visual style exactly!) */}
      {isFileActive && (
        <div className="space-y-5">
          {/* File Row item */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/65 border border-zinc-850 p-4 rounded-xl shadow-md w-full animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-xl text-[#ff5e3a] shrink-0">
                <FileText size={20} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-zinc-200 truncate max-w-[220px]" title={isWriteMdMode ? "soan_thao.md" : selectedFile?.name}>
                  {isWriteMdMode ? "soan_thao.md" : selectedFile?.name}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                  {isWriteMdMode ? getFileSizeStr(markdownInput.length) : selectedFile ? getFileSizeStr(selectedFile.size) : ""} • {getFormatLabel(inputFormat)}
                </p>
              </div>
            </div>

            {/* In-row Convert Dropdown Controls */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto mt-2 sm:mt-0 select-none">
              <span className="text-[10px] font-semibold text-zinc-500">Convert</span>
              <span className="px-2 py-1 bg-zinc-950 border border-zinc-850 rounded text-[10px] font-bold text-zinc-300 uppercase">
                {inputFormat}
              </span>
              <span className="text-zinc-600 text-xs">→</span>
              
              {/* Select target dropdown */}
              <div className="relative">
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-950 border border-[#ff5e3a]/40 hover:border-[#ff5e3a] focus:outline-none focus:ring-1 focus:ring-[#ff5e3a]/30 text-xs font-semibold text-[#ff5e3a] px-3.5 py-1.5 rounded-lg appearance-none cursor-pointer pr-8 outline-none transition-all"
                >
                  {renderFormatOptions()}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#ff5e3a]">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Close Button X */}
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer ml-1"
                title="Hủy chọn tệp"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Inline Markdown editor if write mode is active */}
          {isWriteMdMode && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="block text-xs font-semibold text-zinc-300">Soạn thảo văn bản Markdown của bạn</label>
              <textarea
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                disabled={isLoading}
                className="w-full h-64 bg-[#0d0d12]/80 border border-zinc-800/80 focus:outline-none focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a]/30 text-zinc-100 rounded-xl p-4 text-xs font-mono placeholder:text-zinc-650 resize-none outline-none transition-all duration-200"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <WarningCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 3. Output preview shown below row */}
          {(resultText || resultBlob) && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Tệp đầu ra</span>
                {resultText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <ClipboardText size={12} />
                    <span>{copied ? "Đã sao chép!" : "Sao chép"}</span>
                  </button>
                )}
              </div>

              {/* Output sprocket container */}
              <div className="sprocket-border relative overflow-hidden bg-zinc-950 border border-zinc-850/80 shadow-md">
                <div className="film-sprockets-top" />
                <div className="relative aspect-video w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
                  {resultBlob ? (
                    <div className="flex flex-col items-center gap-2 text-zinc-400 py-6 animate-in zoom-in-95 duration-500">
                      <FileText size={40} className="text-[#ff5e3a]" />
                      <span className="text-xs font-semibold text-zinc-200">Đã chuyển đổi thành công!</span>
                      <p className="text-[10px] text-zinc-500">Bản tài liệu đã sẵn sàng để tải xuống.</p>
                    </div>
                  ) : resultText ? (
                    <textarea
                      readOnly
                      value={resultText}
                      className="w-full h-full bg-zinc-950/80 text-zinc-300 text-[10px] font-mono p-4 focus:outline-none resize-none border-none outline-none animate-in fade-in duration-500"
                    />
                  ) : null}
                </div>
                <div className="film-sprockets-bottom" />
              </div>
            </div>
          )}

          {/* 4. Bottom Action Bar (Matches CloudConvert bottom toolbar!) */}
          <div className="flex items-center justify-between border-t border-zinc-850 pt-4 mt-6">
            {/* Left Status */}
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              {isLoading ? (
                <>
                  <ArrowCounterClockwise className="animate-spin text-[#ff5e3a]" size={14} />
                  <span className="font-mono text-[11px]">{progressStage}</span>
                </>
              ) : (resultText || resultBlob) ? (
                <>
                  <Info size={14} className="text-[#ff5e3a]" />
                  <span>Chuyển đổi hoàn tất! Nhấp tải xuống tệp kết quả.</span>
                </>
              ) : !targetFormat ? (
                <>
                  <Info size={14} className="text-[#ff5e3a]" />
                  <span>Vui lòng chọn định dạng đầu ra</span>
                </>
              ) : (
                <>
                  <Info size={14} className="text-[#ff5e3a]" />
                  <span>Sẵn sàng chuyển đổi sang .{targetFormat}</span>
                </>
              )}
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all active-press cursor-pointer"
              >
                Reset
              </button>

              {(!resultText && !resultBlob) ? (
                <button
                  onClick={handleConvert}
                  disabled={isLoading || !targetFormat}
                  style={{
                    background: (isLoading || !targetFormat) ? undefined : "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                  }}
                  className={`py-2 px-5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all duration-300 active-press outline-none cursor-pointer relative overflow-hidden group/btn ${
                    (isLoading || !targetFormat)
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/20"
                      : "text-zinc-950 shadow-[0_4px_20px_rgba(255,94,58,0.15)] btn-hover-shine"
                  }`}
                >
                  <ArrowCounterClockwise className={isLoading ? "animate-spin" : ""} size={14} weight="bold" />
                  <span>Convert</span>
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  style={{
                    background: "linear-gradient(to right, #ff5e3a, #ff8a5c)",
                  }}
                  className="py-2 px-5 rounded-xl font-bold flex items-center gap-2 text-xs text-zinc-950 shadow-[0_4px_20px_rgba(255,94,58,0.15)] transition-all duration-300 active-press outline-none cursor-pointer btn-hover-shine"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
