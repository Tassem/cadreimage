import { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";

const DEFAULT_HEADLINE = "ترامب يحدد الساعة 8 من مساء الثلاثاء بتوقيت شرق أمريكا نهاية المهلة الممنوحة لإيران";
const DEFAULT_LABEL = "صورة من الأرشيف";

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
  { id: "classic-blue", name: "كلاسيك", bannerColor: "#0f2557", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
  { id: "breaking-red", name: "عاجل", bannerColor: "#7f1d1d", bannerGradient: "linear-gradient(135deg, #991b1b, #7f1d1d)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 60 },
  { id: "modern-black", name: "مودرن", bannerColor: "#0a0a0a", bannerGradient: "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, #000000 100%)", labelColor: "rgba(255,255,255,0.7)", textColor: "#f5f5f5", photoHeight: 70 },
  { id: "emerald", name: "زمرد", bannerColor: "#064e3b", bannerGradient: "linear-gradient(135deg, #065f46, #064e3b)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
  { id: "royal-purple", name: "ملكي", bannerColor: "#3b0764", bannerGradient: "linear-gradient(135deg, #4c1d95, #3b0764)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 60 },
  { id: "gold", name: "ذهبي", bannerColor: "#78350f", bannerGradient: "linear-gradient(135deg, #92400e, #78350f)", labelColor: "rgba(255,255,255,0.85)", textColor: "#fef3c7", photoHeight: 62 },
  { id: "midnight", name: "ليلي", bannerColor: "#1e1b4b", bannerGradient: "linear-gradient(135deg, #312e81, #1e1b4b)", labelColor: "rgba(255,255,255,0.75)", textColor: "#e0e7ff", photoHeight: 60 },
  { id: "slate-fade", name: "تدرج", bannerColor: "transparent", bannerGradient: "linear-gradient(to top, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.6) 60%, transparent 100%)", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 100 },
  { id: "white-quote", name: "بيضاء", bannerColor: "#ffffff", labelColor: "rgba(0,0,0,0.45)", textColor: "#111111", photoHeight: 58, showQuote: true, isLight: true, accentColor: "#dc2626" },
  { id: "purple-wave", name: "موجة", bannerColor: "#7c3aed", bannerGradient: "linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)", labelColor: "rgba(255,255,255,0.8)", textColor: "#ffffff", photoHeight: 60, bannerBorderRadius: "28px 28px 0 0" },
  { id: "crimson", name: "قرمزي", bannerColor: "#dc2626", labelColor: "rgba(255,255,255,0.9)", textColor: "#ffffff", photoHeight: 62 },
  { id: "custom", name: "مخصص", bannerColor: "#0f2557", labelColor: "rgba(255,255,255,0.85)", textColor: "#ffffff", photoHeight: 62 },
];

const ASPECT_RATIOS = {
  "1:1":  { w: 540, h: 540,  label: "مربع 1:1",      export: "1080×1080" },
  "16:9": { w: 540, h: 304,  label: "أفقي 16:9",     export: "1080×608"  },
  "4:5":  { w: 540, h: 675,  label: "بورتريه 4:5",   export: "1080×1350" },
  "9:16": { w: 375, h: 667,  label: "ستوري 9:16",    export: "750×1334"  },
} as const;

type AspectRatio = keyof typeof ASPECT_RATIOS;
type LogoPos = "top-right" | "top-left" | "bottom-right" | "bottom-left";
type TabId = "content" | "design" | "saved" | "typography" | "settings";

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
    logoInvert: boolean;
    logoPos: LogoPos;
    useLogoText: boolean;
    logoText: string;
    showLabel: boolean;
    showSubtitle: boolean;
    imgPositionX: number;
    imgPositionY: number;
    customBannerColor: string;
    customTextColor: string;
    customLabelColor: string;
    customPhotoHeight: number;
    templateHeights: Record<string, number>;
  };
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem("ncg-settings") || "{}"); }
  catch { return {}; }
}

function loadSavedDesigns(): SavedDesign[] {
  try { return JSON.parse(localStorage.getItem("ncg-saved-designs") || "[]"); }
  catch { return []; }
}

