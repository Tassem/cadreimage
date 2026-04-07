/**
 * Landing — NewsCard Pro
 * Desktop-first · Cairo + Inter · #0066FF system
 * Max-width 1280px · Full-bleed hero · Horizontal layout
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Menu, X, ChevronDown, CheckCircle2, Star,
  Zap, Bot, Code2, Palette, Layout, LayoutTemplate,
  Newspaper, ArrowRight, ArrowLeft, Plus, Minus, Download,
  Image as ImgIcon, Shield,
} from "lucide-react";

/* ═══ TOKENS ═══════════════════════════════════════════════ */
const C = {
  blue:    "#0066FF",
  blueDk:  "#004FCC",
  blueLt:  "#EBF3FF",
  blueMd:  "#C2DAFE",
  white:   "#FFFFFF",
  bg:      "#F7F9FC",
  ink:     "#0F172A",
  sub:     "#475569",
  border:  "#E2E8F0",
  soft:    "#F1F5F9",
};

/* ═══ LANGUAGES ══════════════════════════════════════════ */
const LANGS = [
  { code:"ar", label:"العربية",  flag:"AR", dir:"rtl" as const, font:"'Cairo',sans-serif" },
  { code:"en", label:"English",  flag:"EN", dir:"ltr" as const, font:"'Inter',sans-serif" },
  { code:"fr", label:"Français", flag:"FR", dir:"ltr" as const, font:"'Inter',sans-serif" },
] as const;
type LangCode = "ar"|"en"|"fr";

function useLang() {
  const { i18n } = useTranslation();
  return LANGS.find(l => l.code === i18n.language) ?? LANGS[0];
}
function applyLang(l: typeof LANGS[number]) {
  document.documentElement.setAttribute("dir", l.dir);
  document.documentElement.setAttribute("lang", l.code);
}

