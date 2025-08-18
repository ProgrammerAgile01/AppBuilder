"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { getDataById, deleteData } from "@/lib/api";
import {
  Category,
  Column,
  SubCategory,
  StatistikData,
} from "@/components/builder/form/crud-builder-page";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  Columns,
  Loader2,
  Layers,
  Code,
  List,
  AreaChart,
  FileText,
  Key,
  Calendar,
  Eye,
  Type,
  AlignLeft,
  AlignRight,
  AlignCenter,
  Shield,
  SquareDashedKanban,
  Table2,
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Menggunakan type Builder yang diperluas
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
  // Menambahkan properti untuk menampung data rinci
  categories: Category[];
  stats: StatistikData[];
};

// Asumsikan struktur data dari API, berdasarkan `getDataById` yang baru
type ApiData = {
  id: string;
  judul: string;
  judulMenu: string;
  namaTabel: string;
  deskripsi?: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  created_by: string;
  moduleGroup?: string;
  kategori_crud: "utama" | "pendukung";
  categories: Category[];
  stats: StatistikData[];
};

interface BuilderViewDetailProps {
  builderId: string;
}

export function BuilderViewDetail({ builderId }: BuilderViewDetailProps) {
  const router = useRouter();
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBuilder = async () => {
      try {
        setLoading(true);
        const apiData: ApiData = await getDataById("builder", builderId);

        if (apiData) {
          const totalColumns = apiData.categories.reduce(
            (total: number, category: any) => {
              const categoryColumns = category.columns?.length || 0;
              const subCategoryColumns = category.subCategories.reduce(
                (subTotal: number, sub: any) =>
                  subTotal + (sub.columns?.length || 0),
                0
              );
              return total + categoryColumns + subCategoryColumns;
            },
            0
          );

          const mappedBuilder: Builder = {
            id: apiData.id,
            kategoriCrud: apiData.kategori_crud,
            name: apiData.judul,
            menuTitle: apiData.judulMenu,
            tableName: apiData.namaTabel,
            description: apiData.deskripsi,
            totalCategories: apiData.categories?.length || 0,
            totalColumns: totalColumns,
            totalStats: apiData.stats?.length || 0,
            status: apiData.status,
            createdAt: apiData.created_at,
            updatedAt: apiData.updated_at,
            createdBy: apiData.created_by,
            moduleGroup: apiData.moduleGroup,
            // Menyimpan data rinci
            categories: apiData.categories,
            stats: apiData.stats,
          };
          setBuilder(mappedBuilder);
        } else {
          setBuilder(null);
        }
      } catch (error) {
        console.error("Failed to fetch builder:", error);
        toast({
          title: "Gagal",
          description: "Data builder tidak dapat dimuat.",
          variant: "destructive",
        });
        router.push("/admin/builder");
      } finally {
        setLoading(false);
      }
    };

    if (builderId) fetchBuilder();
  }, [builderId, router]);

  const handleEdit = () => router.push(`/admin/builder/edit/${builderId}`);

  const handleDuplicate = async () => {
    if (!builder) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/builder/${builder.id}/duplicate`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Duplicate failed");
      toast({
        title: "Duplikat Berhasil",
        description: `Builder "${builder.name}" berhasil disalin.`,
      });
      router.push("/admin/builder");
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal menduplikat builder.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!builder) return;
    try {
      await deleteData("builder", builder.id);
      toast({
        title: "Builder Dihapus",
        description: `Builder "${builder.name}" berhasil dipindahkan ke sampah.`,
      });
      router.push("/admin/builder");
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal menghapus builder.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Tanggal tidak tersedia";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Format tanggal tidak valid";
    }
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case "utama":
        return "bg-purple-50 text-purple-800";
      case "pendukung":
        return "bg-blue-50 text-blue-800";
      default:
        return "bg-gray-50 text-gray-800";
    }
  };

  const getAlignIcon = (align: string) => {
    switch (align) {
      case "center":
        return <AlignCenter className="h-4 w-4" />;
      case "right":
        return <AlignRight className="h-4 w-4" />;
      default:
        return <AlignLeft className="h-4 w-4" />;
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case "int":
      case "bigint":
        return <Code className="h-4 w-4" />;
      case "varchar":
      case "text":
        return <FileText className="h-4 w-4" />;
      case "date":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Builder tidak ditemukan
        </h2>
        <Button onClick={() => router.push("/admin/builder")}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{builder.name}</h1>
            <p className="text-gray-500 text-sm">
              Detail builder dan statistik
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplikat
          </Button>
          <Button
            onClick={handleEdit}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:brightness-110"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Detail Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Code className="h-5 w-5" />
            Informasi Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Nama Builder</Label>
            <p className="font-semibold">{builder.name}</p>
          </div>
          <div>
            <Label>Judul Menu</Label>
            <p className="font-semibold">{builder.menuTitle}</p>
          </div>
          <div>
            <Label>Nama Tabel</Label>
            <p className="font-semibold">{builder.tableName}</p>
          </div>
          <div>
            <Label>Kategori</Label>
            <Badge
              variant="outline"
              className={getCategoryColor(builder.kategoriCrud)}
            >
              {builder.kategoriCrud}
            </Badge>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(builder.status)}>
              {builder.status}
            </Badge>
          </div>
          <div>
            <Label>Dibuat Oleh</Label>
            <p>{builder.createdBy}</p>
          </div>
          <div>
            <Label>Tanggal Dibuat</Label>
            <p>{formatDate(builder.createdAt)}</p>
          </div>
          <div>
            <Label>Terakhir Diperbarui</Label>
            <p>{formatDate(builder.updatedAt)}</p>
          </div>
          {builder.description && (
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <p className="text-gray-700">{builder.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistik Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <BarChart3 className="h-5 w-5" />
            Statistik Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatBox
            icon={<Layers className="text-blue-600" />}
            value={builder.totalCategories}
            label="Kategori"
          />
          <StatBox
            icon={<Columns className="text-green-600" />}
            value={builder.totalColumns}
            label="Kolom"
          />
          <StatBox
            icon={<AreaChart className="text-purple-600" />}
            value={builder.totalStats}
            label="Statistik"
          />
        </CardContent>
      </Card>

      {/* Daftar Kolom */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Columns className="h-5 w-5" />
            Daftar Kolom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {builder.categories.length > 0 ? (
              builder.categories.map((category) => (
                <div key={category.id}>
                  <h3 className="font-bold text-lg mb-2">{category.nama}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.columns.map((column) => (
                      <ColumnDetailCard key={column.id} column={column} />
                    ))}
                    {category.subCategories.map((subCategory) => (
                      <div key={subCategory.id}>
                        <h4 className="font-semibold text-md mb-2">
                          {subCategory.nama}
                        </h4>
                        <div className="grid gap-4">
                          {subCategory.columns.map((column) => (
                            <ColumnDetailCard key={column.id} column={column} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada kolom yang terdaftar.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daftar Statistik */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <AreaChart className="h-5 w-5" />
            Daftar Statistik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {builder.stats.length > 0 ? (
              builder.stats.map((stat, index) => (
                <StatDetailCard key={index} stat={stat} />
              ))
            ) : (
              <p className="text-gray-500">
                Tidak ada statistik yang terdaftar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin hapus builder?</AlertDialogTitle>
            <AlertDialogDescription>
              Builder <strong>{builder.name}</strong> akan dihapus sementara dan dipindahkan ke sampah
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ... (komponen Label dan StatBox tidak berubah)
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-slate-600">{children}</label>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="text-center p-4 bg-slate-50 rounded-md border">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

// Komponen baru untuk menampilkan detail kolom
function ColumnDetailCard({ column }: { column: Column }) {
  return (
    <Card className="p-4 bg-gray-50 shadow-sm border-l-4 border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Table2 className="h-4 w-4 text-gray-500" />
        <p className="font-semibold">{column.labelTampilan}</p>
      </div>
      <Separator className="my-2" />
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Key className="h-4 w-4" />
          <span className="font-medium">Nama Kolom:</span>
          <span>{column.namaKolom}</span>
        </div>
        <div className="flex items-center gap-1">
          <Code className="h-4 w-4" />
          <span className="font-medium">Tipe Data:</span>
          <span>
            {column.tipeData} ({column.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <SquareDashedKanban className="h-4 w-4" />
          <span className="font-medium">Tipe Input:</span>
          <span>{column.tipeInput}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span className="font-medium">Hide:</span>
          <span>{column.isHide ? "Ya" : "Tidak"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Required:</span>
          <span>{column.isRequired ? "Ya" : "Tidak"}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlignLeft className="h-4 w-4" />
          <span className="font-medium">Align:</span>
          <span>{column.alignKolom}</span>
        </div>
      </div>
    </Card>
  );
}

// Komponen baru untuk menampilkan detail statistik
function StatDetailCard({ stat }: { stat: StatistikData }) {
  return (
    <Card className="p-4 bg-purple-50 shadow-sm border-l-4 border-purple-200">
      <div className="flex items-center gap-2 mb-2">
        <AreaChart className="h-4 w-4 text-purple-600" />
        <p className="font-semibold">{stat.judulStatistik}</p>
      </div>
      <Separator className="my-2" />
      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Query Angka:</span>
          <code className="block mt-1 p-2 bg-gray-100 rounded-md text-xs">
            {stat.queryAngka}
          </code>
        </div>
        <div>
          <span className="font-medium">Query Resume:</span>
          <code className="block mt-1 p-2 bg-gray-100 rounded-md text-xs">
            {stat.queryResume}
          </code>
        </div>
      </div>
    </Card>
  );
}
