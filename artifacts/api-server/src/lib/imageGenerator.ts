import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { chromium, Browser } from "playwright-core";

const UPLOADS_DIR = path.resolve("uploads");
// CWD at runtime is artifacts/api-server/
const FONT_PATH = path.resolve("src/fonts/cairo.ttf");

let cairoFontBase64: string | null = null;

export async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function getCairoFont(): Promise<string> {
  if (cairoFontBase64) return cairoFontBase64;
  try {
    const data = await fs.readFile(FONT_PATH);
    cairoFontBase64 = data.toString("base64");
    return cairoFontBase64;
  } catch {
    return "";
  }
}

// ── Chromium path (resolved once) ───────────────────────────────────────────
let chromiumExec: string | undefined;

async function resolveChromiumPath(): Promise<string | undefined> {
  if (chromiumExec !== undefined) return chromiumExec || undefined;
  const { execSync } = await import("child_process");
  for (const cmd of [
    "which chromium",
    "which chromium-browser",
    "which google-chrome",
    "which google-chrome-stable",
  ]) {
    try {
      const p = execSync(`${cmd} 2>/dev/null`, { encoding: "utf8" }).trim();
      if (p) { chromiumExec = p; return p; }
    } catch { /* try next */ }
  }
  chromiumExec = "";
  return undefined;
}

// ── Persistent browser + page-level concurrency (max 5 pages at once) ────────
// One browser process stays alive; each render borrows a page slot.
// On crash the browser is automatically restarted for the next request.

const MAX_PAGES = 1;
let sharedBrowser: Browser | null = null;
let activePages = 0;
const pageWaiters: Array<() => void> = [];

async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) return sharedBrowser;

  const executablePath = await resolveChromiumPath();
  sharedBrowser = await chromium.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--font-render-hinting=none",
    ],
  });

  // If the browser crashes, clear the reference so it relaunches next time
  sharedBrowser.on("disconnected", () => { sharedBrowser = null; });
  return sharedBrowser;
}

function acquirePageSlot(): Promise<void> {
  if (activePages < MAX_PAGES) {
    activePages++;
    return Promise.resolve();
  }
  return new Promise(resolve =>
    pageWaiters.push(() => { activePages++; resolve(); })
  );
}

function releasePageSlot(): void {
  activePages--;
  const next = pageWaiters.shift();
  if (next) next();
}

async function withPage<T>(fn: (browser: Browser) => Promise<T>): Promise<T> {
  await acquirePageSlot();
  try {
    // Re-fetch browser inside the slot in case it was replaced while waiting
    const b = await getSharedBrowser();
    return await fn(b);
  } finally {
    releasePageSlot();
  }
}

// ── Template definitions matching Home.tsx exactly ──────────────────────────
export interface TemplateDefinition {
  id: string;
  bannerColor: string;
  bannerGradient?: string;
  labelColor: string;
  textColor: string;
  photoHeight: number;         // % of card height
  showQuote?: boolean;
  bannerBorderRadius?: string;
  isLight?: boolean;
  accentColor?: string;
  // New: special layout flags
  hasSocialBar?: boolean;      // render accent-colored social bar at bottom
  hasWave?: boolean;           // render SVG wave at photo/banner boundary
  waveColor?: string;          // color of the wave (default: matches banner)
  overlayMode?: boolean;       // banner is transparent overlay (for custom PNG mode)
}

