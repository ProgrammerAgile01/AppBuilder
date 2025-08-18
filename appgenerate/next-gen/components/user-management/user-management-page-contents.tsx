"use client";

import { Car, Edit, Eye, Fuel, MapPin, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { type Vehicle } from "@/lib/vehicle-data";

// Header
export function UserManagementHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-4 px-4 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their access</p>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Tambah User Management
        </Button>
      </div>
    </div>
  );
}

// Filter
export function UserManagementFilters({
  searchTerm,
  setSearchTerm,
  // statusFilter,
  // setStatusFilter,
  // typeFilter,
  // setTypeFilter,
}: {
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
  )
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
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, total)} of {total} User Management
      </p>
    </div>
  );
}

// Mobile View (SOON)
{/* export function MobileUserManagementCard({
  userManagement,
  handleDelete,
  handleView,
}: {
  userManagement: Record<string, any>;
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
} */}

// desktop View
export function UserManagementTable({
  handleView,
  handleDelete,
  filteredUserManagement
}: {
  handleView: (id: string) => void;
  handleDelete: (id: string) => void;
  filteredUserManagement: Record<string, any>;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-foreground'>Nama</TableHead>
<TableHead className='text-foreground'>Email</TableHead>
<TableHead className='text-foreground'>Nomor Telepon</TableHead>
<TableHead className='text-foreground'>Role</TableHead>
<TableHead className='text-foreground'>Status</TableHead>
<TableHead className='text-foreground'>Foto</TableHead>

              <TableHead className="text-right text-foreground">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { filteredUserManagement.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.nama}</TableCell>
<TableCell>{item.email}</TableCell>
<TableCell>{item.nomor_telp}</TableCell>
<TableCell>{item.role}</TableCell>
<TableCell>{item.status}</TableCell>
<TableCell>{item.foto}</TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* show */}
                    <Button variant="outline" size="sm" onClick={() => handleView(item.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* edit */}
                    <Link href={`/user-management/edit/${item.id}`}>
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
                          <AlertDialogAction onClick={() => handleDelete(item.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

