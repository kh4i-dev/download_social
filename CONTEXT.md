# Domain Context & Architecture

This document outlines the business context, technical architecture, and constraints for the Video Downloader project.

## 1. Business Domain
The app provides a fast, simple utility for downloading videos/audio from YouTube and Facebook. The primary audience expects a quick, high-performance interface with zero ads, tracking, or complicated processes.

## 2. Vercel Hobby/Free Tier Constraints
Vercel's Free tier places strict limits on serverless executions:
- **Maximum Execution Timeout**: 10 seconds.
- **Maximum Payload Size**: 4.5 megabytes.

**Problem**: Traditional downloaders download the video file (often 50MB - 1GB+) onto the server, transcode it, and send it back. This immediately violates both the payload size and the execution timeout limits on Vercel.

**Solution**: The proxy-to-Cobalt architecture.
- The Vercel serverless function (`/api/download`) acts as a *thin control-plane proxy*. It never touches the actual video bytes.
- It translates frontend parameters (audio-only, resolution, URL) into Cobalt API parameters and executes a quick POST request to Cobalt (`api.cobalt.tools`).
- Cobalt returns a direct download link (either a direct redirect or a proxy tunnel stream managed by Cobalt).
- The Next.js API returns this link back to the browser.
- The browser triggers a direct native download from the Cobalt CDN/stream. Vercel server resources are virtually untouched.

## 3. Cobalt API Contract
The Cobalt endpoint used is `POST https://api.cobalt.tools/` (or configured custom URL).

### Headers
- `Accept: application/json`
- `Content-Type: application/json`

### Body (JSON)
- `url` (string, required): Source media URL.
- `downloadMode` (string): `"auto"` or `"audio"`.
- `videoQuality` (string): `"max"`, `"1080"`, `"720"`, etc.
- `audioFormat` (string): `"mp3"`.
- `audioBitrate` (string): `"320"`.

### Response Schema (Cobalt)
- **Status `redirect`**: Direct stream link.
  ```json
  { "status": "redirect", "url": "https://..." }
  ```
- **Status `tunnel`**: Cobalt-proxied stream link.
  ```json
  { "status": "tunnel", "url": "https://..." }
  ```
- **Status `error`**:
  ```json
  { "status": "error", "text": "error.message" }
  ```
- **Status `picker`**: Multiple options found.
  ```json
  { "status": "picker", "picker": [{ "url": "https://..." }] }
  ```
