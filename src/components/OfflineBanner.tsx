import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Show only when truly offline, in a top-level window (skip Lovable preview iframes).
export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const inIframe = window.self !== window.top;
    if (inIframe) return;
    setEnabled(true);
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!enabled || online) return null;
  return (
    <div className="fixed left-1/2 bottom-[84px] z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/15 px-3 py-1 text-[11px] text-warning shadow-lg backdrop-blur pointer-events-none">
      <WifiOff className="h-3 w-3" />
      Offline — showing cached data
    </div>
  );
}
