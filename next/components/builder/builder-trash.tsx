"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  RefreshCw,
  RotateCcw,
  Trash2,
  Loader2,
  Code,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { restore, forceDelete, deletedBuilder } from "@/lib/api";

type Builder = {
  id: string;
  kategori_crud: "utama" | "pendukung";
  name: string;
  judul: string;
  judul_menu: string;
  nama_tabel: string;
  deskripsi?: string;
  totalCategories: number;
  totalColumns: number;
  totalStats: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at: string;
  moduleGroup?: string;
};

const statusColors: Record<Builder["status"], string> = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
};

interface BuilderTrashProps {
  onClose: () => void;
}

export function BuilderTrash({ onClose }: BuilderTrashProps) {
  const [deletedBuilders, setDeletedBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);

  const fetchDeletedBuilders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await deletedBuilder("builder");
      const builderData = response.data || [];

      setDeletedBuilders(builderData);
    } catch (error) {
      console.error("Error fetching deleted builders:", error);
      setDeletedBuilders([]);
      toast({
        title: "Error",
        description:
          "Gagal memuat data builder yang dihapus. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // load
  useEffect(() => {
    fetchDeletedBuilders();
  }, []);

  // Search changes
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(() => {
        fetchDeletedBuilders();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  // handle restore
  const handleRestore = async () => {
    if (!selectedBuilder) return;

    try {
      await restore("builder", selectedBuilder.id);
      toast({
        title: "Berhasil!",
        description: `Builder "${selectedBuilder.judul}" berhasil dipulihkan.`,
      });
      fetchDeletedBuilders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memulihkan builder. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setRestoreDialogOpen(false);
      setSelectedBuilder(null);
    }
  };

  // handle delete permanent
  const handlePermanentDelete = async () => {
    if (!selectedBuilder) return;

    try {
      await forceDelete("builder", selectedBuilder.id);
      toast({
        title: "Berhasil!",
        description: `Builder "${selectedBuilder.judul}" berhasil dihapus permanen.`,
      });
      fetchDeletedBuilders();
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Gagal menghapus builder secara permanen. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setPermanentDeleteDialogOpen(false);
      setSelectedBuilder(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-slate-600">Memuat data sampah...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center mt-0">
      <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">
                  Sampah Builder
                </CardTitle>
                <CardDescription>
                  Kelola builder yang telah dihapus
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-300 bg-transparent"
            >
              Tutup
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Search and Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari builder yang dihapus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDeletedBuilders(true)}
              disabled={refreshing}
              className="border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Deleted Builders List */}
          {deletedBuilders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Trash2 className="h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery
                  ? "Tidak ada builder yang sesuai"
                  : "Sampah kosong"}
              </h3>
              <p className="text-slate-600 text-center max-w-md">
                {searchQuery
                  ? "Coba sesuaikan kriteria pencarian Anda."
                  : "Belum ada builder yang dihapus. Builder yang dihapus akan muncul di sini."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deletedBuilders.map((builder) => (
                <Card key={builder.id} className="border-red-200 bg-red-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Code className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900">
                            {builder.judul}
                          </CardTitle>
                          <CardDescription className="text-slate-600">
                            {builder.nama_tabel}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[builder.status]}>
                        {builder.status}
                      </Badge>
                    </div>
                    {builder.deskripsi && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {builder.deskripsi}
                      </p>
                    )}

                    {/* Deletion Info */}
                    {builder.deleted_at && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        <span>Dihapus: {formatDate(builder.deleted_at)}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-red-100">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">
                          {/* {builder.total_categories} */} 0
                        </div>
                        <div className="text-xs text-slate-500">Kategori</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">
                          {/* {builder.total_columns} */} 0
                        </div>
                        <div className="text-xs text-slate-500">Kolom</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">
                          {/* {builder.total_stats} */} 0
                        </div>
                        <div className="text-xs text-slate-500">Statistik</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBuilder(builder);
                          setRestoreDialogOpen(true);
                        }}
                        className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Pulihkan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBuilder(builder);
                          setPermanentDeleteDialogOpen(true);
                        }}
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Permanen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-green-600" />
              Pulihkan Builder
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin memulihkan builder "
              {selectedBuilder?.judul}"? Builder akan dikembalikan ke status
              aktif dan dapat digunakan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className="bg-green-600 hover:bg-green-700"
            >
              Pulihkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog
        open={permanentDeleteDialogOpen}
        onOpenChange={setPermanentDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Hapus Permanen
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                <strong className="text-red-600">PERINGATAN:</strong> Anda akan
                menghapus builder "{selectedBuilder?.judul}" secara permanen.
              </p>
              <p>
                Tindakan ini <strong>TIDAK DAPAT DIBATALKAN</strong> dan akan
                menghapus semua data terkait termasuk:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Semua kategori dan kolom</li>
                <li>Konfigurasi layout tabel dan kartu</li>
                <li>Data statistik</li>
                <li>Riwayat dan metadata</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
