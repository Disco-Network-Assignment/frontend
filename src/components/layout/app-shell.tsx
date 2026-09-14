"use client";

import { useState } from "react";
import { SearchProvider } from "@/components/layout/search-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export { REPOS_URL } from "@/components/layout/sidebar";

/**
 * The dashboard frame: a sidebar on the left (collapsible to an icon rail on desktop, a
 * slide-in drawer on small screens), a top bar, and the scrolling page on an off-white ground.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SearchProvider>
      <div className="flex h-dvh bg-bg">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          drawerOpen={drawerOpen}
          onCloseDrawer={() => setDrawerOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((v) => !v)}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
          <main className="thin-scroll min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 sm:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
