import { Link, useLocation } from "wouter";
import { LayoutDashboard, Image as ImageIcon, History, Layers, KeySquare, LogOut } from "lucide-react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { name: "إنشاء بطاقة", href: "/generate", icon: ImageIcon },
  { name: "سجل البطاقات", href: "/history", icon: History },
  { name: "القوالب", href: "/templates", icon: Layers },
  { name: "مفاتيح API", href: "/keys", icon: KeySquare },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { enabled: !!localStorage.getItem("pro_token"), queryKey: getGetMeQueryKey() } });

  const handleLogout = () => {
    localStorage.removeItem("pro_token");
    setLocation("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground" dir="rtl">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            <ImageIcon size={20} />
          </div>
          NewsCard Pro
        </div>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "ml-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "المستخدم"}</span>
            <span className="text-xs text-sidebar-foreground/60">{user?.plan === "pro" ? "باقة Pro" : "باقة مجانية"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
