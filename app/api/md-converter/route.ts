// app/api/md-converter/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { marked } from "marked";

// ─── Default design tokens ────────────────────────────────────────────────────
const DEFAULT_THEME = {
  primary: "#2563eb",
  secondary: "#0ea5e9",
  accent: "#6366f1",
  background: "#f8fafc",
  cardBg: "#ffffff",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  headingColor: "#1e3a5f",
  h2Color: "#1d4ed8",
  h3Color: "#0369a1",
  h4Color: "#4f46e5",
  codeText: "#1e40af",
  codeBg: "#eff6ff",
  blockquoteBorder: "#2563eb",
  blockquoteBg: "#eff6ff",
  tableHeaderBg: "#1e3a5f",
  tableHeaderText: "#ffffff",
  tableRowAlt: "#f1f5f9",
  footerText: "#94a3b8",
  brandName: "MED CONVERTER",
  brandTagline: "Medical Markdown → PDF",
};

type Theme = typeof DEFAULT_THEME;

// ─── Arabic detection ─────────────────────────────────────────────────────────
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function hasArabic(text: string): boolean {
  return ARABIC_REGEX.test(text);
}

/** Counts Arabic characters vs total alphabetic characters to determine mix ratio */
function getArabicRatio(text: string): number {
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  const total = arabicChars + latinChars;
  if (total === 0) return 0;
  return arabicChars / total;
}

