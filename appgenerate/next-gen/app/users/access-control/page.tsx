"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Save,
  RotateCcw,
  Shield,
  Eye,
  Plus,
  Edit,
  Trash2,
  FileText,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Home,
  Car,
  BarChart3,
  Users,
  Settings,
  Package,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Sample user levels
const userLevels = [
  { id: 1, name: "Super Admin", description: "Full access to all features" },
  { id: 2, name: "Admin", description: "Access to most features" },
  { id: 3, name: "Kasir", description: "Limited access for transactions" },
  { id: 4, name: "Operasional", description: "Access for operations management" },
  { id: 5, name: "Viewer", description: "Read-only access" },
]

// Permission types
const permissionTypes = [
  { key: "view", label: "Lihat", icon: Eye, color: "text-blue-600" },
  { key: "add", label: "Tambah", icon: Plus, color: "text-green-600" },
  { key: "edit", label: "Edit", icon: Edit, color: "text-yellow-600" },
  { key: "delete", label: "Hapus", icon: Trash2, color: "text-red-600" },
  { key: "approve", label: "Approve", icon: CheckSquare, color: "text-purple-600" },
]

// Menu structure with hierarchical data
const menuStructure = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: Home,
    children: [
      { id: "dashboard-overview", name: "Overview Dashboard" },
      { id: "dashboard-analytics", name: "Analytics Dashboard" },
      { id: "dashboard-reports", name: "Reports Dashboard" },
    ],
  },
  {
    id: "transactions",
    name: "Transaksi",
    icon: FileText,
    children: [
      { id: "booking-rental", name: "Booking Rental" },
      { id: "rental-schedule", name: "Jadwal Rental" },
      { id: "digital-contract", name: "Kontrak Digital" },
      { id: "vehicle-handover", name: "Serah Terima Kendaraan" },
      { id: "vehicle-return", name: "Pengembalian Kendaraan" },
      { id: "invoice-payment", name: "Invoice Pembayaran" },
    ],
  },
  {
    id: "operations",
    name: "Operasional",
    icon: Car,
    children: [
      { id: "vehicle-management", name: "Manajemen Kendaraan" },
      { id: "maintenance-schedule", name: "Jadwal Maintenance" },
      { id: "maintenance-history", name: "Riwayat Maintenance" },
      { id: "driver-crew", name: "Driver Crew" },
      { id: "driver-allowance", name: "Uang Jalan Driver" },
      { id: "fuel-monitoring", name: "Monitoring BBM" },
    ],
  },
  {
    id: "reports",
    name: "Laporan",
    icon: BarChart3,
    children: [
      { id: "transaction-reports", name: "Laporan Transaksi" },
      { id: "vehicle-usage-reports", name: "Laporan Penggunaan Kendaraan" },
      { id: "financial-reports", name: "Laporan Keuangan" },
      { id: "profit-loss-reports", name: "Laba Rugi Per Unit" },
      { id: "fleet-kpi-stats", name: "Statistik KPI Armada" },
    ],
  },
  {
    id: "master-data",
    name: "Master Data",
    icon: Package,
    children: [
      { id: "vehicle-types", name: "Tipe Kendaraan" },
      { id: "fuel-types", name: "Jenis BBM" },
      { id: "transmission-types", name: "Jenis Transmisi" },
      { id: "vehicle-colors", name: "Warna Kendaraan" },
      { id: "customer-data", name: "Data Pelanggan" },
      { id: "license-types", name: "Jenis SIM" },
      { id: "driver-levels", name: "Level Driver" },
    ],
  },
  {
    id: "users",
    name: "Pengguna",
    icon: Users,
    children: [
      { id: "user-levels", name: "Level User" },
      { id: "access-control", name: "Kontrol Akses" },
      { id: "user-data", name: "Data User" },
    ],
  },
  {
    id: "settings",
    name: "Pengaturan",
    icon: Settings,
    children: [
      { id: "rental-pricing", name: "Harga Rental" },
      { id: "access-rights", name: "Hak Akses" },
      { id: "whatsapp-sender", name: "WhatsApp Sender" },
      { id: "notifications", name: "Pengingat Notifikasi" },
      { id: "contract-templates", name: "Template Kontrak" },
    ],
  },
]