/* ═══ LANG PICKER ══════════════════════════════════════ */
function LangPicker({ dark }: { dark?: boolean }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  const pick = (l: typeof LANGS[number]) => {
    i18n.changeLanguage(l.code);
    localStorage.setItem("ncg-lang", l.code);
    applyLang(l);
    setOpen(false);
  };
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative select-none">
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all
          ${dark
            ? "border-white/20 text-white/75 hover:bg-white/10"
            : "border-slate-200 text-slate-600 hover:border-blue-300 bg-white shadow-sm"}`}>
        <Globe size={14} />
        <span className="w-6 text-center tracking-wide">{cur.flag}</span>
        <ChevronDown size={11} className={`transition-transform ${open?"rotate-180":""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity:0, y:-4, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-4, scale:0.97 }}
            transition={{ duration:0.13 }}
            className="absolute top-full mt-1.5 end-0 z-[400] w-44 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5">
            {LANGS.map(l => (
              <li key={l.code}>
                <button onClick={() => pick(l)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition-colors
                    ${l.code === cur.code
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-700 hover:bg-slate-50 font-medium"}`}>
                  <span className={`inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-black
                    ${l.code === cur.code ? "bg-[#0066FF] text-white" : "bg-slate-100 text-slate-500"}`}>
                    {l.flag}
                  </span>
                  {l.label}
                  {l.code === cur.code && <CheckCircle2 size={12} className="ms-auto text-blue-400" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ NAVBAR ════════════════════════════════════════════ */
function Navbar({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMob(false);
  };

  const links = [
    { id:"features", l:t("nav.features") },
    { id:"how",      l:t("nav.howItWorks") },
    { id:"pricing",  l:t("nav.pricing") },
  ];

  return (
    <header style={{ fontFamily:lang.font }}
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-all duration-200
        ${scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.08)]" : "border-b border-slate-100"}`}>
      <div className="max-w-[1280px] mx-auto px-8 h-[68px] flex items-center gap-6">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:C.blue }}>
            <Newspaper size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-[16px] tracking-tight" style={{ color:C.ink }}>
            NewsCard<span style={{ color:C.blue }}> Pro</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ms-4">
          {links.map(n => (
            <button key={n.id} onClick={() => go(n.id)}
              className="px-4 py-2 text-[14px] font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all">
              {n.l}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 ms-auto">
          <LangPicker />
          <a href="/pro/"
            className="hidden sm:block px-3 py-2 text-[14px] font-medium text-slate-600 hover:text-blue-600 transition-colors">
            {t("nav.dashboard")}
          </a>
          <button onClick={onTool}
            className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-sm"
            style={{ background:C.blue }}
            onMouseEnter={e => (e.currentTarget.style.background = C.blueDk)}
            onMouseLeave={e => (e.currentTarget.style.background = C.blue)}>
            {t("nav.tryFree")}
          </button>
          <button className="md:hidden p-2 text-slate-500" onClick={() => setMob(v => !v)}>
            {mob ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mob && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} className="md:hidden bg-white border-t border-slate-100 overflow-hidden">
            <div className="max-w-[1280px] mx-auto px-8 py-3 flex flex-col gap-1">
              {links.map(n => (
                <button key={n.id} onClick={() => go(n.id)}
                  className="text-start px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50 font-medium">
                  {n.l}
                </button>
              ))}
              <a href="/pro/" className="px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50 font-medium">
                {t("nav.dashboard")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ═══ BROWSER MOCKUP ══════════════════════════════════ */
function BrowserMockup() {
  const [active, setActive] = useState(1);
  const tpls = [
    { cat:"عاجل",   badge:"#DC2626", g1:"#4a0404", g2:"#1c0a0a", headline:"القمة العربية تنتهي بوثيقة السلام الشاملة" },
    { cat:"اقتصاد", badge:"#B45309", g1:"#1c1206", g2:"#0f0a05", headline:"البنك المركزي يرفع أسعار الفائدة للمرة الثالثة هذا العام" },
    { cat:"رياضة",  badge:"#15803D", g1:"#04230e", g2:"#030f06", headline:"المنتخب الوطني يتأهل لنهائيات كأس العالم ٢٠٢٦" },
  ];
  const t = tpls[active];

  return (
    <div className="relative">
      {/* ambient glow */}
      <div className="absolute inset-6 rounded-3xl blur-2xl opacity-20 -z-10"
        style={{ background:C.blue }} />

      {/* frame */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden"
        style={{ boxShadow:"0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)" }}>

        {/* chrome */}
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50" dir="ltr">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 mx-3 h-7 px-3 flex items-center gap-2 bg-white border border-slate-200 rounded-md">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-slate-400 text-[11px]">newscard.pro/generate</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">v2.4</span>
        </div>

        {/* body */}
        <div className="flex" dir="ltr">

          {/* templates sidebar */}
          <div className="w-36 shrink-0 border-r border-slate-100 bg-slate-50 p-4">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">Templates</p>
            <div className="flex flex-col gap-2.5">
              {tpls.map((tpl, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`w-full rounded-xl overflow-hidden border-2 text-start transition-all
                    ${active===i ? "border-[#0066FF] shadow-md shadow-blue-100" : "border-transparent opacity-60 hover:opacity-90"}`}>
                  <div className="h-14 relative"
                    style={{ background:`linear-gradient(to bottom right,${tpl.g1},${tpl.g2})` }}>
                    <span className="absolute bottom-2 start-2 text-[8px] font-black px-1.5 py-0.5 rounded text-white"
                      style={{ background:tpl.badge }}>
                      {tpl.cat}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* canvas */}
          <div className="flex-1 flex items-center justify-center p-8"
            style={{ background:"#EEF3FB", minHeight:"280px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity:0, scale:0.93, y:8 }}
                animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.93, y:-8 }}
                transition={{ duration:0.22 }}
                className="w-48 rounded-2xl overflow-hidden"
                style={{ boxShadow:"0 20px 50px rgba(0,0,0,0.20)" }}>
                <div className="h-32 relative"
                  style={{ background:`linear-gradient(135deg,${t.g1},${t.g2})` }}>
                  <div className="absolute inset-0"
                    style={{ background:"linear-gradient(to top,rgba(0,0,0,0.5),transparent)" }}/>
                  <span className="absolute bottom-2.5 start-2.5 text-[10px] font-black px-2 py-0.5 rounded text-white z-10"
                    style={{ background:t.badge }}>
                    {t.cat}
                  </span>
                  <div className="absolute top-2.5 end-2.5 w-6 h-6 rounded flex items-center justify-center bg-white/15">
                    <Newspaper size={10} className="text-white" />
                  </div>
                </div>
                <div className="p-3.5" style={{ background:"#0b1f4a" }}>
                  <div className="w-5 h-0.5 rounded mb-2" style={{ background:t.badge }} />
                  <p className="text-white text-[10px] leading-snug font-medium">{t.headline}</p>
                  <p className="text-white/40 text-[9px] mt-2">٧ أبريل ٢٠٢٦</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* properties panel */}
          <div className="w-36 shrink-0 border-l border-slate-100 bg-white p-4 flex flex-col gap-4">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2.5">Color</p>
              <div className="flex flex-wrap gap-2">
                {["#0b1f4a","#4a0404","#04230e","#1e1b4b"].map((col,i) => (
                  <div key={col}
                    className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${i===0?"ring-2 ring-[#0066FF] ring-offset-1 scale-110":"hover:scale-110"}`}
                    style={{ background:col }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2">Format</p>
              {[["1:1","1080×1080",true],["9:16","Story",false],["16:9","Wide",false]].map(([r,lbl,sel]) => (
                <div key={String(r)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] mb-1 cursor-pointer
                    ${sel ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-500 hover:bg-slate-50"}`}>
                  <span>{r}</span><span>{lbl}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-slate-500 font-medium">Live sync</span>
            </div>
            <button className="mt-auto w-full py-2 rounded-lg text-[9px] font-bold text-white"
              style={{ background:C.blue }}>
              Export PNG
            </button>
          </div>
        </div>
      </div>

      {/* floating chips — anchored corners */}
      <div className="absolute -top-3 -start-3 flex items-center gap-2 bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[12px] font-bold text-slate-700">Live Preview</span>
      </div>
      <div className="absolute -bottom-3 -end-3 px-3.5 py-2 rounded-xl text-[12px] font-bold text-white shadow-lg"
        style={{ background:C.blue }}>
        1080 × 1080 px
      </div>
    </div>
  );
}

/* ═══ HERO ══════════════════════════════════════════════ */
function Hero({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const isRtl = lang.dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const copy: Record<string,{h1:string;h2:string}> = {
    ar: { h1:"أنت تصنع الخبر،",        h2:"ونحن نصنع البطاقة." },
    en: { h1:"You make the news,",      h2:"We make the card." },
    fr: { h1:"Vous créez l'actualité,", h2:"Nous créons la carte." },
  };
  const cp = copy[i18n.language] ?? copy.ar;

  return (
    <section className="relative overflow-hidden" style={{ background:C.white }}>
      {/* top blue tint */}
      <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none"
        style={{ background:"radial-gradient(ellipse 80% 60% at 50% -10%,rgba(0,102,255,0.07) 0%,transparent 100%)" }} />

      <div className="relative max-w-[1280px] mx-auto px-8 pt-20 pb-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* TEXT */}
          <motion.div initial={{ opacity:0, x: isRtl?20:-20 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.55 }}
            className={`flex flex-col order-2 lg:order-1 ${isRtl ? "items-end text-end" : "items-start text-start"}`}>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold border mb-7"
              style={{ background:C.blueLt, color:C.blue, borderColor:C.blueMd }}>
              <Zap size={13} />
              {t("hero.badge")}
            </div>

            <h1 className="font-black leading-[1.08] mb-6 text-slate-900"
              style={{ fontFamily:lang.font, fontSize:"clamp(2.4rem,5vw,4rem)", letterSpacing:isRtl?"0":"-0.04em" }}>
              <span className="block">{cp.h1}</span>
              <span className="block" style={{ color:C.blue }}>{cp.h2}</span>
            </h1>

            <p className="leading-relaxed mb-9 max-w-[480px]"
              style={{ color:C.sub, fontSize:"clamp(16px,1.8vw,18px)" }}>
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button onClick={onTool}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-[15px] text-white transition-all"
                style={{ background:C.blue, boxShadow:"0 4px 24px rgba(0,102,255,0.32)" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.blueDk)}
                onMouseLeave={e => (e.currentTarget.style.background = C.blue)}>
                {t("hero.cta")} <Arrow size={15}/>
              </button>
              <a href="/pro/"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] text-slate-700 bg-white border border-slate-200 hover:border-slate-300 transition-all"
                style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                {i18n.language==="ar" ? "لوحة التحكم" : i18n.language==="fr" ? "Tableau de bord" : "Dashboard"} →
              </a>
            </div>

            {/* stats */}
            <div className="flex items-stretch gap-10 pt-8 border-t border-slate-200">
              {[
                { v:"10,000+", l:t("hero.stat1") },
                { v:"20+",     l:t("hero.stat2") },
                { v:"3",       l:isRtl?"لغات مدعومة":"Languages" },
              ].map((s,i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-3xl font-black text-slate-900" dir="ltr">{s.v}</span>
                  <span className="text-[13px] mt-0.5" style={{ color:C.sub }}>{s.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* MOCKUP */}
          <motion.div initial={{ opacity:0, x:isRtl?-20:20 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.6, delay:0.1 }}
            className="order-1 lg:order-2 px-4 sm:px-0">
            <BrowserMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══ LOGO STRIP ═════════════════════════════════════ */
function Logos() {
  const { i18n } = useTranslation();
  const items = ["Al Jazeera · الجزيرة","Al Mayadeen · الميادين","Al Arabiya · العربية","Sky News Arabia","BBC Arabic"];
  const label = i18n.language==="ar" ? "موثوق به لدى فرق الإعلام في" : i18n.language==="fr" ? "Utilisé par" : "Trusted by editorial teams at";
  return (
    <div className="border-y border-slate-100 py-5" style={{ background:C.soft }}>
      <div className="max-w-[1280px] mx-auto px-8">
        <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">{label}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
          {items.map(it => <span key={it} className="text-[13px] font-semibold text-slate-400">{it}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ═══ FEATURES ══════════════════════════════════════ */
const FEATS = [
  { icon:Zap,            k:"item1" },
  { icon:LayoutTemplate, k:"item2" },
  { icon:Bot,            k:"item3" },
  { icon:Palette,        k:"item4" },
  { icon:Layout,         k:"item5" },
  { icon:Code2,          k:"item6" },
];

function useInView(threshold=0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { ref, v };
}

function Features() {
  const { t } = useTranslation();
  const { ref, v } = useInView();
  return (
    <section id="features" ref={ref} className="py-24 px-8" style={{ background:C.white }}>
      <div className="max-w-[1280px] mx-auto">

        {/* header: label + title side by side on desktop */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-14">
          <div>
            <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}}
              className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color:C.blue }}>
              {t("nav.features")}
            </motion.p>
            <motion.h2 initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.07 }}
              className="font-black text-slate-900" style={{ fontSize:"clamp(1.8rem,3vw,2.8rem)" }}>
              {t("features.title")}
            </motion.h2>
          </div>
          <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.14 }}
            className="text-slate-500 text-[15px] leading-relaxed max-w-sm lg:text-end">
            {t("features.subtitle")}
          </motion.p>
        </div>

        {/* 3-col grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATS.map(({ icon:Icon, k }, i) => (
            <motion.div key={k}
              initial={{ opacity:0, y:20 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:i*0.07 }}
              className="group bg-white border border-slate-200 rounded-2xl p-7 hover:border-blue-200 hover:shadow-xl transition-all duration-250 hover:-translate-y-1 cursor-default">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background:C.blueLt }}>
                <Icon size={22} style={{ color:C.blue }} />
              </div>
              <h3 className="font-bold text-slate-900 text-[16px] mb-2.5">{t(`features.${k}.title`)}</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">{t(`features.${k}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ MULTI-LANG ═════════════════════════════════════ */
function MultiLang() {
  const { i18n } = useTranslation();
  const [sel, setSel] = useState<LangCode>("ar");
  const { ref, v } = useInView();

  const TABS: Record<LangCode,{ dir:"rtl"|"ltr"; font:string; h:string; sub:string; cta:string; cat:string; news:string }> = {
    ar: { dir:"rtl", font:"'Cairo',sans-serif",
          h:"أنت تصنع الخبر،\nونحن نصنع البطاقة.",
          sub:"منصة بطاقات الأخبار العربية — بجودة بث تلفزيوني للمؤسسات الإعلامية.",
          cta:"ابدأ مجاناً", cat:"اقتصاد",
          news:"البنك المركزي يرفع أسعار الفائدة للمرة الثالثة هذا العام" },
    en: { dir:"ltr", font:"'Inter',sans-serif",
          h:"You make the news,\nWe make the card.",
          sub:"Arabic news card platform — broadcast-quality output for media teams.",
          cta:"Get started free", cat:"Business",
          news:"Central bank raises interest rates for the third time this year" },
    fr: { dir:"ltr", font:"'Inter',sans-serif",
          h:"Vous créez l'actualité,\nNous créons la carte.",
          sub:"Générateur de cartes d'actualités — qualité broadcast garantie.",
          cta:"Commencer", cat:"Économie",
          news:"La banque centrale relève ses taux pour la 3ème fois cette année" },
  };
  const tab = TABS[sel];

  const title = i18n.language==="ar" ? "ثلاث لغات، واجهة واحدة"
    : i18n.language==="fr" ? "Trois langues, une interface"
    : "Three languages, one interface";

  return (
    <section ref={ref} className="py-24 px-8 border-y border-slate-100" style={{ background:C.bg }}>
      <div className="max-w-[1280px] mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-10">
          <div>
            <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}}
              className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color:C.blue }}>
              Multi-language
            </motion.p>
            <motion.h2 initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.07 }}
              className="font-black text-slate-900" style={{ fontSize:"clamp(1.8rem,3vw,2.8rem)" }}>
              {title}
            </motion.h2>
          </div>

          {/* tab strip */}
          <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.12 }}>
            <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {(["ar","en","fr"] as LangCode[]).map(code => (
                <button key={code} onClick={() => setSel(code)}
                  className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all
                    ${sel===code ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  style={sel===code ? { background:C.blue } : {}}>
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* big panel */}
        <AnimatePresence mode="wait">
          <motion.div key={sel}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}
            dir={tab.dir}
            className="bg-white border border-slate-200 rounded-3xl p-10 lg:p-14 shadow-sm"
            style={{ fontFamily:tab.font }}>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* text side */}
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="text-[11px] font-black px-3 py-1 rounded-full text-white"
                    style={{ background:C.blue }}>
                    {sel.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {tab.dir.toUpperCase()} direction
                  </span>
                </div>
                <h3 className="font-black text-slate-900 leading-snug mb-5 whitespace-pre-line"
                  style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)" }}>
                  {tab.h}
                </h3>
                <p className="text-slate-500 text-[16px] mb-8 leading-relaxed">{tab.sub}</p>
                <button className="px-7 py-3 rounded-xl text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background:C.blue }}>
                  {tab.cta}
                </button>
              </div>

              {/* card preview side */}
              <div className={`flex ${tab.dir==="rtl" ? "justify-start" : "justify-end"}`}>
                <div className="w-52 rounded-2xl overflow-hidden"
                  style={{ boxShadow:"0 24px 60px rgba(0,0,0,0.15)" }}>
                  <div className="h-36 relative"
                    style={{ background:"linear-gradient(135deg,#0b1f4a,#1e3a6e)" }}>
                    <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.4),transparent)" }}/>
                    <span className="absolute bottom-3 start-3 text-[10px] font-black px-2 py-0.5 rounded text-white z-10"
                      style={{ background:C.blue }}>
                      {tab.cat}
                    </span>
                    <div className="absolute top-3 end-3 w-7 h-7 rounded flex items-center justify-center bg-white/15">
                      <Newspaper size={11} className="text-white"/>
                    </div>
                  </div>
                  <div className="p-4" style={{ background:"#0b1f4a" }}>
                    <div className="w-6 h-0.5 rounded mb-3" style={{ background:C.blue }}/>
                    <p className="text-white text-[11px] leading-snug">{tab.news}</p>
                    <p className="text-white/40 text-[10px] mt-2.5">Apr 7, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ═══ HOW IT WORKS ═══════════════════════════════════ */
function HowItWorks({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const { ref, v } = useInView();
  const steps = [
    { k:"step1", icon:LayoutTemplate, n:1 },
    { k:"step2", icon:ImgIcon,        n:2 },
    { k:"step3", icon:Download,       n:3 },
  ];
  return (
    <section id="how" ref={ref} className="py-24 px-8" style={{ background:C.white }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}}
            className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color:C.blue }}>
            {t("nav.howItWorks")}
          </motion.p>
          <motion.h2 initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.07 }}
            className="font-black text-slate-900 mb-4" style={{ fontSize:"clamp(1.8rem,3vw,2.8rem)" }}>
            {t("howItWorks.title")}
          </motion.h2>
          <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.14 }}
            className="text-slate-500 text-[16px] max-w-md mx-auto leading-relaxed">
            {t("howItWorks.subtitle")}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          {/* connector */}
          <div className="hidden sm:block absolute top-10 start-[18%] end-[18%] h-px bg-slate-200" />

          {steps.map(({ k, icon:Icon, n }, i) => (
            <motion.div key={k}
              initial={{ opacity:0, y:24 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.1+i*0.13 }}
              className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6 z-10"
                style={{ background:C.blueLt, boxShadow:`0 8px 24px rgba(0,102,255,0.12)` }}>
                <Icon size={28} style={{ color:C.blue }}/>
                <span className="absolute -top-2.5 -end-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black text-white border-2 border-white"
                  style={{ background:C.blue }}>
                  {n}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-[17px] mb-2.5">{t(`howItWorks.${k}.title`)}</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">{t(`howItWorks.${k}.desc`)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.52 }}
          className="mt-14 flex justify-center">
          <button onClick={onTool}
            className="px-8 py-4 rounded-xl text-[15px] font-bold text-white transition-all"
            style={{ background:C.ink }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1e293b")}
            onMouseLeave={e => (e.currentTarget.style.background = C.ink)}>
            {t("nav.tryFree")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══ PRICING ════════════════════════════════════════ */
function Pricing({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const [yr, setYr] = useState(false);
  const { ref, v } = useInView();

  return (
    <section id="pricing" ref={ref} className="py-24 px-8 border-y border-slate-100" style={{ background:C.bg }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-14">
          <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}}
            className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color:C.blue }}>
            {t("nav.pricing")}
          </motion.p>
          <motion.h2 initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.07 }}
            className="font-black text-slate-900 mb-3" style={{ fontSize:"clamp(1.8rem,3vw,2.8rem)" }}>
            {t("pricing.title")}
          </motion.h2>
          <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.14 }}
            className="text-slate-500 text-[16px] mb-8">
            {t("pricing.subtitle")}
          </motion.p>

          {/* toggle */}
          <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.2 }}>
            <div className="inline-flex p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              {[
                { val:false, label:t("pricing.monthly") },
                { val:true, label:(
                  <span className="flex items-center gap-2">
                    {t("pricing.yearly")}
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {t("pricing.save")}
                    </span>
                  </span>
                )},
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => setYr(opt.val)}
                  className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center gap-1
                    ${yr===opt.val ? "text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                  style={yr===opt.val ? { background:C.blue } : {}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* cards — capped to 720px so they're not full 1280px wide */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-[720px] mx-auto items-stretch">

          {/* FREE */}
          <motion.div initial={{ opacity:0, y:24 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.16 }}
            className="flex flex-col bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="mb-7">
              <span className="inline-flex px-3 py-1 rounded-lg text-[12px] font-bold bg-slate-100 text-slate-600">
                {t("pricing.free.name")}
              </span>
              <p className="text-slate-400 text-[13px] mt-2">{t("pricing.free.desc")}</p>
            </div>
            <div className="flex items-end gap-1.5 mb-7" dir="ltr">
              <span className="text-[52px] font-black leading-none text-slate-900">0</span>
              <span className="text-slate-400 text-[14px] mb-1">{t("pricing.currency")}/mo</span>
            </div>
            <button onClick={onTool}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white mb-7 transition-all"
              style={{ background:C.ink }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1e293b")}
              onMouseLeave={e => (e.currentTarget.style.background = C.ink)}>
              {t("pricing.cta")}
            </button>
            <ul className="space-y-3.5 flex-1">
              {(["f1","f2","f3","f4"] as const).map(f => (
                <li key={f} className="flex items-start gap-3 text-[14px] text-slate-600">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500"/>
                  {t(`pricing.free.${f}`)}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* PRO */}
          <motion.div initial={{ opacity:0, y:24 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.26 }}
            className="flex flex-col rounded-2xl p-8 relative overflow-hidden"
            style={{ background:C.blue, boxShadow:`0 24px 60px rgba(0,102,255,0.24)` }}>
            <div className="absolute -top-px inset-x-0 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-b-2xl text-[11px] font-black text-amber-900"
                style={{ background:"#FBBF24" }}>
                <Star size={10} fill="currentColor"/>
                {t("pricing.popular")}
              </span>
            </div>
            <div className="mt-7 mb-7">
              <span className="inline-flex px-3 py-1 rounded-lg text-[12px] font-bold bg-blue-500 text-white">
                {t("pricing.pro.name")}
              </span>
              <p className="text-blue-200 text-[13px] mt-2">{t("pricing.pro.desc")}</p>
            </div>
            <div className="flex items-end gap-1.5 mb-7" dir="ltr">
              <span className="text-[52px] font-black leading-none text-white">
                {yr ? t("pricing.pro.priceYear") : t("pricing.pro.price")}
              </span>
              <span className="text-blue-200 text-[14px] mb-1">{t("pricing.currency")}/mo</span>
            </div>
            <a href="/pro/"
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-center block mb-7 transition-all"
              style={{ background:C.white, color:C.blue }}
              onMouseEnter={e => (e.currentTarget.style.background = C.blueLt)}
              onMouseLeave={e => (e.currentTarget.style.background = C.white)}>
              {t("pricing.ctaPro")}
            </a>
            <ul className="space-y-3.5 flex-1">
              {(["f1","f2","f3","f4","f5","f6"] as const).map(f => (
                <li key={f} className="flex items-start gap-3 text-[14px] text-blue-100">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-blue-300"/>
                  {t(`pricing.pro.${f}`)}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* trust row */}
        <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.45 }}
          className="flex flex-wrap justify-center gap-8 mt-10">
          {[
            [Shield,"SSL Secured"],
            [CheckCircle2,"Cancel Anytime"],
            [Star,"No credit card"],
          ].map(([Icon,lbl],i) => {
            const I = Icon as typeof Shield;
            return (
              <span key={i} className="flex items-center gap-2 text-[13px] text-slate-400">
                <I size={14}/>{lbl as string}
              </span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══ FAQ ════════════════════════════════════════════ */
function FAQ() {
  const { t } = useTranslation();
  const lang = useLang();
  const [open, setOpen] = useState<number|null>(null);
  const isRtl = lang.dir === "rtl";
  const { ref, v } = useInView();

  return (
    <section id="faq" ref={ref} className="py-24 px-8" style={{ background:C.white }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid lg:grid-cols-[380px_1fr] gap-16 items-start">

          {/* left/start — sticky title */}
          <motion.div initial={{ opacity:0, x:isRtl?12:-12 }} animate={v?{opacity:1,x:0}:{}}
            className={isRtl ? "lg:order-2 text-end" : "lg:order-1 text-start"}>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color:C.blue }}>FAQ</p>
            <h2 className="font-black text-slate-900 mb-4" style={{ fontSize:"clamp(1.8rem,3vw,2.8rem)" }}>
              {t("faq.title")}
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">{t("faq.subtitle")}</p>
          </motion.div>

          {/* right/end — accordion */}
          <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.1 }}
            className={isRtl ? "lg:order-1" : "lg:order-2"}>
            <div className="space-y-2">
              {Array.from({length:6},(_,i)=>i).map(i => (
                <div key={i}
                  className={`border rounded-2xl bg-white overflow-hidden cursor-pointer transition-all
                    ${open===i ? "border-blue-200 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                  onClick={() => setOpen(open===i ? null : i)}>
                  <div className={`flex items-center gap-4 px-6 py-4.5 py-[18px] ${isRtl ? "flex-row-reverse" : ""}`}>
                    <p className={`flex-1 text-[14px] font-semibold ${open===i ? "text-blue-700" : "text-slate-800"} ${isRtl ? "text-end" : "text-start"}`}>
                      {t(`faq.q${i+1}`)}
                    </p>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-all
                      ${open===i ? "bg-blue-600" : "bg-slate-100"}`}>
                      {open===i ? <Minus size={13} className="text-white"/> : <Plus size={13} className="text-slate-500"/>}
                    </div>
                  </div>
                  <AnimatePresence>
                    {open===i && (
                      <motion.div initial={{ height:0 }} animate={{ height:"auto" }} exit={{ height:0 }}
                        transition={{ duration:0.2 }} className="overflow-hidden">
                        <p className={`px-6 pb-5 text-[14px] text-slate-600 leading-relaxed border-t border-slate-100 pt-4 ${isRtl ? "text-end" : "text-start"}`}>
                          {t(`faq.a${i+1}`)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══ CTA BANNER ════════════════════════════════════ */
function CTABanner({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const COPY: Record<string,{h:string;sub:string}> = {
    ar: { h:"ابدأ مجاناً اليوم", sub:"لا حاجة لبطاقة ائتمان. أنشئ بطاقتك الأولى في أقل من دقيقة." },
    en: { h:"Start for free today", sub:"No credit card required. Create your first card in under a minute." },
    fr: { h:"Commencez gratuitement", sub:"Sans carte bancaire. Créez votre première carte en moins d'une minute." },
  };
  const cp = COPY[i18n.language] ?? COPY.ar;

  return (
    <section className="py-20 px-8 border-t border-slate-100" style={{ background:C.bg }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="relative rounded-3xl overflow-hidden px-10 sm:px-20 py-20 text-center"
          style={{ background:`linear-gradient(135deg,#003D99 0%,${C.blue} 60%,#4D94FF 100%)` }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",
              backgroundSize:"28px 28px",
            }}/>
          <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full opacity-10"
            style={{ border:"40px solid white" }}/>
          <div className="absolute -bottom-12 -start-12 w-48 h-48 rounded-full opacity-10"
            style={{ border:"28px solid white" }}/>
          <div className="relative">
            <h2 className="font-black text-white mb-5"
              style={{ fontFamily:lang.font, fontSize:"clamp(1.8rem,3.5vw,3rem)" }}>
              {cp.h}
            </h2>
            <p className="text-blue-100 mb-10 mx-auto max-w-md leading-relaxed"
              style={{ fontSize:"clamp(15px,1.8vw,17px)" }}>
              {cp.sub}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={onTool}
                className="px-9 py-4 rounded-xl font-bold text-[15px] transition-all"
                style={{ background:C.white, color:C.blue, boxShadow:"0 4px 24px rgba(0,0,0,0.14)" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.blueLt)}
                onMouseLeave={e => (e.currentTarget.style.background = C.white)}>
                {t("hero.cta")}
              </button>
              <a href="/pro/"
                className="px-9 py-4 rounded-xl font-semibold text-[15px] text-white border-2 border-white/30 hover:border-white/60 transition-all">
                {i18n.language==="ar" ? "لوحة التحكم" : i18n.language==="fr" ? "Tableau de bord" : "Dashboard"} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ FOOTER ═════════════════════════════════════════ */
function Footer({ onTool }: { onTool: () => void }) {
  const { t } = useTranslation();
  const sc = (id:string) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  return (
    <footer style={{ background:C.ink }}>
      <div className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:C.blue }}>
                <Newspaper size={16} className="text-white"/>
              </div>
              <span className="font-extrabold text-white text-[16px]">
                NewsCard<span style={{ color:"#93C5FD" }}> Pro</span>
              </span>
            </div>
            <p className="text-slate-400 text-[14px] leading-relaxed max-w-xs mb-6">{t("footer.desc")}</p>
            <LangPicker dark/>
          </div>
          <div>
            <p className="text-white text-[11px] font-bold uppercase tracking-widest mb-5">{t("footer.product")}</p>
            <ul className="space-y-3">
              <li><button onClick={onTool} className="text-slate-400 hover:text-white text-[14px] transition-colors">{t("footer.tool")}</button></li>
              <li><a href="/pro/" className="text-slate-400 hover:text-white text-[14px] transition-colors">{t("footer.dashboard")}</a></li>
              <li><button onClick={() => sc("pricing")} className="text-slate-400 hover:text-white text-[14px] transition-colors">{t("footer.pricing")}</button></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-[11px] font-bold uppercase tracking-widest mb-5">{t("footer.company")}</p>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-white text-[14px] transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white text-[14px] transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[13px] text-slate-500">© {new Date().getFullYear()} NewsCard Pro. {t("footer.rights")}.</span>
          <span className="text-[13px] text-slate-600" dir="ltr">React · Vite · Express · PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══ ROOT ═══════════════════════════════════════════ */
export default function Landing({ onOpenTool }: { onOpenTool: () => void }) {
  const lang = useLang();
  useEffect(() => { applyLang(lang); }, [lang]);

  return (
    <div style={{ fontFamily:lang.font, background:C.white, color:C.ink }}
      className="min-h-screen antialiased overflow-x-hidden">
      <Navbar onTool={onOpenTool}/>
      <div style={{ height:"68px" }} aria-hidden/>
      <main>
        <Hero       onTool={onOpenTool}/>
        <Logos/>
        <Features/>
        <MultiLang/>
        <HowItWorks onTool={onOpenTool}/>
        <Pricing    onTool={onOpenTool}/>
        <FAQ/>
        <CTABanner  onTool={onOpenTool}/>
      </main>
      <Footer onTool={onOpenTool}/>
    </div>
  );
}
