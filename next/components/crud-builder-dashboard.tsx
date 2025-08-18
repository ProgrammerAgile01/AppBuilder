"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import {
  Plus,
  Search,
  Grid3X3,
  List,
  RefreshCw,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Package,
  Loader2,
  Sparkles,
  BarChart3,
  Code,
  Layers,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { apiService, type Builder, type BuilderStats } from "@/lib/api"

const statusColors = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
}

export function CrudBuilderDashboard() {
  const router = useRouter()
  const [builders, setBuilders] = useState<Builder[]>([])
  const [stats, setStats] = useState<BuilderStats>({
    total_builders: 0,
    published_builders: 0,
    draft_builders: 0,
    archived_builders: 0,
    total_columns: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [builderToDelete, setBuilderToDelete] = useState<Builder | null>(null)

  // Fetch data
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const [buildersResponse, statsResponse] = await Promise.all([
        apiService.getBuilders({
          search: searchQuery || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        apiService.getBuilderStats(),
      ])

      // Handle builders response
      if (buildersResponse.status === "success") {
        setBuilders(buildersResponse.data.data || [])
      } else {
        setBuilders([])
      }

      // Handle stats response
      if (statsResponse.status === "success") {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setBuilders([])
      setStats({
        total_builders: 0,
        published_builders: 0,
        draft_builders: 0,
        archived_builders: 0,
        total_columns: 0,
      })
      toast({
        title: "Error",
        description: "Gagal memuat data builder. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchData()
  }, [])

  // Filter changes
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        fetchData()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, statusFilter])

  // Handle delete
  const handleDelete = async () => {
    if (!builderToDelete) return

    try {
      await apiService.deleteBuilder(builderToDelete.id)
      toast({
        title: "Berhasil!",
        description: "Builder berhasil dihapus.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus builder. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setBuilderToDelete(null)
    }
  }

  // Handle duplicate
  const handleDuplicate = async (builder: Builder) => {
    try {
      await apiService.duplicateBuilder(builder.id)
      toast({
        title: "Berhasil!",
        description: "Builder berhasil diduplikasi.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menduplikasi builder. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  // Filter builders based on search and filters
  const filteredBuilders = builders.filter((builder) => {
    const matchesSearch =
      !searchQuery ||
      builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.table_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || builder.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-slate-600">Memuat data builder...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            CRUD Builder
          </h2>
          <p className="text-slate-600 mt-1">Buat dan kelola sistem CRUD dengan mudah</p>
        </div>
        <Button
          onClick={() => router.push("/admin/builder/create")}
          className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-md">
              <Plus className="h-4 w-4" />
            </div>
            <span>Buat Builder Baru</span>
            <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Builder</CardTitle>
            <Code className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_builders}</div>
            <p className="text-xs opacity-80">Semua builder dalam sistem</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Published</CardTitle>
            <Eye className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published_builders}</div>
            <p className="text-xs opacity-80">Builder yang aktif</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Draft</CardTitle>
            <Edit className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft_builders}</div>
            <p className="text-xs opacity-80">Builder dalam pengembangan</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Archived</CardTitle>
            <Package className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived_builders}</div>
            <p className="text-xs opacity-80">Builder yang diarsipkan</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Kolom</CardTitle>
            <BarChart3 className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_columns}</div>
            <p className="text-xs opacity-80">Kolom database</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari builder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-lg bg-white/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-r-none ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-l-none ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Builders Grid/List */}
      {filteredBuilders.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Code className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery || statusFilter !== "all" ? "Tidak ada builder yang sesuai" : "Belum ada builder"}
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              {searchQuery || statusFilter !== "all"
                ? "Coba sesuaikan kriteria pencarian atau filter Anda."
                : "Mulai dengan membuat CRUD builder pertama Anda untuk sistem yang kompleks."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button
                onClick={() => router.push("/admin/builder/create")}
                className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-md">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span>Buat Builder Pertama</span>
                  <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {filteredBuilders.map((builder) => (
            <Card
              key={builder.id}
              className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg">
                      <Layers className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">{builder.name}</CardTitle>
                      <CardDescription className="text-slate-600">{builder.table_name}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/builder/view/${builder.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/builder/edit/${builder.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(builder)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplikasi
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setBuilderToDelete(builder)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[builder.status]}>{builder.status}</Badge>
                </div>
                {builder.description && <p className="text-sm text-slate-600 line-clamp-2">{builder.description}</p>}
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">{builder.total_categories}</div>
                    <div className="text-xs text-slate-500">Kategori</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">{builder.total_columns}</div>
                    <div className="text-xs text-slate-500">Kolom</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">{builder.total_stats}</div>
                    <div className="text-xs text-slate-500">Statistik</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/builder/view/${builder.id}`)}
                    className="flex-1 border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/builder/edit/${builder.id}`)}
                    className="flex-1 border-slate-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-200"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Builder</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus builder "{builderToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
