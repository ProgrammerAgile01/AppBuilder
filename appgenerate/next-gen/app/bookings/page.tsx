"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  CalendarIcon,
  Car,
  User,
  MapPin,
  Eye,
  Edit,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Phone,
  MessageSquare,
  Printer,
  MoreHorizontal,
  CalendarDays,
  DollarSign,
  Mail,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"
import { format, addDays, subDays } from "date-fns"
import { id } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { bookingsData } from "@/lib/sample-data"

// Status configuration with colors and icons
const statusConfig = {
  draft: {
    label: "Draft",
    labelId: "Draft",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 border-gray-200 dark:border-gray-800",
    icon: FileText,
  },
  pending: {
    label: "Pending Approval",
    labelId: "Menunggu Persetujuan",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
  active: {
    label: "Active",
    labelId: "Aktif",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    labelId: "Selesai",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    labelId: "Dibatalkan",
    color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-200 dark:border-red-800",
    icon: XCircle,
  },
}

const paymentStatusConfig = {
  pending: {
    label: "Pending",
    labelId: "Menunggu",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
  },
  paid: {
    label: "Paid",
    labelId: "Lunas",
    color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  },
  refunded: {
    label: "Refunded",
    labelId: "Dikembalikan",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  },
}

export default function BookingsPage() {
  const { language, t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  // Set date range yang lebih luas untuk menampilkan semua data
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // 30 hari yang lalu
    to: addDays(new Date(), 60), // 60 hari ke depan
  })

  // Filter bookings based on search, status, and date range
  const filteredBookings = useMemo(() => {
    console.log("Total bookings:", bookingsData.length)
    console.log("Search term:", searchTerm)
    console.log("Status filter:", statusFilter)
    console.log("Date range:", dateRange)

    return bookingsData.filter((booking) => {
      const matchesSearch =
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter

      // Lebih permisif dengan date range - jika tidak ada date range, tampilkan semua
      let matchesDateRange = true
      if (dateRange?.from && dateRange?.to) {
        const bookingDate = new Date(booking.startDate)
        matchesDateRange = bookingDate >= dateRange.from && bookingDate <= dateRange.to
      }

      console.log(`Booking ${booking.id}:`, {
        matchesSearch,
        matchesStatus,
        matchesDateRange,
        bookingDate: booking.startDate,
      })

      return matchesSearch && matchesStatus && matchesDateRange
    })
  }, [searchTerm, statusFilter, dateRange])

  // Get status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = { all: bookingsData.length }
    Object.keys(statusConfig).forEach((status) => {
      counts[status] = bookingsData.filter((b) => b.status === status).length
    })
    return counts
  }, [])

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const handleDownloadContract = (booking: any) => {
    console.log(`Downloading contract for ${booking.id}`)
  }

  const handleSendWhatsApp = (booking: any) => {
    const message = `Halo ${booking.customerName}, booking ${booking.id} Anda telah dikonfirmasi.`
    console.log(`Sending WhatsApp to ${booking.customerPhone}: ${message}`)
  }

  const StatusBadge = ({ status, size = "default" }: { status: string; size?: "default" | "sm" }) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon
    return (
      <Badge className={`${config.color} flex items-center gap-1 w-fit ${size === "sm" ? "text-xs px-2 py-1" : ""}`}>
        <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
        {language === "id" ? config.labelId : config.label}
      </Badge>
    )
  }

  const PaymentBadge = ({ status }: { status: string }) => {
    const config = paymentStatusConfig[status as keyof typeof paymentStatusConfig]
    if (!config) return null

    return <Badge className={`${config.color} text-xs`}>{language === "id" ? config.labelId : config.label}</Badge>
  }

  // Debug info
  console.log("Filtered bookings count:", filteredBookings.length)
  console.log("All bookings:", bookingsData)

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <TopNavbar />
        <main className="flex-1 space-y-6 p-4 md:p-6 custom-scrollbar bg-background text-foreground min-h-screen pb-24 md:pb-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {language === "id" ? "Manajemen Pemesanan" : "Booking Management"}
                </h1>
                <p className="text-muted-foreground">
                  {language === "id"
                    ? "Kelola semua pemesanan kendaraan rental dengan mudah"
                    : "Manage all vehicle rental bookings with ease"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  {language === "id" ? "Ekspor" : "Export"}
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  {language === "id" ? "Filter" : "Filter"}
                </Button>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {language === "id" ? "Pemesanan Baru" : "New Booking"}
                </Button>
              </div>
            </div>

            {/* Search and Date Range */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={
                      language === "id"
                        ? "Cari berdasarkan nama pelanggan atau kode booking..."
                        : "Search by customer name or booking code..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd", { locale: language === "id" ? id : undefined })} -{" "}
                            {format(dateRange.to, "LLL dd", { locale: language === "id" ? id : undefined })}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd", { locale: language === "id" ? id : undefined })
                        )
                      ) : (
                        <span>{language === "id" ? "Pilih tanggal" : "Pick a date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={() => setDateRange(undefined)} className="bg-transparent">
                  {language === "id" ? "Reset" : "Reset"}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-muted/50">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                {language === "id" ? "Semua" : "All"} ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="draft" className="text-xs md:text-sm">
                {language === "id" ? "Draft" : "Draft"} ({statusCounts.draft || 0})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs md:text-sm">
                {language === "id" ? "Pending" : "Pending"} ({statusCounts.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs md:text-sm">
                {language === "id" ? "Aktif" : "Active"} ({statusCounts.active || 0})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs md:text-sm">
                {language === "id" ? "Selesai" : "Done"} ({statusCounts.completed || 0})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs md:text-sm">
                {language === "id" ? "Batal" : "Cancelled"} ({statusCounts.cancelled || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{language === "id" ? "Daftar Pemesanan" : "Bookings List"}</span>
                      <Badge variant="outline">
                        {filteredBookings.length} {language === "id" ? "booking" : "bookings"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {language === "id"
                        ? `Menampilkan ${filteredBookings.length} dari ${bookingsData.length} pemesanan`
                        : `Showing ${filteredBookings.length} of ${bookingsData.length} bookings`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{language === "id" ? "Kode Booking" : "Booking Code"}</TableHead>
                            <TableHead>{language === "id" ? "Nama Pelanggan" : "Customer Name"}</TableHead>
                            <TableHead>{language === "id" ? "Tanggal Rental" : "Rental Date"}</TableHead>
                            <TableHead>{language === "id" ? "Durasi" : "Duration"}</TableHead>
                            <TableHead>{language === "id" ? "Status" : "Status"}</TableHead>
                            <TableHead className="text-right">{language === "id" ? "Aksi" : "Actions"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((booking) => (
                            <TableRow
                              key={booking.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleViewBooking(booking)}
                            >
                              <TableCell className="font-medium">{booking.id}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{booking.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{booking.vehicle}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{format(new Date(booking.startDate), "dd MMM yyyy")}</div>
                                  <div className="text-muted-foreground">
                                    {language === "id" ? "s/d" : "to"} {format(new Date(booking.endDate), "dd MMM")}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{booking.duration}</TableCell>
                              <TableCell>
                                <StatusBadge status={booking.status} size="sm" />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewBooking(booking)
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
                    onClick={() => handleViewBooking(booking)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg">{booking.id}</div>
                          <StatusBadge status={booking.status} size="sm" />
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            {booking.vehicle} - {booking.plateNumber}
                          </div>
                        </div>

                        {/* Rental Period */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {format(new Date(booking.startDate), "dd MMM")} -{" "}
                            {format(new Date(booking.endDate), "dd MMM")}
                          </div>
                          <div className="text-muted-foreground">({booking.duration})</div>
                        </div>

                        {/* Price and Payment */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 font-medium text-primary">
                            <DollarSign className="h-4 w-4" />
                            Rp {booking.totalPrice.toLocaleString("id-ID")}
                          </div>
                          <PaymentBadge status={booking.paymentStatus} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewBooking(booking)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            {language === "id" ? "Detail" : "View Detail"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-transparent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-3 w-3" />
                            {language === "id" ? "Edit" : "Edit"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredBookings.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {language === "id" ? "Tidak ada booking ditemukan" : "No bookings found"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {language === "id"
                        ? "Coba ubah filter atau buat booking baru"
                        : "Try adjusting your filters or create a new booking"}
                    </p>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      {language === "id" ? "Buat Booking Baru" : "Create New Booking"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Booking Detail Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === "id" ? "Detail Pemesanan" : "Booking Details"}
                </DialogTitle>
                <DialogDescription>
                  {selectedBooking && `${language === "id" ? "Kode Booking:" : "Booking Code:"} ${selectedBooking.id}`}
                </DialogDescription>
              </DialogHeader>

              {selectedBooking && (
                <div className="space-y-6">
                  {/* Status and Actions Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <StatusBadge status={selectedBooking.status} />
                      <PaymentBadge status={selectedBooking.paymentStatus} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Printer className="h-4 w-4" />
                        {language === "id" ? "Cetak" : "Print"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        onClick={() => handleSendWhatsApp(selectedBooking)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      {selectedBooking.contractFile && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          onClick={() => handleDownloadContract(selectedBooking)}
                        >
                          <Download className="h-4 w-4" />
                          {language === "id" ? "Kontrak" : "Contract"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="h-5 w-5" />
                          {language === "id" ? "Informasi Pelanggan" : "Customer Information"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Nama Lengkap" : "Full Name"}
                          </Label>
                          <p className="font-medium">{selectedBooking.customerName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Nomor Telepon" : "Phone Number"}
                          </Label>
                          <p className="font-medium flex items-center gap-2">
                            {selectedBooking.customerPhone}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Phone className="h-3 w-3" />
                            </Button>
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="font-medium flex items-center gap-2">
                            {selectedBooking.customerEmail}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Mail className="h-3 w-3" />
                            </Button>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vehicle Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Car className="h-5 w-5" />
                          {language === "id" ? "Informasi Kendaraan" : "Vehicle Information"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Kendaraan" : "Vehicle"}
                          </Label>
                          <p className="font-medium">{selectedBooking.vehicle}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Plat Nomor" : "Plate Number"}
                          </Label>
                          <p className="font-medium">{selectedBooking.plateNumber}</p>
                        </div>
                        {selectedBooking.vehicleDetails && (
                          <>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                {language === "id" ? "Tahun" : "Year"}
                              </Label>
                              <p className="font-medium">{selectedBooking.vehicleDetails.year}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                {language === "id" ? "Transmisi" : "Transmission"}
                              </Label>
                              <p className="font-medium">{selectedBooking.vehicleDetails.transmission}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Dengan Driver" : "With Driver"}
                          </Label>
                          <p className="font-medium">
                            {selectedBooking.withDriver
                              ? language === "id"
                                ? "Ya"
                                : "Yes"
                              : language === "id"
                                ? "Tidak"
                                : "No"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rental Period */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CalendarIcon className="h-5 w-5" />
                          {language === "id" ? "Periode Rental" : "Rental Period"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Tanggal Mulai" : "Start Date"}
                          </Label>
                          <p className="font-medium">
                            {format(new Date(selectedBooking.startDate), "EEEE, dd MMMM yyyy", {
                              locale: language === "id" ? id : undefined,
                            })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Tanggal Selesai" : "End Date"}
                          </Label>
                          <p className="font-medium">
                            {format(new Date(selectedBooking.endDate), "EEEE, dd MMMM yyyy", {
                              locale: language === "id" ? id : undefined,
                            })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Durasi" : "Duration"}
                          </Label>
                          <p className="font-medium">{selectedBooking.duration}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location & Payment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MapPin className="h-5 w-5" />
                          {language === "id" ? "Lokasi & Pembayaran" : "Location & Payment"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Lokasi Penjemputan" : "Pickup Location"}
                          </Label>
                          <p className="font-medium">{selectedBooking.pickupLocation}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Lokasi Pengembalian" : "Drop-off Location"}
                          </Label>
                          <p className="font-medium">{selectedBooking.dropoffLocation}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Metode Pembayaran" : "Payment Method"}
                          </Label>
                          <p className="font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {selectedBooking.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Total Pembayaran" : "Total Payment"}
                          </Label>
                          <p className="text-2xl font-bold text-primary">
                            Rp {selectedBooking.totalPrice.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Price Breakdown */}
                  {selectedBooking.pricing && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <DollarSign className="h-5 w-5" />
                          {language === "id" ? "Rincian Biaya" : "Price Breakdown"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {language === "id" ? "Harga Sewa" : "Rental Rate"} (
                              {selectedBooking.pricing.dailyRate.toLocaleString("id-ID")}/
                              {language === "id" ? "hari" : "day"} x {selectedBooking.pricing.totalDays})
                            </span>
                            <span>Rp {selectedBooking.pricing.subtotal.toLocaleString("id-ID")}</span>
                          </div>
                          {selectedBooking.pricing.driverFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {language === "id" ? "Biaya Driver" : "Driver Fee"}
                              </span>
                              <span>Rp {selectedBooking.pricing.driverFee.toLocaleString("id-ID")}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {language === "id" ? "Asuransi" : "Insurance"}
                            </span>
                            <span>Rp {selectedBooking.pricing.insurance.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{language === "id" ? "Pajak" : "Tax"}</span>
                            <span>Rp {selectedBooking.pricing.tax.toLocaleString("id-ID")}</span>
                          </div>
                          {selectedBooking.pricing.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>{language === "id" ? "Diskon" : "Discount"}</span>
                              <span>- Rp {selectedBooking.pricing.discount.toLocaleString("id-ID")}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t pt-2 font-bold">
                            <span>{language === "id" ? "Total" : "Total"}</span>
                            <span className="text-primary">
                              Rp {selectedBooking.pricing.totalAmount.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Driver Information */}
                  {selectedBooking.driverInfo && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="h-5 w-5" />
                          {language === "id" ? "Informasi Driver" : "Driver Information"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Nama Driver" : "Driver Name"}
                          </Label>
                          <p className="font-medium">{selectedBooking.driverInfo.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Nomor Telepon" : "Phone Number"}
                          </Label>
                          <p className="font-medium flex items-center gap-2">
                            {selectedBooking.driverInfo.phone}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Phone className="h-3 w-3" />
                            </Button>
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {language === "id" ? "Pengalaman" : "Experience"}
                          </Label>
                          <p className="font-medium">{selectedBooking.driverInfo.experience}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  {selectedBooking.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          {language === "id" ? "Catatan" : "Notes"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{selectedBooking.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </SidebarInset>
    </>
  )
}
