/**
 * Landing — NewsCard Pro
 * High-fidelity SaaS · Cairo (AR) + Inter (EN/FR) · RTL/LTR aware
 * Color palette: #0066FF · White · #F8FAFC
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Menu, X, ChevronDown, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, Star, Zap, Bot, Code2, Palette, Layout,
  LayoutTemplate, Shield, Newspaper, Image as ImgIcon,
  Plus, Minus,
} from "lucide-react";

/* ══════════════════════════════════════════════ */
/* TOKENS                                         */
/* ══════════════════════════════════════════════ */
const T = {
  primary:   "#0066FF",
  primaryDk: "#0052CC",
  primaryLt: "#EBF2FF",
  bg:        "#F8FAFC",
  white:     "#FFFFFF",
  slate900:  "#0F172A",
  slate700:  "#334155",
  slate500:  "#64748B",
  slate300:  "#CBD5E1",
  slate200:  "#E2E8F0",
  slate100:  "#F1F5F9",
};

/* ══════════════════════════════════════════════ */
/* LANGUAGE CONFIG                                */
/* ══════════════════════════════════════════════ */
const LANGS = [
  { code: "ar", label: "العربية", flag: "AR", dir: "rtl" as const, font: "'Cairo', sans-serif" },
  { code: "en", label: "English", flag: "EN", dir: "ltr" as const, font: "'Inter', sans-serif" },
  { code: "fr", label: "Français", flag: "FR", dir: "ltr" as const, font: "'Inter', sans-serif" },
] as const;

function useLang() {
  const { i18n } = useTranslation();
  return LANGS.find(l => l.code === i18n.language) ?? LANGS[0];
}

