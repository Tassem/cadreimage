/**
 * Landing — NewsCard Pro
 * Modern SaaS • Figma-quality • RTL/LTR aware • Cairo + Plus Jakarta Sans
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Globe, Menu, X, ChevronDown, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, Star, Zap, Bot, Code2, Palette, Layout,
  LayoutTemplate, Shield, Newspaper, Image as Img, Play,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════ */
/* LANG CONFIG                                                 */
/* ═══════════════════════════════════════════════════════════ */
const LANGS = [
  { code: "ar", label: "العربية", flag: "AR", dir: "rtl" as const, font: "'Cairo', sans-serif" },
  { code: "fr", label: "Français", flag: "FR", dir: "ltr" as const, font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
  { code: "en", label: "English",  flag: "EN", dir: "ltr" as const, font: "'Plus Jakarta Sans', 'Inter', sans-serif" },
];

const useLang = () => {
  const { i18n } = useTranslation();
  return LANGS.find(l => l.code === i18n.language) ?? LANGS[0];
};

/* ═══════════════════════════════════════════════════════════ */
/* DESIGN TOKENS                                               */
/* ═══════════════════════════════════════════════════════════ */
const C = {
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  blue50:  "#EFF6FF",
  blue100: "#DBEAFE",
  blue200: "#BFDBFE",
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate300: "#CBD5E1",
  slate100: "#F1F5F9",
  slate50:  "#F8FAFC",
  white:    "#FFFFFF",
};

/* ═══════════════════════════════════════════════════════════ */
/* LANGUAGE SWITCHER                                           */
/* ═══════════════════════════════════════════════════════════ */
function LangSwitcher({ inDark }: { inDark?: boolean }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  const pick = (l: typeof LANGS[0]) => {
    i18n.changeLanguage(l.code);
    localStorage.setItem("ncg-lang", l.code);
    document.documentElement.dir = l.dir;
    document.documentElement.lang = l.code;
    setOpen(false);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
          ${inDark
            ? "border-white/20 text-white/80 hover:bg-white/10"
            : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 bg-white"}`}
      >
        <Globe size={12} />
        <span className="tracking-widest">{cur.flag}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 end-0 z-[200] w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 overflow-hidden"
          >
            {LANGS.map(l => (
              <button key={l.code} onClick={() => pick(l)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-start
                  ${l.code === cur.code
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"}`}
              >
                <span className={`w-7 h-5 flex items-center justify-center rounded text-[10px] font-black
                  ${l.code === cur.code ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {l.flag}
                </span>
                {l.label}
                {l.code === cur.code && <CheckCircle2 size={12} className="ms-auto text-blue-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* NAVBAR                                                      */
/* ═══════════════════════════════════════════════════════════ */
function Navbar({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", v => setScrolled(v > 10));
    return unsub;
  }, [scrollY]);

  const links = [
    { id: "features", label: t("nav.features") },
    { id: "how",      label: t("nav.howItWorks") },
    { id: "pricing",  label: t("nav.pricing") },
  ];

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header
      style={{ fontFamily: lang.font }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-white/98 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
          : "bg-white/90 backdrop-blur-sm"}`}
    >
      <div className="max-w-6xl mx-auto px-5 h-[62px] flex items-center gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
            <Newspaper size={15} className="text-white" />
          </div>
          <span style={{ fontFamily: lang.dir === "rtl" ? "'Cairo'" : "'Plus Jakarta Sans'" }}
            className="font-extrabold text-slate-900 text-[15px] tracking-tight">
            NewsCard <span className="text-blue-600">Pro</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 ms-6">
          {links.map(l => (
            <button key={l.id} onClick={() => go(l.id)}
              className="px-3.5 py-2 text-sm text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all font-medium">
              {l.label}
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 ms-auto">
          <LangSwitcher />
          <a href="/pro/"
            className="hidden sm:block text-sm text-slate-500 hover:text-slate-900 font-medium px-1 transition-colors">
            {t("nav.dashboard")}
          </a>
          <button onClick={onTool}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm shadow-blue-200">
            {t("nav.tryFree")}
          </button>
          <button className="md:hidden p-1.5 text-slate-500" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-1">
              {links.map(l => (
                <button key={l.id} onClick={() => go(l.id)}
                  className="text-start px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl font-medium">
                  {l.label}
                </button>
              ))}
              <a href="/pro/" className="px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl font-medium">
                {t("nav.dashboard")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* PRODUCT MOCKUP — the visual centerpiece                     */
/* ═══════════════════════════════════════════════════════════ */
function ProductMockup() {
  const templates = [
    { label: "عاجل", color: "#DC2626", bg: "from-red-950 via-red-900 to-slate-900", text: "القمة العربية تنتهي بإعلان وثيقة السلام" },
    { label: "اقتصاد", color: "#D97706", bg: "from-slate-800 via-slate-700 to-slate-900", text: "البنك المركزي يرفع أسعار الفائدة للمرة الثالثة" },
    { label: "رياضة", color: "#059669", bg: "from-emerald-950 via-slate-800 to-slate-900", text: "المنتخب الوطني يتأهل إلى نهائيات كأس العالم" },
  ];

  return (
    <div className="relative w-full">
      {/* Browser chrome frame */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/80 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-2 h-6 bg-white rounded-md border border-slate-200 flex items-center px-3 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-slate-400 text-[10px]" dir="ltr">newscard.pro/generate</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono" dir="ltr">v2.4.1</div>
        </div>

        {/* App UI */}
        <div className="flex h-52 sm:h-64">
          {/* Sidebar */}
          <div className="w-28 sm:w-36 border-e border-slate-100 bg-slate-50 p-3 flex flex-col gap-2 shrink-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">Templates</p>
            {templates.map((tpl, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${i === 1 ? "border-blue-500 shadow-sm shadow-blue-100" : "border-transparent"}`}
              >
                <div className={`bg-gradient-to-br ${tpl.bg} h-10 sm:h-12 relative flex items-end p-1.5`}>
                  <span className="text-[7px] font-bold px-1 py-0.5 rounded text-white"
                    style={{ background: tpl.color }}>{tpl.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Canvas area */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center items-center bg-[#F8FAFF]">
            {/* Card preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-[200px] sm:max-w-[240px]"
            >
              <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200">
                <div className={`bg-gradient-to-br ${templates[1].bg} h-20 sm:h-24 relative`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Simulated grid pattern */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5 p-1.5 opacity-20">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-sm" />)}
                  </div>
                  {/* Label badge */}
                  <span className="absolute bottom-2 start-2 text-[8px] font-black px-1.5 py-0.5 rounded text-white"
                    style={{ background: templates[1].color }}>اقتصاد</span>
                  {/* Logo placeholder */}
                  <div className="absolute top-2 end-2 w-5 h-5 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Newspaper size={8} className="text-white" />
                  </div>
                </div>
                {/* Banner */}
                <div className="p-2.5" style={{ background: "#0f2557" }}>
                  <div className="h-0.5 w-4 rounded bg-amber-400 mb-1.5" />
                  <p className="text-white text-[9px] font-medium leading-tight line-clamp-2">
                    {templates[1].text}
                  </p>
                  <p className="text-white/40 text-[8px] mt-1.5">٧ أبريل ٢٠٢٦</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Props panel */}
          <div className="w-28 sm:w-36 border-s border-slate-100 bg-white p-3 flex flex-col gap-3 shrink-0">
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-2">Colors</p>
              <div className="flex gap-1.5">
                {["#0f2557","#7f1d1d","#064e3b","#1e1b4b"].map(c => (
                  <div key={c} className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Size</p>
              <div className="flex flex-col gap-1">
                {[["1:1","1080px"],["9:16","Story"],["16:9","Wide"]].map(([ratio, label]) => (
                  <div key={ratio} className={`flex items-center gap-1.5 text-[8px] px-2 py-1 rounded ${ratio === "1:1" ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-500"}`}>
                    <div className={`rounded-sm border ${ratio === "1:1" ? "w-3 h-3 border-blue-400" : ratio === "9:16" ? "w-2 h-3 border-slate-300" : "w-3 h-2 border-slate-300"}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Export</p>
              <button className="w-full py-1.5 bg-blue-600 text-white text-[8px] font-bold rounded-md">
                PNG 1080×1080
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="absolute -top-3 -start-3 bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-slate-700 text-[11px] font-semibold">Live Preview</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
        className="absolute -bottom-3 -end-3 bg-blue-600 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg shadow-blue-200"
      >
        1080 × 1080 px
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
        className="absolute top-1/3 -end-10 sm:-end-12 hidden sm:flex flex-col gap-1 bg-white border border-slate-200 shadow-md rounded-xl p-2.5"
      >
        <div className="text-[9px] text-slate-400 font-semibold mb-1">+10K</div>
        <div className="text-[9px] text-slate-600 font-medium">Cards</div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* HERO                                                        */
/* ═══════════════════════════════════════════════════════════ */
function Hero({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const isRtl = lang.dir === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  /* Content by language */
  const headlines: Record<string, { line1: string; line2: string }> = {
    ar: { line1: "أنت تصنع الخبر،", line2: "ونحن نصنع البطاقة." },
    en: { line1: "You make the news,", line2: "We make the card." },
    fr: { line1: "Vous créez l'actualité,", line2: "Nous créons la carte." },
  };
  const h = headlines[i18n.language] ?? headlines.ar;

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#FAFBFF]" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(219,234,254,0.7) 0%, transparent 100%)" }} />

      <div className="relative max-w-6xl mx-auto px-5 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Text column ── */}
          <div className={`flex flex-col ${isRtl ? "items-start" : "items-start"} order-2 lg:order-1`}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Label badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm">
                <Sparkles size={11} className="text-blue-500" />
                {t("hero.badge")}
              </div>

              {/* Headline */}
              <h1
                style={{ fontFamily: lang.font, letterSpacing: lang.dir === "rtl" ? "0" : "-0.03em" }}
                className="font-black text-slate-900 leading-[1.12] mb-4 text-[clamp(2rem,5vw,3.25rem)]"
              >
                <span className="block">{h.line1}</span>
                <span className="block" style={{ color: C.blue600 }}>{h.line2}</span>
              </h1>

              {/* Sub */}
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                {t("hero.subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <button onClick={onTool}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 font-bold text-sm text-white rounded-xl transition-all"
                  style={{ background: C.blue600 }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.blue700)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.blue600)}
                >
                  <Sparkles size={14} />
                  {t("hero.cta")}
                  <ArrowIcon size={14} />
                </button>
                <a href="/pro/"
                  className="inline-flex items-center gap-2 px-5 py-3.5 font-semibold text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm">
                  <Play size={13} className="text-slate-400" />
                  {i18n.language === "ar" ? "مشاهدة العرض" : i18n.language === "fr" ? "Voir la démo" : "Watch demo"}
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-6 border-t border-slate-200">
                {[
                  { val: "+10K", label: t("hero.stat1") },
                  { val: "20+", label: t("hero.stat2") },
                  { val: "3", label: i18n.language === "ar" ? "لغات" : "Languages" },
                ].map((s, i) => (
                  <div key={i} className={`flex flex-col ${i > 0 ? "ps-6 border-s border-slate-200" : ""}`}>
                    <span className="text-xl font-black text-slate-900" dir="ltr">{s.val}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Product mockup column ── */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ProductMockup />
          </motion.div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* MULTI-LANG SHOWCASE STRIP                                   */
/* shows AR+EN+FR side-by-side so user understands the product */
/* ═══════════════════════════════════════════════════════════ */
function MultiLangStrip() {
  const variants = [
    {
      dir: "rtl" as const,
      lang: "AR",
      font: "'Cairo', sans-serif",
      flag: "🇲🇦",
      headline: "أنت تصنع الخبر،\nونحن نصنع البطاقة.",
      sub: "منصة بطاقات الأخبار العربية",
      cta: "ابدأ مجاناً",
      accent: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    {
      dir: "ltr" as const,
      lang: "EN",
      font: "'Plus Jakarta Sans', sans-serif",
      flag: "🇺🇸",
      headline: "You make the news,\nWe make the card.",
      sub: "Arabic News Card Generator Platform",
      cta: "Try for free",
      accent: "#0891B2",
      bg: "#ECFEFF",
      border: "#A5F3FC",
    },
    {
      dir: "ltr" as const,
      lang: "FR",
      font: "'Plus Jakarta Sans', sans-serif",
      flag: "🇫🇷",
      headline: "Vous créez l'actualité,\nNous créons la carte.",
      sub: "Plateforme de cartes d'actualités",
      cta: "Commencer",
      accent: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-14 px-5 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <div className="text-center mb-8">
          <p className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Globe size={12} /> Multi-language support — AR / EN / FR
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {variants.map((v, i) => (
            <motion.div
              key={v.lang}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              dir={v.dir}
              style={{ fontFamily: v.font, background: v.bg, borderColor: v.border }}
              className="rounded-2xl border-2 p-5 relative overflow-hidden"
            >
              {/* Lang badge */}
              <div className="absolute top-3 end-3 flex items-center gap-1.5">
                <span className="text-sm">{v.flag}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                  style={{ background: v.accent }}>{v.lang}</span>
              </div>

              {/* Text direction indicator */}
              <div className="flex items-center gap-1.5 mb-3">
                {v.dir === "rtl"
                  ? <><ArrowLeft size={10} className="text-slate-400" /><span className="text-[9px] text-slate-400 font-mono">RTL</span></>
                  : <><span className="text-[9px] text-slate-400 font-mono">LTR</span><ArrowRight size={10} className="text-slate-400" /></>
                }
              </div>

              {/* Headline */}
              <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug mb-2 whitespace-pre-line">
                {v.headline}
              </h3>
              <p className="text-slate-500 text-xs mb-4">{v.sub}</p>

              {/* CTA mini */}
              <button className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-opacity hover:opacity-90"
                style={{ background: v.accent }}>
                {v.cta}
              </button>

              {/* Decorative line */}
              <div className="absolute bottom-0 start-0 end-0 h-1 rounded-b-2xl opacity-30"
                style={{ background: `linear-gradient(to end, ${v.accent}, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* FEATURES                                                    */
/* ═══════════════════════════════════════════════════════════ */
const FEAT = [
  { icon: Zap,            key: "item1", accent: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { icon: LayoutTemplate, key: "item2", accent: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { icon: Bot,            key: "item3", accent: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { icon: Palette,        key: "item4", accent: "#DB2777", bg: "#FDF2F8", border: "#FBCFE8" },
  { icon: Layout,         key: "item5", accent: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { icon: Code2,          key: "item6", accent: "#475569", bg: "#F8FAFC", border: "#E2E8F0" },
];

function Features() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="py-20 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <motion.p initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
            className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">
            {t("nav.features")}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3">
            {t("features.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.16 }}
            className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {t("features.subtitle")}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEAT.map(({ icon: Icon, key, accent, bg, border }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="group rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ background: bg, borderColor: border }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white border shadow-sm transition-transform group-hover:scale-110"
                style={{ borderColor: border }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t(`features.${key}.title`)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
              <div className="mt-4 h-0.5 w-8 rounded-full opacity-40" style={{ background: accent }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* HOW IT WORKS                                                */
/* ═══════════════════════════════════════════════════════════ */
function HowItWorks({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const steps = [
    { key: "step1", icon: LayoutTemplate, color: "#2563EB", bg: "#EFF6FF", num: 1 },
    { key: "step2", icon: Img,            color: "#7C3AED", bg: "#F5F3FF", num: 2 },
    { key: "step3", icon: Newspaper,      color: "#059669", bg: "#ECFDF5", num: 3 },
  ];

  return (
    <section id="how" ref={ref} className="py-20 px-5 bg-slate-50 border-y border-slate-100">
      <div className="max-w-5xl mx-auto text-center">
        <motion.p initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
          className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-2">
          {t("nav.howItWorks")}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3">
          {t("howItWorks.title")}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.16 }}
          className="text-slate-500 text-sm mb-14">
          {t("howItWorks.subtitle")}
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          {/* Connector */}
          <div className="hidden sm:block absolute top-8 start-[17%] end-[17%] h-px"
            style={{ background: "linear-gradient(to right, #BFDBFE, #DDD6FE, #A7F3D0)" }} />

          {steps.map(({ key, icon: Icon, color, bg, num }, i) => (
            <motion.div key={key}
              initial={{ opacity: 0, y: 24 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.12 + i * 0.14 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg z-10 border-2 border-white"
                style={{ background: bg }}>
                <Icon size={24} style={{ color }} />
                <span className="absolute -top-2 -end-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white"
                  style={{ background: color }}>{num}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{t(`howItWorks.${key}.title`)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(`howItWorks.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}
          className="mt-12">
          <button onClick={onTool}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md">
            <Sparkles size={14} style={{ color: "#60A5FA" }} />
            {t("nav.tryFree")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* PRICING                                                     */
/* ═══════════════════════════════════════════════════════════ */
function Pricing({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [yearly, setYearly] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="pricing" ref={ref} className="py-20 px-5 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
            className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2">
            {t("nav.pricing")}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3">
            {t("pricing.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.16 }}
            className="text-slate-500 text-sm mb-7">{t("pricing.subtitle")}</motion.p>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.22 }}
            className="inline-flex items-center gap-0.5 p-1 bg-slate-100 border border-slate-200 rounded-xl shadow-inner">
            {[false, true].map(val => (
              <button key={String(val)} onClick={() => setYearly(val)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2
                  ${yearly === val ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {val
                  ? <>{t("pricing.yearly")} <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full font-black">{t("pricing.save")}</span></>
                  : t("pricing.monthly")}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {(["free", "pro"] as const).map((key, i) => {
            const isPro = key === "pro";
            const price = isPro
              ? (yearly ? t("pricing.pro.priceYear") : t("pricing.pro.price"))
              : "0";
            return (
              <motion.div key={key}
                initial={{ opacity: 0, y: 24 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.14 + i * 0.14 }}
                className={`relative rounded-2xl border p-7 flex flex-col transition-all
                  ${isPro
                    ? "bg-blue-600 border-blue-600 shadow-2xl shadow-blue-200"
                    : "bg-white border-slate-200 shadow-sm hover:shadow-md"}`}
              >
                {isPro && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 text-[11px] font-black px-4 py-1.5 rounded-full shadow">
                      <Star size={10} fill="currentColor" />{t("pricing.popular")}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold
                    ${isPro ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {t(`pricing.${key}.name`)}
                  </span>
                </div>
                <p className={`text-xs mb-5 ${isPro ? "text-blue-200" : "text-slate-400"}`}>
                  {t(`pricing.${key}.desc`)}
                </p>

                {/* Price */}
                <div className={`flex items-end gap-1 mb-6 ${isPro ? "text-white" : "text-slate-900"}`} dir="ltr">
                  <span className="text-5xl font-black">{price}</span>
                  {key !== "free" && (
                    <span className={`text-sm pb-1.5 ${isPro ? "text-blue-200" : "text-slate-400"}`}>
                      {t("pricing.currency")}/mo
                    </span>
                  )}
                </div>

                <button
                  onClick={key === "free" ? onTool : () => (window.location.href = "/pro/")}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all mb-6
                    ${isPro ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                >
                  {isPro ? t("pricing.ctaPro") : t("pricing.cta")}
                </button>

                <ul className="space-y-3 flex-1">
                  {["f1","f2","f3","f4",...(key === "pro" ? ["f5","f6"] : [])].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-xs">
                      <CheckCircle2 size={14} className={`shrink-0 mt-px ${isPro ? "text-blue-300" : "text-emerald-500"}`} />
                      <span className={isPro ? "text-blue-100" : "text-slate-600"}>
                        {t(`pricing.${key}.${f}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Trust */}
        <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-slate-400">
          {[Shield, CheckCircle2].map((Icon, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <Icon size={13} />
              {["SSL Secured", "Cancel Anytime"][i]}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* FAQ                                                         */
/* ═══════════════════════════════════════════════════════════ */
function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-5 bg-slate-50 border-t border-slate-100">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{t("faq.title")}</h2>
          <p className="text-slate-400 text-sm">{t("faq.subtitle")}</p>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => i).map(i => (
            <div key={i}
              className={`border rounded-2xl overflow-hidden transition-all cursor-pointer
                ${open === i ? "border-blue-200 bg-white shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"}`}
              onClick={() => setOpen(open === i ? null : i)}>
              <div className="flex items-center gap-3 px-5 py-4">
                <span className={`flex-1 text-sm font-semibold ${open === i ? "text-blue-700" : "text-slate-800"}`}>
                  {t(`faq.q${i + 1}`)}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all
                  ${open === i ? "bg-blue-600" : "bg-slate-100"}`}>
                  <ChevronDown size={12} className={`transition-transform ${open === i ? "rotate-180 text-white" : "text-slate-500"}`} />
                </div>
              </div>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    transition={{ duration: 0.22 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {t(`faq.a${i + 1}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* CTA BANNER                                                  */
/* ═══════════════════════════════════════════════════════════ */
function CTABanner({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <section className="py-16 px-5 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden px-8 sm:px-16 py-14 text-center"
          style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)" }}>
          {/* Decoration */}
          <div className="absolute top-0 start-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "white", transform: "translate(-40%, -40%)" }} />
          <div className="absolute bottom-0 end-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: "white", transform: "translate(30%, 30%)" }} />
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }} />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              {isAr ? "ابدأ مجاناً اليوم" : i18n.language === "fr" ? "Commencez gratuitement" : "Start for free today"}
            </h2>
            <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
              {isAr
                ? "لا حاجة لبطاقة ائتمان. أنشئ بطاقتك الأولى في أقل من دقيقة."
                : i18n.language === "fr"
                ? "Aucune carte requise. Créez votre première carte en moins d'une minute."
                : "No credit card required. Create your first card in under a minute."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={onTool}
                className="px-7 py-3 bg-white font-bold text-blue-700 text-sm rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20">
                {t("hero.cta")}
              </button>
              <a href="/pro/"
                className="px-7 py-3 border-2 border-white/30 hover:border-white/60 text-white font-semibold text-sm rounded-xl transition-all">
                {t("nav.dashboard")} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* FOOTER                                                      */
/* ═══════════════════════════════════════════════════════════ */
function Footer({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-slate-900">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Newspaper size={15} className="text-white" />
              </div>
              <span className="font-extrabold text-white text-base">
                NewsCard <span className="text-blue-400">Pro</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">{t("footer.desc")}</p>
            <LangSwitcher inDark />
          </div>
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-5">{t("footer.product")}</p>
            <ul className="space-y-3">
              <li><button onClick={onTool} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.tool")}</button></li>
              <li><a href="/pro/" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.dashboard")}</a></li>
              <li><button onClick={() => go("pricing")} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.pricing")}</button></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-5">{t("footer.company")}</p>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} NewsCard Pro. {t("footer.rights")}.</span>
          <span className="text-slate-600" dir="ltr">React · Vite · Express · Playwright · PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ROOT EXPORT                                                 */
/* ═══════════════════════════════════════════════════════════ */
export default function Landing({ onOpenTool }: { onOpenTool: () => void }) {
  const { i18n } = useTranslation();
  const lang = useLang();

  useEffect(() => {
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
    // Apply font to whole landing page
    document.body.style.fontFamily = "";
  }, [lang]);

  return (
    <div
      className="min-h-screen antialiased overflow-x-hidden"
      style={{
        background: C.white,
        color: C.slate900,
        fontFamily: lang.font,
      }}
    >
      <Navbar onTool={onOpenTool} />
      {/* Exact-height spacer for fixed navbar */}
      <div style={{ height: "62px" }} />
      <main>
        <Hero onTool={onOpenTool} />
        <MultiLangStrip />
        <Features />
        <HowItWorks onTool={onOpenTool} />
        <Pricing onTool={onOpenTool} />
        <FAQ />
        <CTABanner onTool={onOpenTool} />
      </main>
      <Footer onTool={onOpenTool} />
    </div>
  );
}
