"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ThemePreview {
  bg: string;
  header: string;
  accent: string;
  text: string;
}

interface MedTheme {
  id: string;
  name: string;
  description: string;
  preview: ThemePreview;
  theme: Record<string, string>;
}



// ─── Theme data (loaded from themes.json) ────────────────────────────────────
import themesData from "@/app/api/md-converter/themes.json";
const THEMES: MedTheme[] = themesData as MedTheme[];

// ─── Icons (inline SVG — no extra dep) ───────────────────────────────────────
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ─── Theme Card ───────────────────────────────────────────────────────────────
function ThemeCard({
  t,
  selected,
  onSelect,
}: {
  t: MedTheme;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative group w-full text-left rounded-xl border-2 overflow-hidden transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        selected
          ? "border-blue-500 shadow-md shadow-blue-100 ring-2 ring-blue-200"
          : "border-slate-200 hover:border-slate-300",
      )}
      style={selected ? { "--tw-ring-color": t.preview.accent } as React.CSSProperties : {}}
      aria-pressed={selected}
    >
      {/* Colour swatch strip */}
      <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${t.preview.header} 0%, ${t.preview.accent} 100%)` }} />

      {/* Mini document preview */}
      <div className="p-3" style={{ backgroundColor: t.preview.bg }}>
        <div className="rounded-md overflow-hidden border" style={{ borderColor: `${t.preview.accent}30` }}>
          {/* Header bar */}
          <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: t.preview.header }}>
            <div className="w-8 h-1.5 rounded-full bg-white opacity-70" />
            <div className="ml-auto w-4 h-1.5 rounded-full bg-white opacity-40" />
          </div>
          {/* Content lines */}
          <div className="px-3 py-2 space-y-1.5 bg-white">
            <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: t.preview.text, opacity: 0.15 }} />
            <div className="h-1 w-full rounded-full" style={{ backgroundColor: t.preview.text, opacity: 0.08 }} />
            <div className="h-1 w-5/6 rounded-full" style={{ backgroundColor: t.preview.text, opacity: 0.08 }} />
            <div className="mt-2 h-1 w-1/2 rounded-full" style={{ backgroundColor: t.preview.accent, opacity: 0.4 }} />
            <div className="h-1 w-full rounded-full" style={{ backgroundColor: t.preview.text, opacity: 0.06 }} />
            <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: t.preview.text, opacity: 0.06 }} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-1 bg-white border-t border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{t.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.description}</p>
          </div>
          {selected && (
            <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: t.preview.accent }}>
              <CheckIcon />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MdConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("clinical-blue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ html: string; pdf: string; filename: string } | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [htmlBlobUrl, setHtmlBlobUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Drag & drop handlers ──────────────────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith(".md") || dropped.type === "text/markdown")) {
      setFile(dropped);
      setError(null);
      setResult(null);
    } else {
      setError("Only .md (Markdown) files are accepted.");
    }
  }, []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      setFile(picked);
      setError(null);
      setResult(null);
    }
  }, []);

  // ── Convert ───────────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPdfBlobUrl(null);
    setHtmlBlobUrl(null);

    try {
      const theme = THEMES.find((t) => t.id === selectedTheme);
      const fd = new FormData();
      fd.append("file", file);
      if (theme) fd.append("theme", JSON.stringify(theme.theme));

      const res = await fetch("/api/md-converter", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);

      // Convert to blob URLs for reliable iframe embedding
      if (data.html) {
        const htmlBlob = new Blob([data.html], { type: "text/html; charset=utf-8" });
        setHtmlBlobUrl(URL.createObjectURL(htmlBlob));
      }
      if (data.pdf) {
        const bytes = atob(data.pdf);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const pdfBlob = new Blob([arr], { type: "application/pdf" });
        setPdfBlobUrl(URL.createObjectURL(pdfBlob));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to result
  useEffect(() => {
    if (result) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [result]);

  // Cleanup blob URLs on unmount or change
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      if (htmlBlobUrl) URL.revokeObjectURL(htmlBlobUrl);
    };
  }, [pdfBlobUrl, htmlBlobUrl]);

  // ── Download helpers ──────────────────────────────────────────────────────
  const downloadHtml = () => {
    if (!result) return;
    const blob = new Blob([result.html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${result.filename}.html`;
    a.click();
  };

  const downloadPdf = () => {
    if (!pdfBlobUrl || !result) return;
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.download = `${result.filename}.pdf`;
    a.click();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <main className="mx-auto max-w-5xl px-6 py-16 space-y-10">
        {/* ── Hero heading ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#1e3a5f] flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold tracking-tight">
                M
              </span>
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              Med Converter
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0 font-medium tracking-wide"
            >
              BETA
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Convert your medical notes
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Drop a{" "}
            <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-sm font-mono">
              .md
            </code>{" "}
            file, pick a theme, and get a beautifully styled HTML + PDF
            document.
            <br />
            <span className="text-slate-400 text-sm">
              Supports Arabic · French · English · Mixed content
            </span>
          </p>
        </div>

        {/* ── Upload zone ── */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer",
            "flex flex-col items-center justify-center text-center gap-4 py-14 px-6",
            isDragging
              ? "border-blue-400 bg-blue-50 scale-[1.01]"
              : file
                ? "border-emerald-300 bg-emerald-50 cursor-default"
                : "border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50/40",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <FileIcon />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">
                  {file.name}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · Markdown file ready
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                  setError(null);
                  setPdfBlobUrl(null);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors"
                aria-label="Remove file"
              >
                <XIcon />
              </button>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "text-slate-300 transition-colors",
                  isDragging && "text-blue-400",
                )}
              >
                <UploadIcon />
              </div>
              <div>
                <p className="text-base font-medium text-slate-700">
                  {isDragging
                    ? "Release to upload"
                    : "Drag & drop your .md file here"}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  or{" "}
                  <span className="text-blue-600 font-medium underline underline-offset-2">
                    click to browse
                  </span>
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-xs text-slate-400 border-slate-200"
              >
                Only .md files accepted
              </Badge>
            </>
          )}
        </div>

        {/* ── Theme selector ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-800">
              Choose a PDF theme
            </h2>
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">4 themes available</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {THEMES.map((t) => (
              <ThemeCard
                key={t.id}
                t={t}
                selected={selectedTheme === t.id}
                onSelect={() => setSelectedTheme(t.id)}
              />
            ))}
          </div>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">
              !
            </span>
            {error}
          </div>
        )}

        {/* ── Convert button ── */}
        <div className="flex justify-center">
          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className={cn(
              "flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-semibold text-sm tracking-wide transition-all duration-200 shadow-md",
              !file || loading
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-[#1e3a5f] hover:bg-[#1a3355] hover:shadow-lg active:scale-[0.98]",
            )}
          >
            {loading ? (
              <>
                <SpinnerIcon />
                Generating PDF…
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                Convert to HTML &amp; PDF
              </>
            )}
          </button>
        </div>

        {/* ── Result viewer ── */}
        {result && (
          <div ref={resultRef} className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-semibold text-slate-800">
                Your converted document
              </h2>
              <span className="h-px flex-1 bg-slate-200" />
              {/* Download buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadHtml}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <DownloadIcon /> HTML
                </button>
                <button
                  onClick={downloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e3a5f] text-xs font-medium text-white hover:bg-[#1a3355] transition-colors"
                >
                  <DownloadIcon /> PDF
                </button>
              </div>
            </div>

            <Tabs defaultValue="pdf" className="w-full">
              <TabsList className="mb-0 h-20 bg-slate-100 rounded-t-xl rounded-b-none p-1 w-full justify-start border border-b-0 border-slate-200">
                <TabsTrigger
                  value="html"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                >
                  HTML Preview
                </TabsTrigger>
                <TabsTrigger
                  value="pdf"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                >
                  PDF Preview
                </TabsTrigger>
              </TabsList>

              {/* HTML tab — blob URL iframe for full HTML document rendering */}
              <TabsContent value="html" className="mt-0">
                <div className="rounded-b-xl rounded-tr-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  {htmlBlobUrl ? (
                    <iframe
                      src={htmlBlobUrl}
                      title="HTML Preview"
                      className="w-full border-none"
                      style={{ height: "70vh" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                      HTML preview unavailable
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* PDF tab — use blob URL for reliable cross-browser embedding */}
              <TabsContent value="pdf" className="mt-0">
                <div className="rounded-b-xl rounded-tr-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
                  {pdfBlobUrl ? (
                    <object
                      data={pdfBlobUrl}
                      type="application/pdf"
                      className="w-full border-none"
                      style={{ height: "70vh" }}
                    >
                      {/* Fallback if browser can't render inline PDF */}
                      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500 text-sm">
                        <p>
                          Your browser doesn&apos;t support inline PDF preview.
                        </p>
                        <button
                          onClick={downloadPdf}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1e3a5f] text-xs font-medium text-white hover:bg-[#1a3355] transition-colors"
                        >
                          <DownloadIcon /> Download PDF instead
                        </button>
                      </div>
                    </object>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                      PDF unavailable
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
