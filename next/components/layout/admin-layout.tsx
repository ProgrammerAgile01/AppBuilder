"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Menu,
  Home,
  Database,
  Settings,
  Users,
  BarChart3,
  Code,
  Table,
  Layers,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Navigation,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview dan statistik sistem",
    current: false,
  },
  {
    name: "CRUD Builder",
    href: "/admin/builder",
    icon: Code,
    description: "Buat sistem CRUD kompleks",
    current: false,
    badge: "New",
  },
  {
    name: "Atur Menu",
    href: "/admin/menu-settings",
    icon: Navigation,
    description: "Menu management system",
    badge: "New",
  },
  {
    name: "Modules",
    href: "/admin/modules",
    icon: Layers,
    description: "Kelola modul CRUD",
    current: false,
  },
  {
    name: "Modules Table",
    href: "/admin/modules-table",
    icon: Table,
    description: "Tampilan tabel modul",
    current: false,
  },
  {
    name: "Database",
    href: "/admin/database",
    icon: Database,
    description: "Manajemen database",
    current: false,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Kelola pengguna sistem",
    current: false,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Laporan dan analitik",
    current: false,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Pengaturan sistem",
    current: false,
  },
]

const recentModules = [
  { name: "User Management", status: "published", href: "/admin/modules/1" },
  { name: "Product Catalog", status: "draft", href: "/admin/modules/2" },
  { name: "Order System", status: "published", href: "/admin/modules/3" },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: pathname === item.href || pathname.startsWith(item.href + "/"),
  }))

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-slate-200 transition-all duration-300 ${
          collapsed ? "px-4 justify-center" : "px-6"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Code className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CRUD Builder
              </h1>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {updatedNavigation.map((item) => {
            const Icon = item.icon
            return (
              <TooltipProvider key={item.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                        item.current
                          ? "bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 text-blue-700 shadow-sm border border-blue-200/50"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      } ${collapsed ? "justify-center" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          item.current
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {!collapsed && (
                        <div className="flex-1 min-w-0 transition-opacity duration-300">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{item.description}</p>
                        </div>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="ml-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </nav>

        {/* Recent Modules - Hidden when collapsed */}
        {!collapsed && (
          <div className="mt-8 transition-opacity duration-300">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Modules</h3>
            <div className="space-y-1">
              {recentModules.map((module) => (
                <Link
                  key={module.name}
                  href={module.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="flex-1 truncate">{module.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      module.status === "published"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {module.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-slate-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full h-auto p-3 transition-all duration-300 ${
                collapsed ? "justify-center" : "justify-start gap-3"
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                  AD
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left transition-opacity duration-300">
                    <p className="text-sm font-medium text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-500">admin@example.com</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <div
          className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 shadow-sm transition-all duration-300 z-30 ${
            sidebarCollapsed ? "lg:w-20" : "lg:w-80"
          }`}
        >
          <SidebarContent collapsed={sidebarCollapsed} />

          {/* Collapse Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 z-40"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0 bg-white">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-80"}`}
        >
          {/* Mobile Header */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="-m-2.5 p-2.5">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex-1 text-sm font-semibold leading-6 text-slate-900">CRUD Builder Admin</div>
          </div>

          {/* Desktop Header with Collapse Button */}
          <div className="hidden lg:flex sticky top-0 z-20 h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-6 shadow-sm">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div className="flex-1 text-sm font-semibold leading-6 text-slate-900">
              {sidebarCollapsed ? "CRUD Builder" : "CRUD Builder Admin"}
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
