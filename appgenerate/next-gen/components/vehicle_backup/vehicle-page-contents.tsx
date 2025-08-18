"use client";

import {
  Car,
  Circle,
  Edit,
  Eye,
  Fuel,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { type Vehicle } from "@/lib/vehicle-data";

// Header
export function VehicleHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-4 px-4 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Vehicle Management
          </h1>
          <p className="text-muted-foreground">Manage your fleet of vehicles</p>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Vehicle
        </Button>
      </div>
    </div>
  );
}

// Filter
export function VehicleFilters({
  searchTerm,
  setSearchTerm,
}: // statusFilter,
// setStatusFilter,
// typeFilter,
// setTypeFilter,
{
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  // statusFilter: string;
  // setStatusFilter: (val: string) => void;
  // typeFilter: string;
  // setTypeFilter: (val: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-foreground placeholder:text-muted-foreground"
            />
            <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
          <div className="flex gap-2">
            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Rented">Rented</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Out of Service">Out of Service</SelectItem>
              </SelectContent>
            </Select> */}
            {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Car">Car</SelectItem>
                <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                <SelectItem value="Truck">Truck</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
              </SelectContent>
            </Select>; */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultsInfo({
  total,
  currentPage,
  itemsPerPage,
}: {
  total: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, total)} of{" "}
        {total} Vehicle
      </p>
    </div>
  );
}

// Mobile View (SOON)
{
  /* export function MobileVehicleCard({
  vehicles,
  handleDelete,
  handleView,
}: {
  vehicles: Record<string, any>;
  handleDelete: (id: string) => void;
  handleView: (id: string) => void;
}) {
  const router = useRouter();
  return (
    
    // masih dummy bisa disesuaikan
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Image
            src={items.images[0] || "/placeholder.svg"}
            alt={`${items.nama}`}
            width={100}
            height={75}
            className="w-24 h-18 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-sm truncate text-foreground">
                  {items.name}
                </h3>
                <p className="text-xs text-muted-foreground">{items.deskripsi}</p>
              </div>
              <Badge className={`text-xs`}>{items.status}</Badge>
            </div>

            // lanjutt
          </div>
        </div>
      </CardContent>
    </Card>
  )
} */
}

// desktop View
export function VehicleTable({
  handleView,
  handleDelete,
  filteredVehicle,
}: {
  handleView: (id: string) => void;
  handleDelete: (id: string) => void;
  filteredVehicle: Record<string, any>;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Vehicle</TableHead>
              <TableHead className="text-foreground">Type</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Daily Rate</TableHead>

              <TableHead className="text-right text-foreground">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicle.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="text-left">
                  <div className="text-left flex gap-3">
                    <Image
                      src={item.front_photo_url || "/placeholder.svg"}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {item.model}
                      </div>
                      <div className="text-sm font-normal text-gray-900">
                        {item.plate_number}
                      </div>
                      <div className="text-sm font-normal text-gray-900">
                        {item.year}
                      </div>
                      <div className="text-sm font-normal text-gray-900">
                        {item.color}
                      </div>
                      <div className="text-sm font-normal text-gray-900">
                        {item.location}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.vehicle_type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  {(() => {
                    switch (item.status) {
                      case "Available":
                        return (
                          <Badge className="bg-green-100 text-green-700">
                            Available
                          </Badge>
                        );
                      case "Rented":
                        return (
                          <Badge className="bg-blue-100 text-blue-700">
                            Rented
                          </Badge>
                        );
                      case "Maintenance":
                        return (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            Maintenance
                          </Badge>
                        );
                      case "Out Of Service":
                        return (
                          <Badge className="bg-red-100 text-red-700">
                            Out Of Service
                          </Badge>
                        );

                      default:
                        return item.status;
                    }
                  })()}
                </TableCell>
                <TableCell className="text-left">
                  <div className="font-bold text-blue-600">
                    Rp {item.daily_rate}/day
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* show */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(item.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* edit */}
                    <Link href={`/vehicle/edit/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data</AlertDialogTitle>
                          <AlertDialogDescription>
                            Yakin ingin menghapus data ini?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
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
      </CardContent>
    </Card>
  );
}
