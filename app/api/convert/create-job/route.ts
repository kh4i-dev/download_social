import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey || apiKey === "your_cloudconvert_api_key_here") {
      return NextResponse.json(
        { success: false, error: "CloudConvert API Key (CLOUDCONVERT_API_KEY) chưa được cấu hình trên server. Vui lòng thêm biến môi trường này vào Vercel." },
        { status: 500 }
      );
    }

    const { targetFormat } = await req.json();
    if (!targetFormat) {
      return NextResponse.json({ success: false, error: "Thiếu định dạng chuyển đổi mục tiêu." }, { status: 400 });
    }

    // Call CloudConvert API to initialize job
    const response = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "import-file": {
            operation: "import/upload",
          },
          "convert-file": {
            operation: "convert",
            input: "import-file",
            output_format: targetFormat,
          },
          "export-file": {
            operation: "export/url",
            input: "convert-file",
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CloudConvert create job error:", errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const reason = errorJson.message || "Lỗi tạo phiên chuyển đổi tại CloudConvert.";
        return NextResponse.json({ success: false, error: reason }, { status: response.status });
      } catch {
        return NextResponse.json({ success: false, error: "Không thể khởi tạo tiến trình chuyển đổi." }, { status: response.status });
      }
    }

    const jobData = await response.json();
    const tasks = jobData.data.tasks;

    const importTask = tasks.find((t: any) => t.name === "import-file");
    const exportTask = tasks.find((t: any) => t.name === "export-file");

    if (!importTask || !exportTask) {
      throw new Error("Không thể lập bản đồ tác vụ import/export.");
    }

    // Return signed upload credentials and target export task ID
    return NextResponse.json({
      success: true,
      jobId: jobData.data.id,
      uploadForm: {
        url: importTask.result?.form?.url || importTask.result?.form?.action,
        parameters: importTask.result?.form?.parameters,
      },
      exportTaskId: exportTask.id,
    });
  } catch (err: any) {
    console.error("CloudConvert create job handler error:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi hệ thống khởi tạo chuyển đổi." }, { status: 500 });
  }
}
