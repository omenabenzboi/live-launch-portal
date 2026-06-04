import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div className="fixed left-1/2 top-2 z-50 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/15 px-3 py-1 text-[11px] text-warning shadow-lg backdrop-blur">
      <WifiOff className="h-3 w-3" />
      Offline — showing cached data
    </div>
  );
}
