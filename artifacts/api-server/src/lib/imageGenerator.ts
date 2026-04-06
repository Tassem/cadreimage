import { execSync } from "child_process";
import { existsSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { logger } from "./logger";

let chromiumPath: string | null = null;

function findChromium(): string {
  if (chromiumPath) return chromiumPath;

  const candidates = [
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];

  for (const c of candidates) {
    if (existsSync(c)) {
      chromiumPath = c;
      return c;
    }
  }

  try {
    const which = execSync("which chromium 2>/dev/null || which chromium-browser 2>/dev/null || which google-chrome 2>/dev/null", { encoding: "utf-8" }).trim();
    if (which) {
      chromiumPath = which.split("\n")[0];
      return chromiumPath;
    }
  } catch {
    // ignore
  }

  throw new Error("Chromium not found. Please install chromium.");
}

export interface CardOptions {
  title: string;
  subtitle?: string | null;
  label?: string | null;
  backgroundPhotoUrl?: string | null;
  logoPhotoUrl?: string | null;
  aspectRatio?: string;
  bannerColor?: string;
  bannerGradient?: string | null;
  textColor?: string;
  labelColor?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: number;
  photoHeight?: number;
  logoPos?: string;
  logoInvert?: boolean;
  textShadow?: boolean;
  elements?: string;
  overlayUrl?: string | null;
}

function getCanvasSize(aspectRatio: string): { w: number; h: number; previewW: number } {
  switch (aspectRatio) {
    case "16:9": return { w: 1920, h: 1080, previewW: 480 };
    case "9:16": return { w: 1080, h: 1920, previewW: 270 };
    case "4:5": return { w: 1080, h: 1350, previewW: 480 };
    case "1:1":
    default: return { w: 1080, h: 1080, previewW: 480 };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(opts: CardOptions, w: number, h: number, previewW: number): string {
  const {
    title,
    subtitle,
    label,
    backgroundPhotoUrl,
    logoPhotoUrl,
    bannerColor = "#c0392b",
    bannerGradient,
    textColor = "#ffffff",
    labelColor = "#ffffff",
    font = "Cairo",
    fontSize = 42,
    fontWeight = 700,
    photoHeight = 60,
    logoPos = "top-left",
    logoInvert = false,
    textShadow = false,
    overlayUrl,
  } = opts;

  const scale = w / previewW;
  const scaledFontSize = Math.round(fontSize * scale);
  const scaledSubtitleSize = Math.round(28 * scale);
  const scaledLabelSize = Math.round(22 * scale);
  const scaledLogoSize = Math.round(40 * scale);
  const scaledPad = Math.round(20 * scale);

  const bgColor = bannerGradient
    ? bannerGradient
    : bannerColor;

  const photoHeightPx = Math.round((photoHeight / 100) * h);
  const textAreaHeight = h - photoHeightPx;

  const logoStyle = logoInvert ? "filter: invert(1);" : "";

  const logoHtml = logoPhotoUrl
    ? `<img src="${escapeHtml(logoPhotoUrl)}" style="height:${scaledLogoSize}px;${logoStyle}" />`
    : "";

  const logoPositions: Record<string, string> = {
    "top-left": `position:absolute;top:${scaledPad}px;left:${scaledPad}px;`,
    "top-right": `position:absolute;top:${scaledPad}px;right:${scaledPad}px;`,
    "bottom-left": `position:absolute;bottom:${scaledPad}px;left:${scaledPad}px;`,
    "bottom-right": `position:absolute;bottom:${scaledPad}px;right:${scaledPad}px;`,
  };

  const logoContainerStyle = logoPositions[logoPos] || logoPositions["top-left"];

  const shadowStyle = textShadow ? "text-shadow: 2px 2px 8px rgba(0,0,0,0.7);" : "";

  const textBgStyle = bannerGradient
    ? `background: ${bannerGradient};`
    : `background-color: ${bannerColor};`;

  const photoSection = backgroundPhotoUrl
    ? `<div style="width:${w}px;height:${photoHeightPx}px;overflow:hidden;position:relative;flex-shrink:0;">
        <img src="${escapeHtml(backgroundPhotoUrl)}" style="width:100%;height:100%;object-fit:cover;" />
        ${overlayUrl ? `<img src="${escapeHtml(overlayUrl)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />` : ""}
      </div>`
    : `<div style="width:${w}px;height:${photoHeightPx}px;${textBgStyle}flex-shrink:0;position:relative;">
        ${overlayUrl ? `<img src="${escapeHtml(overlayUrl)}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />` : ""}
      </div>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;700;900&family=Noto+Kufi+Arabic:wght@400;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:${w}px; height:${h}px; overflow:hidden; font-family:'${font}', 'Cairo', Arial, sans-serif; direction:rtl; }
</style>
</head>
<body>
<div style="width:${w}px;height:${h}px;display:flex;flex-direction:column;position:relative;">
  ${photoSection}
  <div style="width:${w}px;flex:1;${textBgStyle}display:flex;flex-direction:column;justify-content:center;padding:${scaledPad * 2}px ${scaledPad * 2.5}px;position:relative;">
    ${label ? `<div style="font-size:${scaledLabelSize}px;color:${labelColor};font-weight:700;margin-bottom:${Math.round(8 * scale)}px;${shadowStyle}">${escapeHtml(label)}</div>` : ""}
    <div style="font-size:${scaledFontSize}px;color:${textColor};font-weight:${fontWeight};line-height:1.4;${shadowStyle}">${escapeHtml(title)}</div>
    ${subtitle ? `<div style="font-size:${scaledSubtitleSize}px;color:${textColor};opacity:0.85;margin-top:${Math.round(10 * scale)}px;${shadowStyle}">${escapeHtml(subtitle)}</div>` : ""}
  </div>
  ${logoPhotoUrl ? `<div style="${logoContainerStyle}z-index:10;">${logoHtml}</div>` : ""}
</div>
</body>
</html>`;
}

let playwrightBrowser: any = null;

async function getBrowser() {
  if (playwrightBrowser) return playwrightBrowser;

  const { chromium } = await import("playwright-core");
  const executablePath = findChromium();

  playwrightBrowser = await chromium.launch({
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
    ],
    headless: true,
  });

  return playwrightBrowser;
}

export async function generateCardImage(opts: CardOptions): Promise<Buffer> {
  const aspectRatio = opts.aspectRatio || "1:1";
  const { w, h, previewW } = getCanvasSize(aspectRatio);
  const html = buildHtml(opts, w, h, previewW);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });

    // Wait for fonts to load
    await page.evaluate(() =>
      document.fonts.ready
    );

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: w, height: h },
    });

    return screenshot as Buffer;
  } finally {
    await page.close();
  }
}
