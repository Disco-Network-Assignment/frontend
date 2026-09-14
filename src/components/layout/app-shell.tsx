"use client";

import { SearchProvider } from "@/components/layout/search-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export { REPOS_URL } from "@/components/layout/sidebar";

/**
 * The dashboard frame: a fixed sidebar on the left, a top bar, and the scrolling page on an
 * off-white ground. One page today; the frame stays put if more are added.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="flex h-dvh bg-bg">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
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
