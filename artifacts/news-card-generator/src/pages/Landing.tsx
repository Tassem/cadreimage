/**
 * Landing Page — NewsCard Pro
 * Clean professional SaaS page. Works on all screen sizes, RTL/LTR.
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Image as Img, Bot, Code2, Layout, Palette,
  CheckCircle2, Star, ChevronDown, Globe, Menu, X,
  Sparkles, Shield, Clock, Newspaper, ArrowUpRight,
  Play, LayoutTemplate,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────── */
/*  Language config                                            */
/* ──────────────────────────────────────────────────────────── */
const LANGS = [
  { code: "ar", label: "العربية", flag: "🇲🇦", dir: "rtl" as const },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" as const },
  { code: "en", label: "English",  flag: "🇺🇸", dir: "ltr" as const },
];

/* ──────────────────────────────────────────────────────────── */
/*  Language switcher                                          */
/* ──────────────────────────────────────────────────────────── */
function LangMenu({ dark }: { dark?: boolean }) {
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
          ${dark
            ? "border-white/20 text-white/80 hover:bg-white/10"
            : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"}`}
      >
        <Globe size={12} />{cur.flag} {cur.label}
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1.5 end-0 z-[300] w-40 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden py-1"
          >
            {LANGS.map(l => (
              <button key={l.code} onClick={() => pick(l)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-start transition-colors
                  ${l.code === cur.code ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}>
                {l.flag} {l.label}
                {l.code === cur.code && <CheckCircle2 size={11} className="ms-auto text-blue-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Navbar                                                     */
/* ──────────────────────────────────────────────────────────── */
function Nav({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { id: "features", label: t("nav.features") },
    { id: "pricing",  label: t("nav.pricing")  },
    { id: "faq",      label: t("faq.title")    },
  ];

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
      ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_#e2e8f0]" : "bg-white/70 backdrop-blur-sm"}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Newspaper size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight">
            NewsCard <span className="text-blue-600">Pro</span>
          </span>
        </a>

        {/* Desktop links — centered */}
        <nav className="hidden md:flex items-center gap-0.5 mx-auto">
          {links.map(l => (
            <button key={l.id} onClick={() => go(l.id)}
              className="px-3.5 py-1.5 text-sm text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100/80 transition-all font-medium">
              {l.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 ms-auto md:ms-0">
          <LangMenu />
          <a href="/pro/"
            className="hidden sm:block text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium px-1">
            {t("nav.dashboard")}
          </a>
          <button onClick={onTool}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm">
            {t("nav.tryFree")}
          </button>
          <button className="md:hidden p-1.5 text-slate-500 hover:text-slate-900"
            onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-slate-100 overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {links.map(l => (
                <button key={l.id} onClick={() => go(l.id)}
                  className="text-start px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium">
                  {l.label}
                </button>
              ))}
              <a href="/pro/" className="px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium">
                {t("nav.dashboard")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Card previews (product mockup)                             */
/* ──────────────────────────────────────────────────────────── */
const CARDS = [
  {
    id: "breaking",
    label: "عاجل",
    labelBg: "bg-red-500",
    photoBg: "from-red-950 to-slate-900",
    bannerBg: "#7f1d1d",
    headline: "القمة العربية تنتهي بإعلان وثيقة السلام",
    date: "٧ أبريل ٢٠٢٦",
    accentBar: "#dc2626",
  },
  {
    id: "classic",
    label: "اقتصاد",
    labelBg: "bg-amber-500",
    photoBg: "from-slate-800 to-slate-700",
    bannerBg: "#0f2557",
    headline: "البنك المركزي يرفع أسعار الفائدة للمرة الثالثة",
    date: "٧ أبريل ٢٠٢٦",
    accentBar: "#2563eb",
  },
  {
    id: "sport",
    label: "رياضة",
    labelBg: "bg-green-500",
    photoBg: "from-emerald-950 to-slate-900",
    bannerBg: "#064e3b",
    headline: "المنتخب الوطني يتأهل إلى نهائيات كأس العالم",
    date: "٧ أبريل ٢٠٢٦",
    accentBar: "#10b981",
  },
];

function NewsCard({ card, className = "" }: { card: typeof CARDS[0]; className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg flex flex-col ${className}`} style={{ minWidth: 0 }}>
      {/* Photo */}
      <div className={`bg-gradient-to-br ${card.photoBg} h-32 relative shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Simulated image grid */}
        <div className="absolute inset-3 grid grid-cols-3 grid-rows-2 gap-1 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded" />
          ))}
        </div>
        {/* Label */}
        <span className={`absolute top-2.5 end-2.5 ${card.labelBg} text-white text-[9px] font-bold px-2 py-0.5 rounded`}>
          {card.label}
        </span>
        {/* Channel logo */}
        <div className="absolute bottom-2.5 start-2.5 w-6 h-6 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Newspaper size={10} className="text-white" />
        </div>
      </div>
      {/* Banner */}
      <div className="flex flex-col p-3 flex-1" style={{ background: card.bannerBg }}>
        <div className="h-0.5 w-6 rounded-full mb-2" style={{ background: card.accentBar }} />
        <p className="text-white text-[11px] font-medium leading-snug line-clamp-2 flex-1">{card.headline}</p>
        <p className="text-white/40 text-[9px] mt-2">{card.date}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Hero                                                       */
/* ──────────────────────────────────────────────────────────── */
function Hero({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <section className="pt-8 pb-0 px-4 sm:px-6 relative overflow-hidden bg-white">
      {/* Decorative top line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      {/* Soft bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#eff6ff_0%,_transparent_100%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 shadow-sm">
            <Sparkles size={11} className="text-blue-500" />
            {t("hero.badge")}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-[2rem] sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight mb-4"
        >
          {isAr ? (
            <>
              أنت تصنع الخبر
              <br />
              <span className="text-blue-600">ونحن نصنع البطاقة</span>
            </>
          ) : i18n.language === "fr" ? (
            <>
              Vous créez l&apos;actualité
              <br />
              <span className="text-blue-600">Nous créons la carte</span>
            </>
          ) : (
            <>
              You make the news
              <br />
              <span className="text-blue-600">We make the card</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-7"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-4"
        >
          <button onClick={onTool}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-200/60">
            <Sparkles size={14} />
            {t("hero.cta")}
            <ArrowUpRight size={14} />
          </button>
          <a href="/pro/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-sm">
            <Play size={12} className="text-slate-400" />
            {isAr ? "مشاهدة العرض" : "Watch demo"}
          </a>
        </motion.div>

        {/* Subtle note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="text-xs text-slate-400 mb-12"
        >
          {t("hero.ctaSub")}
        </motion.p>

        {/* ── Card showcase ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Glassy frame */}
          <div className="relative bg-slate-100/80 border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/80">
            {/* Top bar — mimics browser / app chrome */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="ms-3 flex-1 bg-white rounded-md h-6 border border-slate-200 flex items-center px-3">
                <span className="text-slate-400 text-[10px]">newscard.pro/generate</span>
              </div>
            </div>

            {/* Cards row */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {CARDS.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                >
                  <NewsCard card={card} />
                </motion.div>
              ))}
            </div>

            {/* Overlay gradient at bottom (fade to white) */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white via-white/60 to-transparent rounded-b-2xl pointer-events-none" />
          </div>

          {/* Floating badges */}
          <div className="absolute -top-3 end-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
            1080 × 1080 px
          </div>
          <div className="absolute -bottom-3 start-4 bg-white border border-slate-200 shadow-md rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-700 text-[10px] font-semibold">
              {isAr ? "جاهز للنشر" : i18n.language === "fr" ? "Prêt à publier" : "Ready to publish"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Stats bar */}
      <div className="relative max-w-4xl mx-auto mt-12 mb-0 border-t border-slate-100 pt-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { val: "+10,000", label: t("hero.stat1") },
            { val: "20+", label: t("hero.stat2") },
            { val: "1080px", label: t("hero.stat3") },
            { val: "3", label: isAr ? "لغات مدعومة" : "languages" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <div className="w-px h-4 bg-slate-200 hidden sm:block" />}
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-900" dir="ltr">{s.val}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Features                                                   */
/* ──────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Zap,            key: "item1", color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-100" },
  { icon: LayoutTemplate, key: "item2", color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-100"  },
  { icon: Bot,            key: "item3", color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100"},
  { icon: Palette,        key: "item4", color: "text-pink-500",   bg: "bg-pink-50",   border: "border-pink-100"  },
  { icon: Layout,         key: "item5", color: "text-emerald-500",bg: "bg-emerald-50",border: "border-emerald-100"},
  { icon: Code2,          key: "item6", color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-100" },
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
    <section id="features" ref={ref} className="py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">{t("nav.features")}</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">{t("features.title")}</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">{t("features.subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, key, color, bg, border }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center mb-3`}>
                <Icon size={17} className={color} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{t(`features.${key}.title`)}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{t(`features.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  How It Works                                               */
/* ──────────────────────────────────────────────────────────── */
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
    { key: "step1", icon: LayoutTemplate, num: "١", color: "bg-blue-600"   },
    { key: "step2", icon: Img,            num: "٢", color: "bg-violet-600" },
    { key: "step3", icon: Newspaper,      num: "٣", color: "bg-green-600"  },
  ];

  return (
    <section id="how" ref={ref} className="py-20 px-4 sm:px-6 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-2">{t("nav.howItWorks")}</p>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">{t("howItWorks.title")}</h2>
        <p className="text-slate-500 text-sm mb-12">{t("howItWorks.subtitle")}</p>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden sm:block absolute top-6 start-[20%] end-[20%] h-px bg-gradient-to-r from-blue-200 via-violet-200 to-green-200" />

          {steps.map(({ key, icon: Icon, num, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.12 }}
              className="flex flex-col items-center"
            >
              <div className={`${color} relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md z-10`}>
                <Icon size={20} className="text-white" />
                <span className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-white border-2 border-current text-[9px] font-black flex items-center justify-center" style={{ borderColor: "inherit", color: "inherit" }}>{num}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">{t(`howItWorks.${key}.title`)}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{t(`howItWorks.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <button onClick={onTool}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all">
            <Sparkles size={13} className="text-blue-400" />
            {t("nav.tryFree")}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Pricing                                                    */
/* ──────────────────────────────────────────────────────────── */
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

  type PlanKey = "free" | "pro";
  const plans: Array<{
    key: PlanKey;
    price: string;
    features: string[];
    cta: string;
    highlighted: boolean;
  }> = [
    {
      key: "free",
      price: "0",
      features: ["f1","f2","f3","f4"],
      cta: t("pricing.cta"),
      highlighted: false,
    },
    {
      key: "pro",
      price: yearly ? t("pricing.pro.priceYear") : t("pricing.pro.price"),
      features: ["f1","f2","f3","f4","f5","f6"],
      cta: t("pricing.ctaPro"),
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-100">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2">{t("nav.pricing")}</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">{t("pricing.title")}</h2>
          <p className="text-slate-500 text-sm mb-6">{t("pricing.subtitle")}</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-0.5 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            {[false, true].map(val => (
              <button key={String(val)} onClick={() => setYearly(val)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
                  ${yearly === val ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>
                {val ? (
                  <>{t("pricing.yearly")} <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold">{t("pricing.save")}</span></>
                ) : t("pricing.monthly")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {plans.map(({ key, price, features, cta, highlighted }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.12 }}
              className={`relative rounded-2xl border p-6 flex flex-col
                ${highlighted
                  ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-200"
                  : "bg-white border-slate-200 shadow-sm"}`}
            >
              {highlighted && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full shadow">
                    <Star size={9} fill="currentColor" /> {t("pricing.popular")}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold mb-1.5
                  ${highlighted ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {t(`pricing.${key}.name`)}
                </span>
                <p className={`text-xs ${highlighted ? "text-blue-200" : "text-slate-400"}`}>
                  {t(`pricing.${key}.desc`)}
                </p>
              </div>

              <div className="mb-5">
                <div className={`flex items-end gap-1 ${highlighted ? "text-white" : "text-slate-900"}`} dir="ltr">
                  <span className="text-4xl font-black">{price}</span>
                  {key !== "free" && (
                    <span className={`text-sm pb-1 ${highlighted ? "text-blue-300" : "text-slate-400"}`}>
                      {t("pricing.currency")}/{t("pricing.monthly")}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={key === "free" ? onTool : () => (window.location.href = "/pro/")}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all mb-5
                  ${highlighted
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                {cta}
              </button>

              <ul className="space-y-2.5 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={13} className={`shrink-0 mt-px ${highlighted ? "text-blue-300" : "text-green-500"}`} />
                    <span className={highlighted ? "text-blue-100" : "text-slate-600"}>
                      {t(`pricing.${key}.${f}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-8 text-xs text-slate-400">
          {[
            { icon: Shield,       text: "بيانات مشفرة"    },
            { icon: Clock,        text: "99.9% uptime"   },
            { icon: CheckCircle2, text: "إلغاء في أي وقت"},
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Icon size={12} /> {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  FAQ                                                        */
/* ──────────────────────────────────────────────────────────── */
function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-white border-t border-slate-100">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{t("faq.title")}</h2>
          <p className="text-slate-400 text-sm">{t("faq.subtitle")}</p>
        </div>

        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => i).map(i => (
            <div key={i}
              className={`border rounded-xl overflow-hidden transition-all
                ${open === i ? "border-blue-200 shadow-sm" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center gap-3 px-5 py-4 text-start"
              >
                <span className={`text-sm font-semibold flex-1 ${open === i ? "text-blue-700" : "text-slate-800"}`}>
                  {t(`faq.q${i + 1}`)}
                </span>
                <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all
                  ${open === i ? "bg-blue-600" : "bg-slate-200"}`}>
                  <ChevronDown size={11} className={`transition-transform ${open === i ? "text-white rotate-180" : "text-slate-500"}`} />
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden">
                    <p className="px-5 pb-4 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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

/* ──────────────────────────────────────────────────────────── */
/*  CTA Banner                                                 */
/* ──────────────────────────────────────────────────────────── */
function CTABanner({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <section className="py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-100">
      <div className="max-w-3xl mx-auto">
        <div className="bg-blue-600 rounded-3xl px-8 sm:px-12 py-12 text-center relative overflow-hidden">
          <div className="absolute -top-10 -start-10 w-32 h-32 rounded-full bg-blue-500/40" />
          <div className="absolute -bottom-6 -end-6 w-24 h-24 rounded-full bg-blue-700/50" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              {isAr ? "ابدأ مجاناً اليوم" : i18n.language === "fr" ? "Commencez gratuitement" : "Start for free today"}
            </h2>
            <p className="text-blue-200 text-sm mb-7 max-w-md mx-auto leading-relaxed">
              {isAr
                ? "لا حاجة لبطاقة ائتمان. جرّب المنصة كاملاً وأنشئ بطاقتك الأولى في أقل من دقيقة."
                : "No credit card required. Create your first card in under a minute."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={onTool}
                className="px-6 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition-all shadow-md">
                {t("hero.cta")}
              </button>
              <a href="/pro/"
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-sm border border-blue-400 transition-all">
                {t("nav.dashboard")} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Footer                                                     */
/* ──────────────────────────────────────────────────────────── */
function Footer({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Newspaper size={13} className="text-white" />
              </div>
              <span className="font-extrabold text-white">NewsCard <span className="text-blue-400">Pro</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{t("footer.desc")}</p>
            <div className="mt-4">
              <LangMenu dark />
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-4">{t("footer.product")}</p>
            <ul className="space-y-2.5">
              <li><button onClick={onTool} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.tool")}</button></li>
              <li><a href="/pro/" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.dashboard")}</a></li>
              <li><button onClick={() => go("pricing")} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.pricing")}</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-4">{t("footer.company")}</p>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} NewsCard Pro. {t("footer.rights")}.</span>
          <span className="text-slate-600">Built with React · Vite · Express · Playwright</span>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Root export                                                */
/* ──────────────────────────────────────────────────────────── */
export default function Landing({ onOpenTool }: { onOpenTool: () => void }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const l = LANGS.find(x => x.code === i18n.language) ?? LANGS[0];
    document.documentElement.dir = l.dir;
    document.documentElement.lang = l.code;
  }, [i18n.language]);

  return (
    <div style={{ background: "#ffffff", color: "#0f172a" }} className="min-h-screen antialiased overflow-x-hidden">
      <Nav onTool={onOpenTool} />
      {/* Spacer — exactly matches navbar height so content never hides behind it */}
      <div style={{ height: "60px" }} />
      <main>
        <Hero onTool={onOpenTool} />
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
