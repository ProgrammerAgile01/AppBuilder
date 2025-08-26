"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  Calendar,
  Database,
  Columns,
  BarChart3,
  MoreVertical,
  Grid3X3,
  List,
  Settings,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface CrudBuilder {
  id: string
  judul: string
  judulMenu: string
  namaTabel: string
  deskripsi: string
  totalKategori: number
  totalKolom: number
  totalStatistik: number
  status: "draft" | "published" | "archived"
  createdAt: string
  updatedAt: string
  createdBy: string
  moduleGroup: string
}

// Mock data - in real app this would come from API
const mockBuilders: CrudBuilder[] = [
  {
    id: "1",
    judul: "User Management System",
    judulMenu: "Users",
    namaTabel: "users",
    deskripsi: "Complete user management with roles and permissions",
    totalKategori: 3,
    totalKolom: 12,
    totalStatistik: 4,
    status: "published",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    createdBy: "Admin",
    moduleGroup: "users",
  },
  {
    id: "2",
    judul: "Product Catalog",
    judulMenu: "Products",
    namaTabel: "products",
    deskripsi: "E-commerce product management system",
    totalKategori: 4,
    totalKolom: 18,
    totalStatistik: 6,
    status: "draft",
    createdAt: "2024-01-18",
    updatedAt: "2024-01-22",
    createdBy: "Developer",
    moduleGroup: "products",
  },
  {
    id: "3",
    judul: "Order Management",
    judulMenu: "Orders",
    namaTabel: "orders",
    deskripsi: "Order processing and tracking system",
    totalKategori: 2,
    totalKolom: 8,
    totalStatistik: 3,
    status: "published",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-25",
    createdBy: "Manager",
    moduleGroup: "orders",
  },
  {
    id: "4",
    judul: "Customer Support",
    judulMenu: "Support Tickets",
    namaTabel: "support_tickets",
    deskripsi: "Customer support ticket management",
    totalKategori: 3,
    totalKolom: 15,
    totalStatistik: 5,
    status: "archived",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-15",
    createdBy: "Support Team",
    moduleGroup: "system",
  },
]

export function CrudBuilderList() {
  const router = useRouter()
  const [builders, setBuilders] = useState<CrudBuilder[]>(mockBuilders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("updatedAt")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredBuilders = builders
    .filter((builder) => {
      const matchesSearch =
        builder.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.namaTabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || builder.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "judul":
          return a.judul.localeCompare(b.judul)
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "updatedAt":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const handleEdit = (id: string) => {
    router.push(`/builder?id=${id}`)
  }

  const handleDuplicate = (builder: CrudBuilder) => {
    const newBuilder = {
      ...builder,
      id: Date.now().toString(),
      judul: `${builder.judul} (Copy)`,
      status: "draft" as const,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setBuilders([newBuilder, ...builders])
    toast({
      title: "Success!",
      description: `Builder "${builder.judul}" has been duplicated.`,
    })
  }

  const handleDelete = (id: string) => {
    const builder = builders.find((b) => b.id === id)
    setBuilders(builders.filter((b) => b.id !== id))
    toast({
      title: "Deleted!",
      description: `Builder "${builder?.judul}" has been deleted.`,
      variant: "destructive",
    })
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Published"
      case "draft":
        return "Draft"
      case "archived":
        return "Archived"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">CRUD Builders</h1>
                  <p className="text-sm text-slate-500">Manage your database structure builders</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push("/builder")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Builder
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Builders</p>
                  <p className="text-3xl font-bold text-blue-900">{builders.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Published</p>
                  <p className="text-3xl font-bold text-green-900">
                    {builders.filter((b) => b.status === "published").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {builders.filter((b) => b.status === "draft").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <Edit className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Columns</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {builders.reduce((sum, b) => sum + b.totalKolom, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Columns className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search builders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-11 border-slate-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 h-11 border-slate-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="judul">Name</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-slate-200 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Builders Grid/List */}
        {filteredBuilders.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No builders found</h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first CRUD builder."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button
                  onClick={() => router.push("/builder")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Builder
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredBuilders.map((builder) => (
              <Card
                key={builder.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-2">{builder.judul}</CardTitle>
                      <CardDescription className="text-sm text-slate-600">{builder.judulMenu}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(builder.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(builder)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(builder.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Badge className={`w-fit text-xs ${getStatusColor(builder.status)}`}>
                    {getStatusLabel(builder.status)}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{builder.deskripsi}</p>

                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-slate-500">
                      <Database className="h-4 w-4 mr-2" />
                      Table:{" "}
                      <code className="ml-1 bg-slate-100 px-2 py-1 rounded text-xs font-mono">{builder.namaTabel}</code>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Columns className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">{builder.totalKategori}</div>
                        <div className="text-xs text-slate-600">Categories</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Database className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">{builder.totalKolom}</div>
                        <div className="text-xs text-slate-600">Columns</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <BarChart3 className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="text-lg font-semibold text-slate-900">{builder.totalStatistik}</div>
                        <div className="text-xs text-slate-600">Stats</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Updated {new Date(builder.updatedAt).toLocaleDateString()}
                        </span>
                        <span>by {builder.createdBy}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleEdit(builder.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      variant={builder.status === "draft" ? "default" : "outline"}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {builder.status === "draft" ? "Continue Editing" : "Edit Builder"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
