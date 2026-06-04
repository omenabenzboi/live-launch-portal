import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, MessageSquare, Terminal, FolderTree, Settings } from "lucide-react";

const tabs = [
  { to: "/tasks", label: "Tasks", icon: LayoutGrid, match: ["/tasks", "/dashboard"] },
  { to: "/chat", label: "Chat", icon: MessageSquare, match: ["/chat"] },
  { to: "/terminal", label: "Terminal", icon: Terminal, match: ["/terminal"] },
  { to: "/files", label: "Files", icon: FolderTree, match: ["/files"] },
  { to: "/settings", label: "Settings", icon: Settings, match: ["/settings"] },
] as const;

export function BottomTabs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {tabs.map((t) => {
          const active = t.match.some((m) => path === m || path.startsWith(m + "/"));
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{t.label}</span>
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
