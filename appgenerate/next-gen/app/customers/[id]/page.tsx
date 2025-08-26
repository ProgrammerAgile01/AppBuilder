"use client"

import { useState } from "react"
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, Star, Download, MessageSquare, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
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
import Link from "next/link"
import { useParams } from "next/navigation"

// Sample customer data
const customer = {
  id: 1,
  name: "Ahmad Wijaya",
  email: "ahmad.wijaya@email.com",
  phone: "+62 812-3456-7890",
  company: "PT Maju Jaya",
  position: "General Manager",
  location: "Jakarta",
  address: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10110",
  status: "active",
  type: "corporate",
  joinDate: "2023-06-15",
  lastBooking: "2024-01-15",
  avatar: "/placeholder.svg?height=100&width=100",
  tags: ["VIP", "Corporate", "Regular"],
  notes: "Pelanggan setia dengan track record pembayaran yang baik. Sering booking untuk kebutuhan bisnis.",

  // Statistics
  totalBookings: 24,
  totalRevenue: 45000000,
  avgBookingValue: 1875000,
  satisfactionScore: 4.8,
  onTimePayment: 95,

  // Analytics
  clv: 75000000, // Customer Lifetime Value
  bookingFrequency: 2.1, // per month
  preferredVehicles: ["Toyota Innova", "Honda CR-V", "Mitsubishi Pajero"],
  paymentMethods: { transfer: 70, cash: 20, credit: 10 },
}

// Sample booking history
const bookingHistory = [
  {
    id: "BK-2024-001",
    vehicle: "Toyota Innova",
    startDate: "2024-01-15",
    endDate: "2024-01-18",
    duration: "3 hari",
    amount: 1800000,
    status: "completed",
    rating: 5,
    review: "Pelayanan sangat memuaskan, kendaraan dalam kondisi prima.",
  },
  {
    id: "BK-2024-002",
    vehicle: "Honda CR-V",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    duration: "2 hari",
    amount: 1400000,
    status: "completed",
    rating: 4,
    review: "Bagus, hanya sedikit delay saat pengambilan.",
  },
  {
    id: "BK-2023-045",
    vehicle: "Mitsubishi Pajero",
    startDate: "2023-12-20",
    endDate: "2023-12-25",
    duration: "5 hari",
    amount: 3500000,
    status: "completed",
    rating: 5,
    review: "Perfect untuk liburan keluarga!",
  },
]

// Sample communication history
const communications = [
  {
    id: 1,
    type: "email",
    subject: "Konfirmasi Booking BK-2024-001",
    date: "2024-01-15",
    status: "sent",
    content: "Email konfirmasi booking telah dikirim",
  },
  {
    id: 2,
    type: "whatsapp",
    subject: "Reminder Pembayaran",
    date: "2024-01-14",
    status: "delivered",
    content: "Reminder pembayaran untuk booking BK-2024-001",
  },
  {
    id: 3,
    type: "phone",
    subject: "Follow up Booking",
    date: "2024-01-13",
    status: "completed",
    content: "Telepon follow up untuk konfirmasi detail booking",
  },
]

// Sample documents
const documents = [
  { id: 1, name: "KTP Ahmad Wijaya.pdf", type: "KTP", uploadDate: "2023-06-15", size: "2.1 MB" },
  { id: 2, name: "NPWP PT Maju Jaya.pdf", type: "NPWP", uploadDate: "2023-06-15", size: "1.8 MB" },
  { id: 3, name: "SIM A Ahmad Wijaya.pdf", type: "SIM", uploadDate: "2023-06-15", size: "1.5 MB" },
  { id: 4, name: "Company Profile.pdf", type: "Company Profile", uploadDate: "2023-06-16", size: "5.2 MB" },
]

