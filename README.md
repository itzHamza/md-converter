<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Puppeteer-PDF-green?style=for-the-badge&logo=googlechrome" alt="Puppeteer" />
</p>

# 🩺 Med Converter

> **Convert your medical Markdown notes into beautifully styled HTML & PDF documents.**

Med Converter is a web app built for medical students who write their notes in Markdown. Upload a `.md` file, pick a theme, and get a polished HTML page and a print-ready A4 PDF — with full support for **Arabic**, **French**, and **mixed bilingual content**.

---

## ✨ Features

- **Drag & Drop Upload** — Drop a `.md` file or click to browse
- **4 Medical Themes** — Clinical Blue, Obsidian Scholar, Forest Anatomy, Warm Radiology
- **Arabic + French Support** — Automatic RTL detection with Tajawal font for Arabic and Plus Jakarta Sans for Latin
- **Mixed Bidi Content** — Handles Arabic/French mixed documents with `unicode-bidi: plaintext`
- **HTML Preview** — Live rendered preview in an iframe
- **PDF Preview** — Embedded PDF viewer with download fallback
- **Download Both** — One-click download for `.html` and `.pdf`
- **KaTeX Math** — LaTeX math rendering in both HTML and PDF
- **Print-Optimized PDF** — A4 format, page break prevention, proper margins
- **Med-Friendly Styling** — Clean typography, table borders for drug tables, code blocks for clinical data

---

## 🏗️ Architecture

```
Client (Next.js App Router)
  └── POST /api/md-converter  (multipart: .md file + theme)
        └── Node.js Route Handler
              ├── marked           →  Markdown → HTML
              ├── HTML Template    →  Styled full document (Arabic/RTL aware)
              ├── Puppeteer        →  HTML → PDF (A4, print background)
              └── Response JSON    →  { html, pdf (base64), filename }
```

### Frontend (`/`)

| Component | Description |
|-----------|-------------|
| Upload Zone | Drag & drop `.md` file with visual feedback |
| Theme Selector | 4 med-themed cards with live color previews |
| Convert Button | Sends file + theme to API, shows loading spinner |
| Result Viewer | Two-tab layout: HTML iframe + PDF embed |
| Download Buttons | Download `.html` and `.pdf` files |

### Backend (`/api/md-converter`)

```
POST /api/md-converter
  Content-Type: multipart/form-data
  Body: file (.md), theme (JSON string)

Response:
  {
    html: "<html>...</html>",      // full styled HTML document
    pdf: "base64string...",        // base64-encoded PDF
    filename: "notes"              // original filename without .md
  }
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **Google Chrome** or **Chromium** installed (for Puppeteer PDF generation)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/med-converter.git
cd med-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PUPPETEER_EXECUTABLE_PATH` | Auto-detected | Path to Chrome/Chromium executable |

On Windows, it auto-detects `C:\Program Files\Google\Chrome\Application\chrome.exe`.
On Linux, it falls back to `/usr/bin/chromium`.

---

## 🌍 Language Support

Med Converter automatically detects the language mix in your Markdown:

| Scenario | Direction | Primary Font | Fallback Font |
|----------|-----------|-------------|---------------|
| Mostly Arabic (>30%) | RTL | Tajawal | Plus Jakarta Sans |
| Mostly French/Latin | LTR | Plus Jakarta Sans | Tajawal |
| Mixed content | Auto per element | Both loaded | `unicode-bidi: plaintext` |

Code blocks are always rendered LTR regardless of document direction.

---

## 🎨 Themes

| Theme | Best For |
|-------|----------|
| **Clinical Blue** | Clinical notes, drug tables, general use |
| **Obsidian Scholar** | Dark theme for late-night study sessions |
| **Forest Anatomy** | Physiology, anatomy & pathology notes |
| **Warm Radiology** | Case presentations & radiology reports |

---

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org/) | App Router, API routes, SSR |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Radix UI](https://www.radix-ui.com/) | Tabs component |
| [marked](https://marked.js.org/) | Markdown → HTML parsing |
| [Puppeteer Core](https://pptr.dev/) | HTML → PDF generation |
| [KaTeX](https://katex.org/) | LaTeX math rendering |
| [Tajawal](https://fonts.google.com/specimen/Tajawal) | Arabic typography |
| [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | Latin/French typography |

---

## 🚢 Deployment

### Railway / Nixpacks

The project includes a `nixpacks.toml` for one-click deployment on Railway:

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "chromium"]

[variables]
PUPPETEER_SKIP_DOWNLOAD = "true"
PUPPETEER_EXECUTABLE_PATH = "/root/.nix-profile/bin/chromium"
```

### Docker

Make sure your Docker image includes Chromium and sets `PUPPETEER_EXECUTABLE_PATH`.

---

## 📁 Project Structure

```
med-converter/
├── app/
│   ├── api/
│   │   └── md-converter/
│   │       ├── route.ts          # API: MD → HTML → PDF
│   │       └── themes.json       # Theme definitions
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout + fonts + metadata
│   └── page.tsx                  # Main converter UI
├── components/
│   └── ui/
│       ├── badge.tsx             # Badge component
│       └── tabs.tsx              # Tabs component (Radix)
├── lib/
│   └── utils.ts                  # cn() utility
├── nixpacks.toml                 # Railway deployment config
├── package.json
└── tsconfig.json
```

---

## 📄 License

MIT © Med Converter