export default function Home() {
  const saved = useRef(loadSettings()).current;

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgFileName, setBgFileName] = useState("");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [headline, setHeadline] = useState<string>(saved.headline ?? DEFAULT_HEADLINE);
  const [subtitle, setSubtitle] = useState<string>(saved.subtitle ?? "");
  const [label, setLabel] = useState<string>(saved.label ?? DEFAULT_LABEL);
  const [isDownloading, setIsDownloading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>("content");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(saved.selectedTemplateId ?? "classic-blue");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(saved.aspectRatio ?? "1:1");

  const [font, setFont] = useState<string>(saved.font ?? "Cairo");
  const [fontSize, setFontSize] = useState<number>(saved.fontSize ?? 26);
  const [fontWeight, setFontWeight] = useState<number>(saved.fontWeight ?? 700);
  const [textShadow, setTextShadow] = useState<boolean>(saved.textShadow ?? false);
  // Text alignment per element
  type TextAlign = "right" | "center" | "left";
  const [headlineAlign, setHeadlineAlign] = useState<TextAlign>(saved.headlineAlign ?? "right");
  const [subtitleAlign, setSubtitleAlign] = useState<TextAlign>(saved.subtitleAlign ?? "right");
  const [labelAlign, setLabelAlign]       = useState<TextAlign>(saved.labelAlign ?? "right");
  // Watermark
  const [watermarkText, setWatermarkText]       = useState<string>(saved.watermarkText ?? "");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(saved.watermarkOpacity ?? 0.18);

  const [logoInvert, setLogoInvert] = useState<boolean>(saved.logoInvert ?? false);
  const [logoPos, setLogoPos] = useState<LogoPos>(saved.logoPos ?? "top-right");
  const [useLogoText, setUseLogoText] = useState<boolean>(saved.useLogoText ?? false);
  const [logoText, setLogoText] = useState<string>(saved.logoText ?? "");

  const [showLabel, setShowLabel] = useState<boolean>(saved.showLabel ?? true);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(saved.showSubtitle ?? false);

  const [imgPositionX, setImgPositionX] = useState<number>(saved.imgPositionX ?? 50);
  const [imgPositionY, setImgPositionY] = useState<number>(saved.imgPositionY ?? 50);

  const [customBannerColor, setCustomBannerColor] = useState<string>(saved.customBannerColor ?? "#0f2557");
  const [customTextColor, setCustomTextColor] = useState<string>(saved.customTextColor ?? "#ffffff");
  const [customLabelColor, setCustomLabelColor] = useState<string>(saved.customLabelColor ?? "rgba(255,255,255,0.85)");
  const [customPhotoHeight, setCustomPhotoHeight] = useState<number>(saved.customPhotoHeight ?? 62);
  const [templateHeights, setTemplateHeights] = useState<Record<string, number>>(saved.templateHeights ?? {});

  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(loadSavedDesigns());
  const [saveNameInput, setSaveNameInput] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const rssInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("ncg-settings", JSON.stringify({
      headline, subtitle, label,
      selectedTemplateId, aspectRatio,
      font, fontSize, fontWeight, textShadow,
      logoInvert, logoPos, useLogoText, logoText,
      showLabel, showSubtitle,
      imgPositionX, imgPositionY,
      customBannerColor, customTextColor, customLabelColor, customPhotoHeight, templateHeights,
      headlineAlign, subtitleAlign, labelAlign,
      watermarkText, watermarkOpacity,
    }));
  }, [headline, subtitle, label, selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow, logoInvert, logoPos, useLogoText, logoText, showLabel, showSubtitle, imgPositionX, imgPositionY, customBannerColor, customTextColor, customLabelColor, customPhotoHeight, templateHeights, headlineAlign, subtitleAlign, labelAlign, watermarkText, watermarkOpacity]);

  useEffect(() => {
    localStorage.setItem("ncg-saved-designs", JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  const getCurrentSettings = useCallback(() => ({
    selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow,
    logoInvert, logoPos, useLogoText, logoText,
    showLabel, showSubtitle, imgPositionX, imgPositionY,
    customBannerColor, customTextColor, customLabelColor, customPhotoHeight, templateHeights,
  }), [selectedTemplateId, aspectRatio, font, fontSize, fontWeight, textShadow, logoInvert, logoPos, useLogoText, logoText, showLabel, showSubtitle, imgPositionX, imgPositionY, customBannerColor, customTextColor, customLabelColor, customPhotoHeight, templateHeights]);

  const handleSaveDesign = useCallback(() => {
    const name = saveNameInput.trim();
    if (!name) return;
    const newDesign: SavedDesign = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      settings: getCurrentSettings(),
    };
    setSavedDesigns(prev => [newDesign, ...prev]);
    setSaveNameInput("");
    setShowSaveInput(false);
    setActiveTab("saved");
  }, [saveNameInput, getCurrentSettings]);

  const handleLoadDesign = useCallback((d: SavedDesign) => {
    const s = d.settings;
    setSelectedTemplateId(s.selectedTemplateId);
    setAspectRatio(s.aspectRatio);
    setFont(s.font);
    setFontSize(s.fontSize);
    setFontWeight(s.fontWeight);
    setTextShadow(s.textShadow);
    setLogoInvert(s.logoInvert);
    setLogoPos(s.logoPos);
    setUseLogoText(s.useLogoText);
    setLogoText(s.logoText);
    setShowLabel(s.showLabel);
    setShowSubtitle(s.showSubtitle);
    setImgPositionX(s.imgPositionX);
    setImgPositionY(s.imgPositionY);
    setCustomBannerColor(s.customBannerColor);
    setCustomTextColor(s.customTextColor);
    setCustomLabelColor(s.customLabelColor);
    setCustomPhotoHeight(s.customPhotoHeight);
    setTemplateHeights(s.templateHeights);
    setActiveTab("content");
  }, []);

  const handleDeleteDesign = useCallback((id: string) => {
    setSavedDesigns(prev => prev.filter(d => d.id !== id));
  }, []);

  const getTemplate = useCallback((): Template => {
    const t = TEMPLATES.find(t => t.id === selectedTemplateId)!;
    if (selectedTemplateId === "custom") {
      return { ...t, bannerColor: customBannerColor, bannerGradient: undefined, labelColor: customLabelColor, textColor: customTextColor, photoHeight: customPhotoHeight };
    }
    const overriddenHeight = templateHeights[selectedTemplateId];
    return overriddenHeight !== undefined ? { ...t, photoHeight: overriddenHeight } : t;
  }, [selectedTemplateId, customBannerColor, customLabelColor, customTextColor, customPhotoHeight, templateHeights]);

  const tmpl = getTemplate();
  const isFadeTemplate = tmpl.id === "slate-fade";
  const photoHeightPct = tmpl.photoHeight;
  const bannerHeightPct = 100 - photoHeightPct;
  const { w: cardW, h: cardH } = ASPECT_RATIOS[aspectRatio];

  const logoPositionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: "absolute", height: "38px", width: "auto", maxWidth: "120px", objectFit: "contain" };
    if (logoPos === "top-right")    return { ...base, top: 14, right: 14 };
    if (logoPos === "top-left")     return { ...base, top: 14, left: 14 };
    if (logoPos === "bottom-right") return { ...base, bottom: 14, right: 14 };
    return { ...base, bottom: 14, left: 14 };
  };

  const logoPlaceholderStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: "absolute", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.12)", borderRadius: "4px", padding: "4px 10px", border: "1px dashed rgba(255,255,255,0.25)" };
    if (logoPos === "top-right")    return { ...base, top: 12, right: 12 };
    if (logoPos === "top-left")     return { ...base, top: 12, left: 12 };
    if (logoPos === "bottom-right") return { ...base, bottom: 12, right: 12 };
    return { ...base, bottom: 12, left: 12 };
  };

  const handleBgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBgFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setBgImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setLogoImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleFetchRss = useCallback(async () => {
    const url = rssInputRef.current?.value?.trim();
    if (!url) return;
    try {
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxy);
      const data = await res.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, "application/xml");
      const firstTitle = doc.querySelector("item > title")?.textContent?.trim();
      if (firstTitle) setHeadline(firstTitle);
      else alert("لم يتم إيجاد عنوان في هذا الـ RSS.");
    } catch {
      alert("تعذّر جلب RSS. تحقق من الرابط.");
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: cardW,
        height: cardH,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `news-card-${aspectRatio.replace(":", "x")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [cardW, cardH, aspectRatio]);

  const FONT_WEIGHTS = [400, 500, 600, 700, 800, 900];

  const tabStyle = (id: TabId) => ({
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: activeTab === id ? 600 : 400,
    background: activeTab === id ? "#3b82f6" : "rgba(255,255,255,0.05)",
    color: activeTab === id ? "#fff" : "#94a3b8",
    transition: "all 0.15s",
    fontFamily: "'Cairo', sans-serif",
    whiteSpace: "nowrap" as const,
  });

  const sectionLabel: React.CSSProperties = { fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", fontFamily: "'Inter', sans-serif" };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "'Cairo', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e293b", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f172a", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>🗞️ مولّد بطاقات الأخبار</h1>
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0, fontFamily: "Inter" }}>Arabic News Card Generator</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          style={{ padding: "9px 20px", background: isDownloading ? "#1d4ed8" : "#3b82f6", color: "#fff", border: "none", borderRadius: "10px", cursor: isDownloading ? "wait" : "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "'Cairo', sans-serif", display: "flex", alignItems: "center", gap: "6px" }}
        >
          {isDownloading ? "⏳ جاري التصدير..." : "📥 تنزيل PNG"}
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden" }}>
        {/* Sidebar Controls */}
        <aside style={{ width: "340px", minWidth: "300px", background: "#111827", borderLeft: "1px solid #1e293b", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          {/* Tabs */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["content", "design", "typography", "settings", "saved"] as TabId[]).map(tab => {
              const labels = { content: "المحتوى", design: "التصميم", typography: "الخط", settings: "إعدادات", saved: `محفوظ (${savedDesigns.length})` };
              return <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{labels[tab]}</button>;
            })}
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>

            {/* CONTENT TAB */}
            {activeTab === "content" && (
              <>
                {/* Headline */}
                <div>
                  <p style={sectionLabel}>العنوان الرئيسي</p>
                  <textarea
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    rows={4}
                    dir="rtl"
                    placeholder="أدخل العنوان الإخباري هنا..."
                    style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#f1f5f9", padding: "10px 12px", fontSize: "15px", fontFamily: `'${font}', sans-serif`, resize: "vertical", outline: "none", lineHeight: 1.6 }}
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ ...sectionLabel, marginBottom: 0 }}>عنوان فرعي</p>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "#94a3b8" }}>
                      <input type="checkbox" checked={showSubtitle} onChange={e => setShowSubtitle(e.target.checked)} />
                      إظهار
                    </label>
                  </div>
                  {showSubtitle && (
                    <input
                      value={subtitle}
                      onChange={e => setSubtitle(e.target.value)}
                      dir="rtl"
                      placeholder="أدخل عنواناً فرعياً..."
                      style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", fontFamily: `'${font}', sans-serif`, outline: "none" }}
                    />
                  )}
                </div>

                {/* Label */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ ...sectionLabel, marginBottom: 0 }}>نص التسمية</p>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "#94a3b8" }}>
                      <input type="checkbox" checked={showLabel} onChange={e => setShowLabel(e.target.checked)} />
                      إظهار
                    </label>
                  </div>
                  {showLabel && (
                    <input
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      dir="rtl"
                      style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", fontFamily: `'${font}', sans-serif`, outline: "none" }}
                    />
                  )}
                </div>

                {/* Background Image */}
                <div>
                  <p style={sectionLabel}>صورة الخلفية</p>
                  <button onClick={() => bgInputRef.current?.click()} style={{ width: "100%", padding: "10px", background: "#1e293b", border: "1px dashed #334155", borderRadius: "10px", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>
                    {bgFileName ? `✅ ${bgFileName}` : "📁 اختر صورة..."}
                  </button>
                  <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} style={{ display: "none" }} />
                  {bgImage && (
                    <button onClick={() => { setBgImage(null); setBgFileName(""); }} style={{ marginTop: "6px", fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>× حذف الصورة</button>
                  )}
                </div>

                {/* Image Position */}
                {bgImage && (
                  <div>
                    <p style={sectionLabel}>موضع الصورة</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                          <span>أفقي</span><span>{imgPositionX}%</span>
                        </div>
                        <input type="range" min={0} max={100} value={imgPositionX} onChange={e => setImgPositionX(+e.target.value)} style={{ width: "100%" }} />
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                          <span>عمودي</span><span>{imgPositionY}%</span>
                        </div>
                        <input type="range" min={0} max={100} value={imgPositionY} onChange={e => setImgPositionY(+e.target.value)} style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* RSS Import */}
                <div>
                  <p style={sectionLabel}>استيراد من RSS</p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input ref={rssInputRef} type="url" dir="ltr" placeholder="https://..." style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "8px 10px", fontSize: "12px", outline: "none" }} />
                    <button onClick={handleFetchRss} style={{ padding: "8px 14px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>جلب</button>
                  </div>
                </div>

                {/* Save Design */}
                <div>
                  <p style={sectionLabel}>حفظ التصميم</p>
                  {!showSaveInput ? (
                    <button onClick={() => setShowSaveInput(true)} style={{ width: "100%", padding: "9px", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>💾 حفظ الإعدادات الحالية</button>
                  ) : (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input autoFocus value={saveNameInput} onChange={e => setSaveNameInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSaveDesign(); if (e.key === "Escape") setShowSaveInput(false); }} placeholder="اسم التصميم..." dir="rtl" style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif" }} />
                      <button onClick={handleSaveDesign} style={{ padding: "8px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>حفظ</button>
                      <button onClick={() => setShowSaveInput(false)} style={{ padding: "8px", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>✕</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* DESIGN TAB */}
            {activeTab === "design" && (
              <>
                {/* Templates */}
                <div>
                  <p style={sectionLabel}>القوالب</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        style={{
                          padding: "10px 6px",
                          borderRadius: "10px",
                          border: selectedTemplateId === t.id ? "2px solid #3b82f6" : "2px solid transparent",
                          background: t.isLight ? "#f8f8f8" : (t.bannerGradient || t.bannerColor),
                          color: t.textColor,
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          fontFamily: "'Cairo', sans-serif",
                          boxShadow: selectedTemplateId === t.id ? "0 0 0 3px rgba(59,130,246,0.3)" : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Template Colors */}
                {selectedTemplateId === "custom" && (
                  <div>
                    <p style={sectionLabel}>ألوان مخصصة</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { label: "لون الشريط", value: customBannerColor, onChange: setCustomBannerColor },
                        { label: "لون العنوان", value: customTextColor, onChange: setCustomTextColor },
                      ].map(({ label: lbl, value, onChange }) => (
                        <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1e293b", borderRadius: "8px", padding: "8px 12px" }}>
                          <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{lbl}</span>
                          <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer" }} />
                        </div>
                      ))}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                          <span>ارتفاع الصورة</span><span>{customPhotoHeight}%</span>
                        </div>
                        <input type="range" min={30} max={90} value={customPhotoHeight} onChange={e => setCustomPhotoHeight(+e.target.value)} style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Aspect Ratio */}
                <div>
                  <p style={sectionLabel}>نسبة العرض</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {(Object.entries(ASPECT_RATIOS) as [AspectRatio, { label: string; export: string }][]).map(([ratio, info]) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        style={{ padding: "10px", borderRadius: "10px", border: aspectRatio === ratio ? "2px solid #3b82f6" : "2px solid #1e293b", background: aspectRatio === ratio ? "#1e3a5f" : "#1e293b", color: aspectRatio === ratio ? "#93c5fd" : "#94a3b8", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif", textAlign: "center" }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: "2px" }}>{ratio}</div>
                        <div style={{ fontSize: "10px" }}>{info.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <p style={sectionLabel}>الشعار</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#94a3b8" }}>
                      <input type="checkbox" checked={useLogoText} onChange={e => setUseLogoText(e.target.checked)} />
                      استخدام نص بدلاً من صورة
                    </label>
                    {useLogoText ? (
                      <input value={logoText} onChange={e => setLogoText(e.target.value)} dir="rtl" placeholder="اسم الموقع أو القناة..." style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif" }} />
                    ) : (
                      <>
                        <button onClick={() => logoInputRef.current?.click()} style={{ width: "100%", padding: "9px", background: "#1e293b", border: "1px dashed #334155", borderRadius: "10px", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>
                          {logoFileName ? `✅ ${logoFileName}` : "📁 رفع الشعار..."}
                        </button>
                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                        {logoImage && (
                          <>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#94a3b8" }}>
                              <input type="checkbox" checked={logoInvert} onChange={e => setLogoInvert(e.target.checked)} />
                              عكس ألوان الشعار (أبيض)
                            </label>
                            <button onClick={() => { setLogoImage(null); setLogoFileName(""); }} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", textAlign: "right", fontFamily: "'Cairo', sans-serif" }}>× حذف الشعار</button>
                          </>
                        )}
                      </>
                    )}

                    {/* Logo Position */}
                    <div>
                      <p style={{ ...sectionLabel, marginTop: "4px" }}>موضع الشعار</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {(["top-right", "top-left", "bottom-right", "bottom-left"] as LogoPos[]).map(pos => {
                          const labels: Record<LogoPos, string> = { "top-right": "↖ أعلى يمين", "top-left": "↗ أعلى يسار", "bottom-right": "↙ أسفل يمين", "bottom-left": "↘ أسفل يسار" };
                          return (
                            <button key={pos} onClick={() => setLogoPos(pos)} style={{ padding: "8px", borderRadius: "8px", border: logoPos === pos ? "2px solid #3b82f6" : "2px solid #1e293b", background: logoPos === pos ? "#1e3a5f" : "#1e293b", color: logoPos === pos ? "#93c5fd" : "#94a3b8", cursor: "pointer", fontSize: "11px", fontFamily: "'Cairo', sans-serif" }}>
                              {labels[pos]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TYPOGRAPHY TAB */}
            {activeTab === "typography" && (
              <>
                <div>
                  <p style={sectionLabel}>الخط العربي</p>
                  <select value={font} onChange={e => setFont(e.target.value)} style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#f1f5f9", padding: "10px 12px", fontSize: "14px", outline: "none", fontFamily: `'${font}', sans-serif`, cursor: "pointer" }}>
                    {ARABIC_FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
                  </select>
                  <p style={{ fontSize: "22px", fontFamily: `'${font}', sans-serif`, color: "#e2e8f0", marginTop: "10px", textAlign: "right", lineHeight: 1.5 }}>
                    الأخبار العاجلة
                  </p>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    <span>حجم الخط</span><span>{fontSize}px</span>
                  </div>
                  <input type="range" min={14} max={48} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={{ width: "100%" }} />
                </div>

                <div>
                  <p style={sectionLabel}>سماكة الخط</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
                    {FONT_WEIGHTS.map(w => (
                      <button key={w} onClick={() => setFontWeight(w)} style={{ padding: "8px 4px", borderRadius: "8px", border: fontWeight === w ? "2px solid #3b82f6" : "2px solid #1e293b", background: fontWeight === w ? "#1e3a5f" : "#1e293b", color: fontWeight === w ? "#93c5fd" : "#94a3b8", cursor: "pointer", fontSize: "12px", fontWeight: w, fontFamily: "'Cairo', sans-serif" }}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#94a3b8" }}>
                  <input type="checkbox" checked={textShadow} onChange={e => setTextShadow(e.target.checked)} />
                  إضافة ظل للنص
                </label>

                {/* Text alignment per element */}
                {(() => {
                  const sectionLabel2: React.CSSProperties = { fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" };
                  const items: { label: string; value: TextAlign; set: (v: TextAlign) => void }[] = [
                    { label: "العنوان الرئيسي", value: headlineAlign, set: setHeadlineAlign },
                    { label: "النص الفرعي",     value: subtitleAlign, set: setSubtitleAlign },
                    { label: "التسمية",          value: labelAlign,   set: setLabelAlign },
                  ];
                  return (
                    <div>
                      <p style={{ ...sectionLabel2, marginTop: "4px" }}>محاذاة النص</p>
                      {items.map(item => (
                        <div key={item.label} style={{ marginBottom: "10px" }}>
                          <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>{item.label}</p>
                          <div style={{ display: "flex", gap: "5px" }}>
                            {(["right", "center", "left"] as TextAlign[]).map(a => {
                              const icons: Record<TextAlign, string> = { right: "←", center: "≡", left: "→" };
                              const labels2: Record<TextAlign, string> = { right: "يمين", center: "وسط", left: "يسار" };
                              const active = a === item.value;
                              return (
                                <button key={a} onClick={() => item.set(a)} style={{ flex: 1, padding: "6px 4px", borderRadius: "7px", border: active ? "2px solid #3b82f6" : "2px solid #1e293b", background: active ? "#1e3a5f" : "#1e293b", color: active ? "#93c5fd" : "#64748b", cursor: "pointer", fontSize: "11px", fontFamily: "'Cairo', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{icons[a]}</span>
                                  <span>{labels2[a]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <>
                <div>
                  <p style={sectionLabel}>ارتفاع الصورة (للقالب الحالي)</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    <span>{templateHeights[selectedTemplateId] ?? tmpl.photoHeight}%</span>
                  </div>
                  <input
                    type="range" min={30} max={90}
                    value={templateHeights[selectedTemplateId] ?? tmpl.photoHeight}
                    onChange={e => setTemplateHeights(prev => ({ ...prev, [selectedTemplateId]: +e.target.value }))}
                    style={{ width: "100%" }}
                  />
                  <button onClick={() => setTemplateHeights(prev => { const n = { ...prev }; delete n[selectedTemplateId]; return n; })} style={{ marginTop: "6px", fontSize: "12px", color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>إعادة تعيين</button>
                </div>

                {/* Watermark */}
                <div>
                  <p style={sectionLabel}>علامة مائية (Watermark)</p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 8px", direction: "rtl" }}>
                    نص شفاف قطري فوق البطاقة
                  </p>
                  <input
                    value={watermarkText}
                    onChange={e => setWatermarkText(e.target.value)}
                    placeholder="مثال: حقوق محفوظة ©"
                    dir="rtl"
                    style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", padding: "9px 12px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif", marginBottom: "10px", boxSizing: "border-box" }}
                  />
                  {watermarkText && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                        <span>الشفافية</span>
                        <span>{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range" min={5} max={80} step={1}
                        value={Math.round(watermarkOpacity * 100)}
                        onChange={e => setWatermarkOpacity(Number(e.target.value) / 100)}
                        style={{ width: "100%" }}
                      />
                    </>
                  )}
                </div>

                <div>
                  <p style={sectionLabel}>معلومات التصدير</p>
                  <div style={{ background: "#1e293b", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#94a3b8", lineHeight: 2 }}>
                    <div>📐 نسبة العرض: <strong style={{ color: "#f1f5f9" }}>{aspectRatio}</strong></div>
                    <div>📏 حجم المعاينة: <strong style={{ color: "#f1f5f9" }}>{cardW}×{cardH}</strong></div>
                    <div>📤 حجم التصدير: <strong style={{ color: "#f1f5f9" }}>{ASPECT_RATIOS[aspectRatio].export}</strong></div>
                    <div>🎨 القالب: <strong style={{ color: "#f1f5f9" }}>{tmpl.name}</strong></div>
                    <div>🔤 الخط: <strong style={{ color: "#f1f5f9" }}>{font}</strong></div>
                  </div>
                </div>
              </>
            )}

            {/* SAVED TAB */}
            {activeTab === "saved" && (
              <>
                <div>
                  {savedDesigns.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0", fontSize: "14px" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>💾</div>
                      لا توجد تصاميم محفوظة بعد
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {savedDesigns.map(d => (
                        <div key={d.id} style={{ background: "#1e293b", borderRadius: "10px", padding: "12px", border: "1px solid #334155" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>{d.name}</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{new Date(d.createdAt).toLocaleDateString("ar-SA")}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>
                            {TEMPLATES.find(t => t.id === d.settings.selectedTemplateId)?.name} • {d.settings.aspectRatio} • {d.settings.font}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => handleLoadDesign(d)} style={{ flex: 1, padding: "7px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Cairo', sans-serif" }}>تحميل</button>
                            <button onClick={() => handleDeleteDesign(d.id)} style={{ padding: "7px 12px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>حذف</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Main Preview Area */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", background: "#0a0f1a", overflowY: "auto" }}>
          {/* Card Preview */}
          <div
            ref={cardRef}
            style={{
              width: cardW,
              height: cardH,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              borderRadius: "4px",
              flexShrink: 0,
              background: "#222",
            }}
          >
            {/* Photo Section */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: isFadeTemplate ? "100%" : `${photoHeightPct}%`,
                overflow: "hidden",
              }}
            >
              {bgImage ? (
                <img
                  src={bgImage}
                  alt="bg"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${imgPositionX}% ${imgPositionY}%` }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a2035, #2d3748)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "32px" }}>🖼️</div>
                  <p style={{ color: "#64748b", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>أضف صورة الخلفية</p>
                </div>
              )}
            </div>

            {/* Banner Section */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: isFadeTemplate ? "100%" : `${bannerHeightPct}%`,
                background: tmpl.bannerGradient || tmpl.bannerColor,
                borderRadius: tmpl.bannerBorderRadius,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: isFadeTemplate ? "0 16px 16px" : "12px 16px 14px",
                direction: "rtl",
              }}
            >
              {/* Quote mark */}
              {tmpl.showQuote && (
                <div style={{ position: "absolute", top: 10, right: 12, fontSize: "36px", color: tmpl.accentColor || "#dc2626", lineHeight: 1, fontFamily: "Georgia, serif", opacity: 0.85 }}>❝</div>
              )}

              {/* Headline */}
              <p style={{
                color: tmpl.textColor,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                fontFamily: `'${font}', sans-serif`,
                lineHeight: 1.45,
                margin: 0,
                marginTop: tmpl.showQuote ? "28px" : 0,
                textShadow: textShadow ? "0 1px 4px rgba(0,0,0,0.7)" : "none",
                textAlign: headlineAlign,
              }}>
                {headline || "أدخل العنوان هنا..."}
              </p>

              {/* Subtitle */}
              {showSubtitle && subtitle && (
                <p style={{
                  color: tmpl.labelColor,
                  fontSize: `${Math.max(12, fontSize - 8)}px`,
                  fontWeight: 400,
                  fontFamily: `'${font}', sans-serif`,
                  margin: "6px 0 0",
                  lineHeight: 1.4,
                  textAlign: subtitleAlign,
                }}>
                  {subtitle}
                </p>
              )}

              {/* Label */}
              {showLabel && label && (
                <div style={{
                  marginTop: "8px",
                  alignSelf: labelAlign === "center" ? "center" : labelAlign === "left" ? "flex-end" : "flex-start",
                  background: tmpl.isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  padding: "3px 8px",
                }}>
                  <span style={{ color: tmpl.labelColor, fontSize: "11px", fontFamily: `'${font}', sans-serif` }}>
                    {label}
                  </span>
                </div>
              )}
            </div>

            {/* Logo */}
            {useLogoText && logoText ? (
              <div style={{ ...logoPlaceholderStyle(), border: "none", background: "rgba(0,0,0,0.25)" }}>
                <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 700, fontFamily: `'${font}', sans-serif` }}>{logoText}</span>
              </div>
            ) : logoImage ? (
              <img src={logoImage} alt="logo" style={{ ...logoPositionStyle(), filter: logoInvert ? "invert(1)" : "none" }} />
            ) : (
              <div style={logoPlaceholderStyle()}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Cairo', sans-serif" }}>شعار</span>
              </div>
            )}

            {/* Watermark preview */}
            {watermarkText && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 7 }}>
                <span style={{ fontSize: `${Math.max(10, fontSize * 0.85)}px`, color: `rgba(255,255,255,${watermarkOpacity})`, fontFamily: `'${font}', sans-serif`, fontWeight: 700, transform: "rotate(-30deg)", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                  {watermarkText}
                </span>
              </div>
            )}
          </div>

          {/* Caption */}
          <p style={{ marginTop: "12px", color: "#475569", fontSize: "11px", fontFamily: "Inter, monospace", letterSpacing: "0.02em" }}>
            معاينة مباشرة • {cardW}×{cardH} → يُصدَّر {ASPECT_RATIOS[aspectRatio].export}
          </p>
        </main>
      </div>
    </div>
  );
}
