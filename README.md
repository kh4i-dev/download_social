# kh4idev Stream Client

A highly interactive, high-performance, dark-tech minimalist YouTube and Facebook media downloader. Designed to be deployed 100% serverless on the Vercel Free tier with zero operational overhead, leveraging the public or self-hosted **Cobalt API**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkh4i-dev%2Fdownload_social)

---

## 🚀 Key Features

*   **Vercel Free Tier Optimized**: Implements a serverless control-plane proxy pattern. Media bytes are resolved directly by the user's browser, completely bypassing the 4.5MB Vercel serverless payload limit and the 10-second Hobby execution timeout.
*   **Bento Grid Cockpit UI**: Evolved from standard layouts into an integrated dark-tech Bento Grid cockpit interface featuring high-contrast display typography, active operation monitors, and fine emerald borders.
*   **Interactive Particle Canvas**: Features a custom-written, lightweight HTML5 Canvas particle network (Constellation effect) that dynamically connects nodes with fine emerald lines matching mouse coordinates.
*   **Self-Healing Fallback Routing**: Automatically detects Cloudflare Turnstile blocks on the primary Cobalt endpoint and seamlessly reroutes requests across a pool of secondary public community nodes (`dog.kittycat.boo`, `api.cobalt.liubquanti.click`) within an 8-second abort threshold.
*   **Premium Quality Support**: Offers explicit dropdown selections for advanced video formats (720p, 1080p, 2K QHD, 4K UHD, 8K UHD, or original Maximum Quality) and high-quality MP3 audio extracts (320kbps).
*   **No Emojis & Pure Aesthetics**: Built strictly following professional, clean visual-design guidelines (Geist typography, Zinc-950 backdrop, Emerald-500 pulsing details, and button hover-shine sweep animations).

---

## 🛠️ Architecture Control Flow

The app splits the data plane from the control plane to achieve high performance on serverless hosts:

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

*   **`NEXT_PUBLIC_COBALT_API_URL`**: The endpoint to the Cobalt processing service. Defaults to `https://api.cobalt.tools`. If this instance is down or rate-limited, you can spin up your own instance and replace this URL.

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

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

---

## 📦 Vercel 1-Click Deployment

Click the Deploy button below to clone this repository and deploy it to your Vercel account instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkh4i-dev%2Fdownload_social)

Make sure to add the following environment variable during configuration:
*   `NEXT_PUBLIC_COBALT_API_URL` = `https://api.cobalt.tools` (or your custom self-hosted Cobalt URL).
