"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Database,
  Settings,
  Users,
  Package,
  ShoppingCart,
  Headphones,
  Loader2,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { apiService, type CreateModuleRequest, type UpdateModuleRequest, type Module } from "@/lib/api"

interface ModuleFormData {
  id?: string
  name: string
  menu_title: string
  table_name: string
  description: string
  total_categories: number
  total_columns: number
  total_stats: number
  status: "draft" | "published" | "archived"
  created_by: string
  module_group: string
}

interface ModuleFormProps {
  initialData?: Module
  mode: "create" | "edit"
}

const moduleGroups = [
  { value: "Master", label: "Master", icon: Database },
  { value: "Transaksi", label: "Transaksi", icon: ShoppingCart },
  { value: "System", label: "System", icon: Settings },
  { value: "Users", label: "Users", icon: Users },
  { value: "Products", label: "Products", icon: Package },
  { value: "Support", label: "Support", icon: Headphones },
]

export function ModuleForm({ initialData, mode }: ModuleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const [formData, setFormData] = useState<ModuleFormData>({
    name: "",
    menu_title: "",
    table_name: "",
    description: "",
    total_categories: 0,
    total_columns: 0,
    total_stats: 0,
    status: "draft",
    created_by: "admin", // Default user, bisa diambil dari session
    module_group: "",
    ...initialData,
  })

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true)
        const groups = await apiService.getModuleGroups()
        // Handle both array response and object response
        if (Array.isArray(groups)) {
          setAvailableGroups(groups)
        } else if (groups && Array.isArray(groups.data)) {
          setAvailableGroups(groups.data)
        } else {
          // Fallback to default groups
          setAvailableGroups(moduleGroups.map((g) => g.value))
        }
      } catch (error) {
        console.error("Error fetching groups:", error)
        // Fallback to default groups on error
        setAvailableGroups(moduleGroups.map((g) => g.value))
        toast({
          title: "Warning",
          description: "Could not load module groups. Using default groups.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [])

  // Auto-generate table_name from name
  useEffect(() => {
    if (formData.name && mode === "create") {
      const tableName = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_{2,}/g, "_")
        .replace(/^_|_$/g, "")

      setFormData((prev) => ({ ...prev, table_name: tableName }))
    }
  }, [formData.name, mode])

  // Auto-generate menu_title from name
  useEffect(() => {
    if (formData.name && mode === "create") {
      setFormData((prev) => ({ ...prev, menu_title: formData.name }))
    }
  }, [formData.name, mode])

  const handleInputChange = (field: keyof ModuleFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Nama modul harus diisi.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.menu_title.trim()) {
      toast({
        title: "Validation Error",
        description: "Judul menu harus diisi.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.table_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Nama tabel harus diisi.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.module_group) {
      toast({
        title: "Validation Error",
        description: "Grup modul harus dipilih.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      if (mode === "create") {
        const createData: CreateModuleRequest = {
          name: formData.name,
          menu_title: formData.menu_title,
          table_name: formData.table_name,
          description: formData.description || undefined,
          status: formData.status,
          created_by: formData.created_by,
          module_group: formData.module_group,
        }

        await apiService.createModule(createData)

        toast({
          title: "Berhasil!",
          description: "Modul berhasil dibuat.",
        })
      } else {
        const updateData: UpdateModuleRequest = {
          name: formData.name,
          menu_title: formData.menu_title,
          table_name: formData.table_name,
          description: formData.description || undefined,
          status: formData.status,
          created_by: formData.created_by,
          module_group: formData.module_group,
          total_categories: formData.total_categories,
          total_columns: formData.total_columns,
          total_stats: formData.total_stats,
        }

        await apiService.updateModule(formData.id!, updateData)

        toast({
          title: "Berhasil!",
          description: "Modul berhasil diperbarui.",
        })
      }

      router.push("/admin/modules")
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || `Gagal ${mode === "create" ? "membuat" : "memperbarui"} modul. Silakan coba lagi.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {mode === "create" ? "Buat Modul Baru" : "Edit Modul"}
            </h1>
            <p className="text-slate-600 mt-2">
              {mode === "create"
                ? "Buat modul CRUD baru dengan mengisi informasi dasar"
                : "Perbarui informasi modul yang sudah ada"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 border-b border-slate-200/50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Informasi Modul
                </span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Isi informasi dasar untuk modul CRUD yang akan dibuat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {/* Row 1: Name and Menu Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Nama Modul <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="contoh: User Management System"
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                    required
                  />
                  <p className="text-xs text-slate-500">Nama lengkap modul yang akan ditampilkan</p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="menu_title" className="text-sm font-semibold text-slate-700">
                    Judul Menu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="menu_title"
                    value={formData.menu_title}
                    onChange={(e) => handleInputChange("menu_title", e.target.value)}
                    placeholder="contoh: Users"
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                    required
                  />
                  <p className="text-xs text-slate-500">Nama yang akan muncul di menu sidebar</p>
                </div>
              </div>

              {/* Row 2: Table Name and Module Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="table_name" className="text-sm font-semibold text-slate-700">
                    Nama Tabel <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="table_name"
                    value={formData.table_name}
                    onChange={(e) => handleInputChange("table_name", e.target.value)}
                    placeholder="contoh: users"
                    className="h-12 font-mono border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                    required
                  />
                  <p className="text-xs text-slate-500">Nama tabel database (otomatis dibuat dari nama modul)</p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="module_group" className="text-sm font-semibold text-slate-700">
                    Grup Modul <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.module_group}
                    onValueChange={(value) => handleInputChange("module_group", value)}
                    disabled={isLoadingGroups}
                  >
                    <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50">
                      <SelectValue placeholder={isLoadingGroups ? "Loading..." : "Pilih grup modul"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingGroups ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading groups...
                          </div>
                        </SelectItem>
                      ) : availableGroups && availableGroups.length > 0 ? (
                        availableGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            <div className="flex items-center gap-2">
                              {moduleGroups.find((g) => g.value === group)?.icon &&
                                React.createElement(moduleGroups.find((g) => g.value === group)!.icon, {
                                  className: "h-4 w-4",
                                })}
                              {group}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        moduleGroups.map((group) => {
                          const Icon = group.icon
                          return (
                            <SelectItem key={group.value} value={group.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {group.label}
                              </div>
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Kategori untuk mengelompokkan modul</p>
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                  Deskripsi
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Deskripsi singkat tentang fungsi modul ini..."
                  className="min-h-[120px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                />
                <p className="text-xs text-slate-500">Penjelasan singkat tentang kegunaan modul (opsional)</p>
              </div>

              {/* Row 4: Statistics (for edit mode) */}
              {mode === "edit" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="total_categories" className="text-sm font-semibold text-slate-700">
                      Total Kategori
                    </Label>
                    <Input
                      id="total_categories"
                      type="number"
                      min="0"
                      value={formData.total_categories}
                      onChange={(e) => handleInputChange("total_categories", Number.parseInt(e.target.value) || 0)}
                      className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="total_columns" className="text-sm font-semibold text-slate-700">
                      Total Kolom
                    </Label>
                    <Input
                      id="total_columns"
                      type="number"
                      min="0"
                      value={formData.total_columns}
                      onChange={(e) => handleInputChange("total_columns", Number.parseInt(e.target.value) || 0)}
                      className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="total_stats" className="text-sm font-semibold text-slate-700">
                      Total Statistik
                    </Label>
                    <Input
                      id="total_stats"
                      type="number"
                      min="0"
                      value={formData.total_stats}
                      onChange={(e) => handleInputChange("total_stats", Number.parseInt(e.target.value) || 0)}
                      className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-sm font-semibold text-slate-700">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "draft" | "published" | "archived") => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Row 5: Created By */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="created_by" className="text-sm font-semibold text-slate-700">
                    Dibuat Oleh
                  </Label>
                  <Input
                    id="created_by"
                    value={formData.created_by}
                    onChange={(e) => handleInputChange("created_by", e.target.value)}
                    placeholder="Username atau ID pengguna"
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                  />
                  <p className="text-xs text-slate-500">Username atau ID pengguna yang membuat modul</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="relative min-w-[200px] px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="p-1 bg-white/20 rounded-md">
                      <Save className="h-4 w-4" />
                    </div>
                    <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                )}
                <span>
                  {isSubmitting
                    ? mode === "create"
                      ? "Membuat..."
                      : "Menyimpan..."
                    : mode === "create"
                      ? "Buat Modul"
                      : "Simpan Perubahan"}
                </span>
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
