"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  RefreshCw,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Database,
  Users,
  Package,
  ShoppingCart,
  Settings,
  Headphones,
  Loader2,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { apiService, type Module, type ModuleStats } from "@/lib/api"

const statusColors = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
}

const groupIcons = {
  Master: Database,
  Transaksi: ShoppingCart,
  System: Settings,
  Users: Users,
  Products: Package,
  Support: Headphones,
}

export function ModulesTable() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [stats, setStats] = useState<ModuleStats>({
    total_modules: 0,
    published_modules: 0,
    draft_modules: 0,
    archived_modules: 0,
    total_columns: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [groupFilter, setGroupFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)
  const [availableGroups, setAvailableGroups] = useState<string[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch data
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const [modulesResponse, statsResponse, groupsResponse] = await Promise.all([
        apiService.getModules({
          search: searchQuery || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          module_group: groupFilter !== "all" ? groupFilter : undefined,
        }),
        apiService.getModuleStats(),
        apiService.getModuleGroups(),
      ])

      // Handle modules response
      if (modulesResponse.status === "success") {
        setModules(modulesResponse.data.data || [])
      } else {
        setModules([])
      }

      // Handle stats response
      if (statsResponse.status === "success") {
        setStats(statsResponse.data)
      }

      // Handle groups response
      if (groupsResponse.status === "success") {
        setAvailableGroups(groupsResponse.data || [])
      } else {
        setAvailableGroups([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setModules([])
      setStats({
        total_modules: 0,
        published_modules: 0,
        draft_modules: 0,
        archived_modules: 0,
        total_columns: 0,
      })
      setAvailableGroups([])
      toast({
        title: "Error",
        description: "Gagal memuat data modul. Silakan coba lagi.",
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
        setCurrentPage(1) // Reset to first page when filtering
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, statusFilter, groupFilter])

  // Handle delete
  const handleDelete = async () => {
    if (!moduleToDelete) return

    try {
      await apiService.deleteModule(moduleToDelete.id)
      toast({
        title: "Berhasil!",
        description: "Modul berhasil dihapus.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus modul. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setModuleToDelete(null)
    }
  }

  // Handle duplicate
  const handleDuplicate = async (module: Module) => {
    try {
      await apiService.duplicateModule(module.id)
      toast({
        title: "Berhasil!",
        description: "Modul berhasil diduplikasi.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menduplikasi modul. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  // Filter modules based on search and filters
  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      !searchQuery ||
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.table_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || module.status === statusFilter
    const matchesGroup = groupFilter === "all" || module.module_group === groupFilter

    return matchesSearch && matchesStatus && matchesGroup
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedModules = filteredModules.slice(startIndex, endIndex)

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-slate-600">Memuat data modul...</span>
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
            Modul Table
          </h2>
          <p className="text-slate-600 mt-1">Kelola semua modul CRUD dalam bentuk tabel</p>
        </div>
        <Button
          onClick={() => router.push("/admin/modules/create")}
          className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-md">
              <Plus className="h-4 w-4" />
            </div>
            <span>Buat Modul Baru</span>
            <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Modul</CardTitle>
            <Database className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_modules}</div>
            <p className="text-xs opacity-80">Semua modul dalam sistem</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Published</CardTitle>
            <Eye className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published_modules}</div>
            <p className="text-xs opacity-80">Modul yang aktif</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Draft</CardTitle>
            <Edit className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft_modules}</div>
            <p className="text-xs opacity-80">Modul dalam pengembangan</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Archived</CardTitle>
            <Package className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived_modules}</div>
            <p className="text-xs opacity-80">Modul yang diarsipkan</p>
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
                  placeholder="Cari modul..."
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
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-[140px] h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50">
                  <SelectValue placeholder="Grup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Grup</SelectItem>
                  {availableGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </CardContent>
      </Card>

      {/* Table for Desktop, Cards for Mobile */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150">
                  <TableHead className="font-semibold text-slate-700">Module</TableHead>
                  <TableHead className="font-semibold text-slate-700">Table</TableHead>
                  <TableHead className="font-semibold text-slate-700">Group</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Stats</TableHead>
                  <TableHead className="font-semibold text-slate-700">Created</TableHead>
                  <TableHead className="font-semibold text-slate-700">Updated</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Database className="h-12 w-12 text-slate-400" />
                        <p className="text-slate-600">
                          {searchQuery || statusFilter !== "all" || groupFilter !== "all"
                            ? "Tidak ada modul yang sesuai dengan filter"
                            : "Belum ada modul"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedModules.map((module) => {
                    const GroupIcon = groupIcons[module.module_group as keyof typeof groupIcons] || Database
                    return (
                      <TableRow
                        key={module.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg">
                              <GroupIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{module.name}</div>
                              <div className="text-sm text-slate-500">{module.menu_title}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">{module.table_name}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50">
                            {module.module_group}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[module.status]}>{module.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{module.total_columns} cols</span>
                            <span>{module.total_stats} stats</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{formatDate(module.created_at)}</TableCell>
                        <TableCell className="text-sm text-slate-600">{formatDate(module.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/modules/view/${module.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/modules/edit/${module.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(module)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplikasi
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setModuleToDelete(module)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4">
            {paginatedModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Database className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchQuery || statusFilter !== "all" || groupFilter !== "all"
                    ? "Tidak ada modul yang sesuai"
                    : "Belum ada modul"}
                </h3>
                <p className="text-slate-600 text-center mb-6 max-w-md">
                  {searchQuery || statusFilter !== "all" || groupFilter !== "all"
                    ? "Coba sesuaikan kriteria pencarian atau filter Anda."
                    : "Mulai dengan membuat modul CRUD pertama Anda untuk mengelola data dalam sistem."}
                </p>
              </div>
            ) : (
              paginatedModules.map((module) => {
                const GroupIcon = groupIcons[module.module_group as keyof typeof groupIcons] || Database
                return (
                  <Card key={module.id} className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg">
                            <GroupIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold text-slate-900">{module.name}</CardTitle>
                            <CardDescription className="text-sm text-slate-600">{module.menu_title}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/modules/view/${module.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/modules/edit/${module.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(module)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplikasi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setModuleToDelete(module)
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
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[module.status]}>{module.status}</Badge>
                        <Badge variant="outline" className="bg-slate-50">
                          {module.module_group}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        <code className="bg-slate-100 px-2 py-1 rounded font-mono">{module.table_name}</code>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Kolom:</span>
                          <span className="ml-1 font-medium">{module.total_columns}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Stats:</span>
                          <span className="ml-1 font-medium">{module.total_stats}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Dibuat:</span>
                          <span className="ml-1 font-medium">{formatDate(module.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Update:</span>
                          <span className="ml-1 font-medium">{formatDate(module.updated_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredModules.length)} dari{" "}
                {filteredModules.length} modul
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "border-slate-200"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-slate-200"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Modul</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus modul "{moduleToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.
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
