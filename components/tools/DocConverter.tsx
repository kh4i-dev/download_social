"use client";

import React, { useState, useEffect } from "react";
import { UploadSimple, DownloadSimple, ArrowCounterClockwise, WarningCircle, FileText, Copy, ArrowsLeftRight, ClipboardText } from "@phosphor-icons/react";
import { marked } from "marked";
import mammoth from "mammoth";
import TurndownService from "turndown";
import * as pdfjsLib from "pdfjs-dist";

// Set worker Src for pdfjs client-side execution
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function DocConverter() {
  const [activeTab, setActiveTab] = useState<"md2word" | "word2md" | "pdf2text">("md2word");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Markdown Editor States
  const [markdownInput, setMarkdownInput] = useState(
    "# Tiêu đề Tài liệu\n\nĐây là công cụ chuyển đổi Markdown sang Word trực tuyến.\n\n### Hỗ trợ định dạng:\n- **Chữ in đậm**, *chữ in nghiêng*\n- Danh sách không thứ tự\n- Đoạn mã code `console.log('kh4idev')`\n\n```javascript\n// Khối mã lệnh\nconst suite = 'kh4idev Media Suite';\nconsole.log(suite);\n```\n\n> Hãy thử viết hoặc tải tài liệu của bạn vào đây."
  );

  // Output States
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);

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

    const ext = file.name.split(".").pop()?.toLowerCase();
    
    if (activeTab === "word2md") {
      if (ext !== "docx") {
        setError("Vui lòng tải lên tệp tin Word định dạng .docx");
        return;
      }
    } else if (activeTab === "pdf2text") {
      if (ext !== "pdf") {
        setError("Vui lòng tải lên tệp tin PDF định dạng .pdf");
        return;
      }
    }

    setSelectedFile(file);
  };

  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);
    setResultText(null);
    setResultBlob(null);
    setProgress(20);

    try {
      if (activeTab === "md2word") {
        if (!markdownInput.trim()) {
          throw new Error("Vui lòng nhập nội dung Markdown để chuyển đổi.");
        }
        setProgressStage("Đang phân tích cú pháp Markdown...");
        setProgress(50);

        // Convert MD to HTML
        const htmlContent = await marked.parse(markdownInput);
        
        setProgress(80);
        setProgressStage("Đang đóng gói file Word (DOCX)...");

        // Format Word Document Content
        const header = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                xmlns:w='urn:schemas-microsoft-com:office:word' 
                xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset="utf-8">
            <title>Tài liệu chuyển đổi</title>
            <!--[if gte mso 9]>
            <xml>
              <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>100</w:Zoom>
                <w:DoNotOptimizeForBrowser/>
              </w:WordDocument>
            </xml>
            <![endif]-->
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

        // Use UTF-8 BOM (\ufeff) to preserve Vietnamese accents in Word
        const blob = new Blob(["\ufeff" + fullHtml], { type: "application/msword;charset=utf-8" });
        
        setResultBlob(blob);
        setProgress(100);
      } 
      else if (activeTab === "word2md" && selectedFile) {
        setProgressStage("Đang đọc nhị phân tệp Word...");
        setProgress(30);

        const arrayBuffer = await selectedFile.arrayBuffer();
        
        setProgress(60);
        setProgressStage("Đang phân tích cấu trúc tài liệu...");
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        setProgress(85);
        setProgressStage("Đang sinh mã nguồn Markdown...");
        
        const turndownService = new TurndownService({
          headingStyle: "atx",
          codeBlockStyle: "fenced"
        });
        
        const markdown = turndownService.turndown(html);
        setResultText(markdown);
        setProgress(100);
      } 
      else if (activeTab === "pdf2text" && selectedFile) {
        setProgressStage("Đang nạp công cụ đọc PDF...");
        const arrayBuffer = await selectedFile.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        
        loadingTask.onProgress = (progressData: any) => {
          if (progressData.total > 0) {
            const pct = Math.min(20 + Math.round((progressData.loaded / progressData.total) * 30), 50);
            setProgress(pct);
            setProgressStage(`Đang tải dữ liệu tệp: ${pct}%`);
          }
        };

        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        let textResult = "";

        for (let i = 1; i <= numPages; i++) {
          setProgressStage(`Đang trích xuất chữ trang ${i}/${numPages}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          
          textResult += `--- TRANG ${i} / ${numPages} ---\n${pageText}\n\n`;
          
          const pct = 50 + Math.round((i / numPages) * 45);
          setProgress(pct);
        }

        setResultText(textResult);
        setProgress(100);
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

    if (activeTab === "md2word" && resultBlob) {
      blob = resultBlob;
      filename = "document_converted.doc"; // Export as .doc which Word handles perfectly
    } else if (resultText) {
      blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
      filename = activeTab === "word2md" ? "document_converted.md" : "pdf_text_extracted.txt";
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
    setResultText(null);
    setResultBlob(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <div className="flex bg-[#0d0d12]/60 border border-zinc-850 p-1 rounded-xl max-w-md">
        <button
          onClick={() => { setActiveTab("md2word"); handleReset(); }}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "md2word" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ArrowsLeftRight size={13} />
          Markdown sang Word
        </button>
        <button
          onClick={() => { setActiveTab("word2md"); handleReset(); }}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "word2md" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileText size={13} />
          Word sang Markdown
        </button>
        <button
          onClick={() => { setActiveTab("pdf2text"); handleReset(); }}
          disabled={isLoading}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "pdf2text" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileText size={13} />
          PDF sang Chữ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Source */}
        <div className="md:col-span-6 space-y-5">
          {activeTab === "md2word" ? (
            /* MD Text Input */
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">Nhập mã nguồn Markdown</label>
              <textarea
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                disabled={isLoading}
                placeholder="# Tiêu đề tài liệu..."
                className="w-full h-80 bg-[#0d0d12]/80 border border-zinc-800/80 focus:outline-none focus:border-[#ff5e3a] focus:ring-1 focus:ring-[#ff5e3a]/30 text-zinc-100 rounded-xl p-4 text-xs font-mono placeholder:text-zinc-650 resize-none outline-none transition-all duration-200"
              />
            </div>
          ) : (
            /* File Upload for DOCX or PDF */
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Chọn tệp tin {activeTab === "word2md" ? "Word (.docx)" : "PDF (.pdf)"}
              </label>
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-zinc-800/80 hover:border-[#ff5e3a]/40 bg-[#0d0d12]/40 rounded-xl p-10 text-center cursor-pointer transition-all duration-300 group/drop"
                  onClick={() => document.getElementById("doc-file-upload")?.click()}
                >
                  <input
                    id="doc-file-upload"
                    type="file"
                    accept={activeTab === "word2md" ? ".docx" : ".pdf"}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <UploadSimple size={24} className="text-zinc-500 group-hover/drop:text-[#ff5e3a] transition-colors" />
                    <p className="text-xs font-semibold text-zinc-300">Chọn hoặc kéo thả tệp vào đây</p>
                    <p className="text-[9px] text-zinc-600">Hỗ trợ định dạng .{activeTab === "word2md" ? "docx" : "pdf"} tối đa 15MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-zinc-400" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                      <p className="text-[9px] text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 cursor-pointer"
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

          {/* Action Button */}
          {(!resultText && !resultBlob) ? (
            <button
              onClick={handleConvert}
              disabled={isLoading || (activeTab !== "md2word" && !selectedFile)}
              style={{
                background: (isLoading || (activeTab !== "md2word" && !selectedFile)) ? undefined : "linear-gradient(to right, #ff5e3a, #ff8a5c)",
              }}
              className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 active-press outline-none cursor-pointer relative overflow-hidden group/btn ${
                (isLoading || (activeTab !== "md2word" && !selectedFile))
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
                  <ArrowsLeftRight size={18} weight="bold" />
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
              <span>
                {activeTab === "md2word" ? "Tải xuống file Word (.doc)" : activeTab === "word2md" ? "Tải xuống file Markdown (.md)" : "Tải xuống file Văn bản (.txt)"}
              </span>
            </button>
          )}
        </div>

        {/* Right Column: Output Viewer */}
        <div className="md:col-span-6 space-y-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Xem trước kết quả</span>
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

          {/* Film Cell Frame */}
          <div className="sprocket-border relative overflow-hidden bg-zinc-950 border border-zinc-850/80 shadow-md">
            <div className="film-sprockets-top" />
            
            <div className="relative aspect-video w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
              {resultBlob && activeTab === "md2word" ? (
                /* Success message for MD to Word conversion */
                <div className="flex flex-col items-center gap-2 text-zinc-400 py-6 animate-in zoom-in-95 duration-500">
                  <FileText size={40} className="text-[#ff5e3a]" />
                  <span className="text-xs font-semibold text-zinc-200">Đã đóng gói tài liệu Word thành công!</span>
                  <p className="text-[10px] text-zinc-500">Nhấp vào nút bên trái để tải tệp Word về máy.</p>
                </div>
              ) : resultText ? (
                /* Textarea for output text (DOCX to MD / PDF to Text) */
                <textarea
                  readOnly
                  value={resultText}
                  className="w-full h-full bg-zinc-950/80 text-zinc-300 text-[10px] font-mono p-4 focus:outline-none resize-none border-none outline-none animate-in fade-in duration-500"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-650 py-6">
                  <FileText size={32} weight="thin" />
                  <span className="text-[10px]">Đang chờ tệp tin đầu ra</span>
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
