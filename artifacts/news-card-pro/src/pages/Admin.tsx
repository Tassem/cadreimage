import { useState, useEffect, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
type PlanSlug = "free" | "starter" | "pro" | "agency";
interface AdminUser {
  id: number;
  name: string;
  email: string;
  plan: PlanSlug;
  imagesToday: number;
  totalImages: number;
  isAdmin: boolean;
  createdAt: string;
}
interface Stats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalImages: number;
  todayImages: number;
}
interface AdminImage {
  id: number;
  userId: number;
  title: string;
  imageUrl: string;
  aspectRatio: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}
interface AdminPlan {
  id: number;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  cardsPerDay: number;
  maxTemplates: number;
  maxSavedDesigns: number;
  apiAccess: boolean;
  telegramBot: boolean;
  overlayUpload: boolean;
  customWatermark: boolean;
  isActive: boolean;
  sortOrder: number;
}

// ─── Styles ────────────────────────────────────────────────────────────────
const BG       = "#0a0f1a";
const SURFACE  = "#111827";
const BORDER   = "#1e293b";
const TEXT      = "#f1f5f9";
const MUTED    = "#64748b";
const BLUE     = "#3b82f6";
const GREEN    = "#22c55e";
const RED      = "#ef4444";
const AMBER    = "#f59e0b";
const PURPLE   = "#8b5cf6";

const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px",
  padding: "20px", ...extra,
});

