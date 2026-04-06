import { useState } from "react";
import { useListTemplates, getListTemplatesQueryKey, useDeleteTemplate } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Trash2, Layers, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Templates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: templates, isLoading } = useListTemplates({
    query: {
      queryKey: getListTemplatesQueryKey(),
      enabled: !!localStorage.getItem("pro_token"),
    }
  });

  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplate();

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف القالب "${name}"؟`)) {
      deleteTemplate({ id }, {
        onSuccess: () => {
          toast({
            title: "تم الحذف",
            description: "تم حذف القالب بنجاح",
          });
          queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
        },
        onError: () => {
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء حذف القالب",
            variant: "destructive",
          });
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
          <h1 className="text-3xl font-bold tracking-tight">القوالب</h1>
          <p className="text-muted-foreground mt-1">إدارة قوالب التصميم المحفوظة الخاصة بك</p>
        </div>
        <Button variant="default" disabled title="سيتم تفعيل الميزة قريباً">
          <Plus className="ml-2 h-4 w-4" />
          قالب جديد
        </Button>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg bg-muted/10 border-dashed">
          <Layers className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">لا توجد قوالب</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            لم تقم بإنشاء أي قوالب بعد. يمكنك إنشاء قوالب لتسريع عملية الإنتاج.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-muted/50 mb-3">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline" dir="ltr">{template.aspectRatio}</Badge>
                  <span className="text-xs">
                    {format(new Date(template.createdAt), "dd MMM yyyy", { locale: ar })}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">لون الشريط:</span>
                  <div className="flex items-center gap-2">
                    <span dir="ltr" className="font-mono text-xs">{template.bannerColor}</span>
                    <div 
                      className="w-4 h-4 rounded-full border shadow-sm" 
                      style={{ backgroundColor: template.bannerColor }} 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">لون النص:</span>
                  <div className="flex items-center gap-2">
                    <span dir="ltr" className="font-mono text-xs">{template.textColor}</span>
                    <div 
                      className="w-4 h-4 rounded-full border shadow-sm" 
                      style={{ backgroundColor: template.textColor }} 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الخط:</span>
                  <span>{template.font}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/5">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full text-xs"
                  disabled={isDeleting}
                  onClick={() => handleDelete(template.id, template.name)}
                >
                  <Trash2 className="ml-2 h-4 w-4" />
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
