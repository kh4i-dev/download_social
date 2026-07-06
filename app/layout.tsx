import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Cobalt Stream - Video & Audio Downloader",
  description: "Download YouTube and Facebook videos or audio with zero ads, high speeds, and maximum quality. 100% serverless, Vercel-optimized Cobalt client.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
        <ParticleBackground />
        {children}
      </body>
    </html>
  );
}