export const BUILT_IN_TEMPLATES: Record<string, TemplateDefinition> = {
  "classic-blue":  { id: "classic-blue",  bannerColor: "#0f2557",     labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff",  photoHeight: 62 },
  "breaking-red":  { id: "breaking-red",  bannerColor: "#7f1d1d", bannerGradient: "linear-gradient(135deg,#991b1b,#7f1d1d)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff",  photoHeight: 60 },
  "modern-black":  { id: "modern-black",  bannerColor: "#0a0a0a", bannerGradient: "linear-gradient(180deg,rgba(0,0,0,0) 0%,#000000 100%)",  labelColor: "rgba(255,255,255,0.7)",  textColor: "#f5f5f5", photoHeight: 70 },
  "emerald":       { id: "emerald",        bannerColor: "#064e3b", bannerGradient: "linear-gradient(135deg,#065f46,#064e3b)",  labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff",  photoHeight: 62 },
  "royal-purple":  { id: "royal-purple",  bannerColor: "#3b0764", bannerGradient: "linear-gradient(135deg,#4c1d95,#3b0764)",  labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff",  photoHeight: 60 },
  "gold":          { id: "gold",           bannerColor: "#78350f", bannerGradient: "linear-gradient(135deg,#92400e,#78350f)",  labelColor: "rgba(255,255,255,0.85)", textColor: "#fef3c7", photoHeight: 62 },
  "midnight":      { id: "midnight",       bannerColor: "#1e1b4b", bannerGradient: "linear-gradient(135deg,#312e81,#1e1b4b)",  labelColor: "rgba(255,255,255,0.75)", textColor: "#e0e7ff", photoHeight: 60 },
  "slate-fade":    { id: "slate-fade",     bannerColor: "transparent", bannerGradient: "linear-gradient(to top,rgba(2,6,23,0.95) 0%,rgba(2,6,23,0.6) 60%,transparent 100%)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 100 },
  "white-quote":   { id: "white-quote",   bannerColor: "#ffffff",    labelColor: "rgba(0,0,0,0.45)",        textColor: "#111111", photoHeight: 58, showQuote: true, isLight: true, accentColor: "#dc2626" },
  "purple-wave":   { id: "purple-wave",   bannerColor: "#7c3aed", bannerGradient: "linear-gradient(135deg,#8b5cf6 0%,#5b21b6 100%)", labelColor: "rgba(255,255,255,0.8)",  textColor: "#ffffff",  photoHeight: 60, bannerBorderRadius: "28px 28px 0 0" },
  "crimson":       { id: "crimson",        bannerColor: "#dc2626",    labelColor: "rgba(255,255,255,0.9)",   textColor: "#ffffff",  photoHeight: 62 },
  "custom":        { id: "custom",         bannerColor: "#0f2557",    labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff",  photoHeight: 62 },
  // ── New templates ──
  "news-social":   { id: "news-social",   bannerColor: "#ffffff",    labelColor: "rgba(0,0,0,0.45)",        textColor: "#111111", photoHeight: 57, showQuote: true, isLight: true, accentColor: "#dc2626", hasSocialBar: true },
  "wave-white":    { id: "wave-white",    bannerColor: "#ffffff",    labelColor: "rgba(0,0,0,0.4)",         textColor: "#111111", photoHeight: 65, isLight: true, hasWave: true, waveColor: "#ffffff", accentColor: "#7c3aed" },
  "wave-blue":     { id: "wave-blue",     bannerColor: "#0f2557",    labelColor: "rgba(255,255,255,0.85)",  textColor: "#ffffff", photoHeight: 65, hasWave: true, waveColor: "#0f2557" },
  "ocean":         { id: "ocean",         bannerColor: "#0c4a6e", bannerGradient: "linear-gradient(135deg,#0369a1,#0c4a6e)", labelColor: "rgba(255,255,255,0.8)", textColor: "#e0f2fe", photoHeight: 60 },
  "amber":         { id: "amber",         bannerColor: "#d97706", bannerGradient: "linear-gradient(135deg,#f59e0b,#d97706)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
  "rose":          { id: "rose",          bannerColor: "#9f1239", bannerGradient: "linear-gradient(135deg,#be123c,#9f1239)", labelColor: "rgba(255,255,255,0.85)", textColor: "#fff1f2", photoHeight: 60 },
  "teal":          { id: "teal",          bannerColor: "#0f766e", bannerGradient: "linear-gradient(135deg,#0d9488,#0f766e)", labelColor: "rgba(255,255,255,0.85)", textColor: "#f0fdfa", photoHeight: 62 },
  "dark-social":   { id: "dark-social",   bannerColor: "#18181b",    labelColor: "rgba(255,255,255,0.7)",   textColor: "#f4f4f5", photoHeight: 60, hasSocialBar: true, accentColor: "#3f3f46" },
  "overlay-only":  { id: "overlay-only",  bannerColor: "transparent", bannerGradient: "none", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 100, overlayMode: true },
};

export const ASPECT_SIZES: Record<string, { w: number; h: number }> = {
  "1:1":  { w: 1080, h: 1080 },
  "16:9": { w: 1080, h: 608  },
  "4:5":  { w: 1080, h: 1350 },
  "9:16": { w: 750,  h: 1334 },
};

export interface GenerateOptions {
  title: string;
  subtitle?: string | null;
  label?: string | null;
  templateId?: string;
  bannerColor?: string;
  bannerGradient?: string;
  textColor?: string;
  labelColor?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: number;
  photoHeight?: number;
  aspectRatio?: string;
  backgroundImagePath?: string | null;
  logoText?: string | null;
  logoImagePath?: string | null;
  logoPos?: string | null;
  logoInvert?: boolean;
  imgPositionX?: number;
  imgPositionY?: number;
  textShadow?: boolean;
  overlayImagePath?: string | null;  // custom PNG overlay on top of entire card
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function buildHtml(opts: GenerateOptions, w: number, h: number, bgDataUrl?: string, logoDataUrl?: string, overlayDataUrl?: string): Promise<string> {
  const tmplId    = opts.templateId || "classic-blue";
  const base      = BUILT_IN_TEMPLATES[tmplId] || BUILT_IN_TEMPLATES["classic-blue"];

  const isFade      = tmplId === "slate-fade" || base.overlayMode;
  const bannerBg    = base.overlayMode ? "transparent"
                    : (opts.bannerGradient ?? base.bannerGradient ?? opts.bannerColor ?? base.bannerColor);
  const textColor   = opts.textColor   ?? base.textColor;
  const labelColor  = opts.labelColor  ?? base.labelColor;
  const photoH      = opts.photoHeight ?? base.photoHeight;
  const bannerH     = 100 - photoH;
  const showQuote   = base.showQuote ?? false;
  const accentClr   = base.accentColor ?? "#dc2626";
  const isLight     = base.isLight ?? false;
  const borderRad   = base.bannerBorderRadius ?? "";
  const font        = opts.font       ?? "Cairo";
  const fontWt      = opts.fontWeight ?? 700;
  const shadow      = opts.textShadow ? "0 1px 4px rgba(0,0,0,0.7)" : "none";
  const label       = opts.label !== undefined ? opts.label : null;
  const subtitle    = opts.subtitle ?? null;
  const title       = opts.title || "أدخل العنوان هنا...";
  const logoText    = opts.logoText ?? null;
  const logoPos     = opts.logoPos ?? "top-right";
  const logoInvert  = opts.logoInvert ?? false;
  const imgPosX     = opts.imgPositionX ?? 50;
  const imgPosY     = opts.imgPositionY ?? 50;
  const hasSocialBar = base.hasSocialBar ?? false;
  const hasWave      = base.hasWave ?? false;
  const waveColor    = base.waveColor ?? base.bannerColor;

  // Social bar height
  const socialBarH   = hasSocialBar ? Math.round(44 * (w / 540)) : 0;

  // Font embedding
  const cairoB64  = await getCairoFont();
  const fontFace  = cairoB64
    ? `@font-face { font-family: 'Cairo'; src: url('data:font/ttf;base64,${cairoB64}') format('truetype'); font-weight: 100 900; }`
    : "";

  // Scale factors: structural elements scale from 540px reference
  // Font sizes scale from 480px (actual frontend preview card width for 1:1/16:9/4:5)
  // For 9:16 story (w=750, preview=270), fontScale = 750/270 ≈ 2.78
  const scale  = w / 540;
  const previewW = w === 750 ? 270 : 480;
  const fontSz = Math.round((opts.fontSize ?? 52) * (w / previewW));
  const pad    = Math.round(16 * scale);

  // Photo section background
  const photoBg = bgDataUrl
    ? `<img src="${bgDataUrl}" style="width:100%;height:100%;object-fit:cover;object-position:${imgPosX}% ${imgPosY}%;display:block;" />`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a2035,#2d3748);"></div>`;

  // Quote mark (white-quote / news-social templates)
  const quoteMark = showQuote
    ? `<div style="position:absolute;top:${Math.round(8*scale)}px;right:${Math.round(12*scale)}px;font-size:${Math.round(40*scale)}px;color:${accentClr};line-height:1;font-family:Georgia,serif;font-weight:900;opacity:0.9;">❝</div>`
    : "";

  // SVG wave separator at top of banner
  const waveHtml = hasWave
    ? `<div style="position:absolute;top:-${Math.round(28*scale)}px;left:0;right:0;height:${Math.round(30*scale)}px;overflow:visible;pointer-events:none;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 30" preserveAspectRatio="none" width="100%" height="100%">
          <path d="M0,30 C270,-10 810,-10 1080,30 L1080,0 L0,0 Z" fill="${waveColor}"/>
        </svg>
       </div>`
    : "";

  // Social bar strip at very bottom of banner
  const siteLabel = (label || logoText || "NEWS").toUpperCase();
  const socialBarHtml = hasSocialBar
    ? `<div style="position:absolute;bottom:0;left:0;right:0;height:${socialBarH}px;background:${accentClr};display:flex;align-items:center;padding:0 ${pad}px;gap:${Math.round(6*scale)}px;direction:ltr;">
        <span style="color:rgba(255,255,255,0.8);font-size:${Math.round(11*scale)}px;font-family:'${font}',sans-serif;letter-spacing:${Math.round(3*scale)}px;">● ● ●</span>
        <span style="color:#ffffff;font-size:${Math.round(13*scale)}px;font-weight:700;font-family:'${font}',sans-serif;letter-spacing:${Math.round(1*scale)}px;">${esc(siteLabel)}</span>
        <span style="color:rgba(255,255,255,0.8);font-size:${Math.round(11*scale)}px;font-family:'${font}',sans-serif;letter-spacing:${Math.round(3*scale)}px;">● ● ●</span>
       </div>`
    : "";

  // Subtitle
  const subtitleHtml = subtitle
    ? `<p style="color:${labelColor};font-size:${Math.max(20, fontSz - Math.round(8*scale))}px;font-weight:400;font-family:'${font}',sans-serif;margin:${Math.round(6*scale)}px 0 0;line-height:1.4;">${esc(subtitle)}</p>`
    : "";

  // Label badge
  const labelHtml = label
    ? `<div style="margin-top:${Math.round(8*scale)}px;align-self:flex-start;background:${isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.1)"};border-radius:${Math.round(4*scale)}px;padding:${Math.round(3*scale)}px ${Math.round(8*scale)}px;">
        <span style="color:${labelColor};font-size:${Math.round(11*scale)}px;font-family:'${font}',sans-serif;">${esc(label)}</span>
       </div>`
    : "";

  // Logo position coordinates
  const logoPosStyle = (() => {
    const t = Math.round(12*scale), b = Math.round(12*scale), lr = Math.round(12*scale);
    if (logoPos === "top-right")    return `top:${t}px;right:${lr}px;`;
    if (logoPos === "top-left")     return `top:${t}px;left:${lr}px;`;
    if (logoPos === "bottom-right") return `bottom:${b}px;right:${lr}px;`;
    if (logoPos === "bottom-left")  return `bottom:${b}px;left:${lr}px;`;
    return `top:${t}px;right:${lr}px;`;
  })();

  // Logo HTML: image > text > placeholder
  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" style="position:absolute;${logoPosStyle}height:${Math.round(38*scale)}px;width:auto;max-width:${Math.round(120*scale)}px;object-fit:contain;${logoInvert ? "filter:invert(1);" : ""}" />`
    : logoText
    ? `<div style="position:absolute;${logoPosStyle}height:${Math.round(36*scale)}px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);border-radius:${Math.round(4*scale)}px;padding:${Math.round(4*scale)}px ${Math.round(10*scale)}px;">
        <span style="color:#ffffff;font-size:${Math.round(13*scale)}px;font-weight:700;font-family:'${font}',sans-serif;">${esc(logoText)}</span>
       </div>`
    : "";

  // Custom PNG overlay — covers entire card
  const overlayHtml = overlayDataUrl
    ? `<img src="${overlayDataUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;pointer-events:none;z-index:10;" />`
    : "";

  // Banner padding accounts for social bar
  const bannerPadBottom = hasSocialBar
    ? `${socialBarH + Math.round(14*scale)}px`
    : `${Math.round(14*scale)}px`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
${fontFace}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { margin: 0; background: transparent; }
#card {
  position: relative;
  width: ${w}px;
  height: ${h}px;
  overflow: hidden;
  background: #222;
}
.photo {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: ${isFade ? "100%" : `${photoH}%`};
  overflow: hidden;
}
.banner {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: ${isFade ? "100%" : `${bannerH}%`};
  background: ${bannerBg};
  border-radius: ${borderRad};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${isFade ? `0 ${pad}px ${pad}px` : `${Math.round(12*scale)}px ${pad}px ${Math.round(12*scale)}px`};
  direction: rtl;
  overflow: hidden;
}
.headline {
  color: ${textColor};
  font-size: ${fontSz}px;
  font-weight: ${fontWt};
  font-family: '${font}', 'Cairo', sans-serif;
  line-height: 1.45;
  margin: 0;
  margin-top: ${showQuote ? Math.round(36*scale) : 0}px;
  text-shadow: ${shadow};
}
</style>
</head>
<body>
<div id="card">
  <div class="photo">${photoBg}</div>
  <div class="banner">
    ${waveHtml}
    ${quoteMark}
    <p class="headline">${esc(title)}</p>
    ${subtitleHtml}
    ${labelHtml}
    ${socialBarHtml}
  </div>
  ${logoHtml}
  ${overlayHtml}
</div>
</body>
</html>`;
}

async function fileToDataUrl(filePath: string): Promise<string | undefined> {
  try {
    const buf  = await fs.readFile(filePath);
    const ext  = path.extname(filePath).toLowerCase().replace(".", "");
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg"
               : ext === "png" ? "image/png"
               : ext === "webp" ? "image/webp"
               : ext === "gif" ? "image/gif"
               : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function generateCard(options: GenerateOptions): Promise<{ filePath: string; fileName: string; fileSize: number }> {
  await ensureUploadsDir();

  const { w, h } = ASPECT_SIZES[options.aspectRatio || "1:1"] || ASPECT_SIZES["1:1"];

  // Pre-load images to base64 before entering the queue
  const bgDataUrl      = options.backgroundImagePath ? await fileToDataUrl(options.backgroundImagePath)  : undefined;
  const logoDataUrl    = options.logoImagePath       ? await fileToDataUrl(options.logoImagePath)        : undefined;
  const overlayDataUrl = options.overlayImagePath    ? await fileToDataUrl(options.overlayImagePath)     : undefined;
  const html           = await buildHtml(options, w, h, bgDataUrl, logoDataUrl, overlayDataUrl);

  // Render with shared browser — max 5 pages concurrently
  const screenshotBuffer = await withPage(async (b) => {
    const page = await b.newPage();
    try {
      await page.setViewportSize({ width: w, height: h });
      await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(500);
      const cardEl = await page.$("#card");
      if (!cardEl) throw new Error("Card element not found in page");
      return await cardEl.screenshot({ type: "png" }) as Buffer;
    } finally {
      await page.close().catch(() => {});
    }
  });

  const fileName = `card-${uuidv4()}.png`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  await fs.writeFile(filePath, screenshotBuffer);

  const stats = await fs.stat(filePath);
  return { filePath, fileName, fileSize: stats.size };
}

export async function closeBrowser() {
  if (sharedBrowser) {
    await sharedBrowser.close().catch(() => {});
    sharedBrowser = null;
  }
}
