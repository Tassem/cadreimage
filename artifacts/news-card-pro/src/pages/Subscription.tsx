import { useEffect, useState } from "react";
import { Check, Zap, Building2, User, Star, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Plan {
  id: number;
  slug: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  cardsPerDay: number;
  maxTemplates: number;
  maxSavedDesigns: number;
  apiAccess: boolean;
  telegramBot: boolean;
  overlayUpload: boolean;
  customWatermark: boolean;
  sortOrder: number;
}

interface Usage {
  cardsToday: number;
  cardsLimit: number;
  templates: number;
  templatesLimit: number;
  savedDesigns: number;
  savedDesignsLimit: number;
  apiAccess: boolean;
  telegramBot: boolean;
  overlayUpload: boolean;
  customWatermark: boolean;
}

interface SubscriptionData {
  currentPlan: string;
  usage: Usage;
  plans: Plan[];
}

const PLAN_ICONS: Record<string, React.FC<any>> = {
  free: User,
  starter: Zap,
  pro: Star,
  agency: Building2,
};

const PLAN_COLORS: Record<string, string> = {
  free: "border-slate-200 bg-slate-50",
  starter: "border-blue-200 bg-blue-50",
  pro: "border-violet-300 bg-violet-50",
  agency: "border-amber-300 bg-amber-50",
};

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-violet-100 text-violet-700",
  agency: "bg-amber-100 text-amber-800",
};

function fmt(n: number) { return n === -1 ? "غير محدود" : n.toString(); }

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  if (limit === -1) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-green-600">{used} / ∞</span>
        </div>
        <div className="h-2 rounded-full bg-green-100">
          <div className="h-2 rounded-full bg-green-400 w-1/4" />
        </div>
      </div>
    );
  }
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-foreground";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", color)}>{used} / {limit}</span>
      </div>
      <Progress value={pct} className={cn("h-2", pct >= 90 ? "[&>div]:bg-red-500" : pct >= 70 ? "[&>div]:bg-amber-500" : "")} />
    </div>
  );
}

export default function Subscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const token = localStorage.getItem("pro_token");
    if (!token) return;
    fetch("/api/subscription", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-muted-foreground">تعذّر تحميل بيانات الاشتراك.</div>;

  const { currentPlan, usage, plans } = data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">باقتي</h1>
        <p className="text-muted-foreground mt-1">إدارة اشتراكك ومتابعة الاستخدام</p>
      </div>

      {/* Usage Summary */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">الاستخدام الحالي</CardTitle>
            <Badge className={cn("text-xs px-3 py-1", PLAN_BADGE_COLORS[currentPlan] ?? "bg-muted text-muted-foreground")}>
              {plans.find(p => p.slug === currentPlan)?.name ?? currentPlan}
            </Badge>
          </div>
          <CardDescription>يُحسب عداد البطاقات يومياً ويُعاد تعيينه في منتصف الليل</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <UsageMeter label="بطاقات اليوم" used={usage.cardsToday} limit={usage.cardsLimit} />
          <UsageMeter label="القوالب المحفوظة" used={usage.templates} limit={usage.templatesLimit} />
          <UsageMeter label="التصاميم المحفوظة" used={usage.savedDesigns} limit={usage.savedDesignsLimit} />
        </CardContent>
        <CardContent className="pt-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "API Access", active: usage.apiAccess },
            { label: "بوت تيليقرام", active: usage.telegramBot },
            { label: "رفع Overlay", active: usage.overlayUpload },
            { label: "علامة مائية", active: usage.customWatermark },
          ].map(f => (
            <div key={f.label} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", f.active ? "border-green-200 bg-green-50 text-green-700" : "border-dashed bg-muted/30 text-muted-foreground")}>
              {f.active ? <Check className="h-4 w-4 text-green-500 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0 opacity-40" />}
              {f.label}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">خطط الاشتراك</h2>
          <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/30 text-sm">
            <button
              className={cn("px-3 py-1 rounded-md transition-colors", billing === "monthly" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setBilling("monthly")}
            >شهري</button>
            <button
              className={cn("px-3 py-1 rounded-md transition-colors", billing === "yearly" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setBilling("yearly")}
            >
              سنوي
              <span className="mr-1 text-xs text-green-600 font-medium">وفّر 20%</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.sort((a,b) => a.sortOrder - b.sortOrder).map(plan => {
            const isActive = plan.slug === currentPlan;
            const Icon = PLAN_ICONS[plan.slug] ?? User;
            const price = billing === "yearly" ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;
            const features = [
              { label: `${fmt(plan.cardsPerDay)} بطاقة/يوم`, active: true },
              { label: `${fmt(plan.maxTemplates)} قالب`, active: true },
              { label: `${fmt(plan.maxSavedDesigns)} تصميم محفوظ`, active: true },
              { label: "API Access", active: plan.apiAccess },
              { label: "بوت تيليقرام", active: plan.telegramBot },
              { label: "رفع Overlay", active: plan.overlayUpload },
              { label: "علامة مائية مخصصة", active: plan.customWatermark },
            ];

            return (
              <Card key={plan.id} className={cn("flex flex-col relative transition-all", isActive ? "ring-2 ring-primary shadow-lg scale-[1.02]" : "hover:shadow-md")}>
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-3 text-xs">باقتك الحالية</Badge>
                  </div>
                )}
                <div className={cn("h-1.5 w-full rounded-t-xl", {
                  "bg-slate-400": plan.slug === "free",
                  "bg-blue-500": plan.slug === "starter",
                  "bg-violet-600": plan.slug === "pro",
                  "bg-amber-500": plan.slug === "agency",
                })} />
                <CardHeader className="pt-5 pb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", PLAN_COLORS[plan.slug] ?? "bg-muted")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-1">
                    {plan.priceMonthly === 0 ? (
                      <span className="text-2xl font-bold">مجاني</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{price}</span>
                        <span className="text-sm text-muted-foreground">ر.س/شهر</span>
                      </div>
                    )}
                    {billing === "yearly" && plan.priceYearly > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">{plan.priceYearly} ر.س سنوياً</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-2">
                    {features.map(f => (
                      <li key={f.label} className={cn("flex items-center gap-2 text-sm", !f.active && "opacity-40 line-through")}>
                        <Check className={cn("h-4 w-4 shrink-0", f.active ? "text-green-500" : "text-muted-foreground")} />
                        {f.label}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  {isActive ? (
                    <Button className="w-full" disabled variant="outline">الباقة الحالية</Button>
                  ) : (
                    <Button className="w-full" variant={plan.slug === "pro" ? "default" : "outline"}>
                      {plan.priceMonthly === 0 ? "استخدم مجاناً" : `ترقية إلى ${plan.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          للترقية أو التغيير تواصل مع المشرف · جميع الأسعار بالريال السعودي
        </p>
      </div>
    </div>
  );
}
