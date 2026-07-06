# Video Downloader Web App

A clean, modern YouTube and Facebook video/audio downloader designed to be deployed 100% on the Vercel Free tier. Powered by the public or self-hosted instances of the **Cobalt API**.

## 🚀 Key Features

- **Vercel Free Tier Compatible**: Leverages a serverless control-plane proxy pattern. Video stream data is resolved directly inside the client browser, completely bypassing the 4.5MB serverless payload limit and function timeouts.
- **Dark-Tech Aesthetic**: Designed with clean layout discipline, no AI-slop elements, and using the emerald/zinc color system.
- **Multiple Quality Formats**: Supports MP3 Audio (320kbps), 720p, 1080p, and maximum available qualities.
- **Flexible Deployments**: Supports switching between public instances or your own self-hosted Cobalt nodes via a single environment variable.

---

## 🛠️ Architecture Overview

The app is built on Next.js App Router and is fully optimized for Vercel Hobby limits:

```
┌─────────────┐     POST /api/download     ┌──────────────────┐     POST /      ┌─────────────┐
│   Browser    │ ─────────────────────────► │  Next.js API     │ ──────────────► │  Cobalt API  │
│  (React UI)  │     { url, quality }       │  Route (Vercel)  │  { url, ...}   │  (external)  │
│              │ ◄───────────────────────── │                  │ ◄────────────── │              │
│  triggers    │   { success, url }         │  thin proxy      │  { status,     │  processes   │
│  download    │                            │  ~0 bytes of     │    url }       │  the video   │
│              │                            │  video data      │                │              │
└─────────────┘                             └──────────────────┘                └─────────────┘
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` to configure your environment variables:

```bash
cp .env.example .env.local
```

- **`NEXT_PUBLIC_COBALT_API_URL`**: The endpoint to the Cobalt processing service. Defaults to `https://api.cobalt.tools`. If this instance is down or rate-limited, you can spin up your own instance and replace this URL.

---

## 💻 Local Development

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📦 Vercel 1-Click Deployment

You can deploy this project directly to Vercel. 

Ensure you set the environment variable:
- `NEXT_PUBLIC_COBALT_API_URL` = `https://api.cobalt.tools` (or your self-hosted Cobalt instance endpoint).
