import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Groq API Key (GROQ_API_KEY) chưa được cấu hình trên server. Vui lòng thêm biến môi trường này vào Vercel." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const mediaFile = formData.get("file") as File;
    if (!mediaFile) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tệp tin đa phương tiện." },
        { status: 400 }
      );
    }

    // Limit to 25MB for Groq API upload size
    if (mediaFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Tệp tin vượt quá giới hạn 25MB của Whisper API." },
        { status: 400 }
      );
    }

    // Prepare multipart form data for Groq transcriptions API
    const groqFormData = new FormData();
    groqFormData.append("file", mediaFile);
    groqFormData.append("model", "whisper-large-v3");
    groqFormData.append("response_format", "srt"); // Request SRT directly from Whisper!

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error response:", errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const reason = errorJson.error?.message || "Lỗi giao tiếp với dịch vụ Groq.";
        return NextResponse.json({ success: false, error: reason }, { status: response.status });
      } catch {
        return NextResponse.json(
          { success: false, error: "Lỗi kết nối từ dịch vụ Whisper API. Vui lòng thử lại." },
          { status: response.status }
        );
      }
    }

    const srtText = await response.text();
    return new NextResponse(srtText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("Transcribe proxy error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi xử lý hệ thống phụ đề." },
      { status: 500 }
    );
  }
}
