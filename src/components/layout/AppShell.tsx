import type { ReactNode } from "react";
import { TopHeader } from "./TopHeader";
import { BottomTabs } from "./BottomTabs";

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
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main
        className={`flex-1 mx-auto w-full max-w-2xl ${noPadding ? "" : "px-4 py-4"} pb-24`}
      >
        {children}
      </main>
      {!hideTabs && <BottomTabs />}
    </div>
  );
}
