# Project Coding Standards

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 1. General Principles
- **TypeScript strictly typed**: Avoid using `any` at all costs. Declare proper interfaces.
- **Vercel Free Tier limits**: Keep functions optimized, fast, and below 4.5MB payload limit. Never stream/download video bytes inside the API function.
- **Zero AI-Slop Design**: 
  - Prefer dark mode by default (`zinc-950`).
  - Font: Geist Sans (default).
  - Accent: Emerald (`emerald-500` / `emerald-400` in dark mode).
  - Zero em-dashes (`—`) in user-visible copy. Use standard hyphens.
  - No generic fake statistics or templates.

## 2. Next.js App Router Conventions
- **Component Placement**: Put reusable components in `app/components/`.
- **Client vs Server Components**:
  - Keep client components at the leaves (`"use client"`).
  - Do not use client directives unless interactivity (hooks, state, event handlers) is required.
- **Route Handlers**: Use standard HTTP response objects (`NextResponse`). Return structured envelopes: `{ success: boolean, data?: T, error?: string }`.

## 3. Tailwind CSS
- Use utility classes directly.
- Standardize spacing via grid gaps and consistent paddings.
- Use native variables from `app/globals.css` if custom variables are needed.
