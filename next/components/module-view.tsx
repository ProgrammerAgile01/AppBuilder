"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Copy, Trash2, Database, Calendar, User, Tag, BarChart3, Columns, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { apiService, type Module } from "@/lib/api"

interface ModuleViewProps {
  moduleId: string
}

export function ModuleView({ moduleId }: ModuleViewProps) {
  const router = useRouter()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true)
        const response = await apiService.getModule(moduleId)
        setModule(response.data)
      } catch (error) {
        console.error("Error fetching module:", error)
        toast({
          title: "Error",
          description: "Gagal memuat data modul. Silakan coba lagi.",
          variant: "destructive",
        })
        router.push("/admin/modules")
      } finally {
        setLoading(false)
      }
    }

    if (moduleId) {
      fetchModule()
    }
  }, [moduleId, router])

  const handleEdit = () => {
    router.push(`/admin/modules/edit/${moduleId}`)
  }

  const handleDuplicate = async () => {
    if (!module) return

    try {
      await apiService.duplicateModule(module.id)
      toast({
        title: "Berhasil!",
        description: `Modul "${module.name}" berhasil diduplikat.`,
      })
      router.push("/admin/modules")
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menduplikat modul. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!module) return

    try {
      await apiService.deleteModule(module.id)
      toast({
        title: "Berhasil!",
        description: `Modul "${module.name}" berhasil dihapus.`,
      })
      router.push("/admin/modules")
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus modul. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getGroupColor = (group: string) => {
    switch (group.toLowerCase()) {
      case "master":
        return "bg-blue-100 text-blue-700"
      case "transaksi":
        return "bg-purple-100 text-purple-700"
      case "system":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-slate-100 text-slate-600"
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Memuat data modul...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Modul tidak ditemukan</h1>
          <Button onClick={() => router.push("/admin/modules")}>Kembali ke Daftar Modul</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{module.name}</h1>
            <p className="text-slate-600 mt-2">Detail informasi modul</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplikat
          </Button>
          <Button
            onClick={handleEdit}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Modul
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Informasi Modul
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Nama Modul</Label>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{module.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Judul Menu</Label>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{module.menu_title}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Nama Tabel</Label>
                  <code className="block bg-slate-100 px-3 py-2 rounded-md font-mono text-sm mt-1">
                    {module.table_name}
                  </code>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Grup Modul</Label>
                  <div className="mt-1">
                    {module.module_group && (
                      <Badge className={`${getGroupColor(module.module_group)}`}>{module.module_group}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {module.description && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Deskripsi</Label>
                  <p className="text-slate-700 mt-1 leading-relaxed">{module.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistik Modul
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Columns className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{module.total_categories}</div>
                  <div className="text-sm text-blue-600">Total Kategori</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">{module.total_columns}</div>
                  <div className="text-sm text-green-600">Total Kolom</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{module.total_stats}</div>
                  <div className="text-sm text-purple-600">Total Statistik</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Status & Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Status</Label>
                <div className="mt-1">
                  <Badge className={`${getStatusColor(module.status)}`}>
                    {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {module.created_by && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Dibuat Oleh</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-900">{module.created_by}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-slate-600">Tanggal Dibuat</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-900">
                    {new Date(module.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600">Terakhir Diupdate</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-900">
                    {new Date(module.updated_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleEdit}
                className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Modul
              </Button>
              <Button onClick={handleDuplicate} variant="outline" className="w-full justify-start bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Duplikat Modul
              </Button>
              <Button onClick={handleDeleteClick} variant="destructive" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Modul
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus modul "{module.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={`block text-sm font-medium ${className || ""}`} {...props}>
      {children}
    </label>
  )
}
