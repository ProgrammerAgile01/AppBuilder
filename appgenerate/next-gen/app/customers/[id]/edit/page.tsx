"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Upload, X, Plus, Save, User, Building, MapPin, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useRouter, useParams } from "next/navigation"

const provinces = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Banten",
  "Yogyakarta",
  "Bali",
  "Sumatera Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
]

// Sample existing customer data
const existingCustomer = {
  firstName: "Ahmad",
  lastName: "Wijaya",
  email: "ahmad.wijaya@email.com",
  phone: "+62 812-3456-7890",
  dateOfBirth: "1985-05-15",
  gender: "male",
  idNumber: "3171051505850001",
  companyName: "PT Maju Jaya",
  position: "General Manager",
  industry: "technology",
  companyPhone: "+62 21-1234-5678",
  companyEmail: "info@majujaya.com",
  taxNumber: "12.345.678.9-012.345",
  street: "Jl. Sudirman No. 123, RT/RW 01/02",
  city: "Jakarta",
  province: "DKI Jakarta",
  postalCode: "10110",
  country: "Indonesia",
  notes: "Pelanggan setia dengan track record pembayaran yang baik. Sering booking untuk kebutuhan bisnis.",
  referralSource: "website",
  creditLimit: "50000000",
  paymentTerms: "30",
  allowMarketing: true,
  allowNotifications: true,
  preferredContact: "email",
  language: "id",
  avatar: "/placeholder.svg?height=100&width=100",
  tags: ["VIP", "Corporate", "Regular"],
  status: "active",
  type: "corporate",
}

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState("personal")
  const [customerType, setCustomerType] = useState(existingCustomer.type)
  const [avatar, setAvatar] = useState<string | null>(existingCustomer.avatar)
  const [tags, setTags] = useState<string[]>(existingCustomer.tags)
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState(existingCustomer)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    router.push(`/customers/${params.id}`)
  }

  const getInitials = () => {
    return `${formData.firstName[0] || ""}${formData.lastName[0] || ""}`.toUpperCase()
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
                <BreadcrumbLink href={`/customers/${params.id}`}>
                  {formData.firstName} {formData.lastName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/customers/${params.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Pelanggan</h1>
                <p className="text-muted-foreground">Update informasi pelanggan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push(`/customers/${params.id}`)}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Customer Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Tipe Pelanggan</CardTitle>
              <CardDescription>Ubah tipe pelanggan jika diperlukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${customerType === "individual" ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setCustomerType("individual")}
                >
                  <CardContent className="flex items-center space-x-3 p-4">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Individual</h3>
                      <p className="text-sm text-muted-foreground">Pelanggan perorangan</p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${customerType === "corporate" ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setCustomerType("corporate")}
                >
                  <CardContent className="flex items-center space-x-3 p-4">
                    <Building className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Corporate</h3>
                      <p className="text-sm text-muted-foreground">Pelanggan perusahaan</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Main Form */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Personal</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="company"
                    className="flex items-center space-x-2"
                    disabled={customerType === "individual"}
                  >
                    <Building className="h-4 w-4" />
                    <span>Perusahaan</span>
                  </TabsTrigger>
                  <TabsTrigger value="address" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Alamat</span>
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Tambahan</span>
                  </TabsTrigger>
                </TabsList>

                {/* Personal Info Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatar || ""} />
                        <AvatarFallback className="text-lg">{getInitials() || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Label htmlFor="avatar-upload">
                          <Button variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">
                              <Upload className="mr-2 h-4 w-4" />
                              Ganti Foto
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nama Depan *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Masukkan nama depan"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nama Belakang *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Masukkan nama belakang"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+62 812-3456-7890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Jenis Kelamin</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Laki-laki</SelectItem>
                          <SelectItem value="female">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">Nomor KTP *</Label>
                      <Input
                        id="idNumber"
                        value={formData.idNumber}
                        onChange={(e) => handleInputChange("idNumber", e.target.value)}
                        placeholder="1234567890123456"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Company Info Tab */}
                <TabsContent value="company" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nama Perusahaan *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        placeholder="PT Example Company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Jabatan</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleInputChange("position", e.target.value)}
                        placeholder="Manager, Director, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industri</Label>
                      <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih industri" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Teknologi</SelectItem>
                          <SelectItem value="finance">Keuangan</SelectItem>
                          <SelectItem value="healthcare">Kesehatan</SelectItem>
                          <SelectItem value="education">Pendidikan</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufaktur</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxNumber">NPWP</Label>
                      <Input
                        id="taxNumber"
                        value={formData.taxNumber}
                        onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                        placeholder="12.345.678.9-012.345"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Telepon Perusahaan</Label>
                      <Input
                        id="companyPhone"
                        value={formData.companyPhone}
                        onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                        placeholder="+62 21-1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Email Perusahaan</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={formData.companyEmail}
                        onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                        placeholder="company@example.com"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Address Tab */}
                <TabsContent value="address" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="street">Alamat Lengkap *</Label>
                    <Textarea
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      placeholder="Jl. Contoh No. 123, RT/RW 01/02"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Kota *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Jakarta"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Provinsi *</Label>
                      <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Kode Pos *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Negara</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        disabled
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Additional Info Tab */}
                <TabsContent value="additional" className="space-y-6">
                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tambah tag..."
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Catatan tambahan tentang pelanggan..."
                      rows={4}
                    />
                  </div>

                  {/* Business Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit">Limit Kredit (IDR)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => handleInputChange("creditLimit", e.target.value)}
                        placeholder="10000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">Termin Pembayaran (Hari)</Label>
                      <Select
                        value={formData.paymentTerms}
                        onValueChange={(value) => handleInputChange("paymentTerms", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Cash</SelectItem>
                          <SelectItem value="7">7 Hari</SelectItem>
                          <SelectItem value="14">14 Hari</SelectItem>
                          <SelectItem value="30">30 Hari</SelectItem>
                          <SelectItem value="60">60 Hari</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Communication Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preferensi Komunikasi</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowMarketing">Terima Email Marketing</Label>
                        <Switch
                          id="allowMarketing"
                          checked={formData.allowMarketing}
                          onCheckedChange={(checked) => handleInputChange("allowMarketing", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowNotifications">Terima Notifikasi</Label>
                        <Switch
                          id="allowNotifications"
                          checked={formData.allowNotifications}
                          onCheckedChange={(checked) => handleInputChange("allowNotifications", checked)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredContact">Kontak Preferensi</Label>
                        <Select
                          value={formData.preferredContact}
                          onValueChange={(value) => handleInputChange("preferredContact", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Telepon</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Bahasa</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => handleInputChange("language", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="id">Bahasa Indonesia</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
