"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit, Calendar, MapPin, Fuel, Users, Settings, Car, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { sampleVehicles, type Vehicle } from "@/lib/vehicle-data"
import Image from "next/image"
import Link from "next/link"

function VehicleDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const vehicleId = params.id as string

    // Redirect to new vehicle page if the ID is "new"
    if (vehicleId === "new") {
      router.replace("/vehicles/new")
      return
    }

    // Skip processing for "edit" route
    if (vehicleId === "edit") {
      return
    }

    // Find the vehicle by ID
    const foundVehicle = sampleVehicles.find((v) => v.id === vehicleId)
    setVehicle(foundVehicle || null)
    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vehicle details...</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  if (!vehicle) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 h-7 w-7 border border-white/20 text-white hover:bg-white/10 hover:text-white dark:border-white/30 dark:text-white dark:hover:bg-white/20 dark:hover:text-white" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/vehicles" className="text-muted-foreground hover:text-foreground">
                  Vehicle Management
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground">Vehicle Not Found</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Vehicle Not Found</h2>
            <p className="text-muted-foreground mb-4">The vehicle you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/vehicles")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vehicles
            </Button>
          </div>
        </div>
      </SidebarInset>
    )
  }

  const getStatusColor = (status: Vehicle["status"]) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "Rented":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Out of Service":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1 h-7 w-7 border border-white/20 text-white hover:bg-white/10 hover:text-white dark:border-white/30 dark:text-white dark:hover:bg-white/20 dark:hover:text-white" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/vehicles" className="text-muted-foreground hover:text-foreground">
                Vehicle Management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground">
                {vehicle.brand} {vehicle.model}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/vehicles")}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vehicles
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-muted-foreground">{vehicle.plateNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Vehicle
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Images */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Vehicle Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    vehicle.images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image || "/placeholder.svg?height=300&width=400&text=Vehicle+Image"}
                          alt={`${vehicle.brand} ${vehicle.model} - Image ${index + 1}`}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <Car className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No images available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {vehicle.description || "No description available for this vehicle."}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features && vehicle.features.length > 0 ? (
                    vehicle.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No features listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Details Sidebar */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium text-foreground">{vehicle.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium text-foreground">{vehicle.year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium text-foreground">{vehicle.color}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{vehicle.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="font-medium text-foreground">{vehicle.fuelType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-medium text-foreground">{vehicle.transmission}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-medium text-foreground">{vehicle.seats}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{formatCurrency(vehicle.dailyRate)}</p>
                  <p className="text-sm text-muted-foreground">per day</p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Vehicle Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge className={getStatusColor(vehicle.status)}>{vehicle.status}</Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="font-medium text-foreground">{vehicle.mileage.toLocaleString()} km</p>
                </div>

                {vehicle.lastMaintenance && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Maintenance</p>
                    <p className="font-medium text-foreground">{vehicle.lastMaintenance}</p>
                  </div>
                )}

                {vehicle.nextMaintenance && (
                  <div>
                    <p className="text-sm text-muted-foreground">Next Maintenance</p>
                    <p className="font-medium text-foreground">{vehicle.nextMaintenance}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insurance Information */}
            {vehicle.insurance && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium text-foreground">{vehicle.insurance.provider}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Policy Number</p>
                    <p className="font-medium text-foreground">{vehicle.insurance.policyNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium text-foreground">{vehicle.insurance.expiryDate}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}

export default function VehicleDetailPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <VehicleDetailContent />
    </SidebarProvider>
  )
}
