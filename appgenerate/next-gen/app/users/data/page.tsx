"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, Edit, Trash2, Users, Activity, Shield, Key, Crown, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Sample user levels
const userLevels = [
  { id: 1, name: "Super Admin" },
  { id: 2, name: "Admin" },
  { id: 3, name: "Kasir" },
  { id: 4, name: "Operasional" },
  { id: 5, name: "Viewer" },
]

// Sample users data
const usersData = [
  {
    id: 1,
    fullName: "Ahmad Wijaya",
    email: "ahmad.wijaya@rentvix.com",
    levelId: 1,
    levelName: "Super Admin",
    isActive: true,
    lastLogin: "2024-01-20 14:30:00",
    createdAt: "2024-01-15",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    fullName: "Siti Nurhaliza",
    email: "siti.nurhaliza@rentvix.com",
    levelId: 2,
    levelName: "Admin",
    isActive: true,
    lastLogin: "2024-01-20 13:15:00",
    createdAt: "2024-01-16",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    fullName: "Budi Santoso",
    email: "budi.santoso@rentvix.com",
    levelId: 3,
    levelName: "Kasir",
    isActive: true,
    lastLogin: "2024-01-20 12:45:00",
    createdAt: "2024-01-17",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    fullName: "Dewi Lestari",
    email: "dewi.lestari@rentvix.com",
    levelId: 4,
    levelName: "Operasional",
    isActive: true,
    lastLogin: "2024-01-20 11:20:00",
    createdAt: "2024-01-18",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    fullName: "Eko Prasetyo",
    email: "eko.prasetyo@rentvix.com",
    levelId: 5,
    levelName: "Viewer",
    isActive: false,
    lastLogin: "2024-01-19 16:30:00",
    createdAt: "2024-01-19",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    fullName: "Maya Sari",
    email: "maya.sari@rentvix.com",
    levelId: 3,
    levelName: "Kasir",
    isActive: true,
    lastLogin: "2024-01-20 10:15:00",
    createdAt: "2024-01-20",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function UserDataPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    levelId: "",
    password: "",
    confirmPassword: "",
    isActive: true,
  })

  // Filter data
  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.levelName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)

    const matchesLevel = levelFilter === "all" || user.levelId.toString() === levelFilter

    return matchesSearch && matchesStatus && matchesLevel
  })

  // Stats
  const totalUsers = usersData.length
  const activeUsers = usersData.filter((u) => u.isActive).length
  const inactiveUsers = totalUsers - activeUsers
  const onlineUsers = Math.floor(activeUsers * 0.6) // Simulate online users

  const handleAdd = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive",
      })
      return
    }

    console.log("Adding user:", formData)
    toast({
      title: "Berhasil",
      description: "User berhasil ditambahkan",
    })
    setIsAddDialogOpen(false)
    setFormData({ fullName: "", email: "", levelId: "", password: "", confirmPassword: "", isActive: true })
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      fullName: user.fullName,
      email: user.email,
      levelId: user.levelId.toString(),
      password: "",
      confirmPassword: "",
      isActive: user.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive",
      })
      return
    }

    console.log("Updating user:", editingUser.id, formData)
    toast({
      title: "Berhasil",
      description: "Data user berhasil diperbarui",
    })
    setIsEditDialogOpen(false)
    setEditingUser(null)
  }

  const handleDelete = (id: number) => {
    console.log("Deleting user:", id)
    toast({
      title: "Berhasil",
      description: "User berhasil dihapus",
    })
  }

  const handleResetPassword = (id: number, email: string) => {
    console.log("Resetting password for user:", id)
    toast({
      title: "Berhasil",
      description: `Password reset link telah dikirim ke ${email}`,
    })
  }

  const toggleStatus = (id: number) => {
    console.log("Toggling status for:", id)
    toast({
      title: "Berhasil",
      description: "Status user berhasil diubah",
    })
  }

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Baru saja"
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`
    return `${Math.floor(diffInHours / 24)} hari yang lalu`
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
                  <BreadcrumbPage className="text-foreground">Data User</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Data User</h1>
              <p className="text-muted-foreground">Kelola pengguna sistem dan akses mereka</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Tambah User Baru</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Tambahkan pengguna baru ke sistem
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-foreground">
                      Nama Lengkap
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@rentvix.com"
                      className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level" className="text-foreground">
                      Level User
                    </Label>
                    <Select
                      value={formData.levelId}
                      onValueChange={(value) => setFormData({ ...formData, levelId: value })}
                    >
                      <SelectTrigger className="text-foreground bg-background border-border">
                        <SelectValue placeholder="Pilih level user" />
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
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Masukkan password"
                        className="text-foreground bg-background border-border placeholder:text-muted-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">
                      Konfirmasi Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Konfirmasi password"
                      className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground"
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
                <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Users Aktif</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">Status aktif</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Users Tidak Aktif</CardTitle>
                <Activity className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{inactiveUsers}</div>
                <p className="text-xs text-muted-foreground">Status tidak aktif</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Online Sekarang</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{onlineUsers}</div>
                <p className="text-xs text-muted-foreground">Sedang online</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Filter & Pencarian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Cari berdasarkan nama, email, atau level..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-foreground bg-background border-border placeholder:text-muted-foreground"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 text-foreground bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                      Semua Status
                    </SelectItem>
                    <SelectItem value="active" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                      Aktif
                    </SelectItem>
                    <SelectItem
                      value="inactive"
                      className="text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Tidak Aktif
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40 text-foreground bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                      Semua Level
                    </SelectItem>
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
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Menampilkan {filteredUsers.length} dari {totalUsers} pengguna
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Daftar Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Pengguna</TableHead>
                      <TableHead className="text-foreground">Email</TableHead>
                      <TableHead className="text-foreground">Level</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Login Terakhir</TableHead>
                      <TableHead className="text-foreground">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.levelName === "Super Admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                                {user.fullName}
                              </div>
                              <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-foreground border-border ${
                              user.levelName === "Super Admin"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600"
                                : user.levelName === "Admin"
                                  ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600"
                                  : user.levelName === "Kasir"
                                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600"
                                    : user.levelName === "Operasional"
                                      ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600"
                                      : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {user.levelName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                            className={`cursor-pointer ${
                              user.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                                : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            }`}
                            onClick={() => toggleStatus(user.id)}
                          >
                            {user.isActive ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="text-sm">{formatLastLogin(user.lastLogin)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(user.lastLogin).toLocaleDateString("id-ID")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetPassword(user.id, user.email)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  disabled={user.levelName === "Super Admin"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Hapus User</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus user "{user.fullName}"? Tindakan ini tidak dapat
                                    dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground">
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(user.id)}
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
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">Edit User</DialogTitle>
                <DialogDescription className="text-muted-foreground">Perbarui informasi pengguna</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-fullName" className="text-foreground">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="edit-fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="text-foreground bg-background border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-foreground bg-background border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-level" className="text-foreground">
                    Level User
                  </Label>
                  <Select
                    value={formData.levelId}
                    onValueChange={(value) => setFormData({ ...formData, levelId: value })}
                  >
                    <SelectTrigger className="text-foreground bg-background border-border">
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password" className="text-foreground">
                    Password Baru (Opsional)
                  </Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                    className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                  />
                </div>
                {formData.password && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-confirmPassword" className="text-foreground">
                      Konfirmasi Password
                    </Label>
                    <Input
                      id="edit-confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Konfirmasi password baru"
                      className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground"
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
