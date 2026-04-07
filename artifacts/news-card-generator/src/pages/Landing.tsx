/**
 * Landing — NewsCard Pro
 * نظام تصميم موحّد: لون واحد #0066FF، خلفيات بيضاء فقط،
 * Cairo للعربية، Inter للإنجليزية/الفرنسية.
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Menu, X, ChevronDown, CheckCircle2, Star,
  Zap, Bot, Code2, Palette, Layout, LayoutTemplate,
  Newspaper, ArrowRight, ArrowLeft, Plus, Minus,
  Download, Image as ImgIcon, Layers,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────── */
/* DESIGN TOKENS — لا تغيير في هذه القيم خارج هذا الكائن     */
/* ─────────────────────────────────────────────────────────── */
const DS = {
  blue:     "#0066FF",
  blueDk:   "#0052CC",
  blueLt:   "#EBF2FF",
  blueMid:  "#BFDBFE",
  bg:       "#F8FAFC",
  white:    "#FFFFFF",
  ink:      "#0F172A",
  muted:    "#64748B",
  border:   "#E2E8F0",
  soft:     "#F1F5F9",
};

/* ─────────────────────────────────────────────────────────── */
/* LANGUAGES                                                   */
/* ─────────────────────────────────────────────────────────── */
const LANGS = [
  { code:"ar", label:"العربية",  flag:"AR", dir:"rtl" as const, font:"'Cairo',sans-serif" },
  { code:"en", label:"English",  flag:"EN", dir:"ltr" as const, font:"'Inter',sans-serif" },
  { code:"fr", label:"Français", flag:"FR", dir:"ltr" as const, font:"'Inter',sans-serif" },
] as const;

function useLang() {
  const { i18n } = useTranslation();
  return LANGS.find(l => l.code === i18n.language) ?? LANGS[0];
}

function applyLang(l: typeof LANGS[number]) {
  document.documentElement.setAttribute("dir", l.dir);
  document.documentElement.setAttribute("lang", l.code);
}

