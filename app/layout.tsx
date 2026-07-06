import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from "./components/particle-background";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kh4idev Stream Client - Tải Video Cực Nhanh",
  description: "Giải mã và lưu trữ video yêu thích từ YouTube, Facebook, TikTok và Instagram với chất lượng cao nhất.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${outfit.variable} ${manrope.variable} dark antialiased`}
    >
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-400">
        <ParticleBackground />
        {children}
      </body>
    </html>
  );
}
