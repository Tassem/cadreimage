import { useTranslation } from "react-i18next";

const C = {
  bg: "#09090F",
  surface: "#111119",
  card: "#16161F",
  border: "#1E1E2E",
  red: "#E5243A",
  redHov: "#C41F33",
  white: "#FFFFFF",
  lightBg: "#F8F8FA",
  muted: "#9CA3B0",
  text: "#E2E4EA",
};

interface Props {
  onOpenTool: () => void;
}

export default function Landing({ onOpenTool }: Props) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const changeLang = (l: string) => i18n.changeLanguage(l);

  return (
    <div
      style={{
        fontFamily: "'Cairo', sans-serif",
        direction: "rtl",
        background: C.bg,
        color: C.white,
        minHeight: "100vh",
      }}
    >
      {/* ===== NAVBAR ===== */}
      <nav
        style={{
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Right: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: C.red,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
              color: C.white,
              flexShrink: 0,
            }}
          >
            ن
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.white }}>
            مولّد البطاقات
          </span>
        </div>

        {/* Center: Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["المنتج", "المميزات", "الأسعار"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: C.muted,
                fontSize: 14,
                textDecoration: "none",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = C.white)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = C.muted)
              }
            >
              {item}
            </a>
          ))}
        </div>

        {/* Left: Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            direction: "ltr",
          }}
        >
          <button
            onClick={() => changeLang(isAr ? "en" : "ar")}
            style={{
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.muted,
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {isAr ? "EN" : "AR"}
          </button>

          <button
            onClick={onOpenTool}
            style={{
              background: "transparent",
              border: "none",
              color: C.muted,
              fontSize: 13,
              cursor: "pointer",
              padding: "6px 10px",
              fontFamily: "inherit",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = C.white)
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = C.muted)
            }
          >
            مولّد البطاقات المجاني
          </button>

          <a
            href="/pro/"
            style={{
              background: C.red,
              color: C.white,
              padding: "7px 16px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.background = C.redHov)
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.background = C.red)
            }
          >
            لوحة تحكم برو
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section
        style={{
          minHeight: "calc(100vh - 58px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: C.bg,
          padding: "60px 32px",
          textAlign: "center",
        }}
      >
        {/* Red radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "55%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 550,
            background:
              "radial-gradient(ellipse, rgba(229,36,58,0.2) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 700 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(229,36,58,0.1)",
              border: "1px solid rgba(229,36,58,0.25)",
              borderRadius: 999,
              padding: "6px 18px",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.red,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: C.text }}>
              الخيار الأول للغرف الإخبارية العربية
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.6rem, 6vw, 4.4rem)",
              fontWeight: 900,
              lineHeight: 1.2,
              color: C.white,
              margin: "0 0 20px",
              letterSpacing: "-0.5px",
            }}
          >
            صمم بطاقات إخبارية
            <br />
            احترافية في ثوانٍ.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 16,
              color: C.muted,
              margin: "0 auto 36px",
              lineHeight: 1.7,
              maxWidth: 500,
            }}
          >
            أداة ساس الأقوى للصحفيين والفرق الإعلامية لتوليد صور بطاقات إخبارية
            عربية فورية وموثوقة.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={onOpenTool}
              style={{
                background: C.red,
                color: C.white,
                border: "none",
                padding: "13px 28px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background = C.redHov)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background = C.red)
              }
            >
              ابدأ الآن مجاناً
            </button>

            <button
              style={{
                background: "transparent",
                color: C.white,
                border: `1.5px solid ${C.border}`,
                padding: "12px 28px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.borderColor = C.muted)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.borderColor = C.border)
              }
            >
              تصفح المميزات
            </button>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        style={{
          background: C.lightBg,
          padding: "80px 32px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
              fontWeight: 800,
              marginBottom: 48,
              color: "#0D0D16",
            }}
          >
            كل ما تحتاجه لغرفة الأخبار الرقمية
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                icon: "▦",
                title: "قوالب جاهزة",
                desc: "اختر من بين مجموعة واسعة من القوالب المصممة خصيصاً للشبكات الاجتماعية.",
              },
              {
                icon: "T",
                title: "دعم كامل للغة العربية",
                desc: "خطوط عربية احترافية مع دعم متكامل للاتجاه من اليمين للسار.",
              },
              {
                icon: "⊞",
                title: "تخصيص كامل",
                desc: "تحكم في الألوان، الخطوط، الشعارات لتناسب هويتك البصرية.",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: C.white,
                  border: "1px solid #E5E7EB",
                  borderRadius: 14,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(229,36,58,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    fontSize: 22,
                    color: C.red,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    marginBottom: 10,
                    color: "#0D0D16",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, margin: 0 }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        style={{
          background: C.white,
          padding: "80px 32px",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
              fontWeight: 800,
              marginBottom: 56,
              color: "#0D0D16",
            }}
          >
            كيف تعمل الأداة؟
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            {[
              { num: "1", label: "أدخل الخبر" },
              { num: "2", label: "اختر التصميم" },
              { num: "3", label: "حمل وشارك" },
            ].map((step, i) => (
              <div
                key={step.num}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    width: 130,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      border: "2px solid #D1D5DB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#374151",
                      background: C.white,
                    }}
                  >
                    {step.num}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {i < 2 && (
                  <div
                    style={{
                      width: 90,
                      height: 2,
                      background: "#E5E7EB",
                      marginBottom: 28,
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section style={{ background: C.bg, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
              fontWeight: 800,
              color: C.white,
              marginBottom: 48,
            }}
          >
            خطط تناسب جميع الاحتياجات
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              alignItems: "start",
            }}
          >
            <PricingCard
              title="برو"
              price="$49"
              period="/ شهر"
              features={[
                "Everything in Basic",
                "Custom logos",
                "API access",
                "Team collaboration",
              ]}
              highlighted={false}
              onCta={onOpenTool}
            />
            <PricingCard
              title="أساسي"
              price="$15"
              period="/ شهر"
              features={[
                "All templates",
                "High resolution",
                "No watermark",
                "Custom colors",
              ]}
              highlighted={true}
              onCta={onOpenTool}
            />
            <PricingCard
              title="مجاني"
              price="$0"
              period=""
              features={[
                "Basic templates",
                "Standard quality",
                "Watermarked",
              ]}
              highlighted={false}
              onCta={onOpenTool}
            />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          background: C.lightBg,
          borderTop: "1px solid #E5E7EB",
          padding: "48px 32px 32px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: C.red,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  color: C.white,
                }}
              >
                ن
              </div>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#0D0D16" }}>
                مولّد البطاقات
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#6B7280",
                lineHeight: 1.7,
                maxWidth: 220,
                margin: 0,
              }}
            >
              أداة ساس الأقوى للصحفيين والفرق الإعلامية لتوليد بطاقات إخبارية فورية
              وموثوقة.
            </p>
          </div>

          {/* Product links */}
          <div style={{ textAlign: "center" }}>
            <h4
              style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 14,
                color: "#0D0D16",
              }}
            >
              المنتج
            </h4>
            {["Home", "Free Tool", "Pro Dashboard"].map((l) => (
              <div key={l} style={{ marginBottom: 8 }}>
                <a
                  href="#"
                  style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}
                >
                  {l}
                </a>
              </div>
            ))}
          </div>

          {/* Legal */}
          <div style={{ textAlign: "start", direction: "ltr" }}>
            <h4
              style={{
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 14,
                color: "#0D0D16",
              }}
            >
              Legal
            </h4>
            {["Privacy Policy", "Terms of Service"].map((l) => (
              <div key={l} style={{ marginBottom: 8 }}>
                <a
                  href="#"
                  style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}
                >
                  {l}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            maxWidth: 1100,
            margin: "28px auto 0",
            paddingTop: 20,
            borderTop: "1px solid #E5E7EB",
            textAlign: "center",
            fontSize: 12,
            color: "#9CA3AF",
          }}
        >
          © News Card Generator. All rights reserved 2026.
        </div>
      </footer>
    </div>
  );
}

