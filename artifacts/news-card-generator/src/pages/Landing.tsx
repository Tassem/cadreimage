/**
 * Landing — مولّد البطاقات
 * Dark theme · Red accent · RTL-first · Cairo font
 * Matches reference screenshots exactly.
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Check, Star, ChevronDown,
  LayoutTemplate, Languages, Sliders,
  Globe,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════ */
/* TOKENS                                                     */
/* ══════════════════════════════════════════════════════════ */
const D = {
  bg:      "#09090F",        // dark page bg
  surface: "#111119",        // dark card bg
  card:    "#16161F",        // pricing card bg
  red:     "#E5243A",        // primary red
  redHov:  "#C41F33",        // red hover
  redGlow: "rgba(229,36,58,0.18)",
  white:   "#FFFFFF",
  lightBg: "#F8F8FA",        // light sections
  muted:   "#9CA3B0",        // muted text
  border:  "rgba(255,255,255,0.07)",
  borderL: "#E5E7EB",        // light border
};

/* ══════════════════════════════════════════════════════════ */
/* LANGUAGES                                                  */
/* ══════════════════════════════════════════════════════════ */
const LANGS = [
  { code:"ar", flag:"AR", dir:"rtl" as const, font:"'Cairo',sans-serif" },
  { code:"en", flag:"EN", dir:"ltr" as const, font:"'Cairo','Inter',sans-serif" },
  { code:"fr", flag:"FR", dir:"ltr" as const, font:"'Cairo','Inter',sans-serif" },
] as const;

function useLang() {
  const { i18n } = useTranslation();
  return LANGS.find(l => l.code === i18n.language) ?? LANGS[0];
}
function applyLang(l: typeof LANGS[number]) {
  document.documentElement.setAttribute("dir", l.dir);
  document.documentElement.setAttribute("lang", l.code);
}

/* ══════════════════════════════════════════════════════════ */
/* INTERSECTION HELPER                                        */
/* ══════════════════════════════════════════════════════════ */
function useInView(th = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: th });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { ref, v };
}

