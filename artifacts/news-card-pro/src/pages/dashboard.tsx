import React from "react";
import { Link } from "wouter";
import { useGetStats, getGetStatsQueryKey, useListHistory, getListHistoryQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, LayoutTemplate, Zap, ArrowRight, Download } from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useGetStats({
    query: { enabled: !!token, queryKey: getGetStatsQueryKey() }
  });

  const { data: historyRes, isLoading: historyLoading } = useListHistory(
    { limit: 3 },
    { query: { enabled: !!token, queryKey: getListHistoryQueryKey({ limit: 3 }) } }
  );

  const StatSkeleton = () => (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px]" />
        <Skeleton className="h-3 w-[120px] mt-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your generation activity and usage.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Images Today</CardTitle>
                <Zap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.imagesToday || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  of {stats?.dailyLimit} daily limit
                </div>
                <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.min(100, ((stats?.imagesToday || 0) / (stats?.dailyLimit || 1)) * 100)}%` }} 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Generated</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalImages || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Lifetime images</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
                <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalTemplates || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Saved configurations</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold capitalize">{stats?.plan || 'Free'}</div>
                <div className="text-xs text-muted-foreground mt-1">Active subscription</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 lg:col-span-5 bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Generations</CardTitle>
              <CardDescription>Your latest created images</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : historyRes?.images?.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No images generated yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start creating your first news card.</p>
                <Link href="/generate">
                  <Button>Generate Now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {historyRes?.images?.map((image) => (
                  <div key={image.id} className="flex items-center justify-between p-3 bg-background/40 rounded-lg border border-border/40 hover:bg-background/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={image.imageUrl} alt={image.title} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{image.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(image.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={image.imageUrl} download target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/generate" className="block">
              <Button className="w-full justify-start gap-2" variant="secondary">
                <PenTool className="h-4 w-4" />
                New Card
              </Button>
            </Link>
            <Link href="/templates" className="block">
              <Button className="w-full justify-start gap-2" variant="outline">
                <LayoutTemplate className="h-4 w-4" />
                Manage Templates
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Settings className="h-4 w-4" />
                API Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}