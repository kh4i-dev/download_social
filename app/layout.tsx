import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from "./components/particle-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kh4idev Stream Client - Video & Audio Downloader",
  description: "Tải video từ YouTube, Facebook, TikTok và Instagram cực nhanh với chất lượng gốc. 100% không quảng cáo, tối ưu hóa băng thông.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} dark antialiased`}
    >
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-400">
        <ParticleBackground />
        {children}
      </body>
    </html>
  );
}
