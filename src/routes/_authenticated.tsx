import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // Realtime notifications: surface as toasts. Subscribe once per session.
  useEffect(() => {
    const channel = supabase
      .channel("notifications-toast")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as {
            title?: string;
            body?: string | null;
            severity?: string;
            link?: string | null;
          };
          const fn =
            n.severity === "error"
              ? toast.error
              : n.severity === "warning"
                ? toast.warning
                : n.severity === "success"
                  ? toast.success
                  : toast;
          fn(n.title ?? "Notification", { description: n.body ?? undefined });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <Outlet />;
}
