import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Zap, Image, Bot, Palette, Layout, Code2,
  CheckCircle2, Star, ChevronDown, Globe, Menu, X,
  ArrowUpRight, Play, Sparkles, Shield, Clock
} from "lucide-react";

/* ─── constants ─────────────────────────────────── */
const LANGS = [
  { code: "ar", label: "العربية", flag: "🇲🇦", dir: "rtl" },
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇺🇸", dir: "ltr" },
];

/* ─── tiny helpers ───────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section id={id} ref={ref} data-inview={inView} className={className}>
      {children}
    </section>
  );
}

/* ─── Language Switcher ─────────────────────────── */
function LangSwitcher({ dark = false }: { dark?: boolean }) {
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
    const handleClick = () => setOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
          ${dark
            ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
          }`}
      >
        <Globe size={13} />
        <span>{current.flag} {current.label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 start-0 z-[100] min-w-[150px] rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900"
          >
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => pick(l)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-start transition-colors
                  ${l.code === i18n.language
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-slate-300 hover:bg-slate-800"
                  }`}
              >
                <span>{l.flag}</span> {l.label}
                {l.code === i18n.language && <CheckCircle2 size={13} className="ms-auto text-blue-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Nav ────────────────────────────────────────── */
function Nav({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: t("nav.features"), id: "features" },
    { label: t("nav.howItWorks"), id: "how" },
    { label: t("nav.pricing"), id: "pricing" },
    { label: t("nav.faq"), id: "faq" },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080d1a]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-xl shadow-black/30" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0 me-auto md:me-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-base shadow-lg shadow-blue-900/50">ب</div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">NewsCard<span className="text-blue-400">Pro</span></span>
        </div>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {links.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              className="px-3.5 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
              {l.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LangSwitcher />
          <a href="/pro/" className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors px-2">
            {t("nav.dashboard")}
          </a>
          <button onClick={onTool}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/40">
            <Sparkles size={13} />
            {t("nav.tryFree")}
          </button>
          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/[0.06] bg-[#080d1a]">
            <div className="px-5 py-4 flex flex-col gap-1">
              {links.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className="text-start px-3 py-2.5 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                  {l.label}
                </button>
              ))}
              <a href="/pro/" className="px-3 py-2.5 text-sm text-slate-300 hover:text-white">{t("nav.dashboard")}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────── */
function Hero({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();

  const stats = [
    { val: "+10K", label: i18n.language === "ar" ? "بطاقة مولَّدة" : i18n.language === "fr" ? "cartes" : "cards" },
    { val: "20+",  label: i18n.language === "ar" ? "قالب" : i18n.language === "fr" ? "modèles" : "templates" },
    { val: "1080", label: "px" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-5 text-center overflow-hidden">
      {/* Bg orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
      </div>
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative max-w-4xl mx-auto w-full">
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>

          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
              <Sparkles size={13} /> {t("hero.badge")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fadeUp} custom={0.1} className="font-black leading-tight mb-6">
            <span className="block text-white text-3xl sm:text-4xl md:text-5xl">{t("hero.title")}</span>
            <span className="block text-3xl sm:text-4xl md:text-6xl bg-gradient-to-r from-blue-400 via-violet-400 to-blue-300 bg-clip-text text-transparent py-1">
              {t("hero.titleAccent")}
            </span>
            <span className="block text-white/60 text-2xl sm:text-3xl font-bold">{t("hero.titleEnd")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} custom={0.2}
            className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={onTool}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-2xl font-bold text-base transition-all shadow-xl shadow-blue-900/40">
              <Sparkles size={16} />
              {t("hero.cta")}
              <ArrowUpRight size={16} className="opacity-70" />
            </button>
            <a href="/pro/"
              className="flex items-center gap-2 px-6 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 rounded-2xl font-semibold text-white transition-all text-sm">
              {t("nav.dashboard")} →
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} custom={0.4}
            className="flex items-center justify-center gap-8 pt-8 border-t border-white/[0.06]">
            {stats.map((s, i) => (
              <div key={i} className={`text-center ${i > 0 ? "border-s border-white/[0.08] ps-8" : ""}`}>
                <div className="text-2xl sm:text-3xl font-black text-white" dir="ltr">{s.val}<span className="text-blue-400">{s.label}</span></div>
                <div className="text-xs text-slate-500 mt-1">{t(`hero.stat${i + 1}`)}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Card mockup row */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
        className="relative mt-16 flex gap-4 items-end justify-center">
        {/* Main card */}
        <div className="relative">
          <div className="w-52 sm:w-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/30">
            <div className="h-32 sm:h-40 bg-gradient-to-br from-slate-700 to-slate-800 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/30" />
              <div className="absolute bottom-2 start-3 end-3 flex flex-col gap-1">
                {[...Array(3)].map((_, j) => <div key={j} className="h-1 bg-white/20 rounded" style={{ width: `${80 - j*15}%` }} />)}
              </div>
            </div>
            <div className="bg-[#0f2557] px-4 py-3 flex flex-col gap-1.5">
              <div className="h-2 bg-white/80 rounded-full w-full" />
              <div className="h-1.5 bg-white/40 rounded-full w-4/5" />
              <div className="flex items-center justify-between mt-1">
                <div className="h-1.5 bg-white/25 rounded-full w-1/3" />
                <div className="w-5 h-5 rounded bg-white/20" />
              </div>
            </div>
          </div>
          <div className="absolute -top-2 -end-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
            1080×1080
          </div>
          <div className="absolute -bottom-2 -start-2 bg-slate-800 border border-slate-700 text-[10px] font-medium px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300">{i18n.language === "ar" ? "جاهز للنشر" : "Ready"}</span>
          </div>
        </div>

        {/* Side card — breaking news template */}
        <div className="w-40 sm:w-48 rounded-2xl overflow-hidden border border-white/10 shadow-xl opacity-60 hidden sm:block">
          <div className="h-24 bg-gradient-to-br from-red-900 to-red-800 relative">
            <div className="absolute top-2 start-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">عاجل</div>
          </div>
          <div className="bg-[#7f1d1d] px-3 py-2.5 flex flex-col gap-1">
            <div className="h-1.5 bg-white/70 rounded-full w-full" />
            <div className="h-1.5 bg-white/40 rounded-full w-3/4" />
          </div>
        </div>

        {/* Side card — dark template */}
        <div className="w-40 sm:w-48 rounded-2xl overflow-hidden border border-white/10 shadow-xl opacity-60 hidden sm:block">
          <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-800 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          <div className="bg-slate-900 px-3 py-2.5 flex flex-col gap-1">
            <div className="h-1.5 bg-white/50 rounded-full w-full" />
            <div className="h-1.5 bg-white/30 rounded-full w-2/3" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────── */
function Features() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const items = [
    { icon: Zap,     key: "item1", color: "from-yellow-500/20 to-orange-500/20",   border: "border-yellow-500/20",   text: "text-yellow-300" },
    { icon: Image,   key: "item2", color: "from-blue-500/20 to-cyan-500/20",        border: "border-blue-500/20",     text: "text-blue-300" },
    { icon: Bot,     key: "item3", color: "from-violet-500/20 to-purple-500/20",    border: "border-violet-500/20",   text: "text-violet-300" },
    { icon: Palette, key: "item4", color: "from-pink-500/20 to-rose-500/20",        border: "border-pink-500/20",     text: "text-pink-300" },
    { icon: Layout,  key: "item5", color: "from-green-500/20 to-emerald-500/20",    border: "border-green-500/20",    text: "text-green-300" },
    { icon: Code2,   key: "item6", color: "from-slate-400/20 to-slate-500/20",      border: "border-slate-400/20",    text: "text-slate-300" },
  ];

  return (
    <Section id="features" className="py-24 px-5">
      <div className="max-w-7xl mx-auto">
        <div ref={ref} className="text-center mb-14">
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}
            className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
            {t("nav.features")}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("features.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            {t("features.subtitle")}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, key, color, border, text }, i) => (
            <motion.div key={key}
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className={`group relative bg-gradient-to-br ${color} border ${border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-default`}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} border ${border} flex items-center justify-center mb-5`}>
                <Icon size={20} className={text} />
              </div>
              <h3 className="font-bold text-white mb-2 text-base">{t(`features.${key}.title`)}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── How It Works ───────────────────────────────── */
function HowItWorks({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const steps = [
    { num: "١", key: "step1", icon: Palette },
    { num: "٢", key: "step2", icon: Image },
    { num: "٣", key: "step3", icon: ArrowUpRight },
  ];

  return (
    <Section id="how" className="py-24 px-5 bg-gradient-to-b from-slate-900/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div ref={ref} className="text-center mb-14">
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
            {t("nav.howItWorks")}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("howItWorks.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto">
            {t("howItWorks.subtitle")}
          </motion.p>
        </div>

        <div className="relative grid sm:grid-cols-3 gap-8 lg:gap-12">
          {/* connecting line */}
          <div className="hidden sm:block absolute top-10 start-[17%] end-[17%] h-px bg-gradient-to-r from-blue-500/30 via-violet-500/50 to-blue-500/30" />

          {steps.map(({ num, key, icon: Icon }, i) => (
            <motion.div key={key} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 + i * 0.12 }}
              className="flex flex-col items-center text-center relative">
              <div className="relative w-20 h-20 mb-6 z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-900/40">
                  {num}
                </div>
                <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Icon size={14} className="text-blue-300" />
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{t(`howItWorks.${key}.title`)}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t(`howItWorks.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}
          className="mt-14 text-center">
          <button onClick={onTool}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl font-semibold text-white transition-all">
            <Sparkles size={15} className="text-blue-400" />
            {t("nav.tryFree")}
            <ArrowUpRight size={15} className="text-slate-400" />
          </button>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── Pricing ─────────────────────────────────────── */
function Pricing({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [yearly, setYearly] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const plans = [
    {
      key: "free", featured: false,
      accent: "border-slate-700",
      badgeBg: "bg-slate-700 text-slate-300",
      btnCls: "bg-white/8 hover:bg-white/15 text-white border border-white/10",
      iconColor: "text-slate-400",
      features: ["f1","f2","f3","f4"],
    },
    {
      key: "basic", featured: false,
      accent: "border-blue-600/50",
      badgeBg: "bg-blue-600/20 text-blue-300",
      btnCls: "bg-blue-600 hover:bg-blue-500 text-white",
      iconColor: "text-blue-400",
      features: ["f1","f2","f3","f4","f5"],
    },
    {
      key: "pro", featured: true,
      accent: "border-violet-500",
      badgeBg: "bg-violet-500/20 text-violet-300",
      btnCls: "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-900/40",
      iconColor: "text-violet-400",
      features: ["f1","f2","f3","f4","f5","f6"],
    },
  ];

  return (
    <Section id="pricing" className="py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">
            {t("nav.pricing")}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("pricing.title")}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
            className="text-slate-400 mb-8">
            {t("pricing.subtitle")}
          </motion.p>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
            className="inline-flex items-center p-1 bg-slate-800/60 border border-slate-700 rounded-xl">
            <button onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${!yearly ? "bg-white text-slate-900 shadow" : "text-slate-400 hover:text-white"}`}>
              {t("pricing.monthly")}
            </button>
            <button onClick={() => setYearly(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${yearly ? "bg-white text-slate-900 shadow" : "text-slate-400 hover:text-white"}`}>
              {t("pricing.yearly")}
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">{t("pricing.save")}</span>
            </button>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => {
            const price = yearly && plan.key !== "free"
              ? t(`pricing.${plan.key}.priceYear`)
              : t(`pricing.${plan.key}.price`);

            return (
              <motion.div key={plan.key}
                initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.1 }}
                className={`relative flex flex-col rounded-2xl border ${plan.accent} p-6 bg-slate-900/60 backdrop-blur-sm
                  ${plan.featured ? "ring-1 ring-violet-500/50 shadow-xl shadow-violet-900/20" : ""}`}>

                {plan.featured && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                      <Star size={10} fill="currentColor" /> {t("pricing.popular")}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${plan.badgeBg} mb-3`}>
                    {t(`pricing.${plan.key}.name`)}
                  </span>
                  <p className="text-slate-400 text-sm">{t(`pricing.${plan.key}.desc`)}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{price}</span>
                    {plan.key !== "free" && (
                      <span className="text-slate-400 text-sm pb-1">{t("pricing.currency")}/mo</span>
                    )}
                  </div>
                  {yearly && plan.key !== "free" && (
                    <p className="text-green-400 text-xs mt-1">{t("pricing.save")} 🎉</p>
                  )}
                </div>

                <button
                  onClick={plan.key === "free" ? onTool : () => (window.location.href = "/pro/")}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all mb-6 ${plan.btnCls}`}>
                  {plan.key === "pro" ? t("pricing.ctaPro") : t("pricing.cta")}
                </button>

                <ul className="space-y-2.5 mt-auto">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                      <span className="text-slate-300">{t(`pricing.${plan.key}.${f}`)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          {[
            { icon: Shield, label: "SSL Secured" },
            { icon: Clock, label: "99.9% Uptime" },
            { icon: CheckCircle2, label: "Cancel Anytime" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={14} className="text-slate-600" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── FAQ ────────────────────────────────────────── */
function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <Section id="faq" className="py-24 px-5 bg-gradient-to-b from-transparent to-slate-900/20">
      <div className="max-w-2xl mx-auto">
        <div ref={ref} className="text-center mb-12">
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">FAQ</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("faq.title")}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
            className="text-slate-400">{t("faq.subtitle")}</motion.p>
        </div>

        <div className="space-y-2">
          {[0,1,2,3,4,5].map((i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.07 }}
              className={`rounded-xl border transition-all ${open === i ? "border-blue-500/30 bg-blue-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-start">
                <span className={`font-medium text-sm leading-snug ${open === i ? "text-white" : "text-slate-300"}`}>
                  {t(`faq.q${i + 1}`)}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${open === i ? "bg-blue-500 rotate-180" : "bg-white/5"}`}>
                  <ChevronDown size={13} />
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/[0.06] pt-3">
                      {t(`faq.a${i + 1}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── CTA Section ────────────────────────────────── */
function CTA({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const headline = i18n.language === "ar" ? "جاهز للبدء اليوم؟" : i18n.language === "fr" ? "Prêt à commencer?" : "Ready to get started?";
  const sub = i18n.language === "ar" ? "انضم لمئات المؤسسات الإعلامية التي تثق بمنصتنا." : i18n.language === "fr" ? "Rejoignez des centaines de médias qui nous font confiance." : "Join hundreds of media organizations that trust us.";

  return (
    <section className="py-20 px-5">
      <div ref={ref} className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-blue-900/30 via-slate-900 to-violet-900/30 p-10 sm:p-16 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 left-1/4 w-64 h-64 bg-blue-600/15 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-[80px]" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{headline}</h2>
            <p className="text-slate-400 text-base mb-8 max-w-lg mx-auto">{sub}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={onTool}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/40">
                <Sparkles size={16} /> {t("nav.tryFree")}
              </button>
              <a href="/pro/"
                className="flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl font-semibold text-white transition-all">
                {t("nav.dashboard")} →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────── */
function Footer({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="border-t border-white/[0.06] bg-slate-950/50 backdrop-blur-sm py-14 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-base">ب</div>
              <span className="font-bold text-lg">NewsCard<span className="text-blue-400">Pro</span></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{t("footer.desc")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">{t("footer.product")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("footer.tool"), fn: () => onTool() },
                { label: t("footer.dashboard"), href: "/pro/" },
                { label: t("footer.pricing"), fn: () => scrollTo("pricing") },
              ].map((item, i) => (
                <li key={i}>
                  {item.href
                    ? <a href={item.href} className="text-sm text-slate-500 hover:text-white transition-colors">{item.label}</a>
                    : <button onClick={item.fn} className="text-sm text-slate-500 hover:text-white transition-colors">{item.label}</button>
                  }
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3">
              {[t("footer.about"), t("footer.contact")].map(item => (
                <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} NewsCard Pro. {t("footer.rights")}.</p>
          <LangSwitcher dark />
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Export ─────────────────────────────────── */
export default function Landing({ onOpenTool }: { onOpenTool: () => void }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const l = LANGS.find(x => x.code === i18n.language) ?? LANGS[0];
    document.documentElement.dir = l.dir;
    document.documentElement.lang = l.code;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-[#080d1a] text-white antialiased overflow-x-hidden">
      <Nav onTool={onOpenTool} />
      <Hero onTool={onOpenTool} />
      <Features />
      <HowItWorks onTool={onOpenTool} />
      <Pricing onTool={onOpenTool} />
      <FAQ />
      <CTA onTool={onOpenTool} />
      <Footer onTool={onOpenTool} />
    </div>
  );
}
