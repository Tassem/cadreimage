/**
 * Landing Page — NewsCard Pro
 * Clean, light-themed, professional SaaS landing page
 * Supports Arabic (RTL), French, English
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Zap, Image as ImageIcon, Bot, Code2, Layout, Palette,
  CheckCircle2, Star, ChevronDown, Globe, Menu, X,
  ArrowRight, ArrowLeft, Sparkles, Shield, Clock,
  LayoutTemplate, Newspaper, MonitorPlay
} from "lucide-react";

/* ────── Language config ───────────────── */
const LANGS = [
  { code: "ar", label: "العربية", flag: "🇲🇦", dir: "rtl" as const },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" as const },
  { code: "en", label: "English", flag: "🇺🇸", dir: "ltr" as const },
];

/* ────── Tiny animation helpers ────────── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
});

function useSectionReveal() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return { ref, inView };
}

/* ────── Language Switcher ─────────────── */
function LangSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  const pick = (l: typeof LANGS[0]) => {
    i18n.changeLanguage(l.code);
    localStorage.setItem("ncg-lang", l.code);
    document.documentElement.dir = l.dir;
    document.documentElement.lang = l.code;
    setOpen(false);
  };

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const isLight = variant === "light";

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
          ${isLight
            ? "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
      >
        <Globe size={13} />
        {current.flag} {current.label}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 start-0 z-[200] min-w-[160px] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
          >
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => pick(l)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-start transition-colors
                  ${l.code === i18n.language
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {l.flag} {l.label}
                {l.code === i18n.language && <CheckCircle2 size={13} className="ms-auto text-blue-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────── Navbar ────────────────────────── */
function Navbar({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { id: "pricing", label: t("nav.pricing") },
    { id: "features", label: t("nav.features") },
    { id: "how", label: t("nav.howItWorks") },
  ];

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200
        ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"}`}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 me-auto">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Newspaper size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">
            News<span className="text-blue-600">Card</span> <span className="text-slate-400 font-normal text-base">Pro</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <button
              key={l.id}
              onClick={() => scroll(l.id)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <LangSwitcher />
          <a href="/pro/" className="hidden sm:block text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors px-2">
            {t("nav.dashboard")}
          </a>
          <button
            onClick={onTool}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm shadow-blue-200"
          >
            {t("nav.tryFree")}
          </button>
          <button className="md:hidden p-2 text-slate-500" onClick={() => setMobileOpen(v => !v)}>
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
            className="md:hidden overflow-hidden bg-white border-t border-slate-100"
          >
            <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-1">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => scroll(l.id)}
                  className="text-start px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                  {l.label}
                </button>
              ))}
              <a href="/pro/" className="px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                {t("nav.dashboard")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ────── News Card Mockup ──────────────── */
function CardMockup({ template = "classic" }: { template?: "classic" | "breaking" | "dark" }) {
  const configs = {
    classic: {
      bg: "bg-gradient-to-br from-slate-700 to-slate-800",
      banner: "bg-[#0f2557]",
      label: "اقتصاد",
      labelColor: "bg-amber-500",
      headline: "البنك المركزي يرفع أسعار الفائدة للمرة الثالثة هذا العام",
    },
    breaking: {
      bg: "bg-gradient-to-br from-red-900 to-slate-900",
      banner: "bg-red-800",
      label: "عاجل",
      labelColor: "bg-red-500",
      headline: "القمة العربية تنتهي بإعلان وثيقة الجزائر للسلام",
    },
    dark: {
      bg: "bg-gradient-to-br from-slate-900 to-slate-800",
      banner: "bg-slate-900",
      label: "رياضة",
      labelColor: "bg-green-500",
      headline: "المنتخب الوطني يتأهل إلى نهائيات كأس العالم",
    },
  };
  const c = configs[template];

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 w-full bg-white">
      {/* Photo area */}
      <div className={`${c.bg} relative h-44 sm:h-52`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Logo placeholder */}
        <div className="absolute top-3 end-3 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Newspaper size={14} className="text-white" />
        </div>
        {/* Label */}
        <div className="absolute bottom-3 start-3">
          <span className={`${c.labelColor} text-white text-[10px] font-bold px-2 py-0.5 rounded`}>{c.label}</span>
        </div>
        {/* Decorative lines representing image content */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="grid grid-cols-3 gap-1 p-4 w-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-12 bg-white rounded opacity-50" />
            ))}
          </div>
        </div>
      </div>
      {/* Banner */}
      <div className={`${c.banner} p-4`}>
        <p className="text-white text-xs sm:text-sm font-medium leading-relaxed line-clamp-2">{c.headline}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-white/50 text-[10px]">١٥ يناير ٢٠٢٤</span>
          <div className="w-6 h-6 rounded bg-white/15 flex items-center justify-center">
            <Newspaper size={10} className="text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────── Hero ──────────────────────────── */
function Hero({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="pt-28 pb-16 px-5 overflow-hidden relative">
      {/* Subtle bg gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Text column (DOM first = visually RIGHT in RTL) ── */}
          <div className="flex flex-col items-start order-2 lg:order-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="mb-5"
            >
              <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full">
                <Sparkles size={12} className="text-blue-500" />
                {t("hero.badge")}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 leading-[1.15] mb-5"
            >
              {i18n.language === "ar" ? (
                <>
                  <span className="text-slate-900">أنت تصنع الخبر...</span>
                  <br />
                  <span className="text-blue-600">ونحن نصنع البطاقة</span>
                </>
              ) : i18n.language === "fr" ? (
                <>
                  <span>Vous créez l'actualité...</span>
                  <br />
                  <span className="text-blue-600">Nous créons la carte</span>
                </>
              ) : (
                <>
                  <span>You make the news...</span>
                  <br />
                  <span className="text-blue-600">We make the card</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-500 text-base leading-relaxed mb-8 max-w-md"
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <button onClick={onTool}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-200 text-sm">
                {t("hero.cta")}
                <ArrowIcon size={16} />
              </button>
              <a href="/pro/"
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold rounded-xl transition-all text-sm shadow-sm">
                {i18n.language === "ar" ? "مشاهدة النماذج" : i18n.language === "fr" ? "Voir les modèles" : "View Templates"}
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }}
              className="flex items-center gap-5 pt-5 border-t border-slate-100 w-full"
            >
              {[
                { val: "+10K", label: t("hero.stat1") },
                { val: "20+", label: t("hero.stat2") },
                { val: "1080px", label: t("hero.stat3") },
              ].map((s, i) => (
                <div key={i} className={`flex flex-col ${i > 0 ? "ps-5 border-s border-slate-200" : ""}`}>
                  <span className="text-xl font-black text-slate-900" dir="ltr">{s.val}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Card preview column (DOM second = visually LEFT in RTL) ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="relative order-1 lg:order-2"
          >
            {/* Decorative bg blob */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/60 to-violet-100/40 rounded-3xl blur-2xl" />

            <div className="relative">
              {/* Main card */}
              <div className="relative z-10">
                <CardMockup template="classic" />
              </div>

              {/* Floating badge: resolution */}
              <div className="absolute -top-3 -end-3 z-20 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-blue-200">
                1080 × 1080
              </div>

              {/* Floating badge: ready */}
              <div className="absolute -bottom-3 -start-3 z-20 bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-slate-700 text-xs font-semibold">
                  {i18n.language === "ar" ? "جاهز للنشر" : i18n.language === "fr" ? "Prêt à publier" : "Ready to publish"}
                </span>
              </div>

              {/* Side mini cards */}
              <div className="absolute -end-6 top-8 z-0 w-24 opacity-70 rotate-3 hidden lg:block">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white scale-90">
                  <div className="h-12 bg-gradient-to-br from-red-700 to-red-900" />
                  <div className="bg-red-800 p-1.5">
                    <div className="h-1 bg-white/60 rounded mb-1 w-full" />
                    <div className="h-1 bg-white/30 rounded w-3/4" />
                  </div>
                </div>
              </div>
              <div className="absolute -start-6 bottom-8 z-0 w-24 opacity-70 -rotate-3 hidden lg:block">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white scale-90">
                  <div className="h-12 bg-gradient-to-br from-slate-700 to-slate-900" />
                  <div className="bg-slate-900 p-1.5">
                    <div className="h-1 bg-white/50 rounded mb-1 w-full" />
                    <div className="h-1 bg-white/25 rounded w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
}

/* ────── Features ──────────────────────── */
function Features() {
  const { t } = useTranslation();
  const { ref, inView } = useSectionReveal();

  const features = [
    {
      icon: LayoutTemplate,
      key: "item2",
      size: "lg",
      accent: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      preview: (
        <div className="mt-4 flex gap-2">
          {["classic", "breaking", "dark"].map((t, i) => (
            <div key={i} className={`flex-1 rounded-lg h-14 ${i === 0 ? "bg-blue-600" : i === 1 ? "bg-red-700" : "bg-slate-800"} opacity-${i === 0 ? "100" : "60"} border-2 ${i === 0 ? "border-blue-400" : "border-transparent"}`} />
          ))}
        </div>
      ),
    },
    {
      icon: Zap,
      key: "item1",
      size: "sm",
      accent: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      icon: Bot,
      key: "item3",
      size: "sm",
      accent: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      preview: (
        <div className="mt-3 rounded-lg bg-slate-900 p-2.5 text-[10px] font-mono text-green-400">
          <div className="opacity-60">{"// bot.on('message')"}</div>
          <div>{"→ generate_card()"}</div>
          <div>{"→ send_to_channel()"}</div>
        </div>
      ),
    },
    {
      icon: Code2,
      key: "item6",
      size: "sm",
      accent: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-100",
    },
    {
      icon: Layout,
      key: "item5",
      size: "lg",
      accent: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
      preview: (
        <div className="mt-4 bg-slate-100 rounded-xl h-20 relative overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="absolute w-10 h-10 rounded-lg bg-blue-200 border-2 border-blue-400 cursor-move opacity-80"
              style={{ top: `${8 + i * 14}px`, left: `${10 + i * 30}px` }} />
          ))}
        </div>
      ),
    },
    {
      icon: Palette,
      key: "item4",
      size: "sm",
      accent: "text-pink-600",
      bg: "bg-pink-50",
      border: "border-pink-100",
      preview: (
        <div className="mt-3 flex gap-1.5">
          {["#0f2557","#7f1d1d","#064e3b","#1e1b4b","#7c3aed"].map(c => (
            <div key={c} className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ background: c }} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="features" ref={ref as any} className="py-20 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.p variants={fadeUp(0)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2"
          >
            {t("nav.features")}
          </motion.p>
          <motion.h2 variants={fadeUp(0.08)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
          >
            {t("features.title")}
          </motion.h2>
          <motion.p variants={fadeUp(0.16)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed"
          >
            {t("features.subtitle")}
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, key, accent, bg, border, preview }, i) => (
            <motion.div
              key={key}
              variants={fadeUp(0.06 * i)}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`${bg} border ${border} rounded-2xl p-5 hover:shadow-md transition-all duration-300 group`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white border ${border} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={accent} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">{t(`features.${key}.title`)}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{t(`features.${key}.desc`)}</p>
              {preview}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────── How It Works ──────────────────── */
function HowItWorks({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const { ref, inView } = useSectionReveal();

  const steps = [
    { key: "step1", icon: LayoutTemplate, number: "01", color: "bg-blue-600" },
    { key: "step2", icon: ImageIcon, number: "02", color: "bg-violet-600" },
    { key: "step3", icon: MonitorPlay, number: "03", color: "bg-green-600" },
  ];

  return (
    <section id="how" ref={ref as any} className="py-20 px-5 bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.p variants={fadeUp(0)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-violet-600 text-sm font-bold uppercase tracking-widest mb-2">
            {t("nav.howItWorks")}
          </motion.p>
          <motion.h2 variants={fadeUp(0.08)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            {t("howItWorks.title")}
          </motion.h2>
          <motion.p variants={fadeUp(0.16)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-slate-500 max-w-lg mx-auto text-sm">
            {t("howItWorks.subtitle")}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 lg:gap-10 relative">
          {/* Connector */}
          <div className="hidden sm:block absolute top-8 start-[calc(16%+24px)] end-[calc(16%+24px)] h-px bg-gradient-to-r from-blue-200 via-violet-200 to-green-200" />

          {steps.map(({ key, icon: Icon, number, color }, i) => (
            <motion.div key={key}
              variants={fadeUp(0.1 + i * 0.12)} initial="hidden" animate={inView ? "show" : "hidden"}
              className="flex flex-col items-center text-center relative"
            >
              <div className={`${color} w-16 h-16 rounded-2xl flex flex-col items-center justify-center mb-5 shadow-lg relative z-10`}>
                <Icon size={22} className="text-white" />
                <span className="text-white/60 text-[9px] font-black mt-0.5">{number}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{t(`howItWorks.${key}.title`)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(`howItWorks.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp(0.4)} initial="hidden" animate={inView ? "show" : "hidden"}
          className="text-center mt-12">
          <button onClick={onTool}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md">
            <Sparkles size={14} className="text-blue-400" />
            {t("nav.tryFree")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ────── Pricing ───────────────────────── */
function Pricing({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [yearly, setYearly] = useState(false);
  const { ref, inView } = useSectionReveal();

  const plans = [
    {
      key: "free",
      price: "0",
      recommended: false,
      features: ["f1", "f2", "f3", "f4"],
      btnLabel: t("pricing.cta"),
      btnClass: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200",
      cardClass: "bg-white border-slate-200",
    },
    {
      key: "pro",
      price: yearly ? t("pricing.pro.priceYear") : t("pricing.pro.price"),
      recommended: true,
      features: ["f1", "f2", "f3", "f4", "f5", "f6"],
      btnLabel: t("pricing.ctaPro"),
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200",
      cardClass: "bg-blue-600 border-blue-600",
    },
  ];

  return (
    <section id="pricing" ref={ref as any} className="py-20 px-5 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <motion.p variants={fadeUp(0)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-green-600 text-sm font-bold uppercase tracking-widest mb-2">
            {t("nav.pricing")}
          </motion.p>
          <motion.h2 variants={fadeUp(0.08)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            {t("pricing.title")}
          </motion.h2>
          <motion.p variants={fadeUp(0.16)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-slate-500 max-w-lg mx-auto text-sm mb-6">
            {t("pricing.subtitle")}
          </motion.p>

          {/* Billing toggle */}
          <motion.div variants={fadeUp(0.24)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!yearly ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
              {t("pricing.monthly")}
            </button>
            <button onClick={() => setYearly(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${yearly ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
              {t("pricing.yearly")}
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                {t("pricing.save")}
              </span>
            </button>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              variants={fadeUp(0.1 + i * 0.12)}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`relative rounded-2xl border p-6 ${plan.cardClass} ${plan.recommended ? "shadow-xl shadow-blue-100" : "shadow-sm"}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="bg-amber-400 text-amber-900 text-xs font-black px-4 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star size={10} fill="currentColor" />
                    {t("pricing.popular")}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-2 ${plan.recommended ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {t(`pricing.${plan.key}.name`)}
                </div>
                <p className={`text-sm ${plan.recommended ? "text-blue-100" : "text-slate-500"}`}>
                  {t(`pricing.${plan.key}.desc`)}
                </p>
              </div>

              <div className="mb-5">
                <div className={`flex items-end gap-1 ${plan.recommended ? "text-white" : "text-slate-900"}`}>
                  <span className="text-4xl font-black" dir="ltr">{plan.price}</span>
                  {plan.key !== "free" && (
                    <span className={`text-sm pb-1 ${plan.recommended ? "text-blue-200" : "text-slate-400"}`}>
                      {t("pricing.currency")}/mo
                    </span>
                  )}
                </div>
                {plan.key === "free" && (
                  <p className="text-slate-400 text-xs mt-0.5">{t("pricing.monthly")}</p>
                )}
              </div>

              <button
                onClick={plan.key === "free" ? onTool : () => (window.location.href = "/pro/")}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all mb-5 ${plan.btnClass}`}
              >
                {plan.btnLabel}
              </button>

              <ul className="space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={14} className={`shrink-0 mt-0.5 ${plan.recommended ? "text-blue-300" : "text-green-500"}`} />
                    <span className={plan.recommended ? "text-blue-100" : "text-slate-600"}>
                      {t(`pricing.${plan.key}.${f}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Trust row */}
        <motion.div variants={fadeUp(0.3)} initial="hidden" animate={inView ? "show" : "hidden"}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          {[Shield, Clock, CheckCircle2].map((Icon, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Icon size={13} /> {["SSL Secured", "99.9% Uptime", "Cancel Anytime"][i]}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────── FAQ ───────────────────────────── */
function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const { ref, inView } = useSectionReveal();

  return (
    <section id="faq" ref={ref as any} className="py-20 px-5 bg-slate-50 border-t border-slate-100">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <motion.p variants={fadeUp(0)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-2">FAQ</motion.p>
          <motion.h2 variants={fadeUp(0.08)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{t("faq.title")}</motion.h2>
          <motion.p variants={fadeUp(0.16)} initial="hidden" animate={inView ? "show" : "hidden"}
            className="text-slate-500 text-sm">{t("faq.subtitle")}</motion.p>
        </div>

        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={i}
              variants={fadeUp(0.05 + i * 0.05)}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`bg-white rounded-xl border transition-all overflow-hidden
                ${open === i ? "border-blue-200 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-start"
              >
                <span className={`text-sm font-semibold leading-snug ${open === i ? "text-blue-700" : "text-slate-800"}`}>
                  {t(`faq.q${i + 1}`)}
                </span>
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all
                  ${open === i ? "bg-blue-600 rotate-180" : "bg-slate-100"}`}>
                  <ChevronDown size={13} className={open === i ? "text-white" : "text-slate-500"} />
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                      {t(`faq.a${i + 1}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────── CTA Banner ────────────────────── */
function CTABanner({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const { ref, inView } = useSectionReveal();

  return (
    <section ref={ref as any} className="py-20 px-5 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl px-8 sm:px-16 py-12 sm:py-16 text-center relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -top-12 -end-12 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -start-8 w-28 h-28 rounded-full bg-white/10" />

          <h2 className="relative text-2xl sm:text-3xl font-black text-white mb-4">
            {i18n.language === "ar" ? "ابدأ مجاناً اليوم" : i18n.language === "fr" ? "Commencez gratuitement" : "Start for free today"}
          </h2>
          <p className="relative text-blue-200 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
            {i18n.language === "ar"
              ? "انضم لمئات المؤسسات الإعلامية التي تثق بمنصتنا لإنتاج بطاقاتها الإخبارية."
              : i18n.language === "fr"
              ? "Rejoignez des centaines de médias qui font confiance à notre plateforme."
              : "Join hundreds of media organizations that trust our platform."}
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={onTool}
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm shadow-lg shadow-blue-900/20">
              {t("hero.cta")}
            </button>
            <a href="/pro/"
              className="px-8 py-3 bg-blue-500 hover:bg-blue-400 border border-blue-400 text-white font-semibold rounded-xl transition-all text-sm">
              {t("nav.dashboard")} →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────── Footer ────────────────────────── */
function Footer({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Newspaper size={15} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                News<span className="text-blue-400">Card</span> Pro
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{t("footer.desc")}</p>
            <div className="flex items-center gap-3 mt-5">
              <LangSwitcher variant="dark" />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">{t("footer.product")}</h4>
            <ul className="space-y-2.5">
              <li><button onClick={onTool} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.tool")}</button></li>
              <li><a href="/pro/" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.dashboard")}</a></li>
              <li><button onClick={() => scroll("pricing")} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.pricing")}</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} NewsCard Pro. {t("footer.rights")}.
          </p>
          <p className="text-slate-600 text-xs">
            {" بنيت بأحدث التقنيات · React · Express · Playwright"}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ────── Main Export ───────────────────── */
export default function Landing({ onOpenTool }: { onOpenTool: () => void }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const l = LANGS.find(x => x.code === i18n.language) ?? LANGS[0];
    document.documentElement.dir = l.dir;
    document.documentElement.lang = l.code;
  }, [i18n.language]);

  return (
    /* Force light theme regardless of body dark CSS vars */
    <div
      className="min-h-screen text-slate-900 antialiased overflow-x-hidden"
      style={{ background: "#fafafa", color: "#0f172a" }}
    >
      <Navbar onTool={onOpenTool} />
      <Hero onTool={onOpenTool} />
      <Features />
      <HowItWorks onTool={onOpenTool} />
      <Pricing onTool={onOpenTool} />
      <FAQ />
      <CTABanner onTool={onOpenTool} />
      <Footer onTool={onOpenTool} />
    </div>
  );
}
