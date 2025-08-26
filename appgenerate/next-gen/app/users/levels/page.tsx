"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Plus, Search, Edit, Trash2, Shield, Users, Activity, Crown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Sample data
const userLevels = [
  {
    id: 1,
    name: "Super Admin",
    description: "Akses penuh ke seluruh sistem, dapat mengelola semua modul dan pengguna",
    totalUsers: 2,
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Admin",
    description: "Akses ke sebagian besar fitur, dapat mengelola transaksi dan operasional",
    totalUsers: 5,
    isActive: true,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
  },
  {
    id: 3,
    name: "Kasir",
    description: "Akses terbatas untuk transaksi pembayaran dan invoice",
    totalUsers: 8,
    isActive: true,
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17",
  },
  {
    id: 4,
    name: "Operasional",
    description: "Akses untuk manajemen kendaraan, driver, dan maintenance",
    totalUsers: 12,
    isActive: true,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
  },
  {
    id: 5,
    name: "Viewer",
    description: "Hanya dapat melihat laporan dan data, tanpa akses edit",
    totalUsers: 3,
    isActive: false,
    createdAt: "2024-01-19",
    updatedAt: "2024-01-19",
  },
]

export default function UserLevelsPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  })

  // Filter data
  const filteredLevels = userLevels.filter((level) => {
    const matchesSearch =
      level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Stats
  const totalLevels = userLevels.length
  const activeLevels = userLevels.filter((l) => l.isActive).length
  const inactiveLevels = totalLevels - activeLevels
  const totalUsers = userLevels.reduce((sum, level) => sum + level.totalUsers, 0)

  const handleAdd = () => {
    console.log("Adding user level:", formData)
    toast({
      title: "Berhasil",
      description: "Level user berhasil ditambahkan",
    })
    setIsAddDialogOpen(false)
    setFormData({ name: "", description: "", isActive: true })
  }

  const handleEdit = (level: any) => {
    setEditingLevel(level)
    setFormData({
      name: level.name,
      description: level.description,
      isActive: level.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    console.log("Updating user level:", editingLevel.id, formData)
    toast({
      title: "Berhasil",
      description: "Level user berhasil diperbarui",
    })
    setIsEditDialogOpen(false)
    setEditingLevel(null)
  }

  const handleDelete = (id: number) => {
    console.log("Deleting user level:", id)
    toast({
      title: "Berhasil",
      description: "Level user berhasil dihapus",
    })
  }

  const toggleStatus = (id: number) => {
    console.log("Toggling status for:", id)
    toast({
      title: "Berhasil",
      description: "Status berhasil diubah",
    })
  }

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
                  <BreadcrumbPage className="text-foreground">Level User</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Level User</h1>
              <p className="text-muted-foreground">Kelola level akses pengguna sistem</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Level
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Tambah Level User</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Tambahkan level akses baru untuk pengguna
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-foreground">
                      Nama Level
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Manager, Supervisor"
                      className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-foreground">
                      Deskripsi
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Deskripsi akses dan wewenang level ini"
                      className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Level</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalLevels}</div>
                <p className="text-xs text-muted-foreground">Level akses tersedia</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Level Aktif</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{activeLevels}</div>
                <p className="text-xs text-muted-foreground">Level yang aktif</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Level Tidak Aktif</CardTitle>
                <Activity className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{inactiveLevels}</div>
                <p className="text-xs text-muted-foreground">Level yang tidak aktif</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pencarian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan nama atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-foreground bg-background border-border placeholder:text-muted-foreground"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Menampilkan {filteredLevels.length} dari {totalLevels} level user
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Daftar Level User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Nama Level</TableHead>
                      <TableHead className="text-foreground">Deskripsi</TableHead>
                      <TableHead className="text-foreground">Total Users</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLevels.map((level) => (
                      <TableRow key={level.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            {level.name === "Super Admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                            {level.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground max-w-md">{level.description}</TableCell>
                        <TableCell className="text-foreground">
                          <Badge variant="outline" className="text-foreground border-border">
                            {level.totalUsers} users
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={level.isActive ? "default" : "secondary"}
                            className={`cursor-pointer ${
                              level.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                                : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            }`}
                            onClick={() => toggleStatus(level.id)}
                          >
                            {level.isActive ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(level)}
                              className="text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  disabled={level.name === "Super Admin"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Hapus Level User</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus level "{level.name}"?
                                    {level.totalUsers > 0 && ` Terdapat ${level.totalUsers} pengguna dengan level ini.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(level.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Edit Level User</DialogTitle>
                <DialogDescription className="text-muted-foreground">Perbarui informasi level user</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="text-foreground">
                    Nama Level
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-foreground bg-background border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description" className="text-foreground">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="text-foreground bg-background border-border"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Batal
                </Button>
                <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Perbarui
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
