"use client";

import { useEffect, useState } from "react";
import {
  fetchData,
  deleteData,
  fetchStats,
  generate,
  deletedBuilder,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

import {
  Layers,
  Sparkles,
  Plus,
  Loader2,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Grid3X3,
  List,
  RefreshCw,
  Code,
  Package,
  BarChart3,
} from "lucide-react";

import { BuilderTrash } from "./builder-trash";

const ENTITY = "builder";

type Builder = {
  id: string;
  kategoriCrud: "utama" | "pendukung";
  name: string;
  menuTitle: string;
  tableName: string;
  description?: string;
  totalCategories: number;
  totalColumns: number;
  totalStats: number;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  moduleGroup?: string;
};

type BuilderStats = {
  total_builders: number;
  published_builders: number;
  draft_builders: number;
  archived_builders: number;
  total_columns: number;
};

const statusColors = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
};

export function CrudBuilderDashboard() {
  const router = useRouter();
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [stats, setStats] = useState<BuilderStats>({
    total_builders: 0,
    published_builders: 0,
    draft_builders: 0,
    archived_builders: 0,
    total_columns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [builderToDelete, setBuilderToDelete] = useState<Builder | null>(null);

  const [showTrash, setShowTrash] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const loadData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const all = await fetchData(ENTITY);
      const statsData = await fetchStats(ENTITY);

      const filtered = all.filter((builder: Builder) => {
        const matchSearch =
          !searchQuery ||
          builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          builder.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (builder.description ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchStatus =
          statusFilter === "all" || builder.status === statusFilter;

        return matchSearch && matchStatus;
      });

      setBuilders(filtered);
      setStats(statsData);
    } catch (error) {
      console.error("Load Error:", error);
      setBuilders([]);
      toast({
        title: "Error",
        description: "Gagal memuat data builder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!builderToDelete) return;
    try {
      await deleteData(ENTITY, builderToDelete.id);
      toast({
        title: "Berhasil",
        description: `Builder "${builderToDelete.name}" berhasil dipindahkan ke sampah`,
      });
      loadData();
      fetchDeletedCount();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal hapus builder",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBuilderToDelete(null);
    }
  };

  // count deleted builder
  const fetchDeletedCount = async () => {
    try {
      const response = await deletedBuilder("builder");
      setDeletedCount(response.total);
    } catch (error) {
      console.error("Error fetching deleted count:", error);
    }
  };

  const handleDuplicate = async (builder: Builder) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/${ENTITY}/${builder.id}/duplicate`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Duplicate failed");
      toast({ title: "Duplikasi berhasil" });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal duplikasi",
        variant: "destructive",
      });
    }
  };

  // --- FUNGSI BARU UNTUK GENERATE BUILDER ---
  const handleGenerate = async (builderId: string) => {
    try {
      // Panggilan API pertama untuk generate.
      // builderId dilewatkan sebagai parameter URL.
      await generate("builder", builderId);

      // ... (opsional: kode untuk update status)

      toast({
        title: "Berhasil!",
        description: `Proses generate untuk builder ID: ${builderId} berhasil.`,
      });
      loadData(true);
    } catch (error) {
      console.error("Generate Error:", error);
      toast({
        title: "Error",
        description: "Gagal menjalankan proses generate.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
    fetchDeletedCount();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => loadData(), 500);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-slate-600">Memuat data builder...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            CRUD Builder
          </h2>
          <p className="text-slate-600 mt-1">Kelola builder CRUD dinamis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowTrash(true)}
            className="relative border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sampah
            <Badge className="ml-2 bg-red-100 text-red-700 border-red-200">
              {deletedCount}
            </Badge>
          </Button>
          <Button
            onClick={() => router.push("/admin/builder/create")}
            className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <div className="p-1 bg-white/20 rounded-md">
                <Plus className="h-4 w-4" />
              </div>
              <span>Buat Builder Baru</span>
              <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Button>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Builder"
          value={stats.total_builders}
          icon={<Code />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Published"
          value={stats.published_builders}
          icon={<Eye />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Draft"
          value={stats.draft_builders}
          icon={<Edit />}
          color="from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Archived"
          value={stats.archived_builders}
          icon={<Package />}
          color="from-gray-500 to-gray-600"
        />
        <StatCard
          title="Total Kolom"
          value={stats.total_columns}
          icon={<BarChart3 />}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Filter & Controls */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari builder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-r-none ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : ""
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-l-none ${
                  viewMode === "list" ? "bg-blue-600 text-white" : ""
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Builder Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }
      >
        {builders.map((builder) => (
          <Card
            key={builder.id}
            className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {builder.name}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {builder.tableName}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/builder/view/${builder.id}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/builder/edit/${builder.id}`)
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(builder)}>
                      <Copy className="mr-2 h-4 w-4" /> Duplikasi
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setBuilderToDelete(builder);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    statusColors[builder.status] ??
                    "bg-slate-100 text-slate-800 border-slate-200"
                  }
                >
                  {builder.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    builder.kategoriCrud === "utama"
                      ? "bg-purple-50 text-purple-800 border-purple-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }
                >
                  {builder.kategoriCrud === "utama" ? "Utama" : "Pendukung"}
                </Badge>
                {/* ---------------------------------------------------- */}
              </div>
              {builder.description && (
                <p className="text-sm text-slate-600 line-clamp-2">
                  {builder.description}
                </p>
              )}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <Layers className="h-4 w-4 text-slate-500 mb-1" />
                  <div className="text-lg font-semibold text-slate-900">
                    {builder.totalCategories}
                  </div>
                  <div className="text-xs text-slate-500">Kategori</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Grid3X3 className="h-4 w-4 text-slate-500 mb-1" />
                  <div className="text-lg font-semibold text-slate-900">
                    {builder.totalColumns}
                  </div>
                  <div className="text-xs text-slate-500">Kolom</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-4 w-4 text-slate-500 mb-1" />
                  <div className="text-lg font-semibold text-slate-900">
                    {builder.totalStats}
                  </div>
                  <div className="text-xs text-slate-500">Statistik</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/builder/view/${builder.id}`)
                  }
                  className="flex-1 border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/builder/edit/${builder.id}`)
                  }
                  className="group flex-1 border-slate-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-200"
                >
                  <div className="relative flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                    <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-emerald-500" />
                  </div>
                </Button>
                {builder.status !== "published" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate(builder.id)}
                    className="group flex-1 border-slate-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:border-teal-200"
                  >
                    <div className="relative flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Generate</span>
                      <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-cyan-500" />
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Builder</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus builder "{builderToDelete?.name}
              "? Builder akan dipindahkan ke sampah dan dapat dipulihkan
              kembali.
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
      {/* Builder Trash Modal */}
      {showTrash && (
        <BuilderTrash
          onClose={() => {
            setShowTrash(false);
            // fetchData();
            // fetchDeletedCount();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      className={`border-0 shadow-lg bg-gradient-to-br ${color} text-white`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-90">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs opacity-80">Total {title.toLowerCase()}</p>
      </CardContent>
    </Card>
  );
}