export default function AccessControlPage() {
  const { language } = useLanguage()
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({})
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["dashboard", "transactions"])

  // Initialize permissions for demo
  useState(() => {
    const initialPermissions: Record<string, Record<string, boolean>> = {}
    menuStructure.forEach((menu) => {
      // Parent menu permissions
      initialPermissions[menu.id] = {
        view: true,
        add: selectedLevel <= 2,
        edit: selectedLevel <= 2,
        delete: selectedLevel === 1,
        approve: selectedLevel <= 2,
      }

      // Child menu permissions
      menu.children?.forEach((child) => {
        initialPermissions[child.id] = {
          view: true,
          add: selectedLevel <= 3,
          edit: selectedLevel <= 3,
          delete: selectedLevel <= 2,
          approve: selectedLevel <= 2,
        }
      })
    })
    setPermissions(initialPermissions)
  })

  const togglePermission = (menuId: string, permissionType: string) => {
    setPermissions((prev) => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [permissionType]: !prev[menuId]?.[permissionType],
      },
    }))
  }

  const toggleAllPermissions = (permissionType: string, checked: boolean) => {
    const newPermissions = { ...permissions }
    menuStructure.forEach((menu) => {
      newPermissions[menu.id] = {
        ...newPermissions[menu.id],
        [permissionType]: checked,
      }
      menu.children?.forEach((child) => {
        newPermissions[child.id] = {
          ...newPermissions[child.id],
          [permissionType]: checked,
        }
      })
    })
    setPermissions(newPermissions)
  }

  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
  }

  const handleSave = () => {
    console.log("Saving permissions for level:", selectedLevel, permissions)
    toast({
      title: "Berhasil",
      description: "Pengaturan akses berhasil disimpan",
    })
  }

  const handleReset = () => {
    // Reset to default permissions based on level
    const resetPermissions: Record<string, Record<string, boolean>> = {}
    menuStructure.forEach((menu) => {
      resetPermissions[menu.id] = {
        view: true,
        add: selectedLevel <= 2,
        edit: selectedLevel <= 2,
        delete: selectedLevel === 1,
        approve: selectedLevel <= 2,
      }
      menu.children?.forEach((child) => {
        resetPermissions[child.id] = {
          view: true,
          add: selectedLevel <= 3,
          edit: selectedLevel <= 3,
          delete: selectedLevel <= 2,
          approve: selectedLevel <= 2,
        }
      })
    })
    setPermissions(resetPermissions)
    toast({
      title: "Reset Berhasil",
      description: "Pengaturan akses telah direset ke default",
    })
  }

  const selectedLevelData = userLevels.find((level) => level.id === selectedLevel)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-border/50 bg-background">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-foreground hover:text-primary">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="text-foreground">Users</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">Kontrol Akses</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Matrix Kontrol Akses</h1>
              <p className="text-muted-foreground">Kelola hak akses menu untuk setiap level pengguna</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </div>

          {/* Level Selection */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pilih Level Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedLevel.toString()}
                  onValueChange={(value) => setSelectedLevel(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-64 text-foreground bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {userLevels.map((level) => (
                      <SelectItem
                        key={level.id}
                        value={level.id.toString()}
                        className="text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLevelData && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-foreground border-border">
                      {selectedLevelData.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{selectedLevelData.description}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Matrix Hak Akses</CardTitle>
              <p className="text-sm text-muted-foreground">
                Centang kotak untuk memberikan akses pada menu dan aksi tertentu
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-7 gap-2 p-3 bg-muted/30 rounded-t-lg border border-border">
                    <div className="font-semibold text-foreground">Menu</div>
                    {permissionTypes.map((permission) => (
                      <div key={permission.key} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <permission.icon className={`h-4 w-4 ${permission.color}`} />
                          <span className="text-xs font-medium text-foreground">{permission.label}</span>
                          <Checkbox
                            checked={Object.values(permissions).every((menuPerms) => menuPerms?.[permission.key])}
                            onCheckedChange={(checked) => toggleAllPermissions(permission.key, !!checked)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Menu Rows */}
                  <div className="border-x border-b border-border rounded-b-lg">
                    {menuStructure.map((menu, index) => (
                      <div key={menu.id}>
                        {/* Parent Menu Row */}
                        <div
                          className={`grid grid-cols-7 gap-2 p-3 ${index % 2 === 0 ? "bg-background" : "bg-muted/10"} border-b border-border/50`}
                        >
                          <div className="flex items-center gap-2">
                            <Collapsible
                              open={expandedMenus.includes(menu.id)}
                              onOpenChange={() => toggleMenuExpansion(menu.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto text-foreground hover:bg-transparent"
                                >
                                  {expandedMenus.includes(menu.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                            <menu.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{menu.name}</span>
                          </div>
                          {permissionTypes.map((permission) => (
                            <div key={permission.key} className="flex justify-center">
                              <Checkbox
                                checked={permissions[menu.id]?.[permission.key] || false}
                                onCheckedChange={() => togglePermission(menu.id, permission.key)}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Child Menu Rows */}
                        <Collapsible
                          open={expandedMenus.includes(menu.id)}
                          onOpenChange={() => toggleMenuExpansion(menu.id)}
                        >
                          <CollapsibleContent>
                            {menu.children?.map((child) => (
                              <div
                                key={child.id}
                                className={`grid grid-cols-7 gap-2 p-3 pl-12 ${index % 2 === 0 ? "bg-muted/5" : "bg-muted/15"} border-b border-border/30`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                                  </div>
                                  <span className="text-sm text-foreground">{child.name}</span>
                                </div>
                                {permissionTypes.map((permission) => (
                                  <div key={permission.key} className="flex justify-center">
                                    <Checkbox
                                      checked={permissions[child.id]?.[permission.key] || false}
                                      onCheckedChange={() => togglePermission(child.id, permission.key)}
                                    />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ringkasan Akses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {permissionTypes.map((permission) => {
                  const totalMenus =
                    menuStructure.length + menuStructure.reduce((sum, menu) => sum + (menu.children?.length || 0), 0)
                  const allowedMenus = Object.values(permissions).filter(
                    (menuPerms) => menuPerms?.[permission.key],
                  ).length
                  const percentage = Math.round((allowedMenus / totalMenus) * 100)

                  return (
                    <div
                      key={permission.key}
                      className="text-center p-4 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <permission.icon className={`h-6 w-6 mx-auto mb-2 ${permission.color}`} />
                      <div className="text-sm font-medium text-foreground">{permission.label}</div>
                      <div className="text-2xl font-bold text-foreground mt-1">{allowedMenus}</div>
                      <div className="text-xs text-muted-foreground">
                        dari {totalMenus} menu ({percentage}%)
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
