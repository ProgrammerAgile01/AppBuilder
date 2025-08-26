"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Trash2,
  PackageIcon,
  Users,
  Settings,
  Zap,
  MessageSquare,
  BarChart3,
  FileText,
  Crown,
  Star,
  Sparkles,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

// Package interfaces
export interface PackageFeature {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  type: "limit" | "boolean" | "access"
  category: "user_management" | "menu_access" | "integrations" | "analytics" | "storage" | "support"
  icon: string
  limitValue?: number
  isEnabled: boolean
  isUnlimited?: boolean
}

export interface MenuAccess {
  id: string
  menuId: string
  menuName: string
  isAllowed: boolean
  permissions: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
  }
}

export interface PackageType {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: number
  currency: string
  billingPeriod: "monthly" | "yearly" | "lifetime"
  isPopular: boolean
  isActive: boolean
  features: PackageFeature[]
  menuAccess: MenuAccess[]
  maxUsers: number
  maxStorage: number // in GB
  priority: number
  color: string
  icon: string
}

interface PackageBuilderSectionProps {
  packages: PackageType[]
  setPackages: (packages: PackageType[]) => void
  availableMenus: Array<{ id: string; name: string; category: string }>
}

const FEATURE_CATEGORIES = [
  { id: "user_management", name: "Manajemen User", nameEn: "User Management", icon: Users },
  { id: "menu_access", name: "Akses Menu", nameEn: "Menu Access", icon: Settings },
  { id: "integrations", name: "Integrasi", nameEn: "Integrations", icon: Zap },
  { id: "analytics", name: "Analitik", nameEn: "Analytics", icon: BarChart3 },
  { id: "storage", name: "Penyimpanan", nameEn: "Storage", icon: FileText },
  { id: "support", name: "Dukungan", nameEn: "Support", icon: MessageSquare },
]

const DEFAULT_FEATURES: Omit<PackageFeature, "id">[] = [
  {
    name: "Maksimal User",
    nameEn: "Maximum Users",
    description: "Jumlah maksimal user yang dapat menggunakan sistem",
    descriptionEn: "Maximum number of users that can use the system",
    type: "limit",
    category: "user_management",
    icon: "Users",
    limitValue: 2,
    isEnabled: true,
  },
  {
    name: "Reminder WhatsApp",
    nameEn: "WhatsApp Reminder",
    description: "Fitur pengingat otomatis melalui WhatsApp",
    descriptionEn: "Automatic reminder feature via WhatsApp",
    type: "boolean",
    category: "integrations",
    icon: "MessageSquare",
    isEnabled: false,
  },
  {
    name: "Laporan Laba Rugi",
    nameEn: "Profit Loss Report",
    description: "Akses ke laporan keuangan laba rugi",
    descriptionEn: "Access to profit and loss financial reports",
    type: "access",
    category: "analytics",
    icon: "BarChart3",
    isEnabled: false,
  },
  {
    name: "Export Data",
    nameEn: "Data Export",
    description: "Kemampuan untuk mengekspor data ke berbagai format",
    descriptionEn: "Ability to export data to various formats",
    type: "boolean",
    category: "analytics",
    icon: "FileText",
    isEnabled: true,
  },
  {
    name: "Penyimpanan Cloud",
    nameEn: "Cloud Storage",
    description: "Kapasitas penyimpanan file di cloud",
    descriptionEn: "Cloud file storage capacity",
    type: "limit",
    category: "storage",
    icon: "FileText",
    limitValue: 1,
    isEnabled: true,
  },
  {
    name: "Dukungan Prioritas",
    nameEn: "Priority Support",
    description: "Dukungan teknis dengan prioritas tinggi",
    descriptionEn: "High priority technical support",
    type: "boolean",
    category: "support",
    icon: "Shield",
    isEnabled: false,
  },
]

const PACKAGE_COLORS = [
  { name: "Blue", value: "blue", class: "from-blue-500 to-blue-600" },
  { name: "Green", value: "green", class: "from-green-500 to-green-600" },
  { name: "Purple", value: "purple", class: "from-purple-500 to-purple-600" },
  { name: "Orange", value: "orange", class: "from-orange-500 to-orange-600" },
  { name: "Red", value: "red", class: "from-red-500 to-red-600" },
  { name: "Indigo", value: "indigo", class: "from-indigo-500 to-indigo-600" },
]