export default function CustomerDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("bookings")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return variants[status as keyof typeof variants] || variants.active
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
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
                <BreadcrumbLink href="/customers">Pelanggan</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{customer.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/customers">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Detail Pelanggan</h1>
                <p className="text-muted-foreground">Informasi lengkap dan riwayat transaksi</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Link href={`/customers/${params.id}/edit`}>
                <Button size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Pelanggan
                </Button>
              </Link>
            </div>
          </div>

          {/* Customer Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold">{customer.name}</h2>
                    <Badge className={getStatusBadge(customer.status)}>
                      {customer.status === "active" ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {customer.type === "corporate" ? "Corporate" : "Individual"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {customer.location}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Perusahaan: </span>
                        <span className="font-medium">{customer.company}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Jabatan: </span>
                        <span className="font-medium">{customer.position}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Bergabung: </span>
                        <span className="font-medium">{new Date(customer.joinDate).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.totalBookings}</div>
                <p className="text-xs text-muted-foreground">Sejak bergabung</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(customer.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Rata-rata {formatCurrency(customer.avgBookingValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.satisfactionScore}/5</div>
                <div className="flex items-center space-x-1">{renderStars(Math.floor(customer.satisfactionScore))}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-time Payment</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customer.onTimePayment}%</div>
                <Progress value={customer.onTimePayment} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="bookings">Riwayat Booking</TabsTrigger>
                  <TabsTrigger value="communications">Komunikasi</TabsTrigger>
                  <TabsTrigger value="documents">Dokumen</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Booking History Tab */}
                <TabsContent value="bookings" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Kendaraan</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Durasi</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Rating</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingHistory.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{booking.vehicle}</TableCell>
                            <TableCell>
                              {new Date(booking.startDate).toLocaleDateString("id-ID")} -{" "}
                              {new Date(booking.endDate).toLocaleDateString("id-ID")}
                            </TableCell>
                            <TableCell>{booking.duration}</TableCell>
                            <TableCell>{formatCurrency(booking.amount)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(booking.status)}>
                                {booking.status === "completed" ? "Selesai" : booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {renderStars(booking.rating)}
                                <span className="text-sm text-muted-foreground ml-2">({booking.rating})</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Communications Tab */}
                <TabsContent value="communications" className="space-y-4">
                  <div className="space-y-4">
                    {communications.map((comm) => (
                      <Card key={comm.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                {comm.type === "email" && <Mail className="h-4 w-4 text-primary" />}
                                {comm.type === "whatsapp" && <MessageSquare className="h-4 w-4 text-primary" />}
                                {comm.type === "phone" && <Phone className="h-4 w-4 text-primary" />}
                              </div>
                              <div>
                                <h4 className="font-medium">{comm.subject}</h4>
                                <p className="text-sm text-muted-foreground">{comm.content}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {new Date(comm.date).toLocaleDateString("id-ID")}
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {comm.status === "sent"
                                  ? "Terkirim"
                                  : comm.status === "delivered"
                                    ? "Diterima"
                                    : "Selesai"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Dokumen</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Tanggal Upload</TableHead>
                          <TableHead>Ukuran</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{doc.type}</Badge>
                            </TableCell>
                            <TableCell>{new Date(doc.uploadDate).toLocaleDateString("id-ID")}</TableCell>
                            <TableCell>{doc.size}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(customer.clv)}</div>
                        <p className="text-xs text-muted-foreground">Proyeksi nilai seumur hidup</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Booking Frequency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{customer.bookingFrequency}x</div>
                        <p className="text-xs text-muted-foreground">Per bulan rata-rata</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{Math.round(customer.satisfactionScore * 20)}%</div>
                        <Progress value={customer.satisfactionScore * 20} className="mt-2" />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Kendaraan Favorit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {customer.preferredVehicles.map((vehicle, index) => (
                            <div key={vehicle} className="flex items-center justify-between">
                              <span className="text-sm">{vehicle}</span>
                              <Badge variant="secondary">#{index + 1}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Metode Pembayaran</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Transfer Bank</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={customer.paymentMethods.transfer} className="w-20" />
                              <span className="text-sm font-medium">{customer.paymentMethods.transfer}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Cash</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={customer.paymentMethods.cash} className="w-20" />
                              <span className="text-sm font-medium">{customer.paymentMethods.cash}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Credit Card</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={customer.paymentMethods.credit} className="w-20" />
                              <span className="text-sm font-medium">{customer.paymentMethods.credit}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
