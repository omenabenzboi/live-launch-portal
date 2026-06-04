import type { ReactNode } from "react";
import { TopHeader } from "./TopHeader";
import { BottomTabs } from "./BottomTabs";

/**
 * Mobile-first shell:
 *  - fixed top header (sticky)
 *  - scrollable content region
 *  - fixed bottom tabs (with safe-area inset)
 *  - prevents horizontal overflow
 */
export function AppShell({
  children,
  hideTabs = false,
  noPadding = false,
}: {
  children: ReactNode;
  hideTabs?: boolean;
  noPadding?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden overflow-y-hidden bg-background">
      <TopHeader />
      <main
        className={`flex-1 mx-auto w-full max-w-2xl overflow-x-hidden ${noPadding ? "" : "px-4 py-4"}`}
        style={{
          paddingBottom: hideTabs ? undefined : "calc(76px + env(safe-area-inset-bottom))",
          paddingLeft: noPadding ? "env(safe-area-inset-left)" : undefined,
          paddingRight: noPadding ? "env(safe-area-inset-right)" : undefined,
        }}
      >
        {children}
      </main>
      {!hideTabs && <BottomTabs />}
    </div>
  );
}