/* ══════════════════════════════════════════════════════════ */
/* NAVBAR                                                     */
/* ══════════════════════════════════════════════════════════ */
function Navbar({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const [mob, setMob] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const pickLang = (l: typeof LANGS[number]) => {
    i18n.changeLanguage(l.code);
    localStorage.setItem("ncg-lang", l.code);
    applyLang(l);
    setLangOpen(false);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!langRef.current?.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMob(false); };
  const cur = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  const navLinks = [
    { id: "features", label: t("nav.features")  },
    { id: "how",      label: i18n.language === "ar" ? "المنتج"    : i18n.language === "fr" ? "Produit"   : "Product" },
    { id: "pricing",  label: t("nav.pricing") },
  ];

  return (
    <header
      style={{ fontFamily: lang.font, background: D.bg, borderBottom: `1px solid ${D.border}` }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="max-w-[1280px] mx-auto px-6 h-[58px] flex items-center">

        {/* Logo — always on the right in RTL */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 ms-auto lg:ms-0 order-2 lg:order-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[16px]"
            style={{ background: D.red }}>
            ن
          </div>
          <span className="font-extrabold text-white text-[15px] hidden sm:block">
            {i18n.language === "ar" ? "مولّد البطاقات" : "NewsCard"}
          </span>
        </a>

        {/* Desktop centre nav */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto order-2">
          {navLinks.map(n => (
            <button key={n.id} onClick={() => go(n.id)}
              className="px-4 py-2 text-[14px] font-medium rounded-lg transition-colors"
              style={{ color: D.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = D.white)}
              onMouseLeave={e => (e.currentTarget.style.color = D.muted)}>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Right cluster (appears on left in RTL) */}
        <div className="flex items-center gap-2 order-1 lg:order-3 me-auto lg:me-0">

          {/* Lang picker */}
          <div ref={langRef} className="relative">
            <button onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-bold transition-colors"
              style={{ color: D.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = D.white)}
              onMouseLeave={e => (e.currentTarget.style.color = D.muted)}>
              {cur.flag}
              <ChevronDown size={10} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 end-0 z-[400] w-28 rounded-xl py-1.5 overflow-hidden"
                  style={{ background: "#1c1c28", border: `1px solid ${D.border}` }}>
                  {LANGS.map(l => (
                    <li key={l.code}>
                      <button onClick={() => pickLang(l)}
                        className="w-full text-center py-2.5 text-[13px] font-bold transition-colors"
                        style={{ color: l.code === cur.code ? D.white : D.muted }}>
                        {l.flag}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Free tool link */}
          <button onClick={onTool}
            className="hidden sm:block text-[13px] font-medium transition-colors px-1"
            style={{ color: D.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = D.white)}
            onMouseLeave={e => (e.currentTarget.style.color = D.muted)}>
            {i18n.language === "ar" ? "مولّد البطاقات المجاني" : i18n.language === "fr" ? "Outil gratuit" : "Free Tool"}
          </button>

          {/* Pro dashboard — red button */}
          <a href="/pro/"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-[13px] font-bold text-white transition-all"
            style={{ background: D.red }}
            onMouseEnter={e => (e.currentTarget.style.background = D.redHov)}
            onMouseLeave={e => (e.currentTarget.style.background = D.red)}>
            {t("nav.dashboard")}
          </a>

          <button className="lg:hidden p-2" style={{ color: D.muted }} onClick={() => setMob(v => !v)}>
            {mob ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mob && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden"
            style={{ background: D.bg, borderTop: `1px solid ${D.border}` }}>
            <div className="max-w-[1280px] mx-auto px-6 py-3 flex flex-col gap-1">
              {navLinks.map(n => (
                <button key={n.id} onClick={() => go(n.id)}
                  className="text-start px-3 py-3 rounded-xl text-[14px] font-medium transition-colors"
                  style={{ color: D.muted }}>
                  {n.label}
                </button>
              ))}
              <button onClick={onTool}
                className="text-start px-3 py-3 rounded-xl text-[14px] font-medium"
                style={{ color: D.muted }}>
                {i18n.language === "ar" ? "مولّد البطاقات المجاني" : "Free Tool"}
              </button>
              <a href="/pro/"
                className="mt-1 w-full text-center py-3 rounded-xl text-[14px] font-bold text-white"
                style={{ background: D.red }}>
                {t("nav.dashboard")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* HERO — dark, centered, red glow                            */
/* ══════════════════════════════════════════════════════════ */
function Hero({ onTool }: { onTool: () => void }) {
  const { i18n } = useTranslation();
  const lang = useLang();

  const copy: Record<string, { badge: string; h: string; sub: string; cta: string; sec: string }> = {
    ar: {
      badge: "الخيار الأول للغرف الإخبارية العربية",
      h: "صمم بطاقات إخبارية\nاحترافية في ثوانٍ.",
      sub: "أداة ساس الأقوى للصحفيين والفرق الإعلامية لتوليد صور بطاقات إخبارية عربية فورية وموثوقة.",
      cta: "ابدأ الآن مجاناً",
      sec: "تصفح المميزات",
    },
    en: {
      badge: "The #1 tool for Arabic newsrooms",
      h: "Design professional\nnews cards in seconds.",
      sub: "The most powerful SaaS for journalists and media teams to generate Arabic news card images instantly.",
      cta: "Start for free",
      sec: "Browse features",
    },
    fr: {
      badge: "Le n°1 pour les rédactions arabes",
      h: "Créez des cartes\nd'actualités en secondes.",
      sub: "L'outil SaaS le plus puissant pour générer des cartes d'actualités arabes instantanément.",
      cta: "Commencer gratuitement",
      sec: "Voir les fonctionnalités",
    },
  };
  const c = copy[i18n.language] ?? copy.ar;

  return (
    <section
      className="relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: D.bg, minHeight: "100vh", fontFamily: lang.font }}
    >
      {/* Red glow orbs */}
      <div className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: `radial-gradient(ellipse 55% 55% at 70% 50%, ${D.redGlow} 0%, transparent 70%)`,
        }} />
      <div className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: `radial-gradient(ellipse 40% 40% at 30% 60%, rgba(229,36,58,0.08) 0%, transparent 70%)`,
        }} />

      <div className="relative z-10 max-w-[820px] mx-auto px-6 py-20">

        {/* Pill badge */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-[13px] font-medium mb-8"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: D.white }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: D.red }} />
          {c.badge}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }}
          className="font-black text-white mb-6 whitespace-pre-line"
          style={{
            fontFamily: lang.font,
            fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
            lineHeight: 1.12,
            letterSpacing: lang.dir === "rtl" ? "0" : "-0.03em",
          }}>
          {c.h}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-10 leading-relaxed"
          style={{ color: D.muted, fontSize: "clamp(15px, 2vw, 18px)", maxWidth: "560px" }}>
          {c.sub}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-4">
          <button onClick={onTool}
            className="px-8 py-3.5 rounded-xl font-bold text-[15px] text-white transition-all"
            style={{ background: D.red, boxShadow: "0 4px 24px rgba(229,36,58,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.background = D.redHov)}
            onMouseLeave={e => (e.currentTarget.style.background = D.red)}>
            {c.cta}
          </button>
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-3.5 rounded-xl font-bold text-[15px] text-white transition-all"
            style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.18)" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)")}>
            {c.sec}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* FEATURES — light bg, 3 cards                              */
/* ══════════════════════════════════════════════════════════ */
const FEAT_DATA = [
  { icon: LayoutTemplate, key: "item2" },
  { icon: Languages,      key: "item5" },
  { icon: Sliders,        key: "item4" },
];

function Features() {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const { ref, v } = useInView();

  const title = i18n.language === "ar" ? "كل ما تحتاجه لغرفة الأخبار الرقمية"
    : i18n.language === "fr" ? "Tout ce dont vous avez besoin"
    : "Everything your digital newsroom needs";

  return (
    <section
      id="features"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 px-6"
      style={{ background: D.lightBg, fontFamily: lang.font }}
    >
      <div className="max-w-[1280px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} animate={v ? { opacity: 1, y: 0 } : {}}
          className="text-center font-black text-slate-900 mb-14"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
          {title}
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {FEAT_DATA.map(({ icon: Icon, key }, i) => (
            <motion.div key={key}
              initial={{ opacity: 0, y: 24 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 text-center"
              style={{ border: `1px solid ${D.borderL}` }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(229,36,58,0.08)" }}>
                <Icon size={24} style={{ color: D.red }} />
              </div>
              <h3 className="font-bold text-slate-900 text-[17px] mb-3">{t(`features.${key}.title`)}</h3>
              <p className="text-slate-500 text-[14px] leading-relaxed">{t(`features.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* HOW IT WORKS — light bg, numbered circles + dashes        */
/* ══════════════════════════════════════════════════════════ */
function HowItWorks({ onTool }: { onTool: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const { ref, v } = useInView();

  const title = i18n.language === "ar" ? "كيف تعمل الأداة؟"
    : i18n.language === "fr" ? "Comment ça marche ?"
    : "How does it work?";

  const steps = [
    { n: 1, label: t("howItWorks.step1.title") },
    { n: 2, label: t("howItWorks.step2.title") },
    { n: 3, label: t("howItWorks.step3.title") },
  ];

  return (
    <section
      id="how"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 px-6"
      style={{ background: D.white, fontFamily: lang.font }}
    >
      <div className="max-w-[900px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} animate={v ? { opacity: 1, y: 0 } : {}}
          className="text-center font-black text-slate-900 mb-16"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
          {title}
        </motion.h2>

        {/* steps row */}
        <div className="flex items-start justify-center gap-0">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center w-36 sm:w-44">
                {/* circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-[20px] mb-5 border-2"
                  style={{ color: D.red, borderColor: D.red, background: "transparent" }}>
                  {s.n}
                </div>
                <p className="text-center font-bold text-slate-800 text-[15px] sm:text-[16px]">{s.label}</p>
              </motion.div>

              {/* dash between — not after last */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-2 mb-10" style={{ background: D.borderL, minWidth: "40px" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* PRICING — dark bg, 3 cards, center highlighted             */
/* ══════════════════════════════════════════════════════════ */
function Pricing() {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const { ref, v } = useInView();

  const title = i18n.language === "ar" ? "خطط تناسب جميع الاحتياجات"
    : i18n.language === "fr" ? "Des plans pour tous les besoins"
    : "Plans for every need";

  const plans = [
    {
      key: "pro",
      name: i18n.language === "ar" ? "برو" : "Pro",
      price: "49",
      popular: false,
      features: [
        "Everything in Basic",
        "Custom logos",
        "API access",
        "Team collaboration",
      ],
    },
    {
      key: "basic",
      name: i18n.language === "ar" ? "أساسي" : i18n.language === "fr" ? "Basique" : "Basic",
      price: "15",
      popular: true,
      features: [
        "All templates",
        "High resolution",
        "No watermark",
        "Custom colors",
      ],
    },
    {
      key: "free",
      name: i18n.language === "ar" ? "مجاني" : i18n.language === "fr" ? "Gratuit" : "Free",
      price: "0",
      popular: false,
      features: [
        "Basic templates",
        "Standard quality",
        "Watermarked",
      ],
    },
  ];

  const cta = i18n.language === "ar" ? "اشترك الآن" : i18n.language === "fr" ? "S'abonner" : "Subscribe now";
  const perMonth = i18n.language === "ar" ? "/ شهر" : i18n.language === "fr" ? "/ mois" : "/ mo";

  return (
    <section
      id="pricing"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 px-6"
      style={{ background: D.bg, fontFamily: lang.font }}
    >
      <div className="max-w-[1280px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} animate={v ? { opacity: 1, y: 0 } : {}}
          className="text-center font-black text-white mb-12"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
          {title}
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-4 max-w-[900px] mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div key={plan.key}
              initial={{ opacity: 0, y: 28 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl p-6 flex flex-col"
              style={{
                background: D.card,
                border: plan.popular ? `1.5px solid ${D.red}` : `1px solid ${D.border}`,
                boxShadow: plan.popular ? `0 0 40px rgba(229,36,58,0.15)` : "none",
              }}>

              {/* MOST POPULAR badge */}
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span
                    className="px-5 py-1.5 rounded-full text-[11px] font-black text-white uppercase tracking-widest"
                    style={{ background: D.red }}>
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className="font-bold text-white text-[18px] mb-1 mt-2">{plan.name}</h3>

              {/* Price */}
              <div className="flex items-end gap-1.5 mb-6" dir="ltr">
                <span className="font-black text-white" style={{ fontSize: "clamp(2.2rem,4vw,3rem)" }}>
                  ${plan.price}
                </span>
                {plan.price !== "0" && (
                  <span className="text-[14px] mb-1.5" style={{ color: D.muted }}>{perMonth}</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-7 flex-1" dir="ltr">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px]" style={{ color: "#CBD5E1" }}>
                    <Check size={14} style={{ color: D.red, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a href={plan.key === "free" ? "#" : "/pro/"}
                onClick={plan.key === "free" ? (e) => { e.preventDefault(); } : undefined}
                className="w-full py-3 rounded-xl font-bold text-[14px] text-center block transition-all"
                style={plan.popular
                  ? { background: D.red, color: D.white }
                  : { background: "transparent", border: `1.5px solid rgba(255,255,255,0.15)`, color: D.white }}
                onMouseEnter={e => {
                  if (plan.popular) e.currentTarget.style.background = D.redHov;
                  else e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                }}
                onMouseLeave={e => {
                  if (plan.popular) e.currentTarget.style.background = D.red;
                  else e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}>
                {cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* FOOTER — light bg                                         */
/* ══════════════════════════════════════════════════════════ */
function Footer({ onTool }: { onTool: () => void }) {
  const { i18n } = useTranslation();
  const lang = useLang();

  const productLinks = [
    { label: "Home",          href: "/" },
    { label: "Free Tool",     onClick: onTool },
    { label: "Pro Dashboard", href: "/pro/" },
  ];
  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  return (
    <footer style={{ background: D.white, borderTop: `1px solid ${D.borderL}`, fontFamily: lang.font }}>
      <div className="max-w-[1280px] mx-auto px-6 pt-16 pb-8">

        <div className="grid sm:grid-cols-3 gap-10 mb-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[15px]"
                style={{ background: D.red }}>
                ن
              </div>
              <span className="font-extrabold text-slate-900 text-[15px]">
                {i18n.language === "ar" ? "مولّد البطاقات" : "NewsCard"}
              </span>
            </div>
            <p className="text-slate-500 text-[14px] leading-relaxed max-w-[220px]">
              {i18n.language === "ar"
                ? "أداة ساس الأقوى للصحفيين والفرق الإعلامية لتوليد صور بطاقات إخبارية فورية وموثوقة."
                : i18n.language === "fr"
                ? "L'outil SaaS pour générer des cartes d'actualités arabes instantanément."
                : "The most powerful SaaS for journalists to generate Arabic news cards instantly."}
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="font-bold text-slate-900 text-[14px] mb-5">
              {i18n.language === "ar" ? "المنتج" : i18n.language === "fr" ? "Produit" : "Product"}
            </p>
            <ul className="space-y-3">
              {productLinks.map(l => (
                <li key={l.label}>
                  {l.href
                    ? <a href={l.href} className="text-slate-500 hover:text-slate-900 text-[14px] transition-colors">{l.label}</a>
                    : <button onClick={l.onClick} className="text-slate-500 hover:text-slate-900 text-[14px] transition-colors">{l.label}</button>
                  }
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="font-bold text-slate-900 text-[14px] mb-5">Legal</p>
            <ul className="space-y-3">
              {legalLinks.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-slate-500 hover:text-slate-900 text-[14px] transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 text-center" style={{ borderColor: D.borderL }}>
          <p className="text-slate-400 text-[13px]" dir="ltr">
            News Card Generator. All rights reserved {new Date().getFullYear()} ©
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* ROOT                                                       */
/* ══════════════════════════════════════════════════════════ */
export default function Landing({ onOpenTool }: { onOpenTool: () => void }) {
  const lang = useLang();
  useEffect(() => { applyLang(lang); }, [lang]);

  return (
    <div style={{ fontFamily: lang.font }} className="antialiased overflow-x-hidden">
      <Navbar onTool={onOpenTool} />
      {/* no spacer — hero is full-screen and handles its own padding */}
      <main>
        <Hero       onTool={onOpenTool} />
        <Features />
        <HowItWorks onTool={onOpenTool} />
        <Pricing />
      </main>
      <Footer onTool={onOpenTool} />
    </div>
  );
}
