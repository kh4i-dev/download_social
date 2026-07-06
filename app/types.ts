export interface DownloadRequest {
  url: string;
  quality: "mp3" | "720" | "1080" | "1440" | "2160" | "4320" | "max";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CobaltSuccessResponse {
  status: "redirect" | "tunnel";
  url: string;
  filename?: string;
}

export interface CobaltPickerItem {
  url: string;
  type?: string;
  quality?: string;
}

export interface CobaltPickerResponse {
  status: "picker";
  picker: CobaltPickerItem[];
  audio?: string;
}

export interface CobaltErrorResponse {
  status: "error";
  text: string;
}

export type CobaltResponse = CobaltSuccessResponse | CobaltPickerResponse | CobaltErrorResponse;