// ─── HTML template ────────────────────────────────────────────────────────────
function buildHtml(mdHtml: string, theme: Theme = DEFAULT_THEME, rawMarkdown: string): string {
  const containsArabic = hasArabic(rawMarkdown);
  const arabicRatio = getArabicRatio(rawMarkdown);
  // If more than 30% Arabic, set primary direction to RTL
  const isRtlPrimary = arabicRatio > 0.3;
  const htmlDir = isRtlPrimary ? "rtl" : "ltr";
  const htmlLang = isRtlPrimary ? "ar" : "fr";

  return `<!DOCTYPE html>
<html lang="${htmlLang}" dir="${htmlDir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {
      delimiters: [
        {left:'$$',right:'$$',display:true},
        {left:'$',right:'$',display:false},
        {left:'\\\\(',right:'\\\\)',display:false},
        {left:'\\\\[',right:'\\\\]',display:true}
      ],
      throwOnError: false
    }); document.body.setAttribute('data-math-ready','true');"><\/script>

  <style>
    :root {
      --primary:          ${theme.primary};
      --secondary:        ${theme.secondary};
      --accent:           ${theme.accent};
      --background:       ${theme.background};
      --card-bg:          ${theme.cardBg};
      --text:             ${theme.text};
      --text-muted:       ${theme.textMuted};
      --border:           ${theme.border};
      --heading-color:    ${theme.headingColor};
      --h2-color:         ${theme.h2Color};
      --h3-color:         ${theme.h3Color};
      --h4-color:         ${theme.h4Color};
      --code-text:        ${theme.codeText};
      --code-bg:          ${theme.codeBg};
      --bq-border:        ${theme.blockquoteBorder};
      --bq-bg:            ${theme.blockquoteBg};
      --table-header-bg:  ${theme.tableHeaderBg};
      --table-header-txt: ${theme.tableHeaderText};
      --table-row-alt:    ${theme.tableRowAlt};

      --font-arabic: 'Tajawal', sans-serif;
      --font-latin: 'Plus Jakarta Sans', sans-serif;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: ${containsArabic ? "var(--font-arabic), var(--font-latin)" : "var(--font-latin), var(--font-arabic)"};
      background-color: var(--background);
      color: var(--text);
      margin: 0;
      padding: 40px;
      line-height: 1.85;
      font-size: 14px;
      unicode-bidi: plaintext;
    }

    .page {
      max-width: 860px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    }

    .header {
      background: var(--heading-color);
      padding: 32px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand-name {
      font-family: var(--font-latin);
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.08em;
    }

    .brand-tagline {
      font-size: 12px;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.04em;
      margin-top: 4px;
    }

    .header-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 500;
      color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 100px;
      padding: 4px 14px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .content {
      padding: 48px;
      unicode-bidi: plaintext;
    }

    /* ── Bidirectional text support ── */
    p, li, td, th, blockquote, h1, h2, h3, h4, h5, h6, dd, dt {
      unicode-bidi: plaintext;
      text-align: start;
    }

    h1 {
      font-size: 26px;
      font-weight: 700;
      color: var(--heading-color);
      margin: 0 0 24px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--primary);
      line-height: 1.4;
    }

    h2 {
      font-size: 19px;
      font-weight: 700;
      color: var(--h2-color);
      margin: 32px 0 12px 0;
      padding: 8px 16px;
      border-inline-start: 4px solid var(--primary);
      background: var(--code-bg);
      border-radius: 0 8px 8px 0;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--h3-color);
      margin: 24px 0 8px 0;
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--h4-color);
      margin: 16px 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    p { margin: 0 0 14px 0; color: var(--text); }

    ul, ol { margin: 0 0 14px 0; padding-inline-start: 28px; }
    li { margin-bottom: 6px; color: var(--text); }
    li::marker { color: var(--primary); font-weight: 600; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    thead tr { background-color: var(--table-header-bg); color: var(--table-header-txt); }
    thead th {
      padding: 12px 16px;
      text-align: start;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: none;
    }

    tbody tr:nth-child(even) { background-color: var(--table-row-alt); }
    tbody td {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      text-align: start;
    }

    blockquote {
      border-inline-start: 4px solid var(--bq-border);
      background: var(--bq-bg);
      margin: 16px 0;
      padding: 16px 24px;
      border-radius: 0 10px 10px 0;
      font-style: italic;
      color: var(--text-muted);
    }
    blockquote p { margin: 0; color: inherit; }

    code {
      font-family: 'JetBrains Mono', monospace;
      background: var(--code-bg);
      color: var(--code-text);
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 12.5px;
      border: 1px solid var(--border);
      direction: ltr;
      unicode-bidi: embed;
    }

    pre {
      background: #1e293b;
      border-radius: 10px;
      padding: 20px 24px;
      overflow-x: auto;
      margin: 16px 0;
      direction: ltr;
    }
    pre code { background: none; border: none; color: #e2e8f0; font-size: 13px; padding: 0; }

    hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }

    strong { font-weight: 700; color: var(--heading-color); }
    em { color: var(--text-muted); }

    a {
      color: var(--primary);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .footer {
      padding: 20px 48px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: ${theme.footerText};
      background: var(--background);
    }
    .footer-brand { font-weight: 600; color: var(--primary); }

    /* ── Prevent page-break inside elements ── */
    h1, h2, h3, h4, h5, h6 {
      break-inside: avoid;
      break-after: avoid;
    }
    table, thead, tr {
      break-inside: avoid;
    }
    blockquote {
      break-inside: avoid;
    }
    pre {
      break-inside: avoid;
    }
    ul, ol {
      break-inside: avoid;
    }
    li {
      break-inside: avoid;
    }
    img {
      break-inside: avoid;
    }
    .content > * {
      break-inside: avoid;
    }

    @media print {
      body { padding: 0; background: white !important; }
      .page { border: none !important; box-shadow: none !important; border-radius: 0 !important; }
      pre { white-space: pre-wrap; }
    }
    @page { size: A4; margin: 0mm; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand-name">${theme.brandName}</div>
        <div class="brand-tagline">${theme.brandTagline}</div>
      </div>
      <div class="header-badge">Medical Document</div>
    </div>
    <div class="content">${mdHtml}</div>
    <div class="footer">
      <span>Generated by <span class="footer-brand">${theme.brandName}</span></span>
      <span>${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
    </div>
  </div>
</body>
</html>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Missing required field: file (.md)" },
        { status: 400 },
      );
    }

    if (!file.name.endsWith(".md") && file.type !== "text/markdown") {
      return NextResponse.json(
        { error: "File must be a Markdown (.md) file" },
        { status: 400 },
      );
    }

    const markdown = await file.text();

    if (!markdown.trim()) {
      return NextResponse.json(
        { error: "Markdown file is empty" },
        { status: 400 },
      );
    }

    // ── Merge theme override from frontend ───────────────────────────────────
    let theme: Theme = DEFAULT_THEME;
    const rawTheme = formData.get("theme");
    if (rawTheme && typeof rawTheme === "string") {
      try {
        const parsed = JSON.parse(rawTheme) as Partial<Theme>;
        theme = { ...DEFAULT_THEME, ...parsed };
      } catch {
        // malformed JSON — fall back to default
      }
    }

    // ── MD → HTML ────────────────────────────────────────────────────────────
    const htmlContent = await marked(markdown);
    const fullHtml = buildHtml(htmlContent, theme, markdown);

    // ── Puppeteer → PDF ──────────────────────────────────────────────────────
    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        (process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : "/usr/bin/chromium"),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    await page
      .waitForFunction(
        () => document.body.getAttribute("data-math-ready") === "true",
        { timeout: 10_000 },
      )
      .catch(() => {
        /* no math — continue */
      });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      printBackground: true,
    });

    await browser.close();

    return NextResponse.json({
      html: fullHtml,
      pdf: Buffer.from(pdfBuffer).toString("base64"),
      filename: file.name.replace(/\.md$/, ""),
    });
  } catch (error) {
    console.error("[md-converter] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