/* ============================
   Pricing Card Component
   ============================ */
function PricingCard({
  title,
  price,
  period,
  features,
  highlighted,
  onCta,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  onCta: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: highlighted ? "#16161F" : "#111119",
        border: highlighted
          ? "1.5px solid rgba(229,36,58,0.5)"
          : "1px solid #1E1E2E",
        borderRadius: 14,
        padding: "32px 24px 28px",
        marginTop: highlighted ? 0 : 0,
      }}
    >
      {highlighted && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            background: C.red,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 14px",
            borderRadius: 999,
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          MOST POPULAR
        </div>
      )}

      <h3
        style={{
          fontWeight: 700,
          fontSize: 20,
          color: "#E2E4EA",
          textAlign: "center",
          margin: "0 0 4px",
        }}
      >
        {title}
      </h3>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 38, fontWeight: 900, color: "#FFFFFF" }}>
          {price}
        </span>
        {period && (
          <span style={{ fontSize: 14, color: "#9CA3B0", marginRight: 4 }}>
            {period}
          </span>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
        {features.map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              padding: "8px 0",
              fontSize: 14,
              color: "#9CA3B0",
              borderBottom: "1px solid #1E1E2E",
            }}
          >
            <span>{f}</span>
            <span style={{ color: C.red, fontSize: 16, flexShrink: 0 }}>✓</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        style={{
          width: "100%",
          background: highlighted ? C.red : "transparent",
          border: highlighted ? "none" : "1.5px solid #1E1E2E",
          color: "#FFFFFF",
          padding: "12px 0",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.target as HTMLElement;
          el.style.background = highlighted ? C.redHov : "#1E1E2E";
        }}
        onMouseLeave={(e) => {
          const el = e.target as HTMLElement;
          el.style.background = highlighted ? C.red : "transparent";
        }}
      >
        اشترك الآن
      </button>
    </div>
  );
}
