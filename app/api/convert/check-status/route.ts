import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey || apiKey === "your_cloudconvert_api_key_here") {
      return NextResponse.json(
        { success: false, error: "CloudConvert API Key chưa được cấu hình." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ success: false, error: "Thiếu mã tác vụ (taskId) cần kiểm tra." }, { status: 400 });
    }

    // Call CloudConvert to get task details
    const response = await fetch(`https://api.cloudconvert.com/v2/tasks/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CloudConvert query task error:", errorText);
      return NextResponse.json({ success: false, error: "Không thể lấy trạng thái tác vụ từ CloudConvert." }, { status: response.status });
    }

    const taskData = await response.json();
    const task = taskData.data;

    // Check status: waiting, processing, finished, failed
    if (task.status === "finished") {
      const file = task.result?.files?.[0];
      return NextResponse.json({
        success: true,
        status: "finished",
        url: file?.url,
        filename: file?.filename,
      });
    }

    if (task.status === "error" || task.status === "failed") {
      return NextResponse.json({
        success: true,
        status: "error",
        error: task.message || "Tác vụ chuyển đổi của CloudConvert thất bại.",
      });
    }

    return NextResponse.json({
      success: true,
      status: task.status, // processing, waiting, etc.
    });
  } catch (err: any) {
    console.error("CloudConvert check status error:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi hệ thống kiểm tra trạng thái." }, { status: 500 });
  }
}