/* ══════════════════════════════════════════════ */
/* LANG SWITCHER                                  */
/* ══════════════════════════════════════════════ */
function LangSwitcher({ dark }: { dark?: boolean }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  const pick = (l: typeof LANGS[number]) => {
    i18n.changeLanguage(l.code);
    localStorage.setItem("ncg-lang", l.code);
    document.documentElement.setAttribute("dir", l.dir);
    document.documentElement.setAttribute("lang", l.code);
    setOpen(false);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative select-none">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold border transition-all
          ${dark
            ? "border-white/20 text-white/70 hover:bg-white/10"
            : "border-slate-200 text-slate-600 hover:border-blue-300 bg-white shadow-sm"}`}
      >
        <Globe size={13} />
        <span>{cur.flag}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute top-full mt-1.5 end-0 z-[300] min-w-[148px] bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 overflow-hidden"
          >
            {LANGS.map(l => (
              <li key={l.code}>
                <button
                  onClick={() => pick(l)}
                  className={`w-full text-start px-4 py-2.5 flex items-center gap-3 text-sm transition-colors
                    ${l.code === cur.code
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-700 hover:bg-slate-50 font-medium"}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-black
                    ${l.code === cur.code ? "bg-[#0066FF] text-white" : "bg-slate-100 text-slate-500"}`}>
                    {l.flag}
                  </span>
                  {l.label}
                  {l.code === cur.code && <CheckCircle2 size={12} className="ms-auto text-blue-500 shrink-0" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/* NAVBAR                                         */
/* ══════════════════════════════════════════════ */
function Navbar({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const navLinks = [
    { id: "features",  label: t("nav.features")   },
    { id: "how",       label: t("nav.howItWorks")  },
    { id: "pricing",   label: t("nav.pricing")     },
  ];

  return (
    <header
      style={{ fontFamily: lang.font }}
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-200
        ${scrolled ? "bg-white shadow-[0_1px_12px_rgba(0,0,0,0.07)]" : "bg-white/95 backdrop-blur-sm border-b border-transparent"}`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: T.primary }}>
            <Newspaper size={15} className="text-white" />
          </div>
          <span className="font-extrabold text-[15px] tracking-tight" style={{ color: T.slate900 }}>
            NewsCard <span style={{ color: T.primary }}>Pro</span>
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1 ms-4">
          {navLinks.map(l => (
            <button key={l.id} onClick={() => scroll(l.id)}
              className="px-3.5 py-2 text-[13.5px] font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all">
              {l.label}
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 ms-auto">
          <LangSwitcher />
          <a href="/pro/" className="hidden sm:block px-3 py-2 text-[13.5px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
            {t("nav.dashboard")}
          </a>
          <button
            onClick={onTool}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-bold text-white transition-all shadow-sm"
            style={{ background: T.primary }}
            onMouseEnter={e => (e.currentTarget.style.background = T.primaryDk)}
            onMouseLeave={e => (e.currentTarget.style.background = T.primary)}
          >
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
            <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-0.5">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => scroll(l.id)}
                  className="text-start px-3 py-2.5 rounded-xl text-[14px] text-slate-700 hover:bg-slate-50 font-medium">
                  {l.label}
                </button>
              ))}
              <a href="/pro/" className="px-3 py-2.5 rounded-xl text-[14px] text-slate-700 hover:bg-slate-50 font-medium">
                {t("nav.dashboard")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ══════════════════════════════════════════════ */
/* BROWSER MOCKUP                                 */
/* ══════════════════════════════════════════════ */
function BrowserMockup() {
  const tpls = [
    { label: "عاجل",   badge: "#DC2626", from: "#450a0a", to: "#1c1917" },
    { label: "اقتصاد", badge: "#D97706", from: "#1c1917", to: "#0f172a" },
    { label: "رياضة",  badge: "#16a34a", from: "#052e16", to: "#0f172a" },
  ];
  const [active, setActive] = useState(1);

  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20 -z-10"
        style={{ background: T.primary, transform: "scale(0.9) translateY(16px)" }} />

      {/* Frame */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Chrome bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-2 h-7 bg-white border border-slate-200 rounded-lg flex items-center px-3 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-slate-400 text-[11px]" dir="ltr">newscard.pro/generate</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono" dir="ltr">v2.4</span>
        </div>

        {/* App layout */}
        <div className="flex h-60 sm:h-72">
          {/* Templates sidebar */}
          <div className="w-32 sm:w-40 bg-slate-50 border-e border-slate-100 flex flex-col p-3 gap-2 shrink-0" dir="ltr">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-1 mb-1">Templates</p>
            {tpls.map((tp, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`rounded-xl overflow-hidden border-2 transition-all text-start ${active === i ? "border-blue-500 shadow-md shadow-blue-100" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <div className="h-14 relative flex items-end p-2"
                  style={{ background: `linear-gradient(135deg, ${tp.from}, ${tp.to})` }}>
                  <div className="absolute inset-0 opacity-10 grid grid-cols-3 gap-0.5 p-1">
                    {[...Array(6)].map((_, j) => <div key={j} className="bg-white rounded-sm" />)}
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-white relative z-10"
                    style={{ background: tp.badge }}>
                    {tp.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 bg-[#F8FAFC]">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[180px] sm:max-w-[200px]"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <div className="h-24 sm:h-28 relative"
                  style={{ background: `linear-gradient(135deg, ${tpls[active].from}, ${tpls[active].to})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 opacity-[0.08] grid grid-cols-4 grid-rows-3 gap-0.5 p-2">
                    {[...Array(12)].map((_, i) => <div key={i} className="bg-white rounded-sm" />)}
                  </div>
                  <span className="absolute bottom-2.5 start-2.5 text-[9px] font-black px-2 py-0.5 rounded text-white z-10"
                    style={{ background: tpls[active].badge }}>{tpls[active].label}</span>
                  <div className="absolute top-2.5 end-2.5 w-6 h-6 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center z-10">
                    <Newspaper size={10} className="text-white" />
                  </div>
                </div>
                <div className="p-3" style={{ background: "#0f2557" }}>
                  <div className="h-0.5 w-5 rounded bg-amber-400 mb-2" />
                  <p className="text-white text-[9px] sm:text-[10px] leading-snug font-medium">
                    {["القمة العربية تنتهي بإعلان وثيقة السلام الشاملة",
                      "البنك المركزي يرفع أسعار الفائدة للمرة الثالثة هذا العام",
                      "المنتخب الوطني يتأهل إلى نهائيات كأس العالم"][active]}
                  </p>
                  <p className="text-white/40 text-[8px] mt-2">٧ أبريل ٢٠٢٦</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Properties panel */}
          <div className="w-28 sm:w-36 bg-white border-s border-slate-100 flex flex-col gap-4 p-3 shrink-0" dir="ltr">
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2">Colors</p>
              <div className="flex flex-wrap gap-1.5">
                {["#0f2557","#7f1d1d","#052e16","#1e1b4b","#1c1917"].map(c => (
                  <div key={c} className={`w-4 h-4 rounded-full border-2 cursor-pointer ${c === "#0f2557" ? "border-blue-500 scale-110" : "border-white"} shadow-sm`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2">Size</p>
              {[["■","1080×1080",true],["▬","1920×1080",false],["▮","1080×1920",false]].map(([icon, label, sel]) => (
                <div key={String(label)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] mb-1 cursor-pointer transition-colors
                    ${sel ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-500 hover:bg-slate-50"}`}>
                  <span className="shrink-0">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <button className="mt-auto w-full py-2 rounded-lg text-[9px] font-bold text-white"
              style={{ background: T.primary }}>
              Export PNG
            </button>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="absolute -top-4 -start-4 bg-white border border-slate-200 shadow-lg rounded-xl px-3.5 py-2 flex items-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[12px] font-bold text-slate-700">Live Preview</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="absolute -bottom-4 -end-4 text-white text-[12px] font-bold px-4 py-2 rounded-xl shadow-lg"
        style={{ background: T.primary }}
      >
        1080 × 1080 px
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/* HERO                                           */
/* ══════════════════════════════════════════════ */
function Hero({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const isRtl = lang.dir === "rtl";
  const ArrowIco = isRtl ? ArrowLeft : ArrowRight;

  const headline: Record<string, { l1: string; l2: string }> = {
    ar: { l1: "أنت تصنع الخبر،",        l2: "ونحن نصنع البطاقة." },
    en: { l1: "You make the news,",     l2: "We make the card." },
    fr: { l1: "Vous créez l'actualité,",l2: "Nous créons la carte." },
  };
  const h = headline[i18n.language] ?? headline.ar;

  return (
    <section className="relative overflow-hidden" style={{ background: T.bg }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${T.slate200} 1px, transparent 1px),
            linear-gradient(90deg, ${T.slate200} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
      {/* Top radial glow */}
      <div className="absolute top-0 inset-x-0 h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,102,255,0.08) 0%,transparent 100%)" }} />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 sm:pt-20 sm:pb-28">
        {/* 12-col grid */}
        <div className="grid grid-cols-12 gap-8 items-center">

          {/* Text: cols 1-6 */}
          <div className="col-span-12 lg:col-span-6 order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold mb-6 border"
                style={{ background: T.primaryLt, color: T.primary, borderColor: "#BFDBFE" }}>
                <Sparkles size={11} />
                {t("hero.badge")}
              </div>

              {/* Headline */}
              <h1
                className="font-black text-slate-900 leading-[1.1] mb-4"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", fontFamily: lang.font, letterSpacing: isRtl ? "0" : "-0.035em" }}>
                <span className="block">{h.l1}</span>
                <span className="block" style={{ color: T.primary }}>{h.l2}</span>
              </h1>

              {/* Sub */}
              <p className="mb-8 leading-relaxed max-w-md"
                style={{ color: T.slate500, fontSize: "clamp(15px,2vw,17px)" }}>
                {t("hero.subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <button onClick={onTool}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-[14px] text-white shadow-lg transition-all"
                  style={{ background: T.primary, boxShadow: `0 4px 16px rgba(0,102,255,0.25)` }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.primaryDk)}
                  onMouseLeave={e => (e.currentTarget.style.background = T.primary)}
                >
                  <Sparkles size={14} />
                  {t("hero.cta")}
                  <ArrowIco size={14} />
                </button>
                <a href="/pro/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[14px] bg-white border border-slate-200 text-slate-700 hover:border-slate-300 transition-all shadow-sm">
                  {i18n.language === "ar" ? "لوحة التحكم" : i18n.language === "fr" ? "Tableau de bord" : "Dashboard"}
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-stretch gap-0 border-t border-slate-200 pt-7">
                {[
                  { val: "10K+", lbl: t("hero.stat1") },
                  { val: "20+",  lbl: t("hero.stat2") },
                  { val: "3",    lbl: isRtl ? "لغات" : "Languages" },
                ].map((s, i) => (
                  <div key={i} className={`flex flex-col ${i > 0 ? "ps-6 ms-6 border-s border-slate-200" : ""}`}>
                    <span className="text-2xl font-black text-slate-900" dir="ltr">{s.val}</span>
                    <span className="text-[12px] mt-0.5" style={{ color: T.slate500 }}>{s.lbl}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Mockup: cols 7-12 */}
          <motion.div
            className="col-span-12 lg:col-span-6 order-1 lg:order-2 px-4 sm:px-0"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <BrowserMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════ */
/* MULTI-LANG SECTION — side-by-side cards        */
/* ══════════════════════════════════════════════ */
function MultiLangSection() {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState<"ar" | "en" | "fr">("ar");
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.1 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);

  const variants = {
    ar: {
      dir: "rtl" as const, font: "'Cairo', sans-serif",
      headline: "أنت تصنع الخبر،\nونحن نصنع البطاقة.",
      sub: "منصة بطاقات الأخبار العربية — بجودة بث تلفزيوني",
      cta: "ابدأ مجاناً",
      accent: T.primary, bg: T.primaryLt, border: "#BFDBFE",
    },
    en: {
      dir: "ltr" as const, font: "'Inter', sans-serif",
      headline: "You make the news,\nWe make the card.",
      sub: "Arabic News Card Generator — Broadcast-quality output",
      cta: "Get started free",
      accent: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC",
    },
    fr: {
      dir: "ltr" as const, font: "'Inter', sans-serif",
      headline: "Vous créez l'actualité,\nNous créons la carte.",
      sub: "Générateur de cartes d'actualités — Qualité broadcast",
      cta: "Commencer",
      accent: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE",
    },
  };

  const v = variants[selected];

  return (
    <section ref={ref} className="py-16 border-y border-slate-100" style={{ background: T.white }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <Globe size={11} /> Multi-language support
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {i18n.language === "ar"
                ? "ثلاث لغات. واجهة واحدة."
                : i18n.language === "fr"
                ? "Trois langues. Une interface."
                : "Three languages. One interface."}
            </h2>
          </div>

          {/* Toggle tabs */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-0.5">
            {(["ar", "en", "fr"] as const).map(code => (
              <button key={code} onClick={() => setSelected(code)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                  ${selected === code ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Animated language card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            dir={v.dir}
            className="rounded-2xl border-2 p-8 sm:p-10 relative overflow-hidden"
            style={{ background: v.bg, borderColor: v.border, fontFamily: v.font }}
          >
            {/* Direction indicator */}
            <div className="absolute top-4 end-4 flex items-center gap-1.5 opacity-50">
              {v.dir === "rtl"
                ? <><span className="text-[10px] font-mono font-bold text-slate-600">RTL</span><ArrowLeft size={10} className="text-slate-500" /></>
                : <><ArrowRight size={10} className="text-slate-500" /><span className="text-[10px] font-mono font-bold text-slate-600">LTR</span></>
              }
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              {/* Text */}
              <div className="flex-1">
                <h3 className="font-black text-slate-900 leading-snug mb-3 whitespace-pre-line"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                  {v.headline}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base mb-5 max-w-sm">{v.sub}</p>
                <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: v.accent }}>
                  {v.cta}
                </button>
              </div>

              {/* Mini card preview */}
              <div className="shrink-0 w-36 sm:w-44">
                <div className="rounded-xl overflow-hidden shadow-xl border border-black/5">
                  <div className="h-20 sm:h-24 relative"
                    style={{ background: "linear-gradient(135deg, #0f2557, #1e1b4b)" }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-2 start-2 text-[9px] font-black px-1.5 py-0.5 rounded text-white"
                      style={{ background: v.accent }}>
                      {selected === "ar" ? "اقتصاد" : selected === "fr" ? "Économie" : "Business"}
                    </span>
                  </div>
                  <div className="p-3" style={{ background: "#0f2557" }}>
                    <p className="text-white text-[9px] leading-snug">
                      {selected === "ar"
                        ? "البنك المركزي يرفع الفائدة للمرة الثالثة"
                        : selected === "fr"
                        ? "La banque centrale relève ses taux"
                        : "Central bank raises interest rates again"}
                    </p>
                    <p className="text-white/40 text-[8px] mt-1.5" dir="ltr">Apr 7, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Language pills row */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {[
            { code: "ar", label: "العربية — RTL", dir: "rtl" },
            { code: "en", label: "English — LTR", dir: "ltr" },
            { code: "fr", label: "Français — LTR", dir: "ltr" },
          ].map(({ code, label, dir }) => (
            <span key={code} dir={dir as "rtl" | "ltr"}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════ */
/* FEATURES                                       */
/* ══════════════════════════════════════════════ */
const FEATS = [
  { icon: Zap,            key: "item1", accent: "#D97706", bg: "#FFFBEB", bd: "#FDE68A" },
  { icon: LayoutTemplate, key: "item2", accent: T.primary,  bg: T.primaryLt, bd: "#BFDBFE" },
  { icon: Bot,            key: "item3", accent: "#7C3AED", bg: "#F5F3FF", bd: "#DDD6FE" },
  { icon: Palette,        key: "item4", accent: "#DB2777", bg: "#FDF2F8", bd: "#FBCFE8" },
  { icon: Layout,         key: "item5", accent: "#059669", bg: "#ECFDF5", bd: "#A7F3D0" },
  { icon: Code2,          key: "item6", accent: "#475569", bg: T.slate100, bd: T.slate200 },
];

function Features() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.1 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="py-20 px-6" style={{ background: T.white }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <motion.p initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}}
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: T.primary }}>
            {t("nav.features")}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 }}
            className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)" }}>
            {t("features.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}} transition={{ delay: 0.16 }}
            className="text-slate-500 max-w-xl mx-auto" style={{ fontSize: "clamp(14px,2vw,16px)", lineHeight: 1.7 }}>
            {t("features.subtitle")}
          </motion.p>
        </div>

        {/* 12-col bento grid: 4-4-4 on lg, 6-6 on md, 12 on sm */}
        <div className="grid grid-cols-12 gap-4">
          {FEATS.map(({ icon: Icon, key, accent, bg, bd }, i) => (
            <motion.article key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07 }}
              className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-2xl border p-6 group hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              style={{ background: bg, borderColor: bd }}
            >
              <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110"
                style={{ borderColor: bd }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-1.5">{t(`features.${key}.title`)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
              <div className="mt-4 h-0.5 w-8 rounded-full opacity-50" style={{ background: accent }} />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════ */
/* HOW IT WORKS                                   */
/* ══════════════════════════════════════════════ */
function HowItWorks({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.1 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);

  const steps = [
    { key: "step1", icon: LayoutTemplate, color: T.primary, bg: T.primaryLt },
    { key: "step2", icon: ImgIcon,        color: "#7C3AED", bg: "#F5F3FF" },
    { key: "step3", icon: Newspaper,      color: "#059669", bg: "#ECFDF5" },
  ];

  return (
    <section id="how" ref={ref} className="py-20 px-6 border-y border-slate-100" style={{ background: T.bg }}>
      <div className="max-w-5xl mx-auto text-center">
        <motion.p initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}}
          className="text-[11px] font-bold uppercase tracking-widest text-violet-500 mb-2">
          {t("nav.howItWorks")}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 }}
          className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)" }}>
          {t("howItWorks.title")}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}} transition={{ delay: 0.16 }}
          className="text-slate-500 text-sm mb-14 max-w-md mx-auto leading-relaxed">
          {t("howItWorks.subtitle")}
        </motion.p>

        <div className="grid grid-cols-12 gap-8 relative">
          {/* Horizontal connector line (desktop) */}
          <div className="hidden lg:block absolute top-7 start-[17%] end-[17%] h-px"
            style={{ background: `linear-gradient(to right, ${T.primaryLt}, #DDD6FE, #A7F3D0)` }} />

          {steps.map(({ key, icon: Icon, color, bg }, i) => (
            <motion.div key={key}
              className="col-span-12 sm:col-span-4 flex flex-col items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.12 + i * 0.14 }}
            >
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md border-2 border-white z-10"
                style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
                <span className="absolute -top-2 -end-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white"
                  style={{ background: color }}>
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-2">{t(`howItWorks.${key}.title`)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(`howItWorks.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}
          className="mt-12">
          <button onClick={onTool}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md"
            style={{ background: T.slate900 }}>
            <Sparkles size={14} style={{ color: "#93C5FD" }} />
            {t("nav.tryFree")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════ */
/* PRICING                                        */
/* ══════════════════════════════════════════════ */
function Pricing({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [yearly, setYearly] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.1 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);

  const freeFeats = ["f1","f2","f3","f4"] as const;
  const proFeats  = ["f1","f2","f3","f4","f5","f6"] as const;

  return (
    <section id="pricing" ref={ref} className="py-20 px-6" style={{ background: T.white }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}}
            className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-2">
            {t("nav.pricing")}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 }}
            className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)" }}>
            {t("pricing.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}} transition={{ delay: 0.16 }}
            className="text-slate-500 text-sm mb-8">{t("pricing.subtitle")}
          </motion.p>

          {/* Billing toggle */}
          <motion.div initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}} transition={{ delay: 0.22 }}
            className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl shadow-inner gap-0.5">
            {[
              { val: false, label: t("pricing.monthly") },
              { val: true,  label: <>{t("pricing.yearly")} <span className="ms-1.5 bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-black">{t("pricing.save")}</span></> },
            ].map(opt => (
              <button key={String(opt.val)} onClick={() => setYearly(opt.val)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center
                  ${yearly === opt.val ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {opt.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* 12-col: 6-6 on lg */}
        <div className="grid grid-cols-12 gap-6 max-w-3xl mx-auto items-stretch">

          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.14 }}
            className="col-span-12 sm:col-span-6 flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                {t("pricing.free.name")}
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-5">{t("pricing.free.desc")}</p>
            <div className="flex items-end gap-1 mb-7" dir="ltr">
              <span className="text-5xl font-black text-slate-900">0</span>
              <span className="text-slate-400 text-sm pb-1.5">{t("pricing.currency")}/mo</span>
            </div>
            <button onClick={onTool}
              className="w-full py-3 rounded-xl font-bold text-sm text-white mb-7 transition-all"
              style={{ background: T.slate900 }}>
              {t("pricing.cta")}
            </button>
            <ul className="space-y-3 flex-1">
              {freeFeats.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500" />
                  <span>{t(`pricing.free.${f}`)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* PRO */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={vis ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.24 }}
            className="col-span-12 sm:col-span-6 flex flex-col rounded-2xl p-8 relative overflow-hidden"
            style={{ background: T.primary, boxShadow: `0 20px 60px rgba(0,102,255,0.25)` }}
          >
            {/* Popular badge */}
            <div className="absolute -top-px inset-x-0 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-b-xl text-[11px] font-black text-amber-900"
                style={{ background: "#FCD34D" }}>
                <Star size={10} fill="currentColor" />
                {t("pricing.popular")}
              </span>
            </div>
            <div className="mt-6 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-500">
                {t("pricing.pro.name")}
              </span>
            </div>
            <p className="text-blue-200 text-xs mb-5">{t("pricing.pro.desc")}</p>
            <div className="flex items-end gap-1 mb-7" dir="ltr">
              <span className="text-5xl font-black text-white">
                {yearly ? t("pricing.pro.priceYear") : t("pricing.pro.price")}
              </span>
              <span className="text-blue-200 text-sm pb-1.5">{t("pricing.currency")}/mo</span>
            </div>
            <a href="/pro/"
              className="w-full py-3 rounded-xl font-bold text-sm text-center block mb-7 transition-all"
              style={{ background: T.white, color: T.primary }}
              onMouseEnter={e => (e.currentTarget.style.background = T.primaryLt)}
              onMouseLeave={e => (e.currentTarget.style.background = T.white)}
            >
              {t("pricing.ctaPro")}
            </a>
            <ul className="space-y-3 flex-1">
              {proFeats.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-blue-100">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-blue-300" />
                  <span>{t(`pricing.pro.${f}`)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Trust row */}
        <motion.div initial={{ opacity: 0 }} animate={vis ? { opacity: 1 } : {}} transition={{ delay: 0.45 }}
          className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><Shield size={13} /> SSL Secured</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} /> Cancel Anytime</span>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════ */
/* FAQ ACCORDION                                  */
/* ══════════════════════════════════════════════ */
function FAQ() {
  const { t } = useTranslation();
  const lang = useLang();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-6 border-t border-slate-100" style={{ background: T.bg }}>
      <div className="max-w-2xl mx-auto">
        <div className={`text-${lang.dir === "rtl" ? "end" : "start"} mb-12`}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2">FAQ</p>
          <h2 className="font-black text-slate-900 mb-2" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>
            {t("faq.title")}
          </h2>
          <p className="text-slate-400 text-sm">{t("faq.subtitle")}</p>
        </div>

        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => i).map(i => (
            <div key={i}
              className={`border rounded-2xl bg-white overflow-hidden cursor-pointer transition-all
                ${open === i ? "border-blue-200 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center gap-3 px-5 py-4">
                <p className={`flex-1 text-sm font-semibold text-${lang.dir === "rtl" ? "end" : "start"}
                  ${open === i ? "text-blue-700" : "text-slate-800"}`}>
                  {t(`faq.q${i + 1}`)}
                </p>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-colors
                  ${open === i ? "bg-blue-600" : "bg-slate-100"}`}>
                  {open === i
                    ? <Minus size={12} className="text-white" />
                    : <Plus size={12} className="text-slate-500" />}
                </div>
              </div>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className={`px-5 pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100
                      text-${lang.dir === "rtl" ? "end" : "start"}`}>
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

/* ══════════════════════════════════════════════ */
/* CTA BANNER                                     */
/* ══════════════════════════════════════════════ */
function CTABanner({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();

  const copy = {
    ar: {
      h: "ابدأ مجاناً اليوم",
      sub: "لا حاجة لبطاقة ائتمان. أنشئ بطاقتك الأولى في أقل من دقيقة.",
    },
    en: { h: "Start for free today", sub: "No credit card required. Create your first card in under a minute." },
    fr: { h: "Commencez gratuitement", sub: "Sans carte requise. Créez votre première carte en moins d'une minute." },
  };
  const c = copy[i18n.language as keyof typeof copy] ?? copy.ar;

  return (
    <section className="py-20 px-6" style={{ background: T.white }}>
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl px-8 sm:px-16 py-16 text-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, #004DB3 0%, ${T.primary} 60%, #3B82F6 100%)` }}>

          {/* Decorative circles */}
          <div className="absolute -top-12 -start-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -end-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }} />

          <div className="relative">
            <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)", fontFamily: lang.font }}>
              {c.h}
            </h2>
            <p className="text-blue-100 mb-8 mx-auto max-w-sm leading-relaxed"
              style={{ fontSize: "clamp(14px,2vw,16px)" }}>
              {c.sub}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={onTool}
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-blue-700 bg-white transition-all shadow-lg"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                onMouseEnter={e => (e.currentTarget.style.background = T.primaryLt)}
                onMouseLeave={e => (e.currentTarget.style.background = T.white)}
              >
                {t("hero.cta")}
              </button>
              <a href="/pro/"
                className="px-7 py-3.5 rounded-xl font-semibold text-sm text-white border-2 border-white/30 hover:border-white/70 transition-all">
                {i18n.language === "ar" ? "لوحة التحكم" : i18n.language === "fr" ? "Tableau de bord" : "Dashboard"} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════ */
/* FOOTER                                         */
/* ══════════════════════════════════════════════ */
function Footer({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer style={{ background: T.slate900 }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-12 gap-10 mb-12">

          {/* Brand col: 4 cols on lg */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: T.primary }}>
                <Newspaper size={15} className="text-white" />
              </div>
              <span className="font-extrabold text-white text-[15px]">
                NewsCard <span style={{ color: "#93C5FD" }}>Pro</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">{t("footer.desc")}</p>
            <LangSwitcher dark />
          </div>

          {/* Product col: 3 cols */}
          <div className="col-span-6 lg:col-span-2 lg:col-start-6">
            <p className="text-white text-[11px] font-bold uppercase tracking-wider mb-4">{t("footer.product")}</p>
            <ul className="space-y-2.5">
              <li><button onClick={onTool} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.tool")}</button></li>
              <li><a href="/pro/"      className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.dashboard")}</a></li>
              <li><button onClick={() => scroll("pricing")} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.pricing")}</button></li>
            </ul>
          </div>

          {/* Company col: 3 cols */}
          <div className="col-span-6 lg:col-span-2">
            <p className="text-white text-[11px] font-bold uppercase tracking-wider mb-4">{t("footer.company")}</p>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">© {new Date().getFullYear()} NewsCard Pro. {t("footer.rights")}.</span>
          <span className="text-xs text-slate-600" dir="ltr">React · Vite · Express · PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════ */
/* ROOT                                           */
/* ══════════════════════════════════════════════ */
export default function Landing({ onOpenTool }: { onOpenTool: () => void }) {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.setAttribute("dir", lang.dir);
    document.documentElement.setAttribute("lang", lang.code);
  }, [lang]);

  return (
    <div style={{ fontFamily: lang.font, background: T.white, color: T.slate900 }}
      className="min-h-screen antialiased overflow-x-hidden">
      <Navbar onTool={onOpenTool} />
      <div style={{ height: "64px" }} aria-hidden />
      <main>
        <Hero onTool={onOpenTool} />
        <MultiLangSection />
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
