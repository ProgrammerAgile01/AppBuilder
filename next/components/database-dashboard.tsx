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
  Trash2,
  MoreHorizontal,
  Database,
  Server,
  HardDrive,
  Activity,
  Loader2,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { apiService, type DatabaseTable, type DatabaseStats } from "@/lib/api"

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
}

export function DatabaseDashboard() {
  const router = useRouter()
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [stats, setStats] = useState<DatabaseStats>({
    total_tables: 0,
    active_tables: 0,
    maintenance_tables: 0,
    total_rows: 0,
    total_size_mb: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<DatabaseTable | null>(null)

  // Fetch data
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const [tablesResponse, statsResponse] = await Promise.all([
        apiService.getDatabaseTables({
          search: searchQuery || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        apiService.getDatabaseStats(),
      ])

      // Handle tables response
      if (tablesResponse.status === "success") {
        setTables(tablesResponse.data.data || [])
      } else {
        setTables([])
      }

      // Handle stats response
      if (statsResponse.status === "success") {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setTables([])
      setStats({
        total_tables: 0,
        active_tables: 0,
        maintenance_tables: 0,
        total_rows: 0,
        total_size_mb: 0,
      })
      toast({
        title: "Error",
        description: "Gagal memuat data database. Silakan coba lagi.",
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
    if (!tableToDelete) return

    try {
      await apiService.deleteDatabaseTable(tableToDelete.id)
      toast({
        title: "Berhasil!",
        description: "Tabel berhasil dihapus.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus tabel. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTableToDelete(null)
    }
  }

  // Filter tables based on search and filters
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      !searchQuery ||
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || table.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Format file size
  const formatSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(1)} KB`
    } else if (sizeInMB < 1024) {
      return `${sizeInMB.toFixed(1)} MB`
    } else {
      return `${(sizeInMB / 1024).toFixed(1)} GB`
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-slate-600">Memuat data database...</span>
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
            Database Management
          </h2>
          <p className="text-slate-600 mt-1">Kelola tabel database dan struktur data</p>
        </div>
        <Button
          onClick={() => router.push("/admin/database/create")}
          className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-md">
              <Plus className="h-4 w-4" />
            </div>
            <span>Buat Tabel Baru</span>
            <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Tabel</CardTitle>
            <Database className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tables}</div>
            <p className="text-xs opacity-80">Semua tabel database</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active</CardTitle>
            <Activity className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_tables}</div>
            <p className="text-xs opacity-80">Tabel yang aktif</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Maintenance</CardTitle>
            <Server className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance_tables}</div>
            <p className="text-xs opacity-80">Dalam pemeliharaan</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Rows</CardTitle>
            <BarChart3 className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_rows.toLocaleString()}</div>
            <p className="text-xs opacity-80">Baris data</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Storage</CardTitle>
            <HardDrive className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(stats.total_size_mb)}</div>
            <p className="text-xs opacity-80">Ukuran database</p>
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
                  placeholder="Cari tabel..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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

      {/* Tables Grid/List */}
      {filteredTables.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Database className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery || statusFilter !== "all" ? "Tidak ada tabel yang sesuai" : "Belum ada tabel"}
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              {searchQuery || statusFilter !== "all"
                ? "Coba sesuaikan kriteria pencarian atau filter Anda."
                : "Mulai dengan membuat tabel database pertama Anda untuk menyimpan data."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button
                onClick={() => router.push("/admin/database/create")}
                className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-md">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span>Buat Tabel Pertama</span>
                  <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {filteredTables.map((table) => (
            <Card
              key={table.id}
              className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">{table.name}</CardTitle>
                      <CardDescription className="text-slate-600">{table.description}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/database/view/${table.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/database/edit/${table.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTableToDelete(table)
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
                  <Badge className={statusColors[table.status]}>{table.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">{table.columns_count}</div>
                    <div className="text-xs text-slate-500">Kolom</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">{table.rows_count.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Baris</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">{formatSize(table.size_mb)}</div>
                    <div className="text-xs text-slate-500">Ukuran</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">{formatDate(table.last_backup)}</div>
                    <div className="text-xs text-slate-500">Backup</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/database/view/${table.id}`)}
                    className="flex-1 border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/database/edit/${table.id}`)}
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
            <AlertDialogTitle>Hapus Tabel</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tabel "{tableToDelete?.name}"? Tindakan ini tidak dapat dibatalkan dan
              akan menghapus semua data dalam tabel.
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