/* ─────────────────────────────────────────────────────────── */
/* SHARED: Label above section title                           */
/* ─────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3"
      style={{ color: DS.blue }}>
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* LANGUAGE SWITCHER                                           */
/* ─────────────────────────────────────────────────────────── */
function LangPicker({ onDark }: { onDark?: boolean }) {
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
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold border transition-all select-none
          ${onDark
            ? "border-white/25 text-white/80 hover:bg-white/10"
            : "border-slate-200 text-slate-600 hover:border-blue-300 bg-white shadow-sm"}`}>
        <Globe size={13} />
        <span className="w-6 text-center">{cur.flag}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity:0, scale:0.96, y:-4 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.96, y:-4 }}
            transition={{ duration:0.12 }}
            className="absolute top-full mt-1.5 end-0 z-[400] min-w-[152px] bg-white border border-slate-100 rounded-xl shadow-xl py-1.5">
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

/* ─────────────────────────────────────────────────────────── */
/* NAVBAR                                                      */
/* ─────────────────────────────────────────────────────────── */
function Navbar({ onTool }: { onTool:()=>void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (id:string) => { document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); setMob(false); };

  return (
    <header style={{ fontFamily:lang.font }}
      className={`fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-200
        ${scrolled ? "shadow-[0_1px_16px_rgba(0,0,0,0.08)]" : "border-b border-slate-100"}`}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-5">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:DS.blue }}>
            <Newspaper size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-[15px] tracking-tight" style={{ color:DS.ink }}>
            NewsCard<span style={{ color:DS.blue }}> Pro</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 ms-3">
          {[
            { id:"features", l:t("nav.features") },
            { id:"how",      l:t("nav.howItWorks") },
            { id:"pricing",  l:t("nav.pricing") },
          ].map(n => (
            <button key={n.id} onClick={() => go(n.id)}
              className="px-3.5 py-2 text-[13.5px] font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all">
              {n.l}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ms-auto">
          <LangPicker />
          <a href="/pro/" className="hidden sm:block px-3 py-2 text-[13.5px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
            {t("nav.dashboard")}
          </a>
          <button onClick={onTool}
            className="px-4 py-2 rounded-lg text-[13.5px] font-bold text-white transition-all"
            style={{ background:DS.blue }}
            onMouseEnter={e => (e.currentTarget.style.background = DS.blueDk)}
            onMouseLeave={e => (e.currentTarget.style.background = DS.blue)}>
            {t("nav.tryFree")}
          </button>
          <button className="md:hidden p-1.5 text-slate-500" onClick={() => setMob(v=>!v)}>
            {mob ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mob && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} className="md:hidden bg-white border-t border-slate-100 overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col gap-0.5">
              {[
                { id:"features", l:t("nav.features") },
                { id:"how",      l:t("nav.howItWorks") },
                { id:"pricing",  l:t("nav.pricing") },
              ].map(n => (
                <button key={n.id} onClick={() => go(n.id)}
                  className="text-start px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 font-medium">
                  {n.l}
                </button>
              ))}
              <a href="/pro/" className="px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 font-medium">
                {t("nav.dashboard")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* PRODUCT PREVIEW — simplified, clean browser chrome          */
/* ─────────────────────────────────────────────────────────── */
function AppPreview() {
  const [active, setActive] = useState(1);
  const cards = [
    { cat:"عاجل",   badge:"#DC2626", top:"#450a0a", bot:"#7f1d1d", news:"القمة العربية تنتهي بإعلان وثيقة السلام الشاملة" },
    { cat:"اقتصاد", badge:"#D97706", top:"#1c1917", bot:"#0f172a", news:"البنك المركزي يرفع أسعار الفائدة للمرة الثالثة هذا العام" },
    { cat:"رياضة",  badge:"#16a34a", top:"#052e16", bot:"#0f172a", news:"المنتخب الوطني يتأهل إلى نهائيات كأس العالم ٢٠٢٦" },
  ];
  const c = cards[active];

  return (
    /* outer glow ring */
    <div className="relative p-4">
      <div className="absolute inset-0 rounded-3xl"
        style={{ background:`radial-gradient(ellipse at 60% 40%,rgba(0,102,255,0.12) 0%,transparent 70%)` }} />

      {/* browser frame */}
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        style={{ boxShadow:"0 24px 64px rgba(0,0,0,0.10)" }}>

        {/* chrome bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100" dir="ltr">
          <span className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </span>
          <span className="flex-1 mx-3 flex items-center gap-2 h-7 px-3 bg-white border border-slate-200 rounded-md">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-slate-400 text-[11px]">newscard.pro/generate</span>
          </span>
        </div>

        {/* app body */}
        <div className="flex" dir="ltr">

          {/* sidebar — templates */}
          <div className="w-28 flex-shrink-0 border-r border-slate-100 bg-slate-50 p-3">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2.5">Templates</p>
            <div className="flex flex-col gap-2">
              {cards.map((card, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`w-full rounded-lg overflow-hidden border-2 transition-all
                    ${active === i ? "border-[#0066FF] shadow-sm" : "border-transparent opacity-60 hover:opacity-90"}`}>
                  <div className="h-12 relative"
                    style={{ background:`linear-gradient(to bottom right,${card.top},${card.bot})` }}>
                    <span className="absolute bottom-1.5 start-1.5 text-[8px] font-black px-1 py-0.5 rounded text-white"
                      style={{ background:card.badge }}>
                      {card.cat}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* canvas — card preview */}
          <div className="flex-1 flex items-center justify-center p-6"
            style={{ background:"#F4F7FE", minHeight:"220px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity:0, scale:0.94, y:6 }}
                animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.94, y:-6 }}
                transition={{ duration:0.22 }}
                className="w-40 rounded-2xl overflow-hidden shadow-xl border border-black/5">
                <div className="h-24 relative"
                  style={{ background:`linear-gradient(135deg,${c.top},${c.bot})` }}>
                  <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.45),transparent)" }} />
                  <span className="absolute bottom-2 start-2 text-[9px] font-black px-1.5 py-0.5 rounded text-white z-10"
                    style={{ background:c.badge }}>
                    {c.cat}
                  </span>
                  <div className="absolute top-2 end-2 w-5 h-5 rounded flex items-center justify-center"
                    style={{ background:"rgba(255,255,255,0.15)" }}>
                    <Newspaper size={9} className="text-white" />
                  </div>
                </div>
                <div className="p-3" style={{ background:"#0f2557" }}>
                  <div className="w-4 h-0.5 rounded mb-2" style={{ background:c.badge }} />
                  <p className="text-white text-[9px] leading-snug font-medium">{c.news}</p>
                  <p className="text-white/40 text-[8px] mt-2">٧ أبريل ٢٠٢٦</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* right panel — controls */}
          <div className="w-28 flex-shrink-0 border-l border-slate-100 bg-white p-3 flex flex-col gap-4">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Color</p>
              <div className="flex flex-wrap gap-1.5">
                {["#0f2557","#7f1d1d","#052e16","#1e1b4b"].map((col,i) => (
                  <div key={col} className={`w-4 h-4 rounded-full border-2 ${i===0?"border-blue-500 scale-110":"border-white"} shadow-sm cursor-pointer`}
                    style={{ background:col }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Format</p>
              {[["1:1 ","1080×1080",true],["9:16","Story",false],["16:9","Wide",false]].map(([r,l,sel]) => (
                <div key={String(r)}
                  className={`flex items-center gap-1.5 text-[9px] px-2 py-1.5 rounded-lg mb-0.5 cursor-pointer
                    ${sel?"bg-blue-50 text-blue-700 font-bold":"text-slate-500 hover:bg-slate-50"}`}>
                  <span>{r}</span><span className="truncate">{l}</span>
                </div>
              ))}
            </div>
            <button className="mt-auto w-full py-2 rounded-lg text-[9px] font-bold text-white"
              style={{ background:DS.blue }}>
              Export PNG
            </button>
          </div>
        </div>
      </div>

      {/* floating chips */}
      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        className="absolute top-0 start-0 flex items-center gap-2 bg-white border border-slate-200 shadow-md rounded-xl px-3 py-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[12px] font-bold text-slate-700">Live Preview</span>
      </motion.div>

      <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65 }}
        className="absolute bottom-0 end-0 px-3.5 py-2 rounded-xl text-[12px] font-bold text-white"
        style={{ background:DS.blue }}>
        1080 × 1080 px
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* HERO                                                        */
/* ─────────────────────────────────────────────────────────── */
function Hero({ onTool }:{ onTool:()=>void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const isRtl = lang.dir === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const copy:{[k:string]:{h1:string;h2:string}} = {
    ar: { h1:"أنت تصنع الخبر،", h2:"ونحن نصنع البطاقة." },
    en: { h1:"You make the news,", h2:"We make the card." },
    fr: { h1:"Vous créez l'actualité,", h2:"Nous créons la carte." },
  };
  const tx = copy[i18n.language] ?? copy.ar;

  return (
    <section style={{ background:DS.white }}>
      {/* very subtle top tint */}
      <div className="absolute inset-x-0 h-72 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,102,255,0.05) 0%,transparent 100%)" }} />

      <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* — Text — */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
            className={`flex flex-col ${isRtl ? "items-end text-end" : "items-start text-start"} order-2 lg:order-1`}>

            {/* pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12.5px] font-bold border mb-6"
              style={{ background:DS.blueLt, color:DS.blue, borderColor:DS.blueMid }}>
              <Zap size={12} />
              {t("hero.badge")}
            </div>

            {/* headline */}
            <h1 className="font-black leading-[1.1] mb-5 text-slate-900"
              style={{ fontFamily:lang.font, fontSize:"clamp(2rem,4.5vw,3.2rem)", letterSpacing:isRtl?"0":"-0.03em" }}>
              <span className="block">{tx.h1}</span>
              <span className="block" style={{ color:DS.blue }}>{tx.h2}</span>
            </h1>

            {/* sub */}
            <p className="leading-relaxed mb-8 max-w-[420px]"
              style={{ color:DS.muted, fontSize:"clamp(15px,2vw,17px)" }}>
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <button onClick={onTool}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-[14px] text-white transition-all"
                style={{ background:DS.blue, boxShadow:"0 4px 20px rgba(0,102,255,0.3)" }}
                onMouseEnter={e=>(e.currentTarget.style.background=DS.blueDk)}
                onMouseLeave={e=>(e.currentTarget.style.background=DS.blue)}>
                {t("hero.cta")} <Arrow size={14}/>
              </button>
              <a href="/pro/"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[14px] text-slate-700 bg-white border border-slate-200 hover:border-slate-300 transition-all"
                style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                {i18n.language==="ar" ? "لوحة التحكم" : i18n.language==="fr" ? "Tableau de bord" : "Dashboard"} →
              </a>
            </div>

            {/* stats */}
            <div className="flex items-start gap-8 pt-7 border-t border-slate-200">
              {[
                { v:"10K+", l:t("hero.stat1") },
                { v:"20+",  l:t("hero.stat2") },
                { v:"3",    l:isRtl?"لغات":"Languages" },
              ].map((s,i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900" dir="ltr">{s.v}</span>
                  <span className="text-[12px] mt-0.5" style={{ color:DS.muted }}>{s.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* — Mockup — */}
          <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.12 }}
            className="order-1 lg:order-2">
            <AppPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* LOGO STRIP — "used by" social proof                         */
/* ─────────────────────────────────────────────────────────── */
function LogoStrip() {
  const { i18n } = useTranslation();
  const labels = i18n.language==="ar"
    ? ["شبكة الجزيرة","قناة الميادين","العربية نت","سكاي نيوز عربية","بي بي سي عربي"]
    : i18n.language==="fr"
    ? ["Al Jazeera","Al Mayadeen","Al Arabiya","Sky News Arabia","BBC Arabic"]
    : ["Al Jazeera","Al Mayadeen","Al Arabiya","Sky News Arabia","BBC Arabic"];

  return (
    <div className="border-y border-slate-100 py-6" style={{ background:DS.soft }}>
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-5">
          {i18n.language==="ar" ? "موثوق به من قِبَل" : i18n.language==="fr" ? "Utilisé par" : "Trusted by media teams at"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {labels.map(l => (
            <span key={l} className="text-[13px] font-bold text-slate-400">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* FEATURES — white cards, uniform blue icon bg               */
/* ─────────────────────────────────────────────────────────── */
const FEAT_LIST = [
  { icon:Zap,            k:"item1" },
  { icon:LayoutTemplate, k:"item2" },
  { icon:Bot,            k:"item3" },
  { icon:Palette,        k:"item4" },
  { icon:Layout,         k:"item5" },
  { icon:Code2,          k:"item6" },
];

function Features() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>e.isIntersecting&&setV(true),{threshold:0.1});
    if(ref.current)o.observe(ref.current); return ()=>o.disconnect();
  },[]);

  return (
    <section id="features" ref={ref} className="py-20 px-6" style={{ background:DS.white }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}}>
            <SectionLabel>{t("nav.features")}</SectionLabel>
          </motion.div>
          <motion.h2 initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.08 }}
            className="font-black text-slate-900 mb-3" style={{ fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>
            {t("features.title")}
          </motion.h2>
          <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.16 }}
            className="text-slate-500 max-w-lg mx-auto text-[15px] leading-relaxed">
            {t("features.subtitle")}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEAT_LIST.map(({ icon:Icon, k }, i) => (
            <motion.div key={k}
              initial={{ opacity:0, y:18 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:i*0.07 }}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              {/* uniform icon container */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background:DS.blueLt }}>
                <Icon size={20} style={{ color:DS.blue }} />
              </div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-2">{t(`features.${k}.title`)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(`features.${k}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* MULTI-LANGUAGE SECTION — tabbed toggle, clean preview       */
/* ─────────────────────────────────────────────────────────── */
function MultiLang() {
  const { i18n } = useTranslation();
  const [sel, setSel] = useState<"ar"|"en"|"fr">("ar");
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>e.isIntersecting&&setV(true),{threshold:0.1});
    if(ref.current)o.observe(ref.current); return ()=>o.disconnect();
  },[]);

  const TABS = {
    ar: { dir:"rtl" as const, font:"'Cairo',sans-serif",
          h:"أنت تصنع الخبر،\nونحن نصنع البطاقة.",
          sub:"منصة بطاقات الأخبار العربية — بجودة بث تلفزيوني",
          cta:"ابدأ مجاناً", cat:"اقتصاد",
          news:"البنك المركزي يرفع أسعار الفائدة للمرة الثالثة هذا العام" },
    en: { dir:"ltr" as const, font:"'Inter',sans-serif",
          h:"You make the news,\nWe make the card.",
          sub:"Arabic news card generator — broadcast-quality output",
          cta:"Get started free", cat:"Business",
          news:"Central bank raises interest rates for the third time this year" },
    fr: { dir:"ltr" as const, font:"'Inter',sans-serif",
          h:"Vous créez l'actualité,\nNous créons la carte.",
          sub:"Générateur de cartes — qualité broadcast garantie",
          cta:"Commencer", cat:"Économie",
          news:"La banque centrale relève ses taux d'intérêt pour la 3ème fois" },
  };
  const tab = TABS[sel];

  const heading = i18n.language==="ar"
    ? "ثلاث لغات، واجهة واحدة"
    : i18n.language==="fr"
    ? "Trois langues, une interface"
    : "Three languages, one interface";

  return (
    <section ref={ref} className="py-20 px-6 border-y border-slate-100" style={{ background:DS.bg }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}}
          className="text-center mb-10">
          <SectionLabel>Multi-language</SectionLabel>
          <h2 className="font-black text-slate-900" style={{ fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>{heading}</h2>
        </motion.div>

        {/* tab strip */}
        <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.1 }}
          className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5 shadow-sm">
            {(["ar","en","fr"] as const).map(code => (
              <button key={code} onClick={() => setSel(code)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                  ${sel===code?"text-white shadow-sm":"text-slate-500 hover:text-slate-700"}`}
                style={sel===code?{ background:DS.blue }:{}}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* animated panel */}
        <AnimatePresence mode="wait">
          <motion.div key={sel}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}
            dir={tab.dir}
            className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm"
            style={{ fontFamily:tab.font }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">

              {/* text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background:DS.blue }}>
                    {sel.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{tab.dir.toUpperCase()}</span>
                </div>
                <h3 className="font-black text-slate-900 leading-snug mb-3 whitespace-pre-line"
                  style={{ fontSize:"clamp(1.4rem,3vw,2rem)" }}>
                  {tab.h}
                </h3>
                <p className="text-slate-500 text-[15px] mb-6 max-w-sm leading-relaxed">{tab.sub}</p>
                <button className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background:DS.blue }}>
                  {tab.cta}
                </button>
              </div>

              {/* mini card */}
              <div className="shrink-0">
                <div className="w-36 rounded-2xl overflow-hidden shadow-xl border border-black/5">
                  <div className="h-24 relative" style={{ background:"linear-gradient(135deg,#0f2557,#1e3a5f)" }}>
                    <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.4),transparent)" }} />
                    <span className="absolute bottom-2 start-2 text-[9px] font-black px-1.5 py-0.5 rounded text-white z-10"
                      style={{ background:DS.blue }}>
                      {tab.cat}
                    </span>
                  </div>
                  <div className="p-3" style={{ background:"#0f2557" }}>
                    <div className="w-4 h-0.5 rounded mb-2" style={{ background:DS.blue }} />
                    <p className="text-white text-[9px] leading-snug">{tab.news}</p>
                    <p className="text-white/40 text-[8px] mt-2">Apr 7, 2026</p>
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

/* ─────────────────────────────────────────────────────────── */
/* HOW IT WORKS                                                */
/* ─────────────────────────────────────────────────────────── */
function HowItWorks({ onTool }:{ onTool:()=>void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>e.isIntersecting&&setV(true),{threshold:0.1});
    if(ref.current)o.observe(ref.current); return ()=>o.disconnect();
  },[]);

  const steps = [
    { k:"step1", icon:LayoutTemplate, n:1 },
    { k:"step2", icon:ImgIcon,        n:2 },
    { k:"step3", icon:Download,       n:3 },
  ];

  return (
    <section id="how" ref={ref} className="py-20 px-6" style={{ background:DS.white }}>
      <div className="max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}}>
          <SectionLabel>{t("nav.howItWorks")}</SectionLabel>
        </motion.div>
        <motion.h2 initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.08 }}
          className="font-black text-slate-900 mb-3" style={{ fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>
          {t("howItWorks.title")}
        </motion.h2>
        <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.16 }}
          className="text-slate-500 text-[15px] mb-14 max-w-md mx-auto leading-relaxed">
          {t("howItWorks.subtitle")}
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden sm:block absolute top-9 start-[18%] end-[18%] h-px"
            style={{ background:`linear-gradient(to right,${DS.blueMid},${DS.blueMid})`, opacity:0.6 }} />

          {steps.map(({ k, icon:Icon, n }, i) => (
            <motion.div key={k}
              initial={{ opacity:0, y:20 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.1+i*0.13 }}
              className="flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 z-10 border-2 border-white shadow-md"
                style={{ background:DS.blueLt }}>
                <Icon size={22} style={{ color:DS.blue }} />
                <span className="absolute -top-2 -end-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white border-2 border-white"
                  style={{ background:DS.blue }}>
                  {n}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-2">{t(`howItWorks.${k}.title`)}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t(`howItWorks.${k}.desc`)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.5 }} className="mt-12">
          <button onClick={onTool}
            className="px-7 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all"
            style={{ background:DS.ink }}
            onMouseEnter={e=>(e.currentTarget.style.background="#1e293b")}
            onMouseLeave={e=>(e.currentTarget.style.background=DS.ink)}>
            {t("nav.tryFree")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* PRICING — equal height cards, clean                         */
/* ─────────────────────────────────────────────────────────── */
function Pricing({ onTool }:{ onTool:()=>void }) {
  const { t } = useTranslation();
  const [yr, setYr] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>e.isIntersecting&&setV(true),{threshold:0.1});
    if(ref.current)o.observe(ref.current); return ()=>o.disconnect();
  },[]);

  return (
    <section id="pricing" ref={ref} className="py-20 px-6 border-y border-slate-100" style={{ background:DS.bg }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}}>
            <SectionLabel>{t("nav.pricing")}</SectionLabel>
          </motion.div>
          <motion.h2 initial={{ opacity:0, y:12 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.08 }}
            className="font-black text-slate-900 mb-3" style={{ fontSize:"clamp(1.6rem,3.5vw,2.5rem)" }}>
            {t("pricing.title")}
          </motion.h2>
          <motion.p initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.14 }}
            className="text-slate-500 text-[15px] mb-8">
            {t("pricing.subtitle")}
          </motion.p>

          {/* billing toggle */}
          <motion.div initial={{ opacity:0 }} animate={v?{opacity:1}:{}} transition={{ delay:0.2 }}
            className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            {[
              { v:false, label:t("pricing.monthly") },
              { v:true,  label:(
                <span className="flex items-center gap-2">
                  {t("pricing.yearly")}
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                    {t("pricing.save")}
                  </span>
                </span>
              )},
            ].map(opt => (
              <button key={String(opt.v)} onClick={() => setYr(opt.v)}
                className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center
                  ${yr===opt.v?"text-white shadow-sm":"text-slate-500 hover:text-slate-700"}`}
                style={yr===opt.v?{ background:DS.blue }:{}}>
                {opt.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* cards — equal height via flex + stretch */}
        <div className="grid sm:grid-cols-2 gap-5 items-stretch max-w-2xl mx-auto">

          {/* FREE */}
          <motion.div initial={{ opacity:0, y:20 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.16 }}
            className="flex flex-col bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                {t("pricing.free.name")}
              </span>
              <p className="text-slate-400 text-xs mt-2">{t("pricing.free.desc")}</p>
            </div>
            <div className="flex items-end gap-1 mb-7" dir="ltr">
              <span className="text-5xl font-black text-slate-900">0</span>
              <span className="text-slate-400 text-sm pb-1.5">{t("pricing.currency")}/mo</span>
            </div>
            <button onClick={onTool}
              className="w-full py-3 rounded-xl font-bold text-sm text-white mb-7 transition-all"
              style={{ background:DS.ink }}
              onMouseEnter={e=>(e.currentTarget.style.background="#1e293b")}
              onMouseLeave={e=>(e.currentTarget.style.background=DS.ink)}>
              {t("pricing.cta")}
            </button>
            <ul className="space-y-3 flex-1">
              {(["f1","f2","f3","f4"] as const).map(f => (
                <li key={f} className="flex items-start gap-2.5 text-[14px] text-slate-600">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500"/>
                  {t(`pricing.free.${f}`)}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* PRO */}
          <motion.div initial={{ opacity:0, y:20 }} animate={v?{opacity:1,y:0}:{}} transition={{ delay:0.26 }}
            className="flex flex-col rounded-2xl p-8 relative overflow-hidden"
            style={{ background:DS.blue, boxShadow:`0 20px 50px rgba(0,102,255,0.22)` }}>
            {/* popular badge pinned top center */}
            <div className="absolute -top-px inset-x-0 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-b-xl text-[11px] font-black text-amber-900"
                style={{ background:"#FCD34D" }}>
                <Star size={10} fill="currentColor"/>
                {t("pricing.popular")}
              </span>
            </div>
            <div className="mt-6 mb-6">
              <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-blue-500 text-white">
                {t("pricing.pro.name")}
              </span>
              <p className="text-blue-200 text-xs mt-2">{t("pricing.pro.desc")}</p>
            </div>
            <div className="flex items-end gap-1 mb-7" dir="ltr">
              <span className="text-5xl font-black text-white">
                {yr ? t("pricing.pro.priceYear") : t("pricing.pro.price")}
              </span>
              <span className="text-blue-200 text-sm pb-1.5">{t("pricing.currency")}/mo</span>
            </div>
            <a href="/pro/"
              className="w-full py-3 rounded-xl font-bold text-sm text-center block mb-7 transition-all"
              style={{ background:DS.white, color:DS.blue }}
              onMouseEnter={e=>(e.currentTarget.style.background=DS.blueLt)}
              onMouseLeave={e=>(e.currentTarget.style.background=DS.white)}>
              {t("pricing.ctaPro")}
            </a>
            <ul className="space-y-3 flex-1">
              {(["f1","f2","f3","f4","f5","f6"] as const).map(f => (
                <li key={f} className="flex items-start gap-2.5 text-[14px] text-blue-100">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-blue-300"/>
                  {t(`pricing.pro.${f}`)}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* FAQ — accordion, direction-aware                            */
/* ─────────────────────────────────────────────────────────── */
function FAQ() {
  const { t } = useTranslation();
  const lang = useLang();
  const [open, setOpen] = useState<number|null>(null);
  const isRtl = lang.dir==="rtl";

  return (
    <section id="faq" className="py-20 px-6" style={{ background:DS.white }}>
      <div className="max-w-2xl mx-auto">
        <div className={`mb-12 ${isRtl?"text-end":"text-start"}`}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="font-black text-slate-900 mb-2" style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)" }}>
            {t("faq.title")}
          </h2>
          <p className="text-slate-400 text-[15px]">{t("faq.subtitle")}</p>
        </div>

        <div className="space-y-2">
          {Array.from({length:6},(_,i)=>i).map(i => (
            <div key={i}
              className={`bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all
                ${open===i?"border-blue-200 shadow-sm":"border-slate-200 hover:border-slate-300"}`}
              onClick={() => setOpen(open===i ? null : i)}>
              <div className="flex items-center gap-3 px-5 py-4">
                <p className={`flex-1 text-[14px] font-semibold ${isRtl?"text-end":"text-start"}
                  ${open===i?"text-blue-700":"text-slate-800"}`}>
                  {t(`faq.q${i+1}`)}
                </p>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-colors
                  ${open===i?"bg-blue-600":"bg-slate-100"}`}>
                  {open===i
                    ? <Minus size={12} className="text-white"/>
                    : <Plus  size={12} className="text-slate-500"/>}
                </div>
              </div>
              <AnimatePresence>
                {open===i && (
                  <motion.div initial={{ height:0 }} animate={{ height:"auto" }} exit={{ height:0 }}
                    transition={{ duration:0.2 }} className="overflow-hidden">
                    <p className={`px-5 pb-5 text-[14px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3
                      ${isRtl?"text-end":"text-start"}`}>
                      {t(`faq.a${i+1}`)}
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

/* ─────────────────────────────────────────────────────────── */
/* CTA BANNER                                                  */
/* ─────────────────────────────────────────────────────────── */
function CTABanner({ onTool }:{ onTool:()=>void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();

  const COPY:{[k:string]:{h:string;sub:string}} = {
    ar:{ h:"ابدأ مجاناً اليوم",                        sub:"لا حاجة لبطاقة ائتمان. أنشئ بطاقتك الأولى في أقل من دقيقة." },
    en:{ h:"Start for free today",                      sub:"No credit card required. Create your first card in under a minute." },
    fr:{ h:"Commencez gratuitement aujourd'hui",        sub:"Sans carte bancaire. Créez votre première carte en moins d'une minute." },
  };
  const cp = COPY[i18n.language] ?? COPY.ar;

  return (
    <section className="py-20 px-6 border-t border-slate-100" style={{ background:DS.bg }}>
      <div className="max-w-5xl mx-auto">
        {/* full-width contained banner */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background:`linear-gradient(135deg,#004DB3 0%,${DS.blue} 55%,#3B82F6 100%)` }}>
          {/* subtle dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",
              backgroundSize:"24px 24px",
            }} />
          {/* decorative rings */}
          <div className="absolute -top-16 -end-16 w-64 h-64 rounded-full opacity-10"
            style={{ border:"40px solid white" }} />
          <div className="absolute -bottom-8 -start-8 w-40 h-40 rounded-full opacity-10"
            style={{ border:"24px solid white" }} />

          <div className="relative text-center px-8 sm:px-16 py-16">
            <h2 className="font-black text-white mb-4"
              style={{ fontFamily:lang.font, fontSize:"clamp(1.5rem,3vw,2.4rem)" }}>
              {cp.h}
            </h2>
            <p className="text-blue-100 mb-8 mx-auto max-w-sm leading-relaxed text-[15px]">
              {cp.sub}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={onTool}
                className="px-8 py-3.5 rounded-xl font-bold text-[14px] transition-all"
                style={{ background:DS.white, color:DS.blue, boxShadow:"0 4px 20px rgba(0,0,0,0.14)" }}
                onMouseEnter={e=>(e.currentTarget.style.background=DS.blueLt)}
                onMouseLeave={e=>(e.currentTarget.style.background=DS.white)}>
                {t("hero.cta")}
              </button>
              <a href="/pro/"
                className="px-8 py-3.5 rounded-xl font-semibold text-[14px] text-white border-2 border-white/30 hover:border-white/60 transition-all">
                {i18n.language==="ar" ? "لوحة التحكم" : i18n.language==="fr" ? "Tableau de bord" : "Dashboard"} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* FOOTER                                                      */
/* ─────────────────────────────────────────────────────────── */
function Footer({ onTool }:{ onTool:()=>void }) {
  const { t } = useTranslation();
  const sc = (id:string) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  return (
    <footer style={{ background:DS.ink }}>
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:DS.blue }}>
                <Newspaper size={14} className="text-white"/>
              </div>
              <span className="font-extrabold text-white text-[15px]">
                NewsCard<span style={{ color:"#93C5FD" }}> Pro</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-5">{t("footer.desc")}</p>
            <LangPicker onDark />
          </div>

          {/* Product */}
          <div>
            <p className="text-white text-[11px] font-bold uppercase tracking-wider mb-4">{t("footer.product")}</p>
            <ul className="space-y-2.5">
              <li><button onClick={onTool} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.tool")}</button></li>
              <li><a href="/pro/" className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.dashboard")}</a></li>
              <li><button onClick={()=>sc("pricing")} className="text-slate-400 hover:text-white text-sm transition-colors">{t("footer.pricing")}</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
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

/* ─────────────────────────────────────────────────────────── */
/* ROOT                                                        */
/* ─────────────────────────────────────────────────────────── */
export default function Landing({ onOpenTool }:{ onOpenTool:()=>void }) {
  const lang = useLang();

  useEffect(() => { applyLang(lang); }, [lang]);

  return (
    <div style={{ fontFamily:lang.font, background:DS.white, color:DS.ink }}
      className="min-h-screen antialiased overflow-x-hidden">
      <Navbar onTool={onOpenTool}/>
      {/* exact spacer matching navbar height */}
      <div style={{ height:"64px" }} aria-hidden/>
      <main>
        <Hero       onTool={onOpenTool}/>
        <LogoStrip />
        <Features  />
        <MultiLang />
        <HowItWorks onTool={onOpenTool}/>
        <Pricing    onTool={onOpenTool}/>
        <FAQ/>
        <CTABanner  onTool={onOpenTool}/>
      </main>
      <Footer onTool={onOpenTool}/>
    </div>
  );
}
