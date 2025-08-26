"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Users,
  TrendingUp,
  MessageSquare,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CustomerDetailDrawer } from "@/components/customer-detail-drawer"

// Enhanced sample customer data with more fields
const customers = [
  {
    id: 1,
    name: "Ahmad Wijaya",
    email: "ahmad.wijaya@email.com",
    phone: "+62 812-3456-7890",
    whatsapp: "+62 812-3456-7890",
    company: "PT Maju Jaya Sentosa",
    position: "General Manager",
    location: "Jakarta Selatan",
    address: "Jl. Sudirman No. 123, RT/RW 01/02, Kebayoran Baru, Jakarta Selatan 12190",
    status: "active",
    type: "corporate",
    totalBookings: 24,
    totalRevenue: 45000000,
    lastBooking: "2024-01-15",
    joinDate: "2023-06-15",
    avatar: "/placeholder.svg?height=40&width=40",
    idNumber: "3171051585001234",
    dateOfBirth: "1985-05-15",
    gender: "male",
    notes: "Pelanggan setia dengan track record pembayaran yang baik.",
    preferredContact: "whatsapp",
    creditLimit: 50000000,
    paymentTerms: 30,
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    phone: "+62 813-9876-5432",
    whatsapp: "+62 813-9876-5432",
    company: "CV Berkah Mandiri",
    position: "Owner",
    location: "Bandung",
    address: "Jl. Asia Afrika No. 45, Bandung, Jawa Barat 40111",
    status: "active",
    type: "individual",
    totalBookings: 12,
    totalRevenue: 18000000,
    lastBooking: "2024-01-10",
    joinDate: "2023-08-20",
    avatar: "/placeholder.svg?height=40&width=40",
    idNumber: "3273054590001234",
    dateOfBirth: "1990-04-25",
    gender: "female",
    notes: "Sering booking untuk keperluan keluarga.",
    preferredContact: "email",
    creditLimit: 25000000,
    paymentTerms: 14,
  },
  {
    id: 3,
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "+62 814-5555-1234",
    whatsapp: "+62 814-5555-1234",
    company: "Freelancer",
    position: "Consultant",
    location: "Surabaya",
    address: "Jl. Pemuda No. 78, Surabaya, Jawa Timur 60271",
    status: "inactive",
    type: "individual",
    totalBookings: 8,
    totalRevenue: 12000000,
    lastBooking: "2023-12-20",
    joinDate: "2023-04-10",
    avatar: "/placeholder.svg?height=40&width=40",
    idNumber: "3578051580001234",
    dateOfBirth: "1980-05-15",
    gender: "male",
    notes: "Perlu follow up untuk reaktivasi.",
    preferredContact: "phone",
    creditLimit: 15000000,
    paymentTerms: 7,
  },
  {
    id: 4,
    name: "Maya Sari Dewi",
    email: "maya.sari@email.com",
    phone: "+62 815-7777-8888",
    whatsapp: "+62 815-7777-8888",
    company: "PT Digital Solutions",
    position: "Marketing Director",
    location: "Yogyakarta",
    address: "Jl. Malioboro No. 156, Yogyakarta 55271",
    status: "active",
    type: "corporate",
    totalBookings: 36,
    totalRevenue: 72000000,
    lastBooking: "2024-01-18",
    joinDate: "2023-03-05",
    avatar: "/placeholder.svg?height=40&width=40",
    idNumber: "3471054585001234",
    dateOfBirth: "1985-04-10",
    gender: "female",
    notes: "VIP customer dengan volume booking tinggi.",
    preferredContact: "whatsapp",
    creditLimit: 75000000,
    paymentTerms: 30,
  },
  {
    id: 5,
    name: "Rizki Pratama",
    email: "rizki.pratama@email.com",
    phone: "+62 816-4444-9999",
    whatsapp: "+62 816-4444-9999",
    company: "Startup Tech",
    position: "CEO",
    location: "Medan",
    address: "Jl. Gatot Subroto No. 234, Medan, Sumatera Utara 20235",
    status: "pending",
    type: "corporate",
    totalBookings: 3,
    totalRevenue: 4500000,
    lastBooking: "2024-01-05",
    joinDate: "2024-01-01",
    avatar: "/placeholder.svg?height=40&width=40",
    idNumber: "1271051590001234",
    dateOfBirth: "1990-05-15",
    gender: "male",
    notes: "Customer baru, masih dalam proses verifikasi.",
    preferredContact: "email",
    creditLimit: 10000000,
    paymentTerms: 0,
  },
]

