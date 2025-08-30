"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, appSidebarMenuItems } from "@/components/app-sidebar";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { MobileMenuDrawer } from "@/components/navigation/mobile-menu-drawer";

export function RootClientShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <SidebarProvider defaultOpen>
      {/* Penting: render AppSidebar TANPA hidden lg:block,
          biar CSS var sidebar bekerja untuk halaman yang sudah punya SidebarInset */}
      <AppSidebar />

      {/* Jangan tambah SidebarInset di sini.
          Biarkan setiap page yg sudah punya SidebarInset mengatur offset-nya. */}
      <main className="min-h-dvh flex-1 pb-[calc(env(safe-area-inset-bottom)+88px)] lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom bar + drawer */}
      <MobileTabBar onOpenMenu={() => setOpen(true)} />
      <MobileMenuDrawer
        items={
          Array.isArray(appSidebarMenuItems)
            ? appSidebarMenuItems
            : (appSidebarMenuItems as any)?.items ?? []
        }
        open={open}
        setOpen={setOpen}
      />
    </SidebarProvider>
  );
}
