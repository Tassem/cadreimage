import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Bot, RefreshCw, Eye, EyeOff, Trash2 } from "lucide-react";

interface BotStatus {
  connected: boolean;
  hasToken: boolean;
  botUsername: string | null;
  tokenSource: "env" | "db" | "none";
  tokenMasked: string | null;
}

export default function TelegramBot() {
  const { toast } = useToast();
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const token_stored = localStorage.getItem("pro_token");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/settings/telegram", {
        headers: { Authorization: `Bearer ${token_stored}` },
      });
      if (r.ok) setStatus(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleSave = async () => {
    if (!token.trim()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/settings/telegram", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token_stored}` },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await r.json();
      if (r.ok) {
        toast({ title: "تم الربط بنجاح", description: `البوت: @${data.botUsername}` });
        setToken("");
        fetchStatus();
      } else {
        toast({ title: "خطأ", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "خطأ", description: "تعذّر الاتصال بالخادم", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("هل تريد إزالة ربط البوت؟")) return;
    setRemoving(true);
    try {
      const r = await fetch("/api/settings/telegram", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token_stored}` },
      });
      if (r.ok) {
        toast({ title: "تم إزالة الربط" });
        fetchStatus();
      }
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">بوت تيليقرام</h1>
          <p className="text-muted-foreground text-sm">ربط البوت لتوليد البطاقات مباشرةً من تيليقرام</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            حالة الاتصال
            <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">جاري التحقق...</div>
          ) : status ? (
            <div className="flex items-center gap-3">
              {status.connected ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <div className="font-medium">
                  {status.connected ? `متصل — @${status.botUsername}` : "غير متصل"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {status.tokenSource === "env" && "التوكن مُعيَّن من متغير البيئة"}
                  {status.tokenSource === "db" && `التوكن محفوظ: ${status.tokenMasked}`}
                  {status.tokenSource === "none" && "لم يتم ربط أي بوت بعد"}
                </div>
              </div>
              {status.tokenSource === "db" && (
                <Badge variant="secondary" className="mr-auto">محفوظ</Badge>
              )}
              {status.tokenSource === "env" && (
                <Badge variant="outline" className="mr-auto">متغير بيئة</Badge>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Connect Card */}
      {status?.tokenSource !== "env" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ربط بوت جديد</CardTitle>
            <CardDescription>
              أنشئ بوتاً من{" "}
              <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary underline">
                @BotFather
              </a>{" "}
              ثم انسخ التوكن وأدخله هنا
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bot-token">توكن البوت</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="bot-token"
                    type={showToken ? "text" : "password"}
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="123456789:ABCdef..."
                    className="text-left pr-10 font-mono text-sm"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSave} disabled={saving || !token.trim()}>
                  {saving ? "جاري الربط..." : "ربط البوت"}
                </Button>
              </div>
            </div>

            {status?.tokenSource === "db" && (
              <Button variant="outline" size="sm" onClick={handleRemove} disabled={removing} className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 ml-2" />
                {removing ? "جاري الإزالة..." : "إزالة الربط"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">كيفية استخدام البوت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-3">
              <div className="font-medium mb-1 text-xs text-muted-foreground">الطريقة الأساسية</div>
              <pre className="font-mono text-xs whitespace-pre-wrap">{`قالب : عاجل
عنوان : عنوان الخبر هنا`}</pre>
              <div className="text-xs text-muted-foreground mt-1">ثم أرسل صورة الخلفية أو اكتب /skip</div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <div className="font-medium mb-1 text-xs text-muted-foreground">استخدام قالب API (من لوحة التحكم)</div>
              <pre className="font-mono text-xs whitespace-pre-wrap">{`قالب : اسم-قالبك-المحفوظ
عنوان : عنوان الخبر`}</pre>
              <div className="text-xs text-muted-foreground mt-1">يطبّق البوت كل إعدادات القالب تلقائياً (لون، خط، شعار، محاذاة، علامة مائية)</div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <div className="font-medium mb-1 text-xs text-muted-foreground">صورة مع تعليق مباشر</div>
              <pre className="font-mono text-xs whitespace-pre-wrap">{`قالب : breaking-red
عنوان : عنوان الخبر
نسبة : 16:9
تسمية : CNN`}</pre>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2">القوالب المدمجة:</div>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              {[
                ["عاجل / breaking-red", "🔴"],
                ["كلاسك / classic-blue", "🔵"],
                ["مودرن / modern-black", "⚫"],
                ["زمرد / emerald", "🟢"],
                ["ملكي / royal-purple", "🟣"],
                ["ذهبي / gold", "🟡"],
                ["ليلي / midnight", "🌙"],
                ["موجة / purple-wave", "💜"],
              ].map(([name, icon]) => (
                <div key={name} className="flex items-center gap-1">
                  <span>{icon}</span>
                  <span className="font-mono">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-blue-700 dark:text-blue-300">
            <div className="font-medium text-xs mb-1">💡 نصيحة</div>
            <div className="text-xs">
              احفظ قالباً من صفحة "إنشاء بطاقة" ثم استخدم اسمه أو الـ slug في البوت — سيُطبَّق كل شيء تلقائياً.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
