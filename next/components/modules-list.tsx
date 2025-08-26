"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Grid3X3,
  List,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Database,
  Calendar,
  Users,
} from "lucide-react"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: number
  name: string
  table_name: string
  group: string
  status: string
  columns: number
  stats: number
  created_at: string
  updated_at: string
  description?: string
}

interface ModulesListProps {
  initialData?: Module[]
}

export function ModulesList({ initialData = [] }: ModulesListProps) {
  const [modules, setModules] = useState<Module[]>(initialData)
  const [filteredModules, setFilteredModules] = useState<Module[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [groupFilter, setGroupFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { toast } = useToast()

  // Load modules data
  const loadModules = async () => {
    setLoading(true)
    console.log("🔄 Loading modules...")

    try {
      const response = await apiRequest("/api/modules")
      console.log("📊 API Response:", response)

      if (response.success && response.data) {
        const modulesData = Array.isArray(response.data) ? response.data : []
        console.log("✅ Modules loaded:", modulesData.length, "items")
        setModules(modulesData)
        setFilteredModules(modulesData)
      } else {
        console.log("⚠️ No data in response, using empty array")
        setModules([])
        setFilteredModules([])
      }
    } catch (error) {
      console.error("❌ Error loading modules:", error)
      toast({
        title: "Error",
        description: "Failed to load modules data",
        variant: "destructive",
      })
      setModules([])
      setFilteredModules([])
    } finally {
      setLoading(false)
    }
  }

  // Filter modules
  useEffect(() => {
    let filtered = [...modules]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (module) =>
          module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((module) => module.status === statusFilter)
    }

    // Group filter
    if (groupFilter !== "all") {
      filtered = filtered.filter((module) => module.group === groupFilter)
    }

    console.log("🔍 Filtered modules:", filtered.length, "from", modules.length)
    setFilteredModules(filtered)
  }, [modules, searchTerm, statusFilter, groupFilter])

  // Load data on mount
  useEffect(() => {
    if (initialData.length === 0) {
      loadModules()
    }
  }, [])

  // Get unique groups for filter
  const uniqueGroups = Array.from(new Set(modules.map((m) => m.group)))

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  // Module actions
  const handleView = (id: number) => {
    window.location.href = `/admin/modules/view/${id}`
  }

  const handleEdit = (id: number) => {
    window.location.href = `/admin/modules/edit/${id}`
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this module?")) {
      try {
        // Simulate delete API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        setModules((prev) => prev.filter((m) => m.id !== id))
        toast({
          title: "Success",
          description: "Module deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete module",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari modul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Semua Grup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Grup</SelectItem>
              {uniqueGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={loadModules} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-4">
          <p className="text-sm text-orange-800">
            <strong>Debug Info:</strong> Total modules: {modules.length}, Filtered: {filteredModules.length}, Loading:{" "}
            {loading.toString()}
          </p>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading modules...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredModules.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {modules.length === 0 ? "Tidak ada data modul" : "Tidak ada modul yang sesuai filter"}
            </h3>
            <p className="text-gray-600 mb-4">
              {modules.length === 0
                ? "Belum ada modul yang dibuat. Mulai dengan membuat modul pertama Anda."
                : "Coba ubah filter atau kata kunci pencarian Anda."}
            </p>
            {modules.length === 0 && (
              <Button onClick={() => (window.location.href = "/admin/modules/create")}>Buat Modul Pertama</Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modules Grid/List */}
      {!loading && filteredModules.length > 0 && (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredModules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{module.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Table: {module.table_name}</CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(module.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(module.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(module.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status and Group */}
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                    <Badge variant="outline">{module.group}</Badge>
                  </div>

                  {/* Description */}
                  {module.description && <p className="text-sm text-gray-600 line-clamp-2">{module.description}</p>}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Database className="h-4 w-4" />
                      <span>{module.columns} cols</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{module.stats} stats</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {formatDate(module.created_at)}</span>
                    </div>
                    <span>Updated: {formatDate(module.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