const btn = (color: string, small?: boolean): React.CSSProperties => ({
  background: color, color: "#fff", border: "none", borderRadius: "6px",
  cursor: "pointer", fontFamily: "'Cairo', sans-serif",
  fontSize: small ? "11px" : "13px", fontWeight: 600,
  padding: small ? "4px 10px" : "9px 18px",
});

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{ ...card(), display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "160px" }}>
      <div style={{ width: "46px", height: "46px", borderRadius: "10px", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: TEXT }}>{value.toLocaleString("ar-MA")}</div>
        <div style={{ fontSize: "12px", color: MUTED }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken]           = useState(() => localStorage.getItem("ncg_admin_token") || "");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass]   = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [adminName, setAdminName]   = useState("");
  const [stats, setStats]           = useState<Stats | null>(null);
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [images, setImages]         = useState<AdminImage[]>([]);
  const [activeTab, setActiveTab]   = useState<"stats" | "users" | "images" | "plans">("stats");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [adminPlans, setAdminPlans] = useState<AdminPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [planSaving, setPlanSaving] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  // Verify token and load data
  const loadData = useCallback(async (t: string) => {
    try {
      const [statsRes, usersRes, imagesRes, plansRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${t}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${t}` } }),
        fetch("/api/admin/images", { headers: { Authorization: `Bearer ${t}` } }),
        fetch("/api/admin/plans", { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (statsRes.status === 403 || statsRes.status === 401) {
        localStorage.removeItem("ncg_admin_token");
        setToken("");
        return;
      }
      const [s, u, i, p] = await Promise.all([statsRes.json(), usersRes.json(), imagesRes.json(), plansRes.json()]);
      setStats(s);
      setUsers(u);
      setImages(i);
      if (Array.isArray(p)) setAdminPlans(p);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (token) loadData(token);
  }, [token, loadData]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || "فشل تسجيل الدخول"); return; }
      localStorage.setItem("ncg_admin_token", data.token);
      setToken(data.token);
      setAdminName(data.admin?.name || "Admin");
    } catch {
      setLoginError("خطأ في الاتصال");
    } finally {
      setLoginLoading(false);
    }
  };

  // Update user plan
  const handlePlanChange = async (userId: number, plan: PlanSlug) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ plan }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
    } finally { setUpdatingId(null); }
  };

  // Save plan (create or update)
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    setPlanSaving(true);
    try {
      const isNew = editingPlan.id === -1;
      const url = isNew ? "/api/admin/plans" : `/api/admin/plans/${editingPlan.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(editingPlan) });
      if (res.ok) {
        const saved = await res.json();
        if (isNew) setAdminPlans(prev => [...prev, saved]);
        else setAdminPlans(prev => prev.map(p => p.id === saved.id ? saved : p));
        setEditingPlan(null);
      }
    } finally { setPlanSaving(false); }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
    const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) setAdminPlans(prev => prev.filter(p => p.id !== id));
  };

  // Toggle admin
  const handleAdminToggle = async (userId: number, isAdmin: boolean) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ isAdmin }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin } : u));
    } finally { setUpdatingId(null); }
  };

  // Delete user
  const handleDelete = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setConfirmDeleteId(null);
      }
    } catch { /* silent */ }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Login page ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif" }}>
        <div style={{ width: "360px", ...card() }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🛡️</div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: TEXT, margin: 0 }}>لوحة الإدارة</h1>
            <p style={{ color: MUTED, fontSize: "13px", margin: "4px 0 0" }}>Admin Panel — News Card Pro</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", color: MUTED, display: "block", marginBottom: "6px", direction: "rtl" }}>البريد الإلكتروني</label>
              <input
                type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required dir="ltr"
                style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT, padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: MUTED, display: "block", marginBottom: "6px", direction: "rtl" }}>كلمة المرور</label>
              <input
                type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required dir="ltr"
                style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT, padding: "10px 12px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {loginError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "13px", direction: "rtl" }}>
                {loginError}
              </div>
            )}
            <button type="submit" disabled={loginLoading} style={{ ...btn(BLUE), padding: "12px", fontSize: "15px", marginTop: "4px" }}>
              {loginLoading ? "⏳ جاري التحقق..." : "تسجيل دخول الإدارة"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────
  const tabBtnStyle = (t: typeof activeTab): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: activeTab === t ? 600 : 400, fontFamily: "'Cairo', sans-serif",
    background: activeTab === t ? BLUE : "rgba(255,255,255,0.04)",
    color: activeTab === t ? "#fff" : MUTED,
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>

      {/* Header */}
      <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🛡️</span>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>لوحة الإدارة</div>
            <div style={{ fontSize: "11px", color: MUTED }}>News Card Pro — Admin Panel</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: MUTED }}>مرحباً {adminName || "Admin"}</span>
          <button onClick={() => { localStorage.removeItem("ncg_admin_token"); setToken(""); }} style={{ ...btn("rgba(239,68,68,0.1)"), color: RED, border: `1px solid rgba(239,68,68,0.2)`, fontSize: "12px", padding: "6px 14px" }}>
            تسجيل خروج
          </button>
        </div>
      </header>

      <div style={{ padding: "28px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Stats bar */}
        {stats && (
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "28px" }}>
            <StatCard label="إجمالي المستخدمين" value={stats.totalUsers}  icon="👥" color={BLUE}   />
            <StatCard label="مستخدمو Pro"        value={stats.proUsers}   icon="⭐" color={PURPLE}  />
            <StatCard label="إجمالي الصور"        value={stats.totalImages} icon="🖼️" color={GREEN}  />
            <StatCard label="صور اليوم"           value={stats.todayImages} icon="📅" color={AMBER}  />
          </div>
        )}

        {/* Tab nav */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: `1px solid ${BORDER}`, paddingBottom: "12px", flexWrap: "wrap" }}>
          <button style={tabBtnStyle("stats")}  onClick={() => setActiveTab("stats")}>📊 إحصاءات</button>
          <button style={tabBtnStyle("users")}  onClick={() => setActiveTab("users")}>👥 المستخدمون {users.length ? `(${users.length})` : ""}</button>
          <button style={tabBtnStyle("images")} onClick={() => setActiveTab("images")}>🖼️ الصور الأخيرة</button>
          <button style={tabBtnStyle("plans")}  onClick={() => setActiveTab("plans")}>💎 الباقات {adminPlans.length ? `(${adminPlans.length})` : ""}</button>
        </div>

        {/* ── STATS TAB ── */}
        {activeTab === "stats" && stats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={card()}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", color: TEXT }}>توزيع الخطط</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "خطة مجانية", value: stats.freeUsers,  color: MUTED,   pct: stats.totalUsers ? Math.round(stats.freeUsers / stats.totalUsers * 100) : 0 },
                  { label: "خطة Pro",    value: stats.proUsers,   color: PURPLE,   pct: stats.totalUsers ? Math.round(stats.proUsers / stats.totalUsers * 100) : 0 },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                      <span style={{ color: TEXT }}>{row.label}</span>
                      <span style={{ color: row.color, fontWeight: 600 }}>{row.value} ({row.pct}%)</span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "4px", background: BORDER }}>
                      <div style={{ height: "100%", width: `${row.pct}%`, borderRadius: "4px", background: row.color, transition: "width 0.4s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={card()}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", color: TEXT }}>معدل الاستخدام</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "صور / مستخدم (إجمالي)", value: stats.totalUsers ? (stats.totalImages / stats.totalUsers).toFixed(1) : "0" },
                  { label: "صور اليوم", value: stats.todayImages },
                  { label: "مستخدمون نشطون اليوم", value: users.filter(u => u.imagesToday > 0).length },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: BG, borderRadius: "8px" }}>
                    <span style={{ fontSize: "13px", color: MUTED }}>{row.label}</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: TEXT }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            <div style={{ marginBottom: "14px", display: "flex", gap: "10px" }}>
              <input
                placeholder="🔍 بحث باسم أو بريد..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} dir="rtl"
                style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT, padding: "9px 14px", fontSize: "13px", outline: "none", fontFamily: "'Cairo', sans-serif" }}
              />
              <button onClick={() => loadData(token)} style={{ ...btn(SURFACE), border: `1px solid ${BORDER}`, color: MUTED, padding: "9px 14px", fontSize: "13px" }}>🔄 تحديث</button>
            </div>
            <div style={{ ...card({ padding: 0 }), overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: BG }}>
                    {["#", "الاسم / البريد", "الخطة", "الصور", "اليوم", "Admin", "إجراءات"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", color: MUTED, fontWeight: 600, textAlign: "right", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${BORDER}`, transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#151f30")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "12px 14px", color: MUTED }}>{i + 1}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: TEXT }}>{u.name}</div>
                        <div style={{ fontSize: "11px", color: MUTED, fontFamily: "monospace" }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {(() => {
                          const pc: Record<string,string> = { free:"rgba(100,116,139,0.15)", starter:"rgba(59,130,246,0.15)", pro:"rgba(139,92,246,0.15)", agency:"rgba(245,158,11,0.15)" };
                          const tc: Record<string,string> = { free:MUTED, starter:"#93c5fd", pro:"#c4b5fd", agency:AMBER };
                          const bc: Record<string,string> = { free:BORDER, starter:"rgba(59,130,246,0.3)", pro:"rgba(139,92,246,0.3)", agency:"rgba(245,158,11,0.3)" };
                          const labels: Record<string,string> = { free:"Free", starter:"Starter", pro:"⭐ Pro", agency:"🏢 Agency" };
                          return (
                            <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:700, background:pc[u.plan]??pc.free, color:tc[u.plan]??MUTED, border:`1px solid ${bc[u.plan]??BORDER}` }}>
                              {labels[u.plan]??u.plan}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: "12px 14px", color: TEXT, fontWeight: 600 }}>{u.totalImages}</td>
                      <td style={{ padding: "12px 14px", color: u.imagesToday > 0 ? GREEN : MUTED }}>{u.imagesToday}</td>
                      <td style={{ padding: "12px 14px" }}>
                        {u.isAdmin
                          ? <span style={{ color: AMBER, fontSize: "12px" }}>🛡️ Admin</span>
                          : <span style={{ color: MUTED, fontSize: "12px" }}>—</span>
                        }
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          {updatingId === u.id ? (
                            <span style={{ fontSize: "12px", color: MUTED }}>⏳</span>
                          ) : (
                            <>
                              <select
                                value={u.plan}
                                onChange={e => handlePlanChange(u.id, e.target.value as PlanSlug)}
                                style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: "6px", fontSize: "11px", padding: "3px 6px", fontFamily: "'Cairo', sans-serif", cursor: "pointer" }}
                              >
                                <option value="free">Free</option>
                                <option value="starter">Starter</option>
                                <option value="pro">Pro</option>
                                <option value="agency">Agency</option>
                              </select>
                              {!u.isAdmin
                                ? <button onClick={() => handleAdminToggle(u.id, true)} style={{ ...btn("rgba(245,158,11,0.1)", true), color: AMBER, border: "1px solid rgba(245,158,11,0.2)" }}>🛡️</button>
                                : <button onClick={() => handleAdminToggle(u.id, false)} style={{ ...btn("rgba(100,116,139,0.1)", true), color: MUTED }}>−🛡️</button>
                              }
                              {confirmDeleteId === u.id ? (
                                <>
                                  <button onClick={() => handleDelete(u.id)} style={{ ...btn(RED, true) }}>تأكيد</button>
                                  <button onClick={() => setConfirmDeleteId(null)} style={{ ...btn(SURFACE, true), color: MUTED, border: `1px solid ${BORDER}` }}>إلغاء</button>
                                </>
                              ) : (
                                <button onClick={() => setConfirmDeleteId(u.id)} style={{ ...btn("rgba(239,68,68,0.1)", true), color: RED, border: "1px solid rgba(239,68,68,0.2)" }}>🗑️</button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: MUTED }}>لا توجد نتائج</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── IMAGES TAB ── */}
        {activeTab === "images" && (
          <div>
            <div style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, color: MUTED, fontSize: "13px" }}>آخر 100 صورة مولّدة في المنصة</p>
              <button onClick={() => loadData(token)} style={{ ...btn(SURFACE), border: `1px solid ${BORDER}`, color: MUTED, padding: "7px 14px", fontSize: "12px" }}>🔄 تحديث</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
              {images.map(img => (
                <div key={img.id} style={{ ...card({ padding: 0 }), overflow: "hidden" }}>
                  <a href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                    <img src={img.imageUrl} alt={img.title} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", background: "#1a2035" }} loading="lazy" />
                  </a>
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: TEXT, fontWeight: 600, lineHeight: 1.4, direction: "rtl" }}>{img.title?.slice(0, 60) || "—"}</p>
                    <p style={{ margin: 0, fontSize: "10px", color: MUTED, fontFamily: "monospace" }}>{img.userEmail}</p>
                    <p style={{ margin: "3px 0 0", fontSize: "10px", color: MUTED }}>
                      {new Date(img.createdAt).toLocaleDateString("ar-MA")} • {img.aspectRatio}
                    </p>
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px", color: MUTED }}>لا توجد صور بعد</div>
              )}
            </div>
          </div>
        )}

        {/* ── PLANS TAB ── */}
        {activeTab === "plans" && (
          <div>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, color: MUTED, fontSize: "13px" }}>إدارة باقات الاشتراك وحدودها</p>
              <button
                onClick={() => setEditingPlan({ id: -1, name: "", slug: "", priceMonthly: 0, priceYearly: 0, cardsPerDay: 10, maxTemplates: 5, maxSavedDesigns: 10, apiAccess: false, telegramBot: false, overlayUpload: false, customWatermark: false, isActive: true, sortOrder: 99 })}
                style={{ ...btn(BLUE), padding: "8px 18px", fontSize: "13px" }}
              >+ إضافة باقة جديدة</button>
            </div>

            {/* Edit / Create form */}
            {editingPlan && (
              <div style={{ ...card(), marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 18px", fontSize: "15px", color: TEXT }}>{editingPlan.id === -1 ? "إنشاء باقة جديدة" : `تعديل باقة: ${editingPlan.name}`}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  {[
                    { label: "اسم الباقة", key: "name", type: "text" },
                    { label: "Slug (معرّف)", key: "slug", type: "text" },
                    { label: "السعر شهري ($)", key: "priceMonthly", type: "number" },
                    { label: "السعر سنوي ($)", key: "priceYearly", type: "number" },
                    { label: "بطاقات/يوم (-1 غير محدود)", key: "cardsPerDay", type: "number" },
                    { label: "حد القوالب (-1 غير محدود)", key: "maxTemplates", type: "number" },
                    { label: "حد التصاميم المحفوظة", key: "maxSavedDesigns", type: "number" },
                    { label: "ترتيب العرض", key: "sortOrder", type: "number" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label style={{ fontSize: "11px", color: MUTED, display: "block", marginBottom: "5px", direction: "rtl" }}>{label}</label>
                      <input
                        type={type} dir="ltr"
                        value={editingPlan[key as keyof AdminPlan] as string | number}
                        onChange={e => setEditingPlan(p => p ? { ...p, [key]: type === "number" ? Number(e.target.value) : e.target.value } : p)}
                        style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", color: TEXT, padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "24px", marginBottom: "18px", flexWrap: "wrap" }}>
                  {[
                    { label: "وصول API", key: "apiAccess" },
                    { label: "بوت تيليجرام", key: "telegramBot" },
                    { label: "رفع تراكبات مخصصة", key: "overlayUpload" },
                    { label: "علامة مائية مخصصة", key: "customWatermark" },
                    { label: "نشطة", key: "isActive" },
                  ].map(({ label, key }) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: TEXT, direction: "rtl" }}>
                      <input
                        type="checkbox"
                        checked={editingPlan[key as keyof AdminPlan] as boolean}
                        onChange={e => setEditingPlan(p => p ? { ...p, [key]: e.target.checked } : p)}
                        style={{ width: "16px", height: "16px", accentColor: BLUE, cursor: "pointer" }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleSavePlan} disabled={planSaving} style={{ ...btn(BLUE), padding: "9px 22px" }}>
                    {planSaving ? "⏳ جاري الحفظ..." : "💾 حفظ الباقة"}
                  </button>
                  <button onClick={() => setEditingPlan(null)} style={{ ...btn(SURFACE), border: `1px solid ${BORDER}`, color: MUTED, padding: "9px 18px" }}>إلغاء</button>
                </div>
              </div>
            )}

            {/* Plans grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {adminPlans.map(plan => {
                const slugColors: Record<string,string> = { free:MUTED, starter:BLUE, pro:PURPLE, agency:AMBER };
                const col = slugColors[plan.slug] || BLUE;
                return (
                  <div key={plan.id} style={{ ...card(), borderTop: `3px solid ${col}`, opacity: plan.isActive ? 1 : 0.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "16px", color: TEXT }}>{plan.name}</div>
                        <div style={{ fontSize: "11px", color: MUTED, fontFamily: "monospace" }}>{plan.slug}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: col, fontSize: "18px" }}>${plan.priceMonthly}<span style={{ fontSize: "11px", color: MUTED }}>/شهر</span></div>
                        <div style={{ fontSize: "11px", color: MUTED }}>${plan.priceYearly}/سنة</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                      {[
                        { icon: "🖼️", label: "بطاقات/يوم", value: plan.cardsPerDay === -1 ? "غير محدود" : plan.cardsPerDay },
                        { icon: "📋", label: "القوالب", value: plan.maxTemplates === -1 ? "غير محدود" : plan.maxTemplates },
                        { icon: "💾", label: "التصاميم المحفوظة", value: plan.maxSavedDesigns === -1 ? "غير محدود" : plan.maxSavedDesigns },
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                          <span style={{ color: MUTED }}>{row.icon} {row.label}</span>
                          <span style={{ color: TEXT, fontWeight: 600 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                      {plan.apiAccess     && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" }}>API</span>}
                      {plan.telegramBot   && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(20,184,166,0.15)", color: "#5eead4", border: "1px solid rgba(20,184,166,0.2)" }}>Bot</span>}
                      {plan.overlayUpload && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }}>Overlay</span>}
                      {plan.customWatermark && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.15)", color: AMBER, border: "1px solid rgba(245,158,11,0.2)" }}>Watermark</span>}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setEditingPlan({ ...plan })} style={{ ...btn(SURFACE, true), border: `1px solid ${BORDER}`, color: MUTED, flex: 1 }}>✏️ تعديل</button>
                      <button onClick={() => handleDeletePlan(plan.id)} style={{ ...btn("rgba(239,68,68,0.1)", true), color: RED, border: "1px solid rgba(239,68,68,0.2)" }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
              {adminPlans.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px", color: MUTED }}>لا توجد باقات بعد</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
