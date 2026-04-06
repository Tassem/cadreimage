import { useState, useRef, useCallback, useEffect } from "react";

// ─── Constants (mirror original) ──────────────────────────────────────────────

const DEFAULT_HEADLINE =
  "ترامب يحدد الساعة 8 من مساء الثلاثاء بتوقيت شرق أمريكا نهاية المهلة الممنوحة لإيران";

const ARABIC_FONTS = [
  { value: "Cairo", label: "Cairo — كايرو" },
  { value: "Tajawal", label: "Tajawal — تجوّل" },
  { value: "Noto Kufi Arabic", label: "Noto Kufi — نوتو كوفي" },
  { value: "Amiri", label: "Amiri — أميري" },
  { value: "Reem Kufi", label: "Reem Kufi — ريم كوفي" },
  { value: "IBM Plex Arabic", label: "IBM Plex Arabic" },
  { value: "Lateef", label: "Lateef — لطيف" },
];

interface Template {
  id: string;
  name: string;
  bannerColor: string;
  bannerGradient?: string;
  labelColor: string;
  textColor: string;
  photoHeight: number;
  showQuote?: boolean;
  bannerBorderRadius?: string;
  isLight?: boolean;
  accentColor?: string;
}

const TEMPLATES: Template[] = [
  { id: "classic-blue",  name: "كلاسك",      bannerColor: "#0f2557",  labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
  { id: "breaking-red",  name: "عاجل",        bannerColor: "#7f1d1d",  bannerGradient: "linear-gradient(135deg,#991b1b,#7f1d1d)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 60 },
  { id: "modern-black",  name: "مودرن",       bannerColor: "#0a0a0a",  bannerGradient: "linear-gradient(180deg,rgba(0,0,0,0) 0%,#000000 100%)", labelColor: "rgba(255,255,255,0.7)", textColor: "#f5f5f5", photoHeight: 70 },
  { id: "emerald",       name: "زمرد",        bannerColor: "#064e3b",  bannerGradient: "linear-gradient(135deg,#065f46,#064e3b)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
  { id: "royal-purple",  name: "ملكي",        bannerColor: "#3b0764",  bannerGradient: "linear-gradient(135deg,#4c1d95,#3b0764)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 60 },
  { id: "gold",          name: "ذهبي",        bannerColor: "#78350f",  bannerGradient: "linear-gradient(135deg,#92400e,#78350f)", labelColor: "rgba(255,255,255,0.85)", textColor: "#fef3c7", photoHeight: 62 },
  { id: "midnight",      name: "ليلي",        bannerColor: "#1e1b4b",  bannerGradient: "linear-gradient(135deg,#312e81,#1e1b4b)", labelColor: "rgba(255,255,255,0.75)", textColor: "#e0e7ff", photoHeight: 60 },
  { id: "slate-fade",    name: "تدرج",        bannerColor: "transparent", bannerGradient: "linear-gradient(to top,rgba(2,6,23,0.95) 0%,rgba(2,6,23,0.6) 60%,transparent 100%)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 100 },
  { id: "white-quote",   name: "بيضاء",       bannerColor: "#ffffff",  labelColor: "rgba(0,0,0,0.45)", textColor: "#111111", photoHeight: 58, showQuote: true, isLight: true, accentColor: "#dc2626" },
  { id: "purple-wave",   name: "موجة بنفسجية",bannerColor: "#7c3aed",  bannerGradient: "linear-gradient(135deg,#8b5cf6 0%,#5b21b6 100%)", labelColor: "rgba(255,255,255,0.8)", textColor: "#ffffff", photoHeight: 60, bannerBorderRadius: "28px 28px 0 0" },
  { id: "crimson",       name: "قرمزي",       bannerColor: "#dc2626",  labelColor: "rgba(255,255,255,0.9)", textColor: "#ffffff", photoHeight: 62 },
  { id: "custom",        name: "مخصص",        bannerColor: "#0f2557",  labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
  // ── New templates ──
  { id: "news-social",   name: "خبر + شريط",  bannerColor: "#ffffff",  labelColor: "rgba(0,0,0,0.45)", textColor: "#111111", photoHeight: 57, showQuote: true, isLight: true, accentColor: "#dc2626" },
  { id: "wave-white",    name: "موجة بيضاء",  bannerColor: "#ffffff",  labelColor: "rgba(0,0,0,0.4)",  textColor: "#111111", photoHeight: 65, isLight: true },
  { id: "wave-blue",     name: "موجة زرقاء",  bannerColor: "#0f2557",  labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 65 },
  { id: "ocean",         name: "أوشن",         bannerColor: "#0c4a6e",  bannerGradient: "linear-gradient(135deg,#0369a1,#0c4a6e)", labelColor: "rgba(255,255,255,0.8)", textColor: "#e0f2fe", photoHeight: 60 },
  { id: "amber",         name: "عنبر",         bannerColor: "#d97706",  bannerGradient: "linear-gradient(135deg,#f59e0b,#d97706)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
  { id: "rose",          name: "وردي",         bannerColor: "#9f1239",  bannerGradient: "linear-gradient(135deg,#be123c,#9f1239)", labelColor: "rgba(255,255,255,0.85)", textColor: "#fff1f2", photoHeight: 60 },
  { id: "teal",          name: "فيروزي",       bannerColor: "#0f766e",  bannerGradient: "linear-gradient(135deg,#0d9488,#0f766e)", labelColor: "rgba(255,255,255,0.85)", textColor: "#f0fdfa", photoHeight: 62 },
  { id: "dark-social",   name: "داكن + شريط",  bannerColor: "#18181b",  labelColor: "rgba(255,255,255,0.7)", textColor: "#f4f4f5", photoHeight: 60 },
  { id: "overlay-only",  name: "تصميم مخصص",  bannerColor: "transparent", bannerGradient: "none", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 100 },
];

const ASPECT_RATIOS = {
  "1:1":  { w: 480, h: 480,  label: "مربع 1:1",    export: "1080×1080" },
  "16:9": { w: 480, h: 270,  label: "أفقي 16:9",   export: "1080×608"  },
  "4:5":  { w: 480, h: 600,  label: "بورتريه 4:5", export: "1080×1350" },
  "9:16": { w: 270, h: 480,  label: "ستوري 9:16",  export: "750×1334"  },
} as const;
type AspectRatio = keyof typeof ASPECT_RATIOS;
type LogoPos = "top-right" | "top-left" | "bottom-right" | "bottom-left";
type TabId = "content" | "design" | "saved" | "typography" | "api" | "settings";

// ── Canvas free-positioning editor ─────────────────────────────────────────
type ElemKey = "headline" | "subtitle" | "label" | "logo";
interface ElemRect { x: number; y: number; w: number; }   // %, %, %
type CanvasLayout = Record<ElemKey, ElemRect>;
const CANVAS_DEFAULT: CanvasLayout = {
  headline: { x: 4,  y: 63, w: 92 },
  subtitle:  { x: 4,  y: 79, w: 92 },
  label:     { x: 4,  y: 88, w: 42 },
  logo:      { x: 74, y: 3,  w: 22 },
};

interface SavedDesign {
  id: string;
  name: string;
  createdAt: number;
  settings: {
    selectedTemplateId: string;
    aspectRatio: AspectRatio;
    font: string;
    fontSize: number;
    fontWeight: number;
    textShadow: boolean;
    logoPos: LogoPos;
    logoInvert: boolean;
    useLogoText: boolean;
    logoText: string;
    showSubtitle: boolean;
    showLabel: boolean;
    imgPositionX: number;
    imgPositionY: number;
    customBannerColor: string;
    customTextColor: string;
    customPhotoHeight: number;
    // content
    headline: string;
    subtitle: string;
    label: string;
    // logo image (base64) — saved so it reloads with the design
    logoImage: string | null;
    // overlay image (base64) — saved so it reloads with the design
    overlayImage: string | null;
    overlayPhotoFilename: string | null;
    // Canvas free-positioning
    canvasMode: boolean;
    canvasLayout: CanvasLayout;
  };
}

interface ApiTemplate {
  id: number;
  name: string;
  slug: string | null;
  aspectRatio: string;
  bannerColor: string;
  bannerGradient: string | null;
  textColor: string;
  labelColor: string;
  font: string;
  fontSize: number;
  fontWeight: number;
  photoHeight: number;
  subtitle: string | null;
  label: string | null;
  logoText: string | null;
  logoUrl: string | null;
  logoPos: string;
  logoInvert: boolean;
  textShadow: boolean;
  isPublic: boolean;
  createdAt: string;
  headlineAlign?: string | null;
  subtitleAlign?: string | null;
  labelAlign?: string | null;
  watermarkText?: string | null;
  watermarkOpacity?: number | null;
  showSubtitle?: boolean | null;
  showLabel?: boolean | null;
  useLogoText?: boolean | null;
  canvasLayout?: CanvasLayout | null;
  overlayUrl?: string | null;
}

function loadSaved() {
  try { return JSON.parse(localStorage.getItem("ncg-pro-settings") || "{}"); }
  catch { return {}; }
}
function loadDesigns(): SavedDesign[] {
  try {
    const all: SavedDesign[] = JSON.parse(localStorage.getItem("ncg-pro-designs") || "[]");
    const seen = new Set<string>();
    return all.filter(d => { if (seen.has(d.id)) return false; seen.add(d.id); return true; });
  } catch { return []; }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const SL: React.CSSProperties = {
  fontSize: "11px", color: "#64748b", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.08em",
  marginBottom: "8px", fontFamily: "'Inter', sans-serif",
};
const SECTION: React.CSSProperties = {
  background: "#1a2035", borderRadius: "12px",
  padding: "14px", border: "1px solid #1e293b",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "36px", height: "20px", borderRadius: "10px",
        background: checked ? "#3b82f6" : "#334155",
        cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: "2px",
        left: checked ? "18px" : "2px",
        width: "16px", height: "16px", borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
      }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Generate() {
  const s = useRef(loadSaved()).current;

  // Content state
  const [bgImage, setBgImage]           = useState<string | null>(null);
  const [bgFile,  setBgFile]            = useState<File | null>(null);
  const [bgFileName, setBgFileName]     = useState("");
  const [bgServerFilename, setBgServerFilename] = useState("");
  const [logoServerFilename, setLogoServerFilename] = useState("");
  const [logoImage, setLogoImage]       = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState("");
  // Custom overlay PNG (frame on top of card)
  const [overlayImage, setOverlayImage]     = useState<string | null>(null);
  const [overlayFileName, setOverlayFileName] = useState("");
  const [overlayServerFilename, setOverlayServerFilename] = useState("");
  const [headline, setHeadline]         = useState<string>(s.headline ?? DEFAULT_HEADLINE);
  const [subtitle, setSubtitle]         = useState<string>(s.subtitle ?? "");
  const [label, setLabel]               = useState<string>(s.label ?? "");
  const [showSubtitle, setShowSubtitle] = useState<boolean>(s.showSubtitle ?? false);
  const [showLabel, setShowLabel]       = useState<boolean>(s.showLabel ?? false);

  // Design state
  const [activeTab, setActiveTab]           = useState<TabId>("content");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(s.selectedTemplateId ?? "breaking-red");
  const [aspectRatio, setAspectRatio]       = useState<AspectRatio>(s.aspectRatio ?? "1:1");
  const [customBannerColor, setCustomBannerColor] = useState<string>(s.customBannerColor ?? "#ff0000");
  const [customTextColor, setCustomTextColor] = useState<string>(s.customTextColor ?? "#ffffff");
  const [customPhotoHeight, setCustomPhotoHeight] = useState<number>(s.customPhotoHeight ?? 62);

  // Typography state
  const [font, setFont]               = useState<string>(s.font ?? "Cairo");
  const [fontSize, setFontSize]       = useState<number>(s.fontSize ?? 26);
  const [fontWeight, setFontWeight]   = useState<number>(s.fontWeight ?? 700);
  const [textShadow, setTextShadow]   = useState<boolean>(s.textShadow ?? false);
  // Text alignment per element
  type TextAlign = "right" | "center" | "left";
  const [headlineAlign, setHeadlineAlign] = useState<TextAlign>(s.headlineAlign ?? "right");
  const [subtitleAlign, setSubtitleAlign] = useState<TextAlign>(s.subtitleAlign ?? "right");
  const [labelAlign, setLabelAlign]       = useState<TextAlign>(s.labelAlign ?? "right");
  // Watermark
  const [watermarkText, setWatermarkText]       = useState<string>(s.watermarkText ?? "");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(s.watermarkOpacity ?? 0.18);

  // Logo state
  const [logoPos, setLogoPos]         = useState<LogoPos>(s.logoPos ?? "top-right");
  const [useLogoText, setUseLogoText] = useState<boolean>(s.useLogoText ?? false);
  const [logoText, setLogoText]       = useState<string>(s.logoText ?? "");
  const [logoInvert, setLogoInvert]   = useState<boolean>(s.logoInvert ?? false);

  // Image position
  const [imgPositionX, setImgPositionX] = useState<number>(s.imgPositionX ?? 50);
  const [imgPositionY, setImgPositionY] = useState<number>(s.imgPositionY ?? 50);

  // ── Canvas free-positioning state ──────────────────────────────────────────
  const [canvasMode, setCanvasMode]     = useState(false);
  const [canvasLayout, setCanvasLayout] = useState<CanvasLayout>(CANVAS_DEFAULT);
  const [selElem, setSelElem]           = useState<ElemKey | null>(null);

  // Saved designs (local)
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(loadDesigns());
  const [saveNameInput, setSaveNameInput] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // API Templates (server-side, reusable via ID/slug)
  const [apiTemplates, setApiTemplates] = useState<ApiTemplate[]>([]);
  const [showApiTemplateSave, setShowApiTemplateSave] = useState(false);
  const [apiTplName, setApiTplName] = useState("");
  const [apiTplSlug, setApiTplSlug] = useState("");
  const [apiTplSaving, setApiTplSaving] = useState(false);
  const [editingTplId, setEditingTplId] = useState<number | null>(null);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingTg, setIsSendingTg] = useState(false);

  // API tab state
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [botStatus, setBotStatus] = useState<null | { username: string }>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyRegenerating, setApiKeyRegenerating] = useState(false);

  // User state
  const [userName, setUserName] = useState("...");

  const bgInputRef      = useRef<HTMLInputElement>(null);
  const logoInputRef    = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const importRef       = useRef<HTMLInputElement>(null);
  const cardRef         = useRef<HTMLDivElement>(null);
  const dragRef  = useRef<{ key: ElemKey; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const rszRef   = useRef<{ key: ElemKey; sx: number; ow: number; cw: number } | null>(null);

  // ── Load API template from ?templateId=<id> URL param ────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tplId = params.get("templateId");
    if (!tplId) return;
    const token = localStorage.getItem("pro_token");
    fetch(`/api/templates/${tplId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : null)
      .then((tpl: ApiTemplate | null) => {
        if (!tpl) return;
        // Apply all saved template settings to the generator state
        if (tpl.aspectRatio && Object.keys(ASPECT_RATIOS).includes(tpl.aspectRatio))
          setAspectRatio(tpl.aspectRatio as AspectRatio);
        if (tpl.font)             setFont(tpl.font);
        if (tpl.fontSize)         setFontSize(tpl.fontSize);
        if (tpl.fontWeight)       setFontWeight(tpl.fontWeight);
        if (typeof tpl.textShadow === "boolean") setTextShadow(tpl.textShadow);
        setCustomBannerColor(tpl.bannerColor);
        setCustomTextColor(tpl.textColor);
        if (tpl.photoHeight)      setCustomPhotoHeight(tpl.photoHeight);
        setSelectedTemplateId("custom");
        if (tpl.logoPos && ["top-right","top-left","bottom-right","bottom-left"].includes(tpl.logoPos))
          setLogoPos(tpl.logoPos as LogoPos);
        if (typeof tpl.logoInvert === "boolean") setLogoInvert(tpl.logoInvert);
        if (tpl.label != null)    { setLabel(tpl.label); setShowLabel(true); }
        if (tpl.subtitle != null) { setSubtitle(tpl.subtitle); setShowSubtitle(true); }
        if (tpl.showSubtitle != null) setShowSubtitle(!!tpl.showSubtitle);
        if (tpl.showLabel    != null) setShowLabel(!!tpl.showLabel);
        if (tpl.logoText != null) { setLogoText(tpl.logoText); }
        if (tpl.useLogoText  != null) setUseLogoText(!!tpl.useLogoText);
        if (tpl.headlineAlign && ["right","center","left"].includes(tpl.headlineAlign))
          setHeadlineAlign(tpl.headlineAlign as "right"|"center"|"left");
        if (tpl.subtitleAlign && ["right","center","left"].includes(tpl.subtitleAlign))
          setSubtitleAlign(tpl.subtitleAlign as "right"|"center"|"left");
        if (tpl.labelAlign && ["right","center","left"].includes(tpl.labelAlign))
          setLabelAlign(tpl.labelAlign as "right"|"center"|"left");
        if (tpl.watermarkText != null) setWatermarkText(tpl.watermarkText);
        if (tpl.watermarkOpacity != null) setWatermarkOpacity(tpl.watermarkOpacity);
        // Load logo from URL if present
        if (tpl.logoUrl) {
          const filename = tpl.logoUrl.split("/").pop() || "";
          setLogoServerFilename(filename);
          // Fetch as base64 for preview
          fetch(tpl.logoUrl)
            .then(r => r.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onload = e => { if (e.target?.result) setLogoImage(e.target.result as string); };
              reader.readAsDataURL(blob);
            }).catch(() => {});
        }
        // Clean ?templateId from URL without reload
        const url = new URL(window.location.href);
        url.searchParams.delete("templateId");
        window.history.replaceState({}, "", url.toString());
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist settings ─────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("ncg-pro-settings", JSON.stringify({
      headline, subtitle, label, showSubtitle, showLabel,
      selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow,
      logoPos, useLogoText, logoText, logoInvert,
      imgPositionX, imgPositionY,
      customBannerColor, customTextColor, customPhotoHeight,
      headlineAlign, subtitleAlign, labelAlign,
      watermarkText, watermarkOpacity,
    }));
  }, [headline, subtitle, label, showSubtitle, showLabel, selectedTemplateId, aspectRatio,
      font, fontSize, fontWeight, textShadow, logoPos, useLogoText, logoText, logoInvert,
      imgPositionX, imgPositionY, customBannerColor, customTextColor, customPhotoHeight,
      headlineAlign, subtitleAlign, labelAlign, watermarkText, watermarkOpacity]);

  useEffect(() => {
    localStorage.setItem("ncg-pro-designs", JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  // Load user info + bot status + auto-sync old local designs to server
  useEffect(() => {
    const token = localStorage.getItem("pro_token");
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        if (d.name) setUserName(d.name);
        if (d.apiKey) setApiKey(d.apiKey);
      }).catch(() => {});
    fetch("/api/bot/status", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.connected) setBotStatus({ username: d.username }); }).catch(() => {});

    // Auto-sync all locally-saved designs to server (idempotent — server upserts by name)
    const local = loadDesigns();
    if (local.length === 0) return;
    local.forEach(design => {
      const { logoImage: _img, ...serverSettings } = design.settings as any;
      fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: design.name, settings: serverSettings }),
      }).catch(() => {});
    });
  }, []);

  // ── API Templates (server-side) ───────────────────────────────────────────
  const fetchApiTemplates = useCallback(async () => {
    const token = localStorage.getItem("pro_token");
    if (!token) return;
    try {
      const r = await fetch("/api/templates", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setApiTemplates(await r.json());
    } catch {}
  }, []);

  useEffect(() => { fetchApiTemplates(); }, [fetchApiTemplates]);

  const handleSaveApiTemplate = useCallback(async () => {
    const name = apiTplName.trim(); if (!name) return;
    setApiTplSaving(true);
    const token = localStorage.getItem("pro_token");
    const tmplNow = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
    const payload = {
      name,
      slug: apiTplSlug.trim() || null,
      aspectRatio,
      bannerColor: selectedTemplateId === "custom" ? customBannerColor : (tmplNow.bannerColor ?? "#0f2557"),
      bannerGradient: selectedTemplateId !== "custom" ? (tmplNow.bannerGradient ?? null) : null,
      textColor: selectedTemplateId === "custom" ? customTextColor : (tmplNow.textColor ?? "#ffffff"),
      labelColor: tmplNow.labelColor ?? "rgba(255,255,255,0.85)",
      font,
      fontSize,
      fontWeight,
      photoHeight: customPhotoHeight,
      subtitle: showSubtitle && subtitle ? subtitle : null,
      label: showLabel && label ? label : null,
      logoText: useLogoText && logoText ? logoText : null,
      logoUrl: !useLogoText && logoServerFilename ? `/api/uploads/${logoServerFilename}` : null,
      logoPos,
      logoInvert,
      textShadow,
      headlineAlign,
      subtitleAlign,
      labelAlign,
      watermarkText: watermarkText || null,
      watermarkOpacity: String(watermarkOpacity),
      isPublic: false,
      canvasLayout: canvasMode ? canvasLayout : null,
      overlayUrl: overlayServerFilename ? `/api/uploads/${overlayServerFilename}` : null,
    };
    try {
      let r: Response;
      if (editingTplId !== null) {
        r = await fetch(`/api/templates/${editingTplId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        r = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      if (r.ok) {
        await fetchApiTemplates();
        setShowApiTemplateSave(false);
        setApiTplName(""); setApiTplSlug(""); setEditingTplId(null);
      }
    } catch {} finally { setApiTplSaving(false); }
  }, [apiTplName, apiTplSlug, aspectRatio, selectedTemplateId, customBannerColor, customTextColor, customPhotoHeight, font, fontSize, fontWeight, textShadow, subtitle, label, logoText, logoPos, logoInvert, showSubtitle, showLabel, useLogoText, headlineAlign, subtitleAlign, labelAlign, watermarkText, watermarkOpacity, editingTplId, fetchApiTemplates, canvasMode, canvasLayout, overlayServerFilename]);

  const handleDeleteApiTemplate = useCallback(async (id: number) => {
    if (!confirm("حذف هذا القالب؟")) return;
    const token = localStorage.getItem("pro_token");
    await fetch(`/api/templates/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setApiTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Canvas drag / resize handlers ────────────────────────────────────────
  const startDrag = useCallback((key: ElemKey) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setSelElem(key);
    const el = canvasLayout[key];
    dragRef.current = { key, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y };
    const card = cardRef.current; if (!card) return;
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current; if (!d) return;
      const r = card.getBoundingClientRect();
      setCanvasLayout(p => ({
        ...p,
        [d.key]: {
          ...p[d.key],
          x: Math.max(0, Math.min(90, d.ox + ((ev.clientX - d.sx) / r.width)  * 100)),
          y: Math.max(0, Math.min(95, d.oy + ((ev.clientY - d.sy) / r.height) * 100)),
        },
      }));
    };
    const onUp = () => { dragRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [canvasLayout]);

  const startResize = useCallback((key: ElemKey) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const card = cardRef.current; if (!card) return;
    rszRef.current = { key, sx: e.clientX, ow: canvasLayout[key].w, cw: card.getBoundingClientRect().width };
    const onMove = (ev: MouseEvent) => {
      const d = rszRef.current; if (!d) return;
      setCanvasLayout(p => ({ ...p, [d.key]: { ...p[d.key], w: Math.max(8, Math.min(98, d.ow + ((ev.clientX - d.sx) / d.cw) * 100)) } }));
    };
    const onUp = () => { rszRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [canvasLayout]);

  // ── Template helpers ──────────────────────────────────────────────────────
  const getTemplate = useCallback((): Template => {
    const t = TEMPLATES.find(t => t.id === selectedTemplateId)!;
    if (selectedTemplateId === "custom") {
      return { ...t, bannerColor: customBannerColor, bannerGradient: undefined, textColor: customTextColor, photoHeight: customPhotoHeight };
    }
    return t;
  }, [selectedTemplateId, customBannerColor, customTextColor, customPhotoHeight]);

  const tmpl = getTemplate();
  const isFade = tmpl.id === "slate-fade" || tmpl.id === "overlay-only";
  const photoH = tmpl.photoHeight;
  const bannerH = 100 - photoH;
  const { w: cardW, h: cardH } = ASPECT_RATIOS[aspectRatio];

  const logoStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: "absolute", height: "36px", width: "auto", maxWidth: "110px", objectFit: "contain" };
    if (logoPos === "top-right")    return { ...base, top: 12, right: 12 };
    if (logoPos === "top-left")     return { ...base, top: 12, left: 12 };
    if (logoPos === "bottom-right") return { ...base, bottom: 12, right: 12 };
    return { ...base, bottom: 12, left: 12 };
  };
  const logoBoxStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute", height: "32px", display: "flex", alignItems: "center",
      justifyContent: "center", background: "rgba(255,255,255,0.12)",
      borderRadius: "4px", padding: "4px 10px", border: "1px dashed rgba(255,255,255,0.25)",
    };
    if (logoPos === "top-right")    return { ...base, top: 10, right: 10 };
    if (logoPos === "top-left")     return { ...base, top: 10, left: 10 };
    if (logoPos === "bottom-right") return { ...base, bottom: 10, right: 10 };
    return { ...base, bottom: 10, left: 10 };
  };

  // ── File handlers ─────────────────────────────────────────────────────────
  const handleBgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBgFileName(file.name);
    setBgFile(file);
    const reader = new FileReader();
    reader.onload = ev => setBgImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
    // Also upload to server for high-quality generation
    const token = localStorage.getItem("pro_token");
    const fd = new FormData();
    fd.append("photo", file);
    fetch("/api/photo/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
      .then(r => r.json()).then(d => { if (d.filename) setBgServerFilename(d.filename); }).catch(() => {});
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLogoFileName(file.name);
    // Preview locally
    const reader = new FileReader();
    reader.onload = ev => setLogoImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
    // Upload to server for high-quality generation
    const token = localStorage.getItem("pro_token");
    const fd = new FormData();
    fd.append("photo", file);
    fetch("/api/photo/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
      .then(r => r.json()).then(d => { if (d.filename) setLogoServerFilename(d.filename); }).catch(() => {});
  }, []);

  const handleOverlayUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setOverlayFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setOverlayImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
    const token = localStorage.getItem("pro_token");
    const fd = new FormData();
    fd.append("photo", file);
    fetch("/api/photo/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
      .then(r => r.json()).then(d => { if (d.filename) setOverlayServerFilename(d.filename); }).catch(() => {});
  }, []);

  // ── Saved designs ─────────────────────────────────────────────────────────
  const handleSaveDesign = useCallback(() => {
    const name = saveNameInput.trim(); if (!name) return;
    const settings = {
      selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow,
      logoPos, logoInvert, useLogoText, logoText, showSubtitle, showLabel,
      imgPositionX, imgPositionY, customBannerColor, customTextColor, customPhotoHeight,
      headline, subtitle, label,
      logoImage: logoImage ?? null,
      logoPhotoFilename: (!useLogoText && logoServerFilename) ? logoServerFilename : null,
      // Overlay frame
      overlayImage: overlayImage ?? null,
      overlayPhotoFilename: overlayServerFilename || null,
      // Canvas free-positioning
      canvasMode,
      canvasLayout,
    };
    const design: SavedDesign = { id: Date.now().toString(), name, createdAt: Date.now(), settings };
    setSavedDesigns(prev => [design, ...prev.filter(d => d.name !== name)]);
    setSaveNameInput(""); setShowSaveInput(false);
    setActiveTab("saved");
    // Sync to server (strip logoImage base64 but keep logoPhotoFilename)
    const token = localStorage.getItem("pro_token");
    const { logoImage: _img, ...serverSettings } = settings;
    fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, settings: serverSettings }),
    }).catch(() => {});
  }, [saveNameInput, selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow, logoPos, logoInvert, useLogoText, logoText, showSubtitle, showLabel, imgPositionX, imgPositionY, customBannerColor, customTextColor, customPhotoHeight, headline, subtitle, label, logoImage, logoServerFilename, overlayImage, overlayServerFilename, canvasMode, canvasLayout]);

  const handleLoadDesign = useCallback((d: SavedDesign) => {
    const s = d.settings;
    setSelectedTemplateId(s.selectedTemplateId);
    setAspectRatio(s.aspectRatio);
    setFont(s.font); setFontSize(s.fontSize); setFontWeight(s.fontWeight); setTextShadow(s.textShadow);
    setLogoPos(s.logoPos); setLogoInvert(s.logoInvert ?? false);
    setUseLogoText(s.useLogoText); setLogoText(s.logoText);
    setShowSubtitle(s.showSubtitle); setShowLabel(s.showLabel);
    setImgPositionX(s.imgPositionX); setImgPositionY(s.imgPositionY);
    setCustomBannerColor(s.customBannerColor); setCustomTextColor(s.customTextColor);
    setCustomPhotoHeight(s.customPhotoHeight);
    if (s.headline) setHeadline(s.headline);
    if (s.subtitle !== undefined) setSubtitle(s.subtitle);
    if (s.label !== undefined) setLabel(s.label);
    // Restore canvas free-positioning — always merge with CANVAS_DEFAULT to ensure all keys exist
    if (s.canvasMode !== undefined) setCanvasMode(s.canvasMode);
    if (s.canvasLayout) setCanvasLayout({ ...CANVAS_DEFAULT, ...s.canvasLayout });
    else setCanvasLayout(CANVAS_DEFAULT);
    setSelElem(null);
    // Restore logo image if saved
    if (s.logoImage) {
      setLogoImage(s.logoImage);
      setLogoFileName("(محفوظ)");
      // If we already have the server filename saved, use it directly (avoids re-upload)
      if ((s as any).logoPhotoFilename) {
        setLogoServerFilename((s as any).logoPhotoFilename);
      } else {
        // Re-upload to server so it's available for generation
        const token = localStorage.getItem("pro_token");
        fetch(s.logoImage).then(r => r.blob()).then(blob => {
          const fd = new FormData();
          fd.append("photo", blob, "logo.png");
          return fetch("/api/photo/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        }).then(r => r.json()).then(data => { if (data.filename) setLogoServerFilename(data.filename); }).catch(() => {});
      }
    } else if ((s as any).logoPhotoFilename) {
      // Logo was uploaded to server but base64 not stored locally — restore filename only
      setLogoImage(null);
      setLogoFileName("(محفوظ على السيرفر)");
      setLogoServerFilename((s as any).logoPhotoFilename);
    } else {
      setLogoImage(null);
      setLogoFileName("");
      setLogoServerFilename("");
    }
    // Restore overlay image if saved
    if (s.overlayImage) {
      setOverlayImage(s.overlayImage);
      setOverlayFileName("(محفوظ)");
      if (s.overlayPhotoFilename) {
        setOverlayServerFilename(s.overlayPhotoFilename);
      } else {
        const token = localStorage.getItem("pro_token");
        fetch(s.overlayImage).then(r => r.blob()).then(blob => {
          const fd = new FormData();
          fd.append("photo", blob, "overlay.png");
          return fetch("/api/photo/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        }).then(r => r.json()).then(data => { if (data.filename) setOverlayServerFilename(data.filename); }).catch(() => {});
      }
    } else if (s.overlayPhotoFilename) {
      setOverlayImage(null);
      setOverlayFileName("(محفوظ على السيرفر)");
      setOverlayServerFilename(s.overlayPhotoFilename);
    } else {
      setOverlayImage(null);
      setOverlayFileName("");
      setOverlayServerFilename("");
    }
    setActiveTab("content");
  }, []);

  const exportDesigns = useCallback(() => {
    const blob = new Blob([JSON.stringify(savedDesigns, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "ncg-pro-designs.json"; a.click();
  }, [savedDesigns]);

  const importDesigns = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) setSavedDesigns(prev => [...data, ...prev]);
      } catch { alert("ملف JSON غير صالح"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  // ── Download via server (Playwright) ─────────────────────────────────────
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("pro_token");
      const payload: Record<string, unknown> = {
        title: headline,
        subtitle: showSubtitle ? subtitle : null,
        label: showLabel ? label : null,
        logoText: useLogoText ? logoText : null,
        templateId: selectedTemplateId,
        aspectRatio,
        font,
        fontSize,
        fontWeight,
        textShadow,
        logoPos,
        logoInvert,
        customBannerColor,
        customTextColor,
        customPhotoHeight,
        imgPositionX,
        imgPositionY,
        headlineAlign,
        subtitleAlign,
        labelAlign,
        watermarkText: watermarkText || null,
        watermarkOpacity,
      };
      if (bgServerFilename)   payload.backgroundPhotoFilename = bgServerFilename;
      if (!useLogoText && logoServerFilename) payload.logoPhotoFilename = logoServerFilename;
      if (overlayServerFilename) payload.overlayPhotoFilename = overlayServerFilename;
      if (canvasMode) payload.canvasLayout = canvasLayout;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التوليد");
      const a = document.createElement("a");
      a.href = data.imageUrl; a.download = `card-${selectedTemplateId}-${aspectRatio.replace(":", "x")}.png`;
      a.click();
    } catch (err: any) {
      alert("خطأ: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  }, [headline, subtitle, label, showSubtitle, showLabel, useLogoText, logoText, selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow, logoPos, logoInvert, customBannerColor, customTextColor, customPhotoHeight, imgPositionX, imgPositionY, bgServerFilename, logoServerFilename, overlayServerFilename]);

  // ── Telegram quick send ───────────────────────────────────────────────────
  const handleTelegramSend = useCallback(async () => {
    if (!botToken.trim() || !chatId.trim()) { alert("أدخل Bot Token و Chat ID"); return; }
    setIsSendingTg(true);
    try {
      const token = localStorage.getItem("pro_token");
      const payload: Record<string, unknown> = {
        title: headline,
        subtitle: showSubtitle ? subtitle : null,
        label: showLabel ? label : null,
        logoText: useLogoText ? logoText : null,
        templateId: selectedTemplateId,
        aspectRatio, font, fontSize, fontWeight, textShadow, logoPos, logoInvert,
        customBannerColor, customTextColor, customPhotoHeight, imgPositionX, imgPositionY,
        headlineAlign, subtitleAlign, labelAlign,
        watermarkText: watermarkText || null,
        watermarkOpacity,
      };
      if (bgServerFilename)   payload.backgroundPhotoFilename = bgServerFilename;
      if (!useLogoText && logoServerFilename) payload.logoPhotoFilename = logoServerFilename;
      if (overlayServerFilename) payload.overlayPhotoFilename = overlayServerFilename;
      if (canvasMode) payload.canvasLayout = canvasLayout;

      // Generate image first
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "فشل التوليد");

      // Send via Telegram Bot API
      const imgRes = await fetch(genData.imageUrl);
      const imgBlob = await imgRes.blob();
      const fd = new FormData();
      fd.append("chat_id", chatId.trim());
      fd.append("photo", imgBlob, "card.png");
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendPhoto`, {
        method: "POST", body: fd,
      });
      const tgData = await tgRes.json();
      if (!tgData.ok) throw new Error(tgData.description || "فشل الإرسال");
      alert("تم الإرسال بنجاح ✅");
    } catch (err: any) {
      alert("خطأ: " + err.message);
    } finally {
      setIsSendingTg(false);
    }
  }, [botToken, chatId, headline, subtitle, label, showSubtitle, showLabel, useLogoText, logoText, selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow, logoPos, logoInvert, customBannerColor, customTextColor, customPhotoHeight, imgPositionX, imgPositionY, bgServerFilename, logoServerFilename]);

  // ── Tab style ─────────────────────────────────────────────────────────────
  const tabStyle = (id: TabId): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: activeTab === id ? 600 : 400,
    background: activeTab === id ? "#3b82f6" : "rgba(255,255,255,0.05)",
    color: activeTab === id ? "#fff" : "#94a3b8",
    transition: "all 0.15s", fontFamily: "'Cairo', sans-serif", whiteSpace: "nowrap" as const,
  });

  const FONT_WEIGHTS = [900, 800, 700, 600, 500, 400];
  const tabs: { id: TabId; label: string }[] = [
    { id: "content",    label: "المحتوى" },
    { id: "design",     label: "التصميم" },
    { id: "saved",      label: `قوالي${savedDesigns.length ? ` (${savedDesigns.length})` : ""}` },
    { id: "typography", label: "الخطوط" },
    { id: "api",        label: "API" },
    { id: "settings",   label: "إعدادات" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "'Cairo', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid #1e293b", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f172a", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>🗞️ مولّد بطاقات الأخبار</h1>
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0, fontFamily: "Inter" }}>News Card Generator Pro</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>مرحباً {userName}</span>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>👤</div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left sidebar ── */}
        <aside style={{ width: "420px", minWidth: "380px", background: "#111827", borderLeft: "1px solid #1e293b", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>

          {/* Tabs */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e293b", display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t.id} style={tabStyle(t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>

          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>

            {/* ══ CONTENT TAB ══ */}
            {activeTab === "content" && (
              <>
                {/* Background photo */}
                <div style={SECTION}>
                  <p style={SL}>صورة الخلفية</p>
                  <button onClick={() => bgInputRef.current?.click()} style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px dashed #334155", borderRadius: "8px", color: bgFileName ? "#22c55e" : "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif", textAlign: "right" }}>
                    {bgFileName ? `✅ ${bgFileName}` : "📁 رفع صورة الخلفية"}
                  </button>
                  <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} style={{ display: "none" }} />
                  {bgImage && (
                    <button onClick={() => { setBgImage(null); setBgFileName(""); setBgFile(null); setBgServerFilename(""); }} style={{ marginTop: "6px", fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>× حذف الصورة</button>
                  )}
                </div>

                {/* Headline */}
                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ ...SL, marginBottom: 0 }}>العنوان الرئيسي</p>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{headline.length} حرف</span>
                  </div>
                  <textarea
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    rows={4} dir="rtl"
                    placeholder="أدخل العنوان الإخباري هنا..."
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "10px 12px", fontSize: "15px", fontFamily: `'${font}', sans-serif`, resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
                  />
                </div>

                {/* Subtitle */}
                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ ...SL, marginBottom: 0 }}>العنوان الفرعي</p>
                    <Toggle checked={showSubtitle} onChange={setShowSubtitle} />
                  </div>
                  <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 8px" }}>إظهار العنوان الفرعي</p>
                  {showSubtitle && (
                    <input value={subtitle} onChange={e => setSubtitle(e.target.value)} dir="rtl"
                      placeholder="مثال: BERRECHIDNEWS.COM"
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", fontFamily: `'${font}', sans-serif`, outline: "none", boxSizing: "border-box" }} />
                  )}
                </div>

                {/* Logo */}
                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ ...SL, marginBottom: 0 }}>الشعار (LOGO)</p>
                    <Toggle checked={useLogoText} onChange={setUseLogoText} />
                  </div>
                  <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 10px" }}>استخدام نص بدل صورة</p>
                  {useLogoText ? (
                    <input value={logoText} onChange={e => setLogoText(e.target.value)} dir="rtl"
                      placeholder="اسم الموقع أو القناة..."
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif", boxSizing: "border-box" }} />
                  ) : (
                    <>
                      <button onClick={() => logoInputRef.current?.click()} style={{ width: "100%", padding: "9px", background: "#0f172a", border: "1px dashed #334155", borderRadius: "8px", color: logoFileName ? "#22c55e" : "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif", textAlign: "right" }}>
                        {logoFileName ? `✅ ${logoFileName}` : "📁 رفع الشعار"}
                      </button>
                      <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                      {logoImage && (
                        <>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                            <input type="checkbox" checked={logoInvert} onChange={e => setLogoInvert(e.target.checked)} />
                            عكس ألوان الشعار (أبيض)
                          </label>
                          <button onClick={() => { setLogoImage(null); setLogoFileName(""); }} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginTop: "4px", fontFamily: "'Cairo', sans-serif" }}>× حذف الشعار</button>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Small text / label */}
                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ ...SL, marginBottom: 0 }}>النص الصغير</p>
                    <Toggle checked={showLabel} onChange={setShowLabel} />
                  </div>
                  <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 8px" }}>إظهار النص الصغير</p>
                  {showLabel && (
                    <input value={label} onChange={e => setLabel(e.target.value)} dir="rtl"
                      placeholder="مثال: صورة من الأرشيف"
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif", boxSizing: "border-box" }} />
                  )}
                </div>
              </>
            )}

            {/* ══ DESIGN TAB ══ */}
            {activeTab === "design" && (
              <>
                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <p style={{ ...SL, marginBottom: 0 }}>قوالب جاهزة</p>
                    <button onClick={() => setShowSaveInput(v => !v)} style={{ fontSize: "12px", background: "#1e3a5f", color: "#93c5fd", border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>💾 حفظ التصميم</button>
                  </div>
                  {showSaveInput && (
                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                      <input autoFocus value={saveNameInput} onChange={e => setSaveNameInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSaveDesign(); if (e.key === "Escape") setShowSaveInput(false); }}
                        placeholder="اسم التصميم..." dir="rtl"
                        style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif" }} />
                      <button onClick={handleSaveDesign} style={{ padding: "8px 12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>حفظ</button>
                      <button onClick={() => setShowSaveInput(false)} style={{ padding: "8px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer" }}>✕</button>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {TEMPLATES.map(t => {
                      const isSelected = selectedTemplateId === t.id;
                      const isFade = t.id === "slate-fade" || t.id === "overlay-only";
                      const photoH = t.photoHeight ?? 62;
                      const bannerH = 100 - photoH;
                      return (
                        <button key={t.id} onClick={() => setSelectedTemplateId(t.id)} style={{
                          padding: 0, borderRadius: "10px", overflow: "hidden", cursor: "pointer",
                          border: isSelected ? "2px solid #3b82f6" : "2px solid #1e293b",
                          boxShadow: isSelected ? "0 0 0 3px rgba(59,130,246,0.3)" : "none",
                          transition: "all 0.15s", background: "none", display: "flex", flexDirection: "column",
                          height: "72px",
                        }}>
                          {/* Photo area */}
                          <div style={{
                            flex: isFade ? "1 1 100%" : `0 0 ${photoH * 0.72}px`,
                            background: t.isLight
                              ? "linear-gradient(135deg,#e2e8f0,#f1f5f9)"
                              : "linear-gradient(135deg,#1a2035,#2d3748)",
                            position: "relative",
                            ...(isFade ? {
                              background: t.bannerGradient || t.bannerColor,
                              display: "flex", alignItems: "flex-end",
                              padding: "6px",
                            } : {}),
                          }}>
                            {isFade && (
                              <span style={{ color: t.textColor, fontSize: "9px", fontWeight: 700, fontFamily: "'Cairo',sans-serif", lineHeight: 1 }}>{t.name}</span>
                            )}
                          </div>
                          {/* Banner area */}
                          {!isFade && (
                            <div style={{
                              flex: `0 0 ${bannerH * 0.72}px`,
                              background: t.bannerGradient || t.bannerColor,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              padding: "4px",
                            }}>
                              <span style={{ color: t.textColor, fontSize: "10px", fontWeight: 700, fontFamily: "'Cairo',sans-serif", lineHeight: 1 }}>{t.name}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom colors */}
                <div style={SECTION}>
                  <p style={SL}>إعدادات مخصصة</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { label: "لون الشريط", value: customBannerColor, onChange: setCustomBannerColor },
                      { label: "لون النص",   value: customTextColor,  onChange: setCustomTextColor },
                    ].map(({ label: lbl, value, onChange }) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f172a", borderRadius: "8px", padding: "8px 12px" }}>
                        <div>
                          <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{lbl}</span>
                          <div style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>{value}</div>
                        </div>
                        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: "36px", height: "36px", borderRadius: "6px", cursor: "pointer", border: "none", background: "none" }} />
                      </div>
                    ))}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                        <span>ارتفاع الصورة %</span>
                        <span>{customPhotoHeight}%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#475569" }}>40%</span>
                        <input type="range" min={40} max={90} value={customPhotoHeight} onChange={e => setCustomPhotoHeight(+e.target.value)} style={{ flex: 1 }} />
                        <span style={{ fontSize: "11px", color: "#475569" }}>90%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom overlay PNG */}
                <div style={SECTION}>
                  <p style={SL}>إطار / تصميم مخصص (Overlay)</p>
                  <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 10px" }}>
                    ارفع صورة PNG شفافة تُوضع فوق البطاقة كاملة (إطار، شعار ضخم، تأثير...)
                  </p>
                  <button onClick={() => overlayInputRef.current?.click()} style={{ width: "100%", padding: "10px", background: "#0f172a", border: `1px dashed ${overlayImage ? "#a855f7" : "#334155"}`, borderRadius: "8px", color: overlayImage ? "#c084fc" : "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif", textAlign: "right" }}>
                    {overlayFileName ? `✅ ${overlayFileName}` : "📁 رفع صورة الإطار (PNG)"}
                  </button>
                  <input ref={overlayInputRef} type="file" accept="image/png,image/*" onChange={handleOverlayUpload} style={{ display: "none" }} />
                  {overlayImage && (
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <img src={overlayImage} alt="overlay preview" style={{ height: "40px", borderRadius: "4px", border: "1px solid #334155", objectFit: "contain", background: "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 0 0/10px 10px" }} />
                      <button onClick={() => { setOverlayImage(null); setOverlayFileName(""); setOverlayServerFilename(""); }} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>× حذف الإطار</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ══ SAVED TAB ══ */}
            {activeTab === "saved" && (
              <>
                {/* ══ API Templates Section ══ */}
                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <p style={{ ...SL, marginBottom: 2 }}>قوالب API</p>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>قالب يحفظ كل الإعدادات — تستخدمه بـ ID في n8n</p>
                    </div>
                    <button onClick={() => { setShowApiTemplateSave(true); setEditingTplId(null); setApiTplName(""); setApiTplSlug(""); }}
                      style={{ fontSize: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 11px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", whiteSpace: "nowrap" }}>
                      + قالب API جديد
                    </button>
                  </div>

                  {showApiTemplateSave && (
                    <div style={{ background: "#0f172a", border: "1px solid #7c3aed", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
                      <p style={{ fontSize: "12px", color: "#a78bfa", marginBottom: "8px", fontFamily: "'Cairo', sans-serif" }}>
                        {editingTplId !== null ? `تعديل القالب #${editingTplId}` : "إنشاء قالب API جديد من الإعدادات الحالية"}
                      </p>
                      <input value={apiTplName} onChange={e => setApiTplName(e.target.value)}
                        placeholder="اسم القالب (مثل: قالب الرياضة)" dir="rtl"
                        style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif", marginBottom: "8px", boxSizing: "border-box" }} />
                      <input value={apiTplSlug} onChange={e => setApiTplSlug(e.target.value.replace(/[^a-z0-9\-_]/gi, "").toLowerCase())}
                        placeholder="slug اختياري (مثل: sport-template) — للاستخدام بدل الرقم" dir="ltr"
                        style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "monospace", marginBottom: "8px", boxSizing: "border-box" }} />
                      <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                        سيحفظ: الخط، الحجم، الألوان، ارتفاع الصورة، العنوان الفرعي، اللوغو، الـ subtitle، الـ label
                      </p>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={handleSaveApiTemplate} disabled={apiTplSaving || !apiTplName.trim()}
                          style={{ flex: 1, padding: "8px", background: apiTplSaving ? "#4c1d95" : "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: apiTplSaving ? "wait" : "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>
                          {apiTplSaving ? "⏳ جاري الحفظ..." : (editingTplId !== null ? "تحديث القالب" : "حفظ القالب")}
                        </button>
                        <button onClick={() => { setShowApiTemplateSave(false); setEditingTplId(null); }}
                          style={{ padding: "8px 12px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  )}

                  {apiTemplates.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "24px 0", fontSize: "13px" }}>
                      <div style={{ fontSize: "28px", marginBottom: "6px" }}>🗂️</div>
                      لا توجد قوالب API بعد — أنشئ قالباً أولاً
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {apiTemplates.map(t => (
                        <div key={t.id} style={{ background: "#1a1030", borderRadius: "10px", padding: "10px 12px", border: "1px solid #3b1d6e" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{t.name}</span>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button onClick={() => { setEditingTplId(t.id); setApiTplName(t.name); setApiTplSlug(t.slug ?? ""); setShowApiTemplateSave(true); if (t.canvasLayout) { setCanvasLayout({ ...CANVAS_DEFAULT, ...t.canvasLayout }); setCanvasMode(true); } else { setCanvasMode(false); setCanvasLayout(CANVAS_DEFAULT); } if (t.overlayUrl) { const fn = t.overlayUrl.split("/").pop() ?? ""; setOverlayServerFilename(fn); setOverlayImage(t.overlayUrl); setOverlayFileName("(محفوظ على السيرفر)"); } else { setOverlayImage(null); setOverlayFileName(""); setOverlayServerFilename(""); } }}
                                style={{ padding: "3px 8px", fontSize: "11px", background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1e4080", borderRadius: "6px", cursor: "pointer" }}>تعديل</button>
                              <button onClick={() => handleDeleteApiTemplate(t.id)}
                                style={{ padding: "3px 8px", fontSize: "11px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", cursor: "pointer" }}>حذف</button>
                            </div>
                          </div>

                          {/* ID badge — main API identifier */}
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#0f2557", borderRadius: "6px", padding: "3px 8px" }}>
                              <span style={{ fontSize: "10px", color: "#93c5fd" }}>ID الرقمي:</span>
                              <code style={{ fontSize: "12px", color: "#60a5fa", fontFamily: "monospace", fontWeight: 700 }}>{t.id}</code>
                              <button onClick={() => navigator.clipboard.writeText(String(t.id))}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#60a5fa", fontSize: "10px", padding: "0 2px" }}>📋</button>
                            </div>
                            {t.slug && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#0c2340", borderRadius: "6px", padding: "3px 8px" }}>
                                <span style={{ fontSize: "10px", color: "#7dd3fc" }}>slug:</span>
                                <code style={{ fontSize: "12px", color: "#38bdf8", fontFamily: "monospace" }}>{t.slug}</code>
                                <button onClick={() => navigator.clipboard.writeText(t.slug!)}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "#38bdf8", fontSize: "10px", padding: "0 2px" }}>📋</button>
                              </div>
                            )}
                          </div>

                          {/* Summary of stored settings */}
                          <div style={{ fontSize: "10px", color: "#64748b", lineHeight: 1.7 }}>
                            <span style={{ marginLeft: "8px" }}>📐 {t.aspectRatio}</span>
                            <span style={{ marginLeft: "8px" }}>🔤 {t.font} {t.fontSize}px</span>
                            <span style={{ marginLeft: "8px" }}>📸 {t.photoHeight}%</span>
                            {t.subtitle && <span style={{ marginLeft: "8px" }}>💬 {t.subtitle.slice(0, 20)}</span>}
                            {t.logoText  && <span style={{ marginLeft: "8px" }}>🏷️ {t.logoText}</span>}
                            {t.overlayUrl && <span style={{ marginLeft: "8px", color: "#a855f7", fontWeight: 600 }}>🖼️ إطار مخصص ✓</span>}
                            {t.logoUrl   && !t.logoText && <span style={{ marginLeft: "8px", color: "#60a5fa" }}>🏷️ شعار محفوظ ✓</span>}
                          </div>

                          {/* n8n usage hint */}
                          <div style={{ marginTop: "6px", background: "#0f172a", borderRadius: "6px", padding: "5px 8px" }}>
                            <p style={{ fontSize: "10px", color: "#475569", margin: "0 0 2px", fontFamily: "monospace" }}>استخدام في n8n / API:</p>
                            <code style={{ fontSize: "10px", color: "#86efac", fontFamily: "monospace" }}>
                              {`"templateId": ${t.slug ? `"${t.slug}"` : t.id}`}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ══ Local Saved Designs Section ══ */}
                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <p style={{ ...SL, marginBottom: 0 }}>تصاميم محلية محفوظة</p>
                    <button onClick={() => setShowSaveInput(true)} style={{ fontSize: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>+ حفظ الحالي</button>
                  </div>
                  {showSaveInput && (
                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                      <input autoFocus value={saveNameInput} onChange={e => setSaveNameInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSaveDesign(); if (e.key === "Escape") setShowSaveInput(false); }}
                        placeholder="اسم التصميم..." dir="rtl"
                        style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif" }} />
                      <button onClick={handleSaveDesign} style={{ padding: "8px 12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>حفظ</button>
                      <button onClick={() => setShowSaveInput(false)} style={{ padding: "8px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer" }}>✕</button>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    <button onClick={exportDesigns} style={{ flex: 1, padding: "8px", background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1e4080", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>📤 تصدير JSON</button>
                    <button onClick={() => importRef.current?.click()} style={{ flex: 1, padding: "8px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>📥 استيراد JSON</button>
                    <input ref={importRef} type="file" accept=".json" onChange={importDesigns} style={{ display: "none" }} />
                  </div>
                </div>

                {savedDesigns.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "28px 0", fontSize: "14px" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>💾</div>
                    لا توجد تصاميم محلية بعد
                  </div>
                ) : (
                  savedDesigns.map(d => (
                    <div key={d.id} style={{ background: "#1a2035", borderRadius: "10px", padding: "12px", border: "1px solid #1e293b" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>{d.name}</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{new Date(d.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>
                        {TEMPLATES.find(t => t.id === d.settings.selectedTemplateId)?.name} · {d.settings.font}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleLoadDesign(d)} style={{ flex: 1, padding: "7px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>تطبيق</button>
                        <button onClick={() => setSavedDesigns(prev => prev.filter(x => x.id !== d.id))} style={{ padding: "7px 12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>×</button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ══ TYPOGRAPHY TAB ══ */}
            {activeTab === "typography" && (
              <>
                <div style={SECTION}>
                  <p style={SL}>الخط العربي</p>
                  <select value={font} onChange={e => setFont(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "10px 12px", fontSize: "14px", outline: "none", fontFamily: `'${font}', sans-serif`, cursor: "pointer" }}>
                    {ARABIC_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <p style={{ fontSize: "20px", fontFamily: `'${font}', sans-serif`, color: "#e2e8f0", marginTop: "12px", textAlign: "right", lineHeight: 1.6, direction: "rtl" }}>
                    هذا مثال على الخط المختار
                  </p>
                </div>

                <div style={SECTION}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
                    <span>حجم النص</span><span>{fontSize}px</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#475569" }}>14px</span>
                    <input type="range" min={14} max={48} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={{ flex: 1 }} />
                    <span style={{ fontSize: "11px", color: "#475569" }}>48px</span>
                  </div>
                </div>

                <div style={SECTION}>
                  <p style={SL}>وزن الخط</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
                    {FONT_WEIGHTS.map(w => (
                      <button key={w} onClick={() => setFontWeight(w)} style={{ padding: "8px 4px", borderRadius: "8px", border: fontWeight === w ? "2px solid #3b82f6" : "2px solid #1e293b", background: fontWeight === w ? "#1e3a5f" : "#0f172a", color: fontWeight === w ? "#93c5fd" : "#94a3b8", cursor: "pointer", fontSize: "12px", fontWeight: w, fontFamily: "'Cairo', sans-serif" }}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={SECTION}>
                  <p style={SL}>تأثيرات</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>ظل النص</span>
                    <Toggle checked={textShadow} onChange={setTextShadow} />
                  </div>
                </div>

                {/* ── Text alignment per element ── */}
                {(() => {
                  const AlignBtn = ({ align, current, onChange }: { align: TextAlign; current: TextAlign; onChange: (v: TextAlign) => void }) => {
                    const icons: Record<TextAlign, string> = { right: "←", center: "≡", left: "→" };
                    const labels: Record<TextAlign, string> = { right: "يمين", center: "وسط", left: "يسار" };
                    const active = align === current;
                    return (
                      <button onClick={() => onChange(align)} style={{ flex: 1, padding: "7px 4px", borderRadius: "7px", border: active ? "2px solid #3b82f6" : "2px solid #1e293b", background: active ? "#1e3a5f" : "#0f172a", color: active ? "#93c5fd" : "#64748b", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>{icons[align]}</span>
                        <span>{labels[align]}</span>
                      </button>
                    );
                  };
                  const items: { label: string; value: TextAlign; set: (v: TextAlign) => void }[] = [
                    { label: "العنوان الرئيسي", value: headlineAlign, set: setHeadlineAlign },
                    { label: "النص الفرعي",     value: subtitleAlign, set: setSubtitleAlign },
                    { label: "التسمية",          value: labelAlign,   set: setLabelAlign },
                  ];
                  return (
                    <div style={SECTION}>
                      <p style={SL}>محاذاة النص</p>
                      {items.map(item => (
                        <div key={item.label} style={{ marginBottom: "12px" }}>
                          <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>{item.label}</p>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {(["right", "center", "left"] as TextAlign[]).map(a => (
                              <AlignBtn key={a} align={a} current={item.value} onChange={item.set} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Live text preview */}
                <div style={{ background: "#ffffff", borderRadius: "12px", padding: "16px", direction: "rtl" }}>
                  <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px", fontFamily: "Inter" }}>معاينة نص</p>
                  <p style={{
                    fontFamily: `'${font}', sans-serif`, fontSize: `${fontSize}px`,
                    fontWeight: fontWeight, color: "#111",
                    textShadow: textShadow ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                    lineHeight: 1.5, margin: 0,
                  }}>
                    {headline || "أدخل العنوان هنا..."}
                  </p>
                </div>
              </>
            )}

            {/* ══ API TAB ══ */}
            {activeTab === "api" && (
              <>
                {/* ── API Key section ── */}
                <div style={SECTION}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "18px" }}>🔑</span>
                    <p style={{ ...SL, marginBottom: 0 }}>مفتاح API الخاص بك</p>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", direction: "rtl" }}>
                    استخدم هذا المفتاح للوصول إلى API من n8n أو أي أداة أتمتة. أرسله كـ Header بالشكل:
                    <code style={{ display: "block", marginTop: "4px", color: "#93c5fd", fontFamily: "monospace", fontSize: "11px" }}>X-Api-Key: YOUR_KEY</code>
                  </p>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "9px 12px", fontFamily: "monospace", fontSize: "12px", color: apiKey ? "#a5f3fc" : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {apiKey ? (apiKeyVisible ? apiKey : `${apiKey.slice(0, 8)}${"•".repeat(24)}`) : "جاري التحميل..."}
                    </div>
                    <button onClick={() => setApiKeyVisible(v => !v)} title={apiKeyVisible ? "إخفاء" : "إظهار"} style={{ padding: "9px 10px", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer", color: "#94a3b8", fontSize: "14px" }}>
                      {apiKeyVisible ? "🙈" : "👁️"}
                    </button>
                    <button onClick={() => { if (apiKey) { navigator.clipboard.writeText(apiKey); } }} style={{ padding: "9px 10px", background: "#1e3a5f", border: "1px solid #1e4080", borderRadius: "8px", cursor: "pointer", color: "#93c5fd", fontSize: "13px" }} title="نسخ">
                      📋
                    </button>
                  </div>
                  <button
                    disabled={apiKeyRegenerating}
                    onClick={async () => {
                      if (!confirm("تجديد المفتاح سيُلغي المفتاح القديم. هل أنت متأكد؟")) return;
                      setApiKeyRegenerating(true);
                      const token = localStorage.getItem("pro_token");
                      const res = await fetch("/api/auth/regenerate-key", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
                      const d = await res.json();
                      if (d.apiKey) setApiKey(d.apiKey);
                      setApiKeyRegenerating(false);
                    }}
                    style={{ marginTop: "8px", width: "100%", padding: "8px", background: "rgba(234,179,8,0.08)", color: "#facc15", border: "1px solid rgba(234,179,8,0.2)", borderRadius: "8px", cursor: apiKeyRegenerating ? "wait" : "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}
                  >
                    {apiKeyRegenerating ? "⏳ جاري التجديد..." : "🔄 تجديد المفتاح"}
                  </button>
                </div>

                {/* ── n8n Integration guide ── */}
                <div style={SECTION}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "20px" }}>⚡</span>
                    <p style={{ ...SL, marginBottom: 0 }}>ربط مع n8n</p>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px", direction: "rtl" }}>
                    استخدم <strong style={{ color: "#94a3b8" }}>HTTP Request</strong> node في n8n لتوليد البطاقات تلقائيًا.
                  </p>

                  {/* Steps */}
                  {[
                    { num: "1", title: "Method", val: "POST" },
                    { num: "2", title: "URL", val: `${window.location.origin}/api/generate` },
                    { num: "3", title: "Header", val: `X-Api-Key: ${apiKey || "YOUR_API_KEY"}` },
                    { num: "4", title: "Body Type", val: "JSON" },
                  ].map(s => (
                    <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ minWidth: "22px", height: "22px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: "1px" }}>{s.num}</div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "Inter" }}>{s.title}</div>
                        <div style={{ fontSize: "12px", color: "#a5f3fc", fontFamily: "monospace", wordBreak: "break-all" }}>{s.val}</div>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText(s.val)} style={{ marginRight: "auto", padding: "3px 7px", background: "#1e293b", border: "1px solid #334155", borderRadius: "5px", cursor: "pointer", color: "#64748b", fontSize: "11px", flexShrink: 0 }}>نسخ</button>
                    </div>
                  ))}

                  {/* JSON body example */}
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: "12px 0 6px", fontWeight: 600 }}>Body (JSON):</p>
                  {(() => {
                    const example = JSON.stringify({
                      title: "عنوان الخبر يُكتب هنا",
                      subtitle: "المصدر: وكالة الأنباء",
                      templateId: "classic-blue",
                      aspectRatio: "1:1",
                      backgroundImageUrl: "https://example.com/photo.jpg",
                      logoText: "اسم الموقع",
                      logoPos: "top-right",
                      font: "Cairo",
                      fontSize: 52,
                      fontWeight: 700,
                    }, null, 2);
                    return (
                      <div style={{ position: "relative" }}>
                        <pre style={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px", fontSize: "10.5px", color: "#7dd3fc", fontFamily: "monospace", overflowX: "auto", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{example}</pre>
                        <button onClick={() => navigator.clipboard.writeText(example)} style={{ position: "absolute", top: "8px", left: "8px", padding: "3px 8px", background: "#1e293b", border: "1px solid #334155", borderRadius: "5px", cursor: "pointer", color: "#64748b", fontSize: "11px" }}>📋 نسخ</button>
                      </div>
                    );
                  })()}
                </div>

                {/* ── Response format ── */}
                <div style={SECTION}>
                  <p style={{ ...SL, marginBottom: "8px" }}>شكل الرد (Response)</p>
                  <pre style={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px", fontSize: "10.5px", color: "#86efac", fontFamily: "monospace", overflowX: "auto", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{JSON.stringify({
                    id: 42,
                    imageUrl: "/api/uploads/card_abc123.png",
                    imageFullUrl: `${window.location.origin}/api/uploads/card_abc123.png`,
                    aspectRatio: "1:1",
                    createdAt: new Date().toISOString(),
                  }, null, 2)}</pre>
                  <p style={{ fontSize: "11px", color: "#475569", marginTop: "8px", direction: "rtl" }}>
                    استخدم <code style={{ color: "#86efac", fontFamily: "monospace" }}>imageFullUrl</code> مباشرة في n8n للخطوات اللاحقة (إرسال تيليغرام، رفع Drive...).
                  </p>
                </div>

                {/* ── حقول الصور المدعومة ── */}
                <div style={SECTION}>
                  <p style={{ ...SL, marginBottom: "8px" }}>حقول الصور المدعومة</p>
                  {[
                    ["backgroundImageUrl", "رابط صورة الخلفية (URL مباشر)"],
                    ["logoImageUrl",       "رابط صورة الشعار (URL مباشر)"],
                    ["overlayImageUrl",    "رابط صورة الإطار (URL مباشر)"],
                    ["backgroundPhotoFilename", "اسم ملف مرفوع مسبقًا عبر /api/photo/upload"],
                    ["logoPhotoFilename",        "اسم ملف الشعار المرفوع"],
                    ["overlayPhotoFilename",     "اسم ملف الإطار المرفوع"],
                  ].map(([field, desc]) => (
                    <div key={field} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #1e293b", gap: "8px" }}>
                      <code style={{ fontSize: "11px", color: "#a5f3fc", fontFamily: "monospace", flexShrink: 0 }}>{field}</code>
                      <span style={{ fontSize: "11px", color: "#64748b", textAlign: "right" }}>{desc}</span>
                    </div>
                  ))}
                </div>

                {/* ── القوالب المتاحة ── */}
                <div style={SECTION}>
                  <p style={{ ...SL, marginBottom: "8px" }}>معرّفات القوالب (templateId)</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => navigator.clipboard.writeText(t.id)} style={{ padding: "3px 8px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "6px", color: "#94a3b8", fontSize: "11px", cursor: "pointer", fontFamily: "monospace" }} title="نسخ">
                        {t.id}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "#475569", marginTop: "6px" }}>اضغط على أي معرّف لنسخه</p>
                </div>

                {/* ── Telegram quick send ── */}
                <div style={SECTION}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span>✈️</span>
                    <p style={{ ...SL, marginBottom: 0 }}>إرسال سريع لتيليغرام</p>
                  </div>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px", direction: "rtl" }}>إرسال البطاقة الحالية مباشرة لأي قناة أو مجموعة</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input value={botToken} onChange={e => setBotToken(e.target.value)} placeholder="Bot Token" dir="ltr"
                      style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 10px", fontSize: "12px", outline: "none", fontFamily: "monospace" }} />
                    <input value={chatId} onChange={e => setChatId(e.target.value)} placeholder="Chat ID (مثلاً: -100123456789)" dir="ltr"
                      style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 10px", fontSize: "12px", outline: "none", fontFamily: "monospace" }} />
                    <button onClick={handleTelegramSend} disabled={isSendingTg} style={{ width: "100%", padding: "10px", background: isSendingTg ? "#334155" : "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: isSendingTg ? "wait" : "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}>
                      {isSendingTg ? "⏳ جاري الإرسال..." : "✈️ إرسال البطاقة الحالية"}
                    </button>
                  </div>
                </div>

                {/* ── Telegram bot status ── */}
                <div style={SECTION}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "16px" }}>🤖</span>
                    <p style={{ ...SL, marginBottom: 0 }}>بوت تيليغرام الآلي</p>
                  </div>
                  {botStatus ? (
                    <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "10px 14px" }}>
                      <div style={{ color: "#22c55e", fontSize: "13px", fontWeight: 600 }}>البوت مرتبط ✓</div>
                      <div style={{ color: "#86efac", fontSize: "12px", fontFamily: "monospace" }}>@{botStatus.username}</div>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(71,85,105,0.2)", border: "1px solid #334155", borderRadius: "8px", padding: "10px 14px" }}>
                      <div style={{ color: "#94a3b8", fontSize: "12px", direction: "rtl" }}>أرسل أي رسالة للبوت لاستخدامه — يُولّد بطاقات تلقائيًا من الصور والنصوص.</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ══ SETTINGS TAB ══ */}
            {activeTab === "settings" && (
              <>
                {/* Aspect ratio */}
                <div style={SECTION}>
                  <p style={SL}>نسبة الصورة</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {(Object.entries(ASPECT_RATIOS) as [AspectRatio, { label: string; export: string }][]).map(([ratio, info]) => {
                      const icons: Record<string, string> = { "1:1": "⬛", "16:9": "▬", "4:5": "▮", "9:16": "📱" };
                      return (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)} style={{
                          padding: "12px 8px", borderRadius: "10px",
                          border: aspectRatio === ratio ? "2px solid #3b82f6" : "2px solid #1e293b",
                          background: aspectRatio === ratio ? "#1e3a5f" : "#0f172a",
                          color: aspectRatio === ratio ? "#93c5fd" : "#94a3b8",
                          cursor: "pointer", fontFamily: "'Cairo', sans-serif", textAlign: "center",
                        }}>
                          <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icons[ratio]}</div>
                          <div style={{ fontWeight: 700, fontSize: "13px" }}>{info.label}</div>
                          <div style={{ fontSize: "10px", opacity: 0.7, fontFamily: "monospace" }}>{info.export}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logo position */}
                <div style={SECTION}>
                  <p style={SL}>موضع الشعار</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {([
                      { pos: "top-right" as LogoPos,    label: "يمين ↑" },
                      { pos: "top-left" as LogoPos,     label: "يسار ↑" },
                      { pos: "bottom-right" as LogoPos, label: "يمين ↓" },
                      { pos: "bottom-left" as LogoPos,  label: "يسار ↓" },
                    ]).map(({ pos, label: lbl }) => (
                      <button key={pos} onClick={() => setLogoPos(pos)} style={{
                        padding: "9px", borderRadius: "8px",
                        border: logoPos === pos ? "2px solid #3b82f6" : "2px solid #1e293b",
                        background: logoPos === pos ? "#1e3a5f" : "#0f172a",
                        color: logoPos === pos ? "#93c5fd" : "#94a3b8",
                        cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif",
                      }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image position (shown only when bg image exists) */}
                {bgImage && (
                  <div style={SECTION}>
                    <p style={SL}>موضع الصورة</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { label: "أفقي", value: imgPositionX, onChange: setImgPositionX },
                        { label: "عمودي", value: imgPositionY, onChange: setImgPositionY },
                      ].map(({ label: lbl, value, onChange }) => (
                        <div key={lbl}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                            <span>{lbl === "أفقي" ? "أفقي" : "عمودي"}</span>
                            <div style={{ display: "flex", gap: "16px" }}>
                              <span>{lbl === "أفقي" ? "يمين" : "أعلى"}</span>
                              <span>{lbl === "أفقي" ? "يسار" : "أسفل"}</span>
                            </div>
                          </div>
                          <input type="range" min={0} max={100} value={value}
                            onChange={e => onChange(+e.target.value)} style={{ width: "100%" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Watermark ── */}
                <div style={SECTION}>
                  <p style={SL}>علامة مائية (Watermark)</p>
                  <p style={{ fontSize: "11px", color: "#475569", margin: "0 0 10px", direction: "rtl" }}>
                    نص يظهر بشكل قطري شفاف فوق البطاقة كاملة
                  </p>
                  <input
                    value={watermarkText}
                    onChange={e => setWatermarkText(e.target.value)}
                    placeholder="مثال: حقوق محفوظة ©"
                    dir="rtl"
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif", marginBottom: "12px", boxSizing: "border-box" }}
                  />
                  {watermarkText && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                        <span>الشفافية</span>
                        <span>{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range" min={5} max={80} step={1}
                        value={Math.round(watermarkOpacity * 100)}
                        onChange={e => setWatermarkOpacity(Number(e.target.value) / 100)}
                        style={{ width: "100%" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#475569", marginTop: "2px" }}>
                        <span>5%</span><span>خفيف جداً ← متوسط → واضح</span><span>80%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Export info */}
                <div style={SECTION}>
                  <p style={SL}>معلومات التصدير</p>
                  <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 2.2 }}>
                    <div>📐 النسبة: <strong style={{ color: "#f1f5f9" }}>{aspectRatio}</strong></div>
                    <div>📏 المعاينة: <strong style={{ color: "#f1f5f9" }}>{cardW}×{cardH}</strong></div>
                    <div>📤 التصدير: <strong style={{ color: "#f1f5f9" }}>{ASPECT_RATIOS[aspectRatio].export}</strong></div>
                    <div>🎨 القالب: <strong style={{ color: "#f1f5f9" }}>{tmpl.name}</strong></div>
                    <div>🔤 الخط: <strong style={{ color: "#f1f5f9" }}>{font}</strong></div>
                  </div>
                </div>
              </>
            )}

          </div>
        </aside>

        {/* ── Right: Card preview ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "#0a0f1a", overflowY: "auto", gap: "14px" }}>

          {/* Card */}
          <div
            ref={cardRef}
            style={{
              width: cardW, height: cardH,
              position: "relative", overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              borderRadius: "4px", flexShrink: 0,
              background: "#1a2035",
            }}
          >
            {/* ── Photo area ─────────────────────────────────────────── */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: isFade ? "100%" : `${photoH}%`, overflow: "hidden" }}>
              {bgImage ? (
                <img src={bgImage} alt="bg" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${imgPositionX}% ${imgPositionY}%` }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a2035,#2d3748)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "28px", opacity: 0.5 }}>🖼️</div>
                  <p style={{ color: "#64748b", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>أضف صورة الخلفية</p>
                </div>
              )}
            </div>

            {/* ── Banner background (always rendered, text only in classic mode) ── */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: isFade ? "100%" : `${bannerH}%`,
              background: tmpl.bannerGradient || tmpl.bannerColor,
              borderRadius: tmpl.bannerBorderRadius,
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: isFade ? "0 14px 14px" : "10px 14px 10px",
              direction: "rtl",
              zIndex: 2,
            }}>
              {/* Classic mode: text lives inside banner */}
              {!canvasMode && (
                <>
                  {tmpl.showQuote && (
                    <div style={{ position: "absolute", top: 8, right: 10, fontSize: "30px", color: tmpl.accentColor || "#dc2626", lineHeight: 1, fontFamily: "Georgia, serif", opacity: 0.85 }}>❝</div>
                  )}
                  <p style={{ color: tmpl.textColor, fontSize: `${fontSize}px`, fontWeight, fontFamily: `'${font}', sans-serif`, lineHeight: 1.45, margin: 0, marginTop: tmpl.showQuote ? "24px" : 0, textShadow: textShadow ? "0 1px 4px rgba(0,0,0,0.7)" : "none", textAlign: headlineAlign }}>
                    {headline || "أدخل العنوان هنا..."}
                  </p>
                  {showSubtitle && subtitle && (
                    <p style={{ color: tmpl.labelColor, fontSize: `${Math.max(11, fontSize - 8)}px`, fontFamily: `'${font}', sans-serif`, margin: "5px 0 0", lineHeight: 1.4, textAlign: subtitleAlign }}>{subtitle}</p>
                  )}
                  {showLabel && label && (
                    <div style={{ marginTop: "6px", alignSelf: labelAlign === "center" ? "center" : labelAlign === "left" ? "flex-end" : "flex-start", background: tmpl.isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.1)", borderRadius: "4px", padding: "2px 8px" }}>
                      <span style={{ color: tmpl.labelColor, fontSize: "10px", fontFamily: `'${font}', sans-serif` }}>{label}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Custom overlay (z-index 5 — above banner background, below canvas elements) ── */}
            {overlayImage && (
              <img src={overlayImage} alt="overlay" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill", pointerEvents: "none", zIndex: 5 }} />
            )}

            {/* ── Classic mode: Logo at fixed position ── */}
            {!canvasMode && (
              useLogoText && logoText ? (
                <div style={{ ...logoBoxStyle(), border: "none", background: "rgba(0,0,0,0.3)", zIndex: 6 }}>
                  <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: 700, fontFamily: `'${font}', sans-serif` }}>{logoText}</span>
                </div>
              ) : logoImage ? (
                <img src={logoImage} alt="logo" style={{ ...logoStyle(), filter: logoInvert ? "invert(1)" : "none", zIndex: 6 }} />
              ) : (
                <div style={{ ...logoBoxStyle(), zIndex: 6 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontFamily: "'Cairo', sans-serif" }}>شعار</span>
                </div>
              )
            )}

            {/* ── Watermark (above overlay in both modes) ── */}
            {watermarkText && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: canvasMode ? 12 : 7 }}>
                <span style={{ fontSize: `${Math.max(10, fontSize * 0.85)}px`, color: `rgba(255,255,255,${watermarkOpacity})`, fontFamily: `'${font}', sans-serif`, fontWeight: 700, transform: "rotate(-30deg)", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                  {watermarkText}
                </span>
              </div>
            )}

            {/* ── CANVAS MODE: freely draggable elements (z-index 11+) ── */}
            {canvasMode && (
              <div
                onMouseDown={(e) => { if (e.target === e.currentTarget) setSelElem(null); }}
                style={{ position: "absolute", inset: 0, zIndex: 11 }}
              >

                {/* ── Reusable canvas element wrapper ── */}
                {(
                  [
                    {
                      key: "headline" as ElemKey,
                      rect: canvasLayout.headline,
                      label: "عنوان",
                      content: (
                        <p style={{ color: customTextColor || tmpl.textColor, fontSize: `${fontSize}px`, fontWeight, fontFamily: `'${font}', sans-serif`, lineHeight: 1.45, margin: 0, textAlign: headlineAlign, textShadow: textShadow ? "0 1px 4px rgba(0,0,0,0.7)" : "none", pointerEvents: "none", direction: "rtl" }}>
                          {headline || "أدخل العنوان هنا..."}
                        </p>
                      ),
                    },
                    ...(showSubtitle && subtitle ? [{
                      key: "subtitle" as ElemKey,
                      rect: canvasLayout.subtitle,
                      label: "ترجمة",
                      content: (
                        <p style={{ color: tmpl.labelColor, fontSize: `${Math.max(11, fontSize - 8)}px`, fontFamily: `'${font}', sans-serif`, margin: 0, lineHeight: 1.4, textAlign: subtitleAlign, pointerEvents: "none", direction: "rtl" }}>{subtitle}</p>
                      ),
                    }] : []),
                    ...(showLabel && label ? [{
                      key: "label" as ElemKey,
                      rect: canvasLayout.label,
                      label: "تصنيف",
                      content: (
                        <div style={{ background: tmpl.isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.1)", borderRadius: "4px", padding: "2px 8px", display: "inline-block", pointerEvents: "none" }}>
                          <span style={{ color: tmpl.labelColor, fontSize: "10px", fontFamily: `'${font}', sans-serif` }}>{label}</span>
                        </div>
                      ),
                    }] : []),
                    {
                      key: "logo" as ElemKey,
                      rect: canvasLayout.logo,
                      label: "شعار",
                      content: useLogoText && logoText ? (
                        <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "4px", padding: "3px 8px", display: "inline-block", pointerEvents: "none" }}>
                          <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: 700, fontFamily: `'${font}', sans-serif` }}>{logoText}</span>
                        </div>
                      ) : logoImage ? (
                        <img src={logoImage} alt="logo" style={{ width: "100%", height: "auto", objectFit: "contain", filter: logoInvert ? "invert(1)" : "none", display: "block", pointerEvents: "none" }} />
                      ) : (
                        <div style={{ background: "rgba(255,255,255,0.08)", border: "1px dashed rgba(255,255,255,0.3)", borderRadius: "4px", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontFamily: "'Cairo', sans-serif" }}>شعار</span>
                        </div>
                      ),
                    },
                  ] as { key: ElemKey; rect: { x: number; y: number; w: number } | undefined; label: string; content: React.ReactNode }[]
                ).filter(item => !!item.rect).map(({ key, rect, label: elemLabel, content }) => {
                  const rect2 = rect!;
                  const sel = selElem === key;
                  return (
                    <div
                      key={key}
                      onMouseDown={startDrag(key)}
                      style={{
                        position: "absolute",
                        left: `${rect2.x}%`, top: `${rect2.y}%`, width: `${rect2.w}%`,
                        cursor: "move", userSelect: "none",
                        outline: sel ? "2px solid #6366f1" : "1px dashed rgba(255,255,255,0.25)",
                        borderRadius: "4px",
                        padding: "2px 4px",
                        boxSizing: "border-box",
                        zIndex: sel ? 13 : 11,
                      }}
                    >
                      {content}

                      {/* Label badge (always shown in canvas mode) */}
                      <div style={{
                        position: "absolute", top: -16, left: 0,
                        fontSize: "9px", color: sel ? "#c7d2fe" : "rgba(255,255,255,0.45)",
                        background: sel ? "rgba(99,102,241,0.85)" : "rgba(0,0,0,0.5)",
                        padding: "1px 6px", borderRadius: "3px", whiteSpace: "nowrap",
                        pointerEvents: "none", lineHeight: 1.6,
                      }}>
                        {elemLabel}
                      </div>

                      {/* ── Resize handle — bottom-right corner, large touch target ── */}
                      <div
                        onMouseDown={startResize(key)}
                        onClick={(e) => e.stopPropagation()}
                        title="اسحب لتغيير العرض"
                        style={{
                          position: "absolute",
                          bottom: 0, right: 0,
                          width: 26, height: 26,
                          background: sel ? "#6366f1" : "rgba(99,102,241,0.7)",
                          cursor: "ew-resize",
                          borderRadius: "4px 0 4px 0",
                          zIndex: 15,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", color: "#fff",
                          userSelect: "none",
                          boxShadow: "0 1px 5px rgba(0,0,0,0.5)",
                          lineHeight: 1,
                        }}
                      >
                        ↔
                      </div>
                    </div>
                  );
                })}

              </div>
            )}
          </div>

          {/* Caption + canvas toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: `${cardW}px`, gap: "8px" }}>
            <p style={{ color: "#475569", fontSize: "11px", fontFamily: "Inter, monospace", letterSpacing: "0.02em", margin: 0 }}>
              {cardW}×{cardH} → {ASPECT_RATIOS[aspectRatio].export}
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              {canvasMode && (
                <button
                  onClick={() => setCanvasLayout(CANVAS_DEFAULT)}
                  title="إعادة تعيين المواضع"
                  style={{ padding: "5px 10px", background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", borderRadius: "7px", color: "#94a3b8", cursor: "pointer", fontSize: "11px", fontFamily: "'Cairo', sans-serif" }}
                >↺ إعادة</button>
              )}
              <button
                onClick={() => { setCanvasMode(p => !p); setSelElem(null); }}
                style={{
                  padding: "5px 12px",
                  background: canvasMode ? "rgba(99,102,241,0.2)" : "rgba(100,116,139,0.1)",
                  border: `1px solid ${canvasMode ? "rgba(99,102,241,0.6)" : "rgba(100,116,139,0.3)"}`,
                  borderRadius: "7px",
                  color: canvasMode ? "#a5b4fc" : "#94a3b8",
                  cursor: "pointer", fontSize: "12px", fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                  display: "flex", alignItems: "center", gap: "5px",
                }}
              >
                {canvasMode ? "✏️ وضع التصميم الحر — تشغيل" : "✏️ وضع التصميم الحر"}
              </button>
            </div>
          </div>

          {canvasMode && (
            <div style={{ width: "100%", maxWidth: `${cardW}px`, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "8px", padding: "8px 12px", direction: "rtl" }}>
              <p style={{ margin: 0, fontSize: "11px", color: "#a5b4fc", fontFamily: "'Cairo', sans-serif", lineHeight: 1.6 }}>
                🎨 <strong>وضع التصميم الحر:</strong> اسحب أي عنصر (عنوان / شعار / تصنيف) إلى المكان الذي تريده على البطاقة. اسحب الشريط الأزرق على اليمين لتغيير العرض.
              </p>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              width: "100%", maxWidth: `${cardW}px`,
              padding: "13px", background: isDownloading ? "#1d4ed8" : "#3b82f6",
              color: "#fff", border: "none", borderRadius: "10px",
              cursor: isDownloading ? "wait" : "pointer",
              fontSize: "15px", fontWeight: 600, fontFamily: "'Cairo', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "background 0.15s",
            }}
          >
            {isDownloading ? "⏳ جاري التصدير..." : "📥 تحميل البطاقة PNG"}
          </button>

          {/* n8n + Telegram row */}
          <div style={{ width: "100%", maxWidth: `${cardW}px`, display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                const url = `${window.location.origin}/api/generate`;
                navigator.clipboard?.writeText(url).then(() => alert("تم نسخ رابط API ✅"));
              }}
              style={{ flex: 1, padding: "11px", background: "#1a1208", color: "#f59e0b", border: "1px solid #44320a", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'Cairo', sans-serif" }}
            >
              n8n ⚡
            </button>
            <button
              onClick={() => { setActiveTab("api"); }}
              style={{ flex: 1, padding: "11px", background: "#052e16", color: "#4ade80", border: "1px solid #14532d", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'Cairo', sans-serif" }}
            >
              تيليغرام 🔗
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
