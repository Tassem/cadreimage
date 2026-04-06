import React from "react";
import { useListHistory, getListHistoryQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, History as HistoryIcon, Maximize2 } from "lucide-react";

export default function History() {
  const { token } = useAuth();
  
  const { data, isLoading } = useListHistory(
    { limit: 50 },
    { query: { enabled: !!token, queryKey: getListHistoryQueryKey({ limit: 50 }) } }
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generation History</h1>
        <p className="text-muted-foreground mt-2">Browse and download your previously generated news cards.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i} className="bg-card/50 overflow-hidden"><Skeleton className="h-48 w-full" /><div className="p-4"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></div></Card>
          ))}
        </div>
      ) : data?.images?.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border/50">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
            <HistoryIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No history yet</h3>
          <p className="text-muted-foreground mt-2">Generated images will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.images?.map((img) => (
            <Card key={img.id} className="bg-card/50 border-border/50 overflow-hidden group relative">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center p-2">
                <img 
                  src={img.imageUrl} 
                  alt={img.title} 
                  className="max-w-full max-h-full object-contain shadow-md rounded-sm"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" asChild>
                    <a href={img.imageUrl} target="_blank" rel="noreferrer"><Maximize2 className="h-4 w-4" /></a>
                  </Button>
                  <Button size="icon" variant="default" asChild>
                    <a href={img.imageUrl} download target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="font-medium text-sm line-clamp-2 leading-snug" dir="rtl">{img.title}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">{img.aspectRatio}</span>
                  <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}