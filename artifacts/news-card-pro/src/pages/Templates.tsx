import { useState } from "react";
import { useListTemplates, getListTemplatesQueryKey, useDeleteTemplate } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Trash2, Layers, Copy, Check, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Templates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: templates, isLoading } = useListTemplates({
    query: {
      queryKey: getListTemplatesQueryKey(),
      enabled: !!localStorage.getItem("pro_token"),
    }
  });

  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id)).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({ title: "تم النسخ", description: `ID القالب: ${id}` });
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف القالب "${name}"؟`)) {
      deleteTemplate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف", description: "تم حذف القالب بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
        },
        onError: () => {
          toast({ title: "خطأ", description: "حدث خطأ أثناء حذف القالب", variant: "destructive" });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">قوالب API</h1>
          <p className="text-muted-foreground mt-1">كل قالب يحفظ إعداداتك الكاملة — استخدم الـ ID في n8n أو أي أتمتة</p>
        </div>
      </div>

      {/* Usage hint */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">كيف تستخدم القوالب في n8n؟</p>
        <p>أرسل طلب POST إلى <code className="bg-muted px-1 rounded text-xs" dir="ltr">/api/generate</code> مع <code className="bg-muted px-1 rounded text-xs" dir="ltr">templateId: &lt;ID&gt;</code> لتوليد صورة بإعدادات القالب مباشرة.</p>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg bg-muted/10 border-dashed">
          <Layers className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">لا توجد قوالب</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            اذهب إلى صفحة <strong>التوليد</strong>، اضبط التصميم كما تريد، ثم احفظه كـ "قالب API" من تاب الـ API.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              {/* Color preview strip */}
              <div
                className="h-2 w-full rounded-t-lg"
                style={{ background: template.bannerGradient ?? template.bannerColor }}
              />

              <CardHeader className="pb-3 pt-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
                  <Badge variant="outline" dir="ltr" className="text-xs shrink-0">{template.aspectRatio}</Badge>
                </div>
                <CardDescription className="text-xs">
                  {format(new Date(template.createdAt), "dd MMM yyyy", { locale: ar })}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 text-sm space-y-3">
                {/* Template ID — primary action */}
                <div className="rounded-md bg-muted/50 border px-3 py-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Template ID</p>
                    <p className="font-mono font-bold text-base" dir="ltr">{template.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopyId(template.id)}
                    title="نسخ الـ ID"
                  >
                    {copiedId === template.id
                      ? <Check className="h-4 w-4 text-green-500" />
                      : <Copy className="h-4 w-4" />
                    }
                  </Button>
                </div>

                {/* Slug (if set) */}
                {(template as any).slug && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Slug:</span>
                    <code className="bg-muted px-1 rounded">{(template as any).slug}</code>
                  </div>
                )}

                {/* Colors */}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">لون الشريط:</span>
                  <div className="flex items-center gap-1.5">
                    <span dir="ltr" className="font-mono text-xs">{template.bannerColor}</span>
                    <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: template.bannerColor }} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">لون النص:</span>
                  <div className="flex items-center gap-1.5">
                    <span dir="ltr" className="font-mono text-xs">{template.textColor}</span>
                    <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: template.textColor }} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الخط:</span>
                  <span className="text-xs">{template.font}</span>
                </div>

                {/* Logo */}
                {template.logoUrl ? (
                  <div className="flex items-center gap-2 pt-1">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <img
                      src={template.logoUrl}
                      alt="logo"
                      className="h-6 max-w-[80px] object-contain rounded"
                    />
                    <span className="text-xs text-muted-foreground">لوغو محفوظ</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    <span className="text-xs text-muted-foreground/50">بدون لوغو</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t bg-muted/5 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  asChild
                >
                  <a href={`/pro/generate`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    فتح في المولّد
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs"
                  disabled={isDeleting}
                  onClick={() => handleDelete(template.id, template.name)}
                >
                  <Trash2 className="ml-1.5 h-3.5 w-3.5" />
                  حذف القالب
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
