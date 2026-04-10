import { useGetStats, getGetStatsQueryKey, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Image as ImageIcon, Layers, Target, Clock, KeySquare } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats({
    query: {
      queryKey: getGetStatsQueryKey(),
      enabled: !!localStorage.getItem("pro_token"),
    }
  });

  const { data: user, isLoading: userLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!localStorage.getItem("pro_token"),
    }
  });

  if (statsLoading || userLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const usagePercent = stats ? Math.min(100, Math.round((stats.imagesToday / stats.dailyLimit) * 100)) : 0;
  const isNearLimit = usagePercent > 80;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مرحباً، {user?.name}</h1>
          <p className="text-muted-foreground mt-1">إليك نظرة عامة على استخدامك اليوم</p>
        </div>
        <Button asChild>
          <Link href="/generate">
            <ImageIcon className="ml-2 h-4 w-4" />
            إنشاء بطاقة جديدة
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">بطاقات اليوم</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.imagesToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">من أصل {stats?.dailyLimit || 0} مسموح بها</p>
            <Progress value={usagePercent} className={`mt-3 h-2 ${isNearLimit ? "bg-destructive/20 [&>div]:bg-destructive" : ""}`} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي البطاقات</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalImages || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">منذ إنشاء الحساب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">القوالب الخاصة</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTemplates || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">قالب مخصص</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">نوع الباقة</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stats?.plan === 'pro' ? 'برو' : 'مجانية'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.plan === 'pro' ? 'صلاحيات كاملة' : 'حد يومي للاستخدام'}
            </p>
          </CardContent>
        </Card>

        {(user?.planDetails?.telegramBot || user?.isAdmin) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">رمز البوت السري</CardTitle>
              <KeySquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold tracking-wider text-primary">
                {user?.botCode || "لم يحدد"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">يُرجى إرساله للبوت: `رقم حساب : {user?.botCode}`</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>البدء السريع</CardTitle>
            <CardDescription>روابط سريعة للوظائف الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/generate">
                <ImageIcon className="ml-2 h-4 w-4" />
                إنشاء بطاقة إخبارية
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/templates">
                <Layers className="ml-2 h-4 w-4" />
                إدارة القوالب
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/history">
                <Clock className="ml-2 h-4 w-4" />
                سجل البطاقات السابقة
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
