import { NextRequest, NextResponse } from "next/server";

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, "0");
  return `${h}:${m}:${s},${ms}`;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "Vui lòng cung cấp liên kết video YouTube." }, { status: 400 });
    }

    // Extract YouTube Video ID
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      return NextResponse.json({ success: false, error: "Đường dẫn không hợp lệ hoặc không tìm thấy ID video YouTube." }, { status: 400 });
    }

    // Fetch video page HTML
    const ytPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!ytPageResponse.ok) {
      return NextResponse.json({ success: false, error: "Không thể lấy dữ liệu từ YouTube." }, { status: 500 });
    }

    const html = await ytPageResponse.text();
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    
    if (!playerResponseMatch) {
      return NextResponse.json({ success: false, error: "Không tìm thấy dữ liệu phụ đề từ video này. Video có thể đã tắt phụ đề." }, { status: 404 });
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {
      return NextResponse.json({ success: false, error: "Video này không chứa phụ đề sẵn có." }, { status: 404 });
    }

    // Find Vietnamese track first, otherwise fallback to English or the first available track
    let selectedTrack = captionTracks.find((track: any) => track.languageCode === "vi") 
      || captionTracks.find((track: any) => track.languageCode === "en") 
      || captionTracks[0];

    const subtitleResponse = await fetch(selectedTrack.baseUrl);
    if (!subtitleResponse.ok) {
      return NextResponse.json({ success: false, error: "Không thể tải nội dung phụ đề từ máy chủ YouTube." }, { status: 500 });
    }

    const xml = await subtitleResponse.text();
    
    // Parse YouTube caption XML format to SRT format
    const srtRegex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
    let srtText = "";
    let index = 1;
    let srtMatch;

    while ((srtMatch = srtRegex.exec(xml)) !== null) {
      const start = parseFloat(srtMatch[1]);
      const dur = parseFloat(srtMatch[2]);
      const text = srtMatch[3]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');
      
      const end = start + dur;
      
      srtText += `${index}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${text}\n\n`;
      index++;
    }

    if (!srtText) {
      return NextResponse.json({ success: false, error: "Không có phụ đề chữ hợp lệ trong tệp tin YouTube." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      srt: srtText,
      language: selectedTrack.name.simpleText || selectedTrack.languageCode,
    });
  } catch (err: any) {
    console.error("Yt-subtitle error:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi trích xuất phụ đề YouTube." }, { status: 500 });
  }
}
