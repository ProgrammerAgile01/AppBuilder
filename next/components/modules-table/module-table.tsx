"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchData, deleteData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Sparkles,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Database,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Code,
  BarChart3,
  Package as PackageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export function ModulesTable() {
  const router = useRouter();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFetchData = async (showRefreshing = false) => {
    try {
      showRefreshing ? setRefreshing(true) : setLoading(true);
      const data = await fetchData("modules");
      setModules(data);
    } catch {
      toast({
        title: "Error",
        description: "Gagal memuat data modul.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const filteredModules = modules.filter((mod) => {
    const matchesSearch =
      mod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.menuTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.tableName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || mod.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const paginatedModules = filteredModules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleDelete = async () => {
    if (!moduleToDelete) return;
    try {
      await deleteData("modules", moduleToDelete.id);
      toast({ title: "Berhasil", description: "Modul berhasil dihapus." });
      handleFetchData();
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghapus modul.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setModuleToDelete(null);
    }
  };

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-800 border-green-200",
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    archived: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Atas */}
      <div className="flex justify-end">
        <Button
          onClick={() => router.push("/admin/modules/create")}
          className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-md">
              <Plus className="h-4 w-4" />
            </div>
            <span>Buat Modul Baru</span>
            <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Button>
      </div>

      {/* Statistik Kartu */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Total Modul
            </CardTitle>
            <Code className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs opacity-80">Semua modul dalam sistem</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Published
            </CardTitle>
            <Eye className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.filter((m) => m.status === "published").length}
            </div>
            <p className="text-xs opacity-80">Modul yang aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Draft
            </CardTitle>
            <Edit className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.filter((m) => m.status === "draft").length}
            </div>
            <p className="text-xs opacity-80">Modul dalam pengembangan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-lg">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Archived
            </CardTitle>
            <PackageIcon className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.filter((m) => m.status === "archived").length}
            </div>
            <p className="text-xs opacity-80">Modul diarsipkan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Total Kolom
            </CardTitle>
            <BarChart3 className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.reduce((acc, curr) => acc + (curr.totalColumns || 0), 0)}
            </div>
            <p className="text-xs opacity-80">
              Kolom database dari semua modul
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Cari..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => handleFetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Modul</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Kolom</TableHead>
                <TableHead>Total Statistik</TableHead>
                <TableHead>Terakhir Update</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">
                    <div>{module.name}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Database className="h-4 w-4" />
                        <span>{module.totalColumns ?? 0} cols</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{module.totalStats ?? 0} stats</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code>{module.tableName}</code>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[module.status]}>
                      {module.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{module.totalColumns ?? 0}</TableCell>
                  <TableCell>{module.totalStats ?? 0}</TableCell>
                  <TableCell>{formatDate(module.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/modules/view/${module.id}`)
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/modules/edit/${module.id}`)
                          }
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setModuleToDelete(module);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan{" "}
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              filteredModules.length
            )}{" "}
            - {Math.min(currentPage * itemsPerPage, filteredModules.length)}{" "}
            dari {filteredModules.length} entri
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Modul</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus modul{" "}
              <strong>{moduleToDelete?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
