import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Image, Bot, Palette, Layout, Code2,
  CheckCircle2, Star, ChevronDown, Globe, ArrowLeft, ArrowRight,
  Newspaper, Users, Download, Menu, X
} from "lucide-react";

const LANGS = [
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const switchLang = (code: string, dir: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = dir;
    document.documentElement.lang = code;
    setOpen(false);
  };

  useEffect(() => {
    const l = LANGS.find(l => l.code === i18n.language) || LANGS[0];
    document.documentElement.dir = l.dir;
    document.documentElement.lang = l.code;
  }, [i18n.language]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
      >
        <Globe size={14} />
        {current.label}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-1 start-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[120px]"
          >
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => switchLang(l.code, l.dir)}
                className={`w-full text-start px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors ${
                  l.code === i18n.language ? "text-blue-400 bg-slate-700/50" : "text-slate-300"
                }`}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

interface LandingProps {
  onOpenTool: () => void;
}

export default function Landing({ onOpenTool }: LandingProps) {
  const { t, i18n } = useTranslation();
  const [billingYearly, setBillingYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isRtl = i18n.language === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const features = [
    { icon: Zap,       key: "item1" },
    { icon: Image,     key: "item2" },
    { icon: Bot,       key: "item3" },
    { icon: Palette,   key: "item4" },
    { icon: Layout,    key: "item5" },
    { icon: Code2,     key: "item6" },
  ];

  const steps = [
    { num: "01", key: "step1" },
    { num: "02", key: "step2" },
    { num: "03", key: "step3" },
  ];

  const plans = [
    {
      key: "free",
      color: "from-slate-700 to-slate-800",
      border: "border-slate-600",
      btn: "bg-white/10 hover:bg-white/20",
      featured: false,
      features: ["f1","f2","f3","f4"],
    },
    {
      key: "basic",
      color: "from-blue-800 to-blue-900",
      border: "border-blue-500",
      btn: "bg-blue-500 hover:bg-blue-400",
      featured: false,
      features: ["f1","f2","f3","f4","f5"],
    },
    {
      key: "pro",
      color: "from-violet-800 to-violet-900",
      border: "border-violet-400",
      btn: "bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400",
      featured: true,
      features: ["f1","f2","f3","f4","f5","f6"],
    },
  ];

  const faqs = [0,1,2,3,4,5];

  const stats = [
    { value: "10K+", label: t("hero.stat1") },
    { value: "20+",  label: t("hero.stat2") },
    { value: "1080px", label: t("hero.stat3") },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ────────────── NAVBAR ────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-sm">ب</div>
            <span className="font-bold text-lg hidden sm:block">NewsCard Pro</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <button onClick={() => scrollTo("features")} className="hover:text-white transition-colors">{t("nav.features")}</button>
            <button onClick={() => scrollTo("how")} className="hover:text-white transition-colors">{t("nav.howItWorks")}</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-white transition-colors">{t("nav.pricing")}</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-white transition-colors">{t("nav.faq")}</button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="/pro/"
              className="hidden sm:block text-sm text-slate-300 hover:text-white transition-colors"
            >
              {t("nav.dashboard")}
            </a>
            <button
              onClick={onOpenTool}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/40"
            >
              {t("nav.tryFree")}
            </button>
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0a0f1e]"
            >
              <div className="px-4 py-4 flex flex-col gap-3 text-sm text-slate-300">
                <button onClick={() => scrollTo("features")} className="text-start py-2 hover:text-white">{t("nav.features")}</button>
                <button onClick={() => scrollTo("how")} className="text-start py-2 hover:text-white">{t("nav.howItWorks")}</button>
                <button onClick={() => scrollTo("pricing")} className="text-start py-2 hover:text-white">{t("nav.pricing")}</button>
                <button onClick={() => scrollTo("faq")} className="text-start py-2 hover:text-white">{t("nav.faq")}</button>
                <a href="/pro/" className="py-2 hover:text-white">{t("nav.dashboard")}</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ────────────── HERO ────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <span className="inline-block px-4 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-6">
                {t("hero.badge")}
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              {t("hero.title")}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {t("hero.titleAccent")}
              </span>{" "}
              {t("hero.titleEnd")}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.subtitle")}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenTool}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-blue-900/50 flex items-center gap-2 group"
              >
                {t("hero.cta")}
                <ArrowIcon size={20} className="group-hover:translate-x-1 transition-transform" style={{ transform: isRtl ? "scaleX(-1)" : undefined }} />
              </button>
              <p className="text-slate-500 text-sm">{t("hero.ctaSub")}</p>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-4">
              <a href="/pro/" className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4">
                {t("hero.proLink")} →
              </a>
            </motion.p>

            {/* Stats */}
            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-slate-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Card preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 max-w-sm mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-square bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2557] via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-5">
              <div className="h-2 bg-white/30 rounded mb-2 w-4/5" />
              <div className="h-2 bg-white/20 rounded mb-2 w-3/5" />
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded bg-white/20" />
                <div className="h-2 bg-white/20 rounded w-16" />
              </div>
            </div>
            <div className="absolute top-3 end-3 w-10 h-10 rounded-lg bg-white/20" />
          </div>
          <div className="mt-3 text-center text-slate-500 text-xs">Preview — NewsCard Pro</div>
        </motion.div>
      </section>

      {/* ────────────── FEATURES ────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              {t("features.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto">
              {t("features.subtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, key }) => (
              <motion.div
                key={key}
                variants={fadeUp}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={22} className="text-blue-300" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t(`features.${key}.title`)}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────── HOW IT WORKS ────────────── */}
      <section id="how" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              {t("howItWorks.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg">
              {t("howItWorks.subtitle")}
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 inset-x-[16%] h-px bg-gradient-to-r from-blue-600/50 via-violet-600/50 to-blue-600/50" />

            {steps.map(({ num, key }, i) => (
              <motion.div
                key={key}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-blue-900/50 z-10">
                  {num}
                </div>
                <h3 className="font-bold text-xl mb-3">{t(`howItWorks.${key}.title`)}</h3>
                <p className="text-slate-400 leading-relaxed">{t(`howItWorks.${key}.desc`)}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <button
              onClick={onOpenTool}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/50"
            >
              {t("nav.tryFree")} →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ────────────── PRICING ────────────── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              {t("pricing.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg mb-8">
              {t("pricing.subtitle")}
            </motion.p>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 bg-white/5 rounded-2xl p-1 border border-white/10">
              <button
                onClick={() => setBillingYearly(false)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  !billingYearly ? "bg-white text-slate-900 shadow" : "text-slate-400"
                }`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                onClick={() => setBillingYearly(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingYearly ? "bg-white text-slate-900 shadow" : "text-slate-400"
                }`}
              >
                {t("pricing.yearly")}
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">{t("pricing.save")}</span>
              </button>
            </motion.div>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => {
              const price = billingYearly && plan.key !== "free"
                ? t(`pricing.${plan.key}.priceYear`)
                : t(`pricing.${plan.key}.price`);

              return (
                <motion.div
                  key={plan.key}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className={`relative rounded-2xl border ${plan.border} bg-gradient-to-b ${plan.color} p-6 ${plan.featured ? "ring-2 ring-violet-500 shadow-xl shadow-violet-900/40" : ""}`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                      <span className="bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                        <Star size={10} /> {t("pricing.popular")}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-bold text-xl mb-1">{t(`pricing.${plan.key}.name`)}</h3>
                    <p className="text-slate-400 text-sm">{t(`pricing.${plan.key}.desc`)}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-black">{price}</span>
                    {plan.key !== "free" && (
                      <span className="text-slate-400 text-sm"> {t("pricing.currency")}/mo</span>
                    )}
                  </div>

                  <button
                    onClick={plan.key === "free" ? onOpenTool : () => window.location.href = "/pro/"}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${plan.btn}`}
                  >
                    {plan.key === "pro" ? t("pricing.ctaPro") : t("pricing.cta")}
                  </button>

                  <ul className="space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                        <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                        {t(`pricing.${plan.key}.${f}`)}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────── STATS BANNER ────────────── */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-900/30 to-violet-900/30 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: Newspaper, val: "10K+", label: t("hero.stat1") },
            { icon: Users,     val: "500+", label: isRtl ? "مؤسسة إعلامية" : i18n.language === "fr" ? "Médias" : "Media orgs" },
            { icon: Download,  val: "99.9%", label: isRtl ? "وقت تشغيل" : i18n.language === "fr" ? "Disponibilité" : "Uptime" },
          ].map(({ icon: Icon, val, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <Icon size={28} className="text-blue-400 mb-2" />
              <div className="text-3xl font-black">{val}</div>
              <div className="text-slate-400">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────────────── FAQ ────────────── */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("faq.title")}</h2>
            <p className="text-slate-400">{t("faq.subtitle")}</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-start hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base">{t(`faq.q${i + 1}`)}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
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

      {/* ────────────── CTA BANNER ────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-900/50 to-violet-900/50 rounded-3xl p-12 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px]" />
            </div>
            <h2 className="relative text-3xl sm:text-4xl font-bold mb-4">
              {i18n.language === "ar" ? "جاهز للبدء؟" : i18n.language === "fr" ? "Prêt à commencer ?" : "Ready to get started?"}
            </h2>
            <p className="relative text-slate-400 mb-8 text-lg">
              {i18n.language === "ar" ? "انضم لمئات المؤسسات الإعلامية التي تثق بمنصتنا." : i18n.language === "fr" ? "Rejoignez des centaines de médias qui font confiance à notre plateforme." : "Join hundreds of media organizations that trust our platform."}
            </p>
            <button
              onClick={onOpenTool}
              className="relative px-10 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-blue-900/50"
            >
              {t("nav.tryFree")} →
            </button>
          </div>
        </div>
      </section>

      {/* ────────────── FOOTER ────────────── */}
      <footer className="border-t border-white/5 bg-white/[0.02] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-sm">ب</div>
                <span className="font-bold text-lg">NewsCard Pro</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{t("footer.desc")}</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t("footer.product")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={onOpenTool} className="hover:text-white transition-colors">{t("footer.tool")}</button></li>
                <li><a href="/pro/" className="hover:text-white transition-colors">{t("footer.dashboard")}</a></li>
                <li><button onClick={() => scrollTo("pricing")} className="hover:text-white transition-colors">{t("footer.pricing")}</button></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t("footer.company")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.about")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.contact")}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>© {new Date().getFullYear()} NewsCard Pro. {t("footer.rights")}.</span>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}
