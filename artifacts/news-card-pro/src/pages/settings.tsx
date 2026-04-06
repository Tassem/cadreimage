import React, { useState } from "react";
import { useGetMe, getGetMeQueryKey, useRegenerateApiKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, RefreshCw, ShieldAlert, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: user, isLoading } = useGetMe({
    query: { enabled: !!token, queryKey: getGetMeQueryKey() }
  });

  const regenApi = useRegenerateApiKey();

  const handleCopy = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    if (!confirm("Are you sure? Any integrations using your current API key will break immediately.")) return;
    
    regenApi.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "API Key Regenerated" });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Failed to regenerate", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and API access.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Account Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={user?.name || ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ""} disabled className="bg-muted/50" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Label>Subscription Plan</Label>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-primary/10 text-primary font-medium text-sm rounded-full capitalize">
                  {user?.plan || "Free"} Plan
                </div>
                <span className="text-sm text-muted-foreground">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 border-destructive/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Key className="w-48 h-48" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" /> API Access
            </CardTitle>
            <CardDescription>Use this key to authenticate requests to the generation API from your own backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="space-y-2">
              <Label>Secret API Key</Label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  value={user?.apiKey || "********************************"} 
                  readOnly 
                  className="font-mono text-muted-foreground bg-muted/50"
                />
                <Button variant="secondary" onClick={handleCopy} className="w-24">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Never share this key in client-side code (browsers/apps). It should only be used server-to-server.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-destructive/5 border-t border-destructive/10 pt-4 flex justify-between items-center z-10 relative">
            <p className="text-xs text-muted-foreground">If your key is compromised, generate a new one immediately.</p>
            <Button variant="destructive" onClick={handleRegenerate} disabled={regenApi.isPending}>
              {regenApi.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Roll Key
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}