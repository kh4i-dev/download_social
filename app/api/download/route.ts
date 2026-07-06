import { NextResponse } from "next/server";
import { DownloadRequest, CobaltResponse, ApiResponse } from "../../types";

const FALLBACK_INSTANCES = [
  "https://dog.kittycat.boo",
  "https://api.cobalt.liubquanti.click",
];

async function callCobaltInstance(apiUrl: string, payload: Record<string, any>): Promise<{ url: string; filename: string }> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    // 8-second timeout for each instance to prevent Vercel execution timeout (10s Hobby limit)
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error?.code) {
        errorMessage = errorJson.error.code;
      } else if (errorJson.text) {
        errorMessage = errorJson.text;
      }
    } catch {
      // Not JSON
    }
    throw new Error(errorMessage);
  }

  const data: CobaltResponse = await response.json();

  if (data.status === "error") {
    throw new Error(data.text || "API returned error status");
  }

  if (data.status === "redirect" || data.status === "tunnel") {
    return {
      url: data.url,
      filename: data.filename || "download",
    };
  }

  if (data.status === "picker") {
    if (data.picker && data.picker.length > 0) {
      return {
        url: data.picker[0].url,
        filename: "download",
      };
    }
  }

  throw new Error("Unsupported status in API response");
}

export async function POST(request: Request) {
  try {
    const body: DownloadRequest = await request.json();
    const { url, quality } = body;

    if (!url) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Please enter a valid URL." },
        { status: 400 }
      );
    }

    // Build Cobalt payload
    const cobaltPayload: Record<string, any> = {
      url: url,
      filenameStyle: "basic",
    };

    if (quality === "mp3") {
      cobaltPayload.downloadMode = "audio";
      cobaltPayload.audioFormat = "mp3";
      cobaltPayload.audioBitrate = "320";
    } else {
      cobaltPayload.downloadMode = "auto";
      cobaltPayload.videoQuality = quality === "max" ? "max" : quality;
    }

    const primaryApiUrl = process.env.NEXT_PUBLIC_COBALT_API_URL || "https://api.cobalt.tools";
    const candidateUrls = [primaryApiUrl, ...FALLBACK_INSTANCES];

    let lastError: string = "";

    // Try each instance in sequence
    for (const apiUrl of candidateUrls) {
      try {
        console.log(`[Proxy] Attempting download via: ${apiUrl}`);
        const result = await callCobaltInstance(apiUrl, cobaltPayload);
        console.log(`[Proxy] Success! Media resolved using instance: ${apiUrl}`);
        return NextResponse.json<ApiResponse>({
          success: true,
          data: result,
        });
      } catch (err: any) {
        console.warn(`[Proxy] Failed call to ${apiUrl}: ${err.message}`);
        lastError = err.message || "Unknown error";
        
        // If it's a validation error with the URL itself, don't retry other instances
        if (lastError.includes("url") || lastError.includes("invalid") || lastError.includes("unsupported")) {
          break;
        }
      }
    }

    // Format human-friendly error messages
    let friendlyError = "All Cobalt API servers are currently busy or rate-limited. Please try again in a few moments.";
    if (lastError.includes("jwt")) {
      friendlyError = "The primary Cobalt instance has enabled Turnstile bot protection. Falling back to alternative servers failed. Please try again later or configure a self-hosted instance.";
    } else if (lastError) {
      friendlyError = `API Error: ${lastError}. Please verify the URL or try again.`;
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: friendlyError },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