const customerStats = {
  total: 156,
  active: 142,
  inactive: 8,
  pending: 6,
  corporate: 89,
  individual: 67,
  totalRevenue: 2450000000,
  avgRevenue: 15705128,
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customers)[0] | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    const matchesType = typeFilter === "all" || customer.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customers.map((c) => c.id))
    } else {
      setSelectedCustomers([])
    }
  }

  const handleSelectCustomer = (customerId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId])
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId))
    }
  }

  const handleViewCustomer = (customer: (typeof customers)[0]) => {
    setSelectedCustomer(customer)
    setIsDrawerOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    }
    return variants[status as keyof typeof variants] || variants.active
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      corporate:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      individual:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    }
    return variants[type as keyof typeof variants] || variants.individual
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength - 3)}...`
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: "Aktif / Active",
      inactive: "Nonaktif / Inactive",
      pending: "Pending / Pending",
    }
    return labels[status as keyof typeof labels] || status
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      corporate: "Perusahaan / Corporate",
      individual: "Perorangan / Individual",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Manajemen Pelanggan / Customer Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 space-y-6 p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Manajemen Pelanggan / Customer Management
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Kelola data pelanggan dan riwayat transaksi / Manage customer data and transaction history
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm border-border bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm border-border bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm border-border bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Link href="/customers/new">
                  <Button size="sm" className="text-xs md:text-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pelanggan / Add Customer
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama, email, atau nomor telepon / Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status / All Status</SelectItem>
                        <SelectItem value="active">Aktif / Active</SelectItem>
                        <SelectItem value="inactive">Nonaktif / Inactive</SelectItem>
                        <SelectItem value="pending">Pending / Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Tipe / Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe / All Types</SelectItem>
                        <SelectItem value="corporate">Perusahaan / Corporate</SelectItem>
                        <SelectItem value="individual">Perorangan / Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pelanggan / Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.total}</div>
                <p className="text-xs text-muted-foreground">+12% dari bulan lalu / +12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pelanggan Aktif / Active Customers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.active}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((customerStats.active / customerStats.total) * 100)}% dari total / of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(customerStats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">+8% dari bulan lalu / +8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Revenue / Avg Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(customerStats.avgRevenue)}</div>
                <p className="text-xs text-muted-foreground">Per pelanggan / Per customer</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pelanggan / Customer List</CardTitle>
                  <CardDescription>
                    Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan / Showing{" "}
                    {filteredCustomers.length} of {customers.length} customers
                  </CardDescription>
                </div>
                {selectedCustomers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{selectedCustomers.length} dipilih / selected</span>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus / Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              {!isMobile && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedCustomers.length === filteredCustomers.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="min-w-[200px]">Nama / Name</TableHead>
                        <TableHead className="min-w-[150px]">WhatsApp</TableHead>
                        <TableHead className="min-w-[200px]">Email</TableHead>
                        <TableHead className="min-w-[120px]">Tipe / Type</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="w-[100px] text-center">Aksi / Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {customer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                                        {customer.company}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{customer.company}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-green-600" />
                              <span className="font-mono text-sm">{customer.whatsapp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm truncate max-w-[180px]">{customer.email}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{customer.email}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTypeBadge(customer.type)}>
                              {getTypeLabel(customer.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(customer.status)}>
                              {getStatusLabel(customer.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewCustomer(customer)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Lihat Detail / View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                      <Link href={`/customers/${customer.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aksi / Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus / Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <div className="space-y-4 p-4">
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {customer.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-base">{customer.name}</h3>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">{customer.company}</p>
                            </div>
                          </div>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-mono">{customer.whatsapp}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={getTypeBadge(customer.type)}>
                              {customer.type === "corporate" ? "Perusahaan" : "Perorangan"}
                            </Badge>
                            <Badge variant="outline" className={getStatusBadge(customer.status)}>
                              {customer.status === "active"
                                ? "Aktif"
                                : customer.status === "inactive"
                                  ? "Nonaktif"
                                  : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan / Showing{" "}
                  {filteredCustomers.length} of {customers.length} customers
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Detail Drawer */}
        <CustomerDetailDrawer customer={selectedCustomer} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      </SidebarInset>
    </>
  )
}
