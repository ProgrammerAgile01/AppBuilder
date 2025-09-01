"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, appSidebarMenuItems } from "@/components/app-sidebar";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { MobileMenuDrawer } from "@/components/navigation/mobile-menu-drawer";

export function RootClientShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <SidebarProvider defaultOpen>
      {/* Sidebar harus jadi saudara langsung dari SidebarInset */}
      <AppSidebar />

      {/* ⬇️ Inilah kuncinya: pakai SidebarInset sebagai SIBLING Sidebar */}
      <SidebarInset>
        {children}
      </SidebarInset>

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
