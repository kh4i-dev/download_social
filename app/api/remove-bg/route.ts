import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Remove.bg API Key chưa được cấu hình trên server." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tệp ảnh gửi lên." },
        { status: 400 }
      );
    }

    // Prepare request body for official remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageFile);
    removeBgFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove.bg API error response:", errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const firstError = errorJson.errors?.[0]?.title || "Lỗi kết nối từ dịch vụ Remove.bg.";
        return NextResponse.json({ success: false, error: firstError }, { status: response.status });
      } catch {
        return NextResponse.json(
          { success: false, error: "Lỗi kết nối từ dịch vụ Remove.bg. Vui lòng thử lại." },
          { status: response.status }
        );
      }
    }

    const imageBlob = await response.blob();
    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (err: any) {
    console.error("Remove-bg proxy error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi xử lý hệ thống nội bộ." },
      { status: 500 }
    );
  }
}
