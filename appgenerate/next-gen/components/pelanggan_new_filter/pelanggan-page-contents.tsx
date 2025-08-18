"use client";

import {
  Car,
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

// NOTE: Tambahkan interface ini untuk konfigurasi filter
export interface ColumnFilterConfig {
  id: string;
  nama_kolom: string;
  label_id: string;
  tipe_input: string;
  enum_values: string[];
}

// Header
export function PelangganHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-4 px-4 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pelanggan</h1>
          <p className="text-muted-foreground">ini tabel pelanggan</p>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>
    </div>
  );
}

// Filter yang sudah diperbaiki
export function PelangganFilters({
  searchTerm,
  setSearchTerm,
  filterConfigs,
  filters,
  onFilterChange,
}: {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterConfigs: ColumnFilterConfig[];
  filters: Record<string, string>;
  onFilterChange: (filterName: string, value: string) => void;
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
            {/* Render filter dinamis */}
            {filterConfigs.map((filter) => (
              <Select
                key={filter.id}
                value={filters[filter.nama_kolom] || "all"}
                onValueChange={(value) =>
                  onFilterChange(filter.nama_kolom, value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={`Semua ${filter.label_id}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua {filter.label_id}</SelectItem>
                  {filter.enum_values &&
                    filter.enum_values.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ResultsInfo
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
        {total} Pelanggan
      </p>
    </div>
  );
}

// Table
export function PelangganTable({
  handleView,
  handleDelete,
  filteredPelanggan,
}: {
  handleView: (id: string) => void;
  handleDelete: (id: string) => void;
  filteredPelanggan: Record<string, any>[];
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Nama</TableHead>
              <TableHead className="text-right text-foreground">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPelanggan.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.nama}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(item.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/pelanggan/edit/${item.id}`}>
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
