<div align="center">

# PrivyTools

**Privacy-first PDF, image & document tools — 100% in your browser.**

_No uploads. No accounts. No tracking. Your files never leave your device._

[![React](https://img.shields.io/badge/React-19-0f172a?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-0f172a?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-0f172a?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-0f172a?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-0f172a?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

</div>

---

## What is PrivyTools?

PrivyTools is a **privacy-first file toolkit** with **73 tools** for working with PDFs,
images, and documents — designed around one rule:

> **Your files are processed locally, on your own device. Nothing is ever uploaded.**

Merge PDFs, compress images, convert formats, strip EXIF/GPS metadata, clean hidden
data, and more — all powered by WebCrypto, Canvas, and `pdf-lib`/`jszip`, right in the
browser. It works as an installable, offline-capable PWA.

## Why PrivyTools?

| | Typical online tools | **PrivyTools** |
|---|---|---|
| Files uploaded to a server | Yes | **Never** |
| Account required | Often | **No** |
| Works offline | No | **Yes (PWA)** |
| Installable as an app | No | **Yes** |
| Free | Rarely | **Fully local** |

## Features

### 📄 PDF Tools <sup>26 tools</sup>

- **Merge & split** — combine PDFs in any page order, or split into single pages / selected ranges (ZIP output)
- **Compress** — Lossless, Visually-Lossless, Balanced, or Compact presets; object-stream compression with zero visual loss
- **Edit pages** — rotate, reorder, delete, extract, and duplicate
- **Annotate** — watermarks, page numbers ("Page X of Y"), headers & footers
- **Convert** — JPG / PNG / WebP → PDF, Text / Markdown → PDF
- **Manage metadata** — edit or wipe Title / Author / Subject / Keywords
- **Inspect** — page counts, dimensions, metadata; export as JSON
- **Encrypt** — AES-256 password protection _(coming soon)_

### 🖼️ Image Tools <sup>19 tools</sup>

- **Compress** — JPG / PNG / WebP with quality presets, plus a lossless (pixel-perfect) mode
- **Resize & crop** — custom dimensions, aspect-ratio lock, and 1080p/720p/50% presets
- **Rotate & flip** — 90°/180°/270° and horizontal/vertical mirroring
- **Convert formats** — JPG ↔ PNG ↔ WebP ↔ BMP
- **Adjust** — brightness, contrast, grayscale
- **Batch** — compress or convert many images at once into a ZIP

### 🛡️ Privacy Tools <sup>13 tools</sup>

- **Privacy Scanner** — scans for GPS, camera model, software, timestamps, and PDF author; rates the file **0–100**
- **EXIF viewer & remover** — see and strip embedded metadata
- **GPS remover** — delete geo-tags from photos
- **Metadata cleaner** — batch-wipe metadata across images
- **File hash generator** — SHA-256 / SHA-512 / SHA-1 / MD5
- **Filename privacy cleaner** — anonymize filenames
- **File type detector** — magic-byte inspection to catch spoofed extensions

### 📝 Document Tools <sup>7 tools</sup>

- Text → PDF, Markdown → PDF, CSV / JSON / HTML → PDF
- OCR (image → text) and PDF → text extraction

### 🧰 Utility Tools <sup>8 tools</sup>

- QR generator
- Base64 encode / decode
- Duplicate file finder
- Batch rename, file-size analyzer, MIME detector

### ✨ App-level features

- **Privacy Center** — scan a file for a privacy score, then "Clean Everything" (metadata, EXIF/GPS, filenames) and download
- **Batch Queue** — live progress bars with queued / processing / done / error states
- **Local History** — last 50 jobs with file counts and bytes saved
- **Quick search** — press `/` anywhere for a command-palette tool lookup
- **Smart suggestions** — drop a file and PrivyTools recommends the right tool for its type
- **Dark mode & favorites** — persisted locally
- **Android install** — WebAPK prompt or downloadable Capacitor bundle

## Getting Started

Requires [Bun](https://bun.sh) (or npm).

```bash
bun install        # install dependencies
bun run dev        # start dev server → http://localhost:3000
bun run build      # production build to dist/
bun run preview    # preview the production build
bun run lint       # type-check (tsc --noEmit)
```

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 · TypeScript · Tailwind CSS 4 |
| Build | Vite 6 · @vitejs/plugin-react · @tailwindcss/vite |
| Processing | pdf-lib · jszip · Canvas API · WebCrypto |
| PWA | vite-plugin-pwa (auto-update + offline caching) |
| Icons | lucide-react |
| Package manager | Bun |

## Project Structure

```
.
├── src/
│   ├── main.tsx · App.tsx    # Entry point & root shell (state-driven navigation)
│   ├── data/tools.ts         # Registry of all 73 tools + categories
│   ├── engines/              # Pure processing logic (no UI)
│   │   ├── pdfEngine.ts      # pdf-lib operations
│   │   ├── imageEngine.ts    # Canvas-based image ops
│   │   ├── privacyEngine.ts  # hashing, privacy scan, filename sanitize
│   │   └── utilityEngine.ts  # base64, duplicates, QR, magic-byte
│   ├── hooks/                # usePWAInstall, useOnlineStatus
│   └── components/           # ToolExecutor, drop zones, modals, nav
├── public/                   # PWA icons (auto-generated)
├── scripts/generate-icons.js # zero-dependency PWA icon generator
├── vite.config.ts            # Vite + Tailwind + PWA config
└── metadata.json             # AI Studio applet manifest
```

## Environment Variables

Rename `.env.example` to `.env` and fill in values. In AI Studio, configure these
via the **Secrets panel** — the key stays server-side and is never sent to the client.

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini AI API key (injected at runtime by AI Studio) |
| `APP_URL` | Public URL of the hosted app (Cloud Run service URL) |

## Roadmap

- [ ] OCR (image → text) and real QR encoding / decoding
- [ ] True engine logic for page tools (reorder, delete, extract, duplicate)
- [ ] Full server-side Gemini proxy (Express + `@google/genai`)

## License

Private project — all processing is local; no data ever leaves the browser.