export function PackageBuilderSection({ packages, setPackages, availableMenus }: PackageBuilderSectionProps) {
  const [activePackage, setActivePackage] = useState<string>("")
  const [activeTab, setActiveTab] = useState("packages")

  // Add new package
  const addPackage = () => {
    const newPackage: PackageType = {
      id: uuidv4(),
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      price: 0,
      currency: "IDR",
      billingPeriod: "monthly",
      isPopular: false,
      isActive: true,
      features: DEFAULT_FEATURES.map((feature) => ({
        ...feature,
        id: uuidv4(),
      })),
      menuAccess: availableMenus.map((menu) => ({
        id: uuidv4(),
        menuId: menu.id,
        menuName: menu.name,
        isAllowed: true,
        permissions: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true,
        },
      })),
      maxUsers: 2,
      maxStorage: 1,
      priority: packages.length + 1,
      color: "blue",
      icon: "Package",
    }

    setPackages([...packages, newPackage])
    setActivePackage(newPackage.id)

    toast({
      title: "Paket Baru Ditambahkan",
      description: "Paket baru berhasil dibuat. Silakan lengkapi informasinya.",
    })
  }

  // Update package
  const updatePackage = (packageId: string, updates: Partial<PackageType>) => {
    setPackages(packages.map((pkg) => (pkg.id === packageId ? { ...pkg, ...updates } : pkg)))
  }

  // Delete package
  const deletePackage = (packageId: string) => {
    setPackages(packages.filter((pkg) => pkg.id !== packageId))
    if (activePackage === packageId) {
      setActivePackage("")
    }

    toast({
      title: "Paket Dihapus",
      description: "Paket berhasil dihapus dari sistem.",
    })
  }

  // Add feature to package
  const addFeature = (packageId: string) => {
    const newFeature: PackageFeature = {
      id: uuidv4(),
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      type: "boolean",
      category: "user_management",
      icon: "Settings",
      isEnabled: true,
    }

    updatePackage(packageId, {
      features: [...(packages.find((p) => p.id === packageId)?.features || []), newFeature],
    })
  }

  // Update feature
  const updateFeature = (packageId: string, featureId: string, updates: Partial<PackageFeature>) => {
    const pkg = packages.find((p) => p.id === packageId)
    if (!pkg) return

    const updatedFeatures = pkg.features.map((feature) =>
      feature.id === featureId ? { ...feature, ...updates } : feature,
    )

    updatePackage(packageId, { features: updatedFeatures })
  }

  // Delete feature
  const deleteFeature = (packageId: string, featureId: string) => {
    const pkg = packages.find((p) => p.id === packageId)
    if (!pkg) return

    updatePackage(packageId, {
      features: pkg.features.filter((f) => f.id !== featureId),
    })
  }

  // Update menu access
  const updateMenuAccess = (packageId: string, menuId: string, updates: Partial<MenuAccess>) => {
    const pkg = packages.find((p) => p.id === packageId)
    if (!pkg) return

    const updatedMenuAccess = pkg.menuAccess.map((menu) => (menu.menuId === menuId ? { ...menu, ...updates } : menu))

    updatePackage(packageId, { menuAccess: updatedMenuAccess })
  }

  // Generate preset packages
  const generatePresetPackages = () => {
    const presets: Omit<PackageType, "id">[] = [
      {
        name: "Paket Standar",
        nameEn: "Standard Package",
        description: "Paket dasar untuk usaha kecil dengan fitur essential",
        descriptionEn: "Basic package for small businesses with essential features",
        price: 99000,
        currency: "IDR",
        billingPeriod: "monthly",
        isPopular: false,
        isActive: true,
        features: DEFAULT_FEATURES.map((feature) => ({
          ...feature,
          id: uuidv4(),
          isEnabled:
            feature.name === "Maksimal User" || feature.name === "Export Data" || feature.name === "Penyimpanan Cloud",
          limitValue:
            feature.name === "Maksimal User" ? 2 : feature.name === "Penyimpanan Cloud" ? 1 : feature.limitValue,
        })),
        menuAccess: availableMenus.map((menu) => ({
          id: uuidv4(),
          menuId: menu.id,
          menuName: menu.name,
          isAllowed: menu.name !== "Laporan Laba Rugi",
          permissions: {
            view: true,
            create: menu.name !== "Laporan Laba Rugi",
            edit: menu.name !== "Laporan Laba Rugi",
            delete: false,
            export: menu.name !== "Laporan Laba Rugi",
          },
        })),
        maxUsers: 2,
        maxStorage: 1,
        priority: 1,
        color: "blue",
        icon: "Package",
      },
      {
        name: "Paket Intermediate",
        nameEn: "Intermediate Package",
        description: "Paket menengah untuk bisnis yang berkembang",
        descriptionEn: "Intermediate package for growing businesses",
        price: 199000,
        currency: "IDR",
        billingPeriod: "monthly",
        isPopular: true,
        isActive: true,
        features: DEFAULT_FEATURES.map((feature) => ({
          ...feature,
          id: uuidv4(),
          isEnabled: feature.name !== "Reminder WhatsApp" && feature.name !== "Dukungan Prioritas",
          limitValue:
            feature.name === "Maksimal User" ? 5 : feature.name === "Penyimpanan Cloud" ? 5 : feature.limitValue,
        })),
        menuAccess: availableMenus.map((menu) => ({
          id: uuidv4(),
          menuId: menu.id,
          menuName: menu.name,
          isAllowed: true,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: menu.name !== "User Management",
            export: true,
          },
        })),
        maxUsers: 5,
        maxStorage: 5,
        priority: 2,
        color: "green",
        icon: "Star",
      },
      {
        name: "Paket Ultimate",
        nameEn: "Ultimate Package",
        description: "Paket lengkap dengan semua fitur premium",
        descriptionEn: "Complete package with all premium features",
        price: 399000,
        currency: "IDR",
        billingPeriod: "monthly",
        isPopular: false,
        isActive: true,
        features: DEFAULT_FEATURES.map((feature) => ({
          ...feature,
          id: uuidv4(),
          isEnabled: true,
          limitValue:
            feature.name === "Maksimal User" ? 0 : feature.name === "Penyimpanan Cloud" ? 50 : feature.limitValue,
          isUnlimited: feature.name === "Maksimal User",
        })),
        menuAccess: availableMenus.map((menu) => ({
          id: uuidv4(),
          menuId: menu.id,
          menuName: menu.name,
          isAllowed: true,
          permissions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            export: true,
          },
        })),
        maxUsers: 0, // unlimited
        maxStorage: 50,
        priority: 3,
        color: "purple",
        icon: "Crown",
      },
    ]

    const newPackages = presets.map((preset) => ({
      ...preset,
      id: uuidv4(),
    }))

    setPackages([...packages, ...newPackages])

    toast({
      title: "Paket Preset Dibuat",
      description: "3 paket preset (Standar, Intermediate, Ultimate) berhasil ditambahkan.",
    })
  }

  const selectedPackage = packages.find((p) => p.id === activePackage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Package Builder</h2>
          <p className="text-slate-600">Kelola paket berlangganan dan fitur untuk sistem RentVix Pro</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={generatePresetPackages}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Preset
          </Button>
          <Button
            onClick={addPackage}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Paket
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Daftar Paket</TabsTrigger>
          <TabsTrigger value="preview">Preview Paket</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Package List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="w-5 h-5" />
                    Daftar Paket ({packages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            activePackage === pkg.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => setActivePackage(pkg.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900">{pkg.name || "Paket Baru"}</h3>
                                {pkg.isPopular && (
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">Popular</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{pkg.description || "Belum ada deskripsi"}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg font-bold text-slate-900">
                                  Rp {pkg.price.toLocaleString()}
                                </span>
                                <span className="text-sm text-slate-500">/{pkg.billingPeriod}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePackage(pkg.id)
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {packages.length === 0 && (
                        <div className="text-center py-8">
                          <PackageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-600">Belum ada paket</p>
                          <p className="text-sm text-slate-500">Klik "Tambah Paket" untuk memulai</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Package Configuration */}
            <div className="lg:col-span-2">
              {selectedPackage ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Konfigurasi Paket: {selectedPackage.name || "Paket Baru"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                        <TabsTrigger value="features">Fitur & Batasan</TabsTrigger>
                        <TabsTrigger value="menu">Akses Menu</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nama Paket (ID)</Label>
                            <Input
                              id="name"
                              value={selectedPackage.name}
                              onChange={(e) => updatePackage(selectedPackage.id, { name: e.target.value })}
                              placeholder="Contoh: Paket Standar"
                            />
                          </div>
                          <div>
                            <Label htmlFor="nameEn">Nama Paket (EN)</Label>
                            <Input
                              id="nameEn"
                              value={selectedPackage.nameEn}
                              onChange={(e) => updatePackage(selectedPackage.id, { nameEn: e.target.value })}
                              placeholder="Example: Standard Package"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Deskripsi (ID)</Label>
                          <Textarea
                            id="description"
                            value={selectedPackage.description}
                            onChange={(e) => updatePackage(selectedPackage.id, { description: e.target.value })}
                            placeholder="Deskripsi paket dalam bahasa Indonesia"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="descriptionEn">Deskripsi (EN)</Label>
                          <Textarea
                            id="descriptionEn"
                            value={selectedPackage.descriptionEn}
                            onChange={(e) => updatePackage(selectedPackage.id, { descriptionEn: e.target.value })}
                            placeholder="Package description in English"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Harga</Label>
                            <Input
                              id="price"
                              type="number"
                              value={selectedPackage.price}
                              onChange={(e) => updatePackage(selectedPackage.id, { price: Number(e.target.value) })}
                              placeholder="99000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="currency">Mata Uang</Label>
                            <Select
                              value={selectedPackage.currency}
                              onValueChange={(value) => updatePackage(selectedPackage.id, { currency: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                                <SelectItem value="USD">USD (Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="billing">Periode Tagihan</Label>
                            <Select
                              value={selectedPackage.billingPeriod}
                              onValueChange={(value: "monthly" | "yearly" | "lifetime") =>
                                updatePackage(selectedPackage.id, { billingPeriod: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Bulanan</SelectItem>
                                <SelectItem value="yearly">Tahunan</SelectItem>
                                <SelectItem value="lifetime">Seumur Hidup</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="color">Warna Tema</Label>
                            <Select
                              value={selectedPackage.color}
                              onValueChange={(value) => updatePackage(selectedPackage.id, { color: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PACKAGE_COLORS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded bg-gradient-to-r ${color.class}`} />
                                      {color.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority">Prioritas Urutan</Label>
                            <Input
                              id="priority"
                              type="number"
                              value={selectedPackage.priority}
                              onChange={(e) => updatePackage(selectedPackage.id, { priority: Number(e.target.value) })}
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="popular"
                              checked={selectedPackage.isPopular}
                              onCheckedChange={(checked) => updatePackage(selectedPackage.id, { isPopular: checked })}
                            />
                            <Label htmlFor="popular">Paket Populer</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="active"
                              checked={selectedPackage.isActive}
                              onCheckedChange={(checked) => updatePackage(selectedPackage.id, { isActive: checked })}
                            />
                            <Label htmlFor="active">Paket Aktif</Label>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Fitur & Batasan</h3>
                          <Button variant="outline" size="sm" onClick={() => addFeature(selectedPackage.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Fitur
                          </Button>
                        </div>

                        <ScrollArea className="h-[500px]">
                          <div className="space-y-4">
                            {selectedPackage.features.map((feature) => (
                              <Card key={feature.id} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={feature.isEnabled}
                                        onCheckedChange={(checked) =>
                                          updateFeature(selectedPackage.id, feature.id, { isEnabled: checked })
                                        }
                                      />
                                      <Badge variant="outline">
                                        {FEATURE_CATEGORIES.find((c) => c.id === feature.category)?.name}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteFeature(selectedPackage.id, feature.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label>Nama Fitur (ID)</Label>
                                      <Input
                                        value={feature.name}
                                        onChange={(e) =>
                                          updateFeature(selectedPackage.id, feature.id, { name: e.target.value })
                                        }
                                        placeholder="Nama fitur"
                                      />
                                    </div>
                                    <div>
                                      <Label>Nama Fitur (EN)</Label>
                                      <Input
                                        value={feature.nameEn}
                                        onChange={(e) =>
                                          updateFeature(selectedPackage.id, feature.id, { nameEn: e.target.value })
                                        }
                                        placeholder="Feature name"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label>Tipe Fitur</Label>
                                      <Select
                                        value={feature.type}
                                        onValueChange={(value: "limit" | "boolean" | "access") =>
                                          updateFeature(selectedPackage.id, feature.id, { type: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="limit">Batasan Angka</SelectItem>
                                          <SelectItem value="boolean">Ya/Tidak</SelectItem>
                                          <SelectItem value="access">Akses Menu</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Kategori</Label>
                                      <Select
                                        value={feature.category}
                                        onValueChange={(value) =>
                                          updateFeature(selectedPackage.id, feature.id, { category: value as any })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {FEATURE_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                              {cat.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {feature.type === "limit" && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label>Nilai Batas</Label>
                                        <Input
                                          type="number"
                                          value={feature.limitValue || 0}
                                          onChange={(e) =>
                                            updateFeature(selectedPackage.id, feature.id, {
                                              limitValue: Number(e.target.value),
                                            })
                                          }
                                          placeholder="0"
                                        />
                                      </div>
                                      <div className="flex items-center space-x-2 pt-6">
                                        <Switch
                                          checked={feature.isUnlimited || false}
                                          onCheckedChange={(checked) =>
                                            updateFeature(selectedPackage.id, feature.id, {
                                              isUnlimited: checked,
                                              limitValue: checked ? 0 : feature.limitValue,
                                            })
                                          }
                                        />
                                        <Label>Unlimited</Label>
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <Label>Deskripsi (ID)</Label>
                                    <Textarea
                                      value={feature.description}
                                      onChange={(e) =>
                                        updateFeature(selectedPackage.id, feature.id, { description: e.target.value })
                                      }
                                      placeholder="Deskripsi fitur"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="menu" className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Pengaturan Akses Menu</h3>
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-3">
                              {selectedPackage.menuAccess.map((menu) => (
                                <Card key={menu.id} className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Switch
                                          checked={menu.isAllowed}
                                          onCheckedChange={(checked) =>
                                            updateMenuAccess(selectedPackage.id, menu.menuId, { isAllowed: checked })
                                          }
                                        />
                                        <h4 className="font-medium">{menu.menuName}</h4>
                                      </div>
                                    </div>

                                    {menu.isAllowed && (
                                      <div className="grid grid-cols-5 gap-3 pl-6">
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            checked={menu.permissions.view}
                                            onCheckedChange={(checked) =>
                                              updateMenuAccess(selectedPackage.id, menu.menuId, {
                                                permissions: { ...menu.permissions, view: checked },
                                              })
                                            }
                                          />
                                          <Label className="text-sm">Lihat</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            checked={menu.permissions.create}
                                            onCheckedChange={(checked) =>
                                              updateMenuAccess(selectedPackage.id, menu.menuId, {
                                                permissions: { ...menu.permissions, create: checked },
                                              })
                                            }
                                          />
                                          <Label className="text-sm">Buat</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            checked={menu.permissions.edit}
                                            onCheckedChange={(checked) =>
                                              updateMenuAccess(selectedPackage.id, menu.menuId, {
                                                permissions: { ...menu.permissions, edit: checked },
                                              })
                                            }
                                          />
                                          <Label className="text-sm">Edit</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            checked={menu.permissions.delete}
                                            onCheckedChange={(checked) =>
                                              updateMenuAccess(selectedPackage.id, menu.menuId, {
                                                permissions: { ...menu.permissions, delete: checked },
                                              })
                                            }
                                          />
                                          <Label className="text-sm">Hapus</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Switch
                                            checked={menu.permissions.export}
                                            onCheckedChange={(checked) =>
                                              updateMenuAccess(selectedPackage.id, menu.menuId, {
                                                permissions: { ...menu.permissions, export: checked },
                                              })
                                            }
                                          />
                                          <Label className="text-sm">Export</Label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <PackageIcon className="w-16 h-16 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Pilih Paket untuk Dikonfigurasi</h3>
                    <p className="text-slate-600 text-center">
                      Pilih paket dari daftar di sebelah kiri untuk mulai mengkonfigurasi fitur dan pengaturannya.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Paket Berlangganan</CardTitle>
              <CardDescription>Tampilan paket seperti yang akan dilihat oleh pengguna</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages
                  .filter((pkg) => pkg.isActive)
                  .map((pkg) => {
                    const colorClass =
                      PACKAGE_COLORS.find((c) => c.value === pkg.color)?.class || "from-blue-500 to-blue-600"

                    return (
                      <Card
                        key={pkg.id}
                        className={`relative overflow-hidden ${pkg.isPopular ? "ring-2 ring-orange-500" : ""}`}
                      >
                        {pkg.isPopular && (
                          <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-semibold">
                            POPULAR
                          </div>
                        )}
                        <CardHeader className={`bg-gradient-to-r ${colorClass} text-white`}>
                          <CardTitle className="flex items-center gap-2">
                            {pkg.icon === "Crown" ? (
                              <Crown className="w-5 h-5" />
                            ) : pkg.icon === "Star" ? (
                              <Star className="w-5 h-5" />
                            ) : (
                              <PackageIcon className="w-5 h-5" />
                            )}
                            {pkg.name}
                          </CardTitle>
                          <CardDescription className="text-white/80">{pkg.description}</CardDescription>
                          <div className="text-3xl font-bold">
                            Rp {pkg.price.toLocaleString()}
                            <span className="text-lg font-normal">/{pkg.billingPeriod}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            {pkg.features
                              .filter((f) => f.isEnabled)
                              .map((feature) => (
                                <div key={feature.id} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  <span className="text-sm">
                                    {feature.name}
                                    {feature.type === "limit" && (
                                      <span className="text-slate-600">
                                        {feature.isUnlimited ? " (Unlimited)" : ` (${feature.limitValue})`}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                          </div>
                          <Button className={`w-full mt-6 bg-gradient-to-r ${colorClass} hover:opacity-90`}>
                            Pilih Paket
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
