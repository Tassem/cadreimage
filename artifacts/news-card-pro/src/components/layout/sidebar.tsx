import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenTool, LayoutTemplate, History, Settings, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/generate", label: "Generate", icon: PenTool },
    { href: "/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/history", label: "History", icon: History },
  ];

  const bottomItems = [
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">NewsCard Pro</h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Media Generation</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}>
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}>
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent">
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Log out</span>
        </button>
        
        {user && (
          <div className="mt-4 px-3 py-2 bg-sidebar-accent/50 rounded-md border border-sidebar-border/50">
            <div className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/60 truncate">{user.email}</div>
            <div className="mt-2 text-xs font-mono text-sidebar-primary bg-sidebar-accent px-2 py-1 rounded inline-block">{user.plan}</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-sidebar">
        <h1 className="font-bold text-lg">NewsCard Pro</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-sidebar-border bg-sidebar">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block w-64 flex-shrink-0">
        <SidebarContent />
      </div>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
