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
import { Plus, Search, Edit, Trash2, Car, Users, Activity } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Sample data
const vehicleTypes = [
  {
    id: 1,
    name: "Sedan",
    category: "Mobil Penumpang",
    capacity: 4,
    description: "Kendaraan penumpang dengan 4 pintu dan bagasi terpisah",
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "SUV",
    category: "Mobil Penumpang",
    capacity: 7,
    description: "Sport Utility Vehicle dengan kapasitas besar",
    isActive: true,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
  },
  {
    id: 3,
    name: "MPV",
    category: "Mobil Penumpang",
    capacity: 8,
    description: "Multi Purpose Vehicle untuk keluarga besar",
    isActive: true,
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17",
  },
  {
    id: 4,
    name: "Pick Up",
    category: "Komersial",
    capacity: 2,
    description: "Kendaraan komersial untuk angkut barang",
    isActive: false,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
  },
  {
    id: 5,
    name: "Motor Matic",
    category: "Motor",
    capacity: 2,
    description: "Motor dengan transmisi otomatis",
    isActive: true,
    createdAt: "2024-01-19",
    updatedAt: "2024-01-19",
  },
]

const categories = ["Mobil Penumpang", "Komersial", "Motor"]

export default function VehicleTypesPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    capacity: "",
    description: "",
    isActive: true,
  })

  // Filter data
  const filteredTypes = vehicleTypes.filter((type) => {
    const matchesSearch =
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || type.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Stats
  const totalTypes = vehicleTypes.length
  const activeTypes = vehicleTypes.filter((t) => t.isActive).length
  const inactiveTypes = totalTypes - activeTypes
  const totalCategories = new Set(vehicleTypes.map((t) => t.category)).size

  const handleAdd = () => {
    console.log("Adding vehicle type:", formData)
    toast({
      title: "Berhasil",
      description: "Tipe kendaraan berhasil ditambahkan",
    })
    setIsAddDialogOpen(false)
    setFormData({ name: "", category: "", capacity: "", description: "", isActive: true })
  }

  const handleEdit = (type: any) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      category: type.category,
      capacity: type.capacity.toString(),
      description: type.description,
      isActive: type.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    console.log("Updating vehicle type:", editingType.id, formData)
    toast({
      title: "Berhasil",
      description: "Tipe kendaraan berhasil diperbarui",
    })
    setIsEditDialogOpen(false)
    setEditingType(null)
  }

  const handleDelete = (id: number) => {
    console.log("Deleting vehicle type:", id)
    toast({
      title: "Berhasil",
      description: "Tipe kendaraan berhasil dihapus",
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
                  <BreadcrumbLink className="text-foreground">Master Data</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">Tipe Kendaraan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tipe Kendaraan</h1>
              <p className="text-muted-foreground">Kelola tipe kendaraan yang tersedia</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Tipe
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Tambah Tipe Kendaraan</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Tambahkan tipe kendaraan baru ke dalam sistem
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-foreground">
                      Nama Tipe
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Sedan, SUV, MPV"
                      className="text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-foreground">
                      Kategori
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="text-foreground bg-background border-border">
                        <SelectValue placeholder="Pilih kategori" className="text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-foreground hover:bg-accent">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity" className="text-foreground">
                      Kapasitas
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="Jumlah penumpang"
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
                      placeholder="Deskripsi tipe kendaraan"
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
                <CardTitle className="text-sm font-medium text-foreground">Total Tipe</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalTypes}</div>
                <p className="text-xs text-muted-foreground">Semua tipe kendaraan</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Aktif</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{activeTypes}</div>
                <p className="text-xs text-muted-foreground">Tipe yang aktif</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Tidak Aktif</CardTitle>
                <Activity className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{inactiveTypes}</div>
                <p className="text-xs text-muted-foreground">Tipe yang tidak aktif</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Kategori</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalCategories}</div>
                <p className="text-xs text-muted-foreground">Kategori berbeda</p>
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
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Cari berdasarkan nama atau deskripsi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-foreground bg-background border-border placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="text-foreground bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all" className="text-foreground hover:bg-accent">
                        Semua Kategori
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-foreground hover:bg-accent">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Menampilkan {filteredTypes.length} dari {totalTypes} tipe kendaraan
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Daftar Tipe Kendaraan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Nama Tipe</TableHead>
                      <TableHead className="text-foreground">Kategori</TableHead>
                      <TableHead className="text-foreground">Kapasitas</TableHead>
                      <TableHead className="text-foreground">Deskripsi</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTypes.map((type) => (
                      <TableRow key={type.id} className="border-border">
                        <TableCell className="font-medium text-foreground">{type.name}</TableCell>
                        <TableCell className="text-foreground">{type.category}</TableCell>
                        <TableCell className="text-foreground">{type.capacity} orang</TableCell>
                        <TableCell className="text-foreground max-w-xs truncate">{type.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant={type.isActive ? "default" : "secondary"}
                            className={`cursor-pointer ${
                              type.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                                : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            }`}
                            onClick={() => toggleStatus(type.id)}
                          >
                            {type.isActive ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(type)}
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
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Hapus Tipe Kendaraan</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus tipe "{type.name}"? Tindakan ini tidak dapat
                                    dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-foreground border-border bg-background hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(type.id)}
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
                <DialogTitle className="text-foreground">Edit Tipe Kendaraan</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Perbarui informasi tipe kendaraan
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="text-foreground">
                    Nama Tipe
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-foreground bg-background border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category" className="text-foreground">
                    Kategori
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="text-foreground bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-foreground hover:bg-accent">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity" className="text-foreground">
                    Kapasitas
                  </Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
