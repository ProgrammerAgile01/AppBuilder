"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { getDataById, deleteData } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Database,
  Calendar,
  User,
  BarChart3,
  Columns,
  Loader2,
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

interface ModuleViewProps {
  moduleId: string;
}

export function ModuleView({ moduleId }: ModuleViewProps) {
  const router = useRouter();
  const [module, setModule] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const data = await getDataById("modules", moduleId);
        setModule(data);
      } catch (error) {
        toast({
          title: "Gagal",
          description: "Data modul tidak dapat dimuat.",
          variant: "destructive",
        });
        router.push("/admin/modules");
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) fetchModule();
  }, [moduleId, router]);

  const handleEdit = () => router.push(`/admin/modules/edit/${moduleId}`);

  const handleDuplicate = async () => {
    if (!module) return;
    try {
      await duplicateData("modules", module.id);
      toast({
        title: "Duplikat Berhasil",
        description: `Modul "${module.name}" berhasil disalin.`,
      });
      router.push("/admin/modules");
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal menduplikat modul.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!module) return;
    try {
      await deleteData("modules", module.id);
      toast({
        title: "Modul Dihapus",
        description: `Modul "${module.name}" berhasil dihapus.`,
      });
      router.push("/admin/modules");
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal menghapus modul.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Modul tidak ditemukan
        </h2>
        <Button onClick={() => router.push("/admin/modules")}>Kembali</Button>
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
            <h1 className="text-3xl font-bold">{module.name}</h1>
            <p className="text-gray-500 text-sm">Detail modul dan statistik</p>
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
            <Database className="h-5 w-5" />
            Informasi Modul
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Nama Modul</Label>
            <p className="font-semibold">{module.name}</p>
          </div>
          <div>
            <Label>Judul Menu</Label>
            <p className="font-semibold">{module.menuTitle}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className={getStatusColor(module.status)}>
              {module.status}
            </Badge>
          </div>
          <div>
            <Label>Dibuat Oleh</Label>
            <p>{module.createdBy}</p>
          </div>
          <div>
            <Label>Tanggal Dibuat</Label>
            <p>{formatDate(module.createdAt)}</p>
          </div>
          <div>
            <Label>Terakhir Diperbarui</Label>
            <p>{formatDate(module.updatedAt)}</p>
          </div>
          {module.description && (
            <div className="md:col-span-2">
              <Label>Deskripsi</Label>
              <p className="text-gray-700">{module.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistik Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <BarChart3 className="h-5 w-5" />
            Statistik Modul
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatBox
            icon={<Columns className="text-blue-600" />}
            value={module.totalCategories}
            label="Kategori"
          />
          <StatBox
            icon={<Database className="text-green-600" />}
            value={module.totalColumns}
            label="Kolom"
          />
          <StatBox
            icon={<BarChart3 className="text-purple-600" />}
            value={module.totalStats}
            label="Statistik"
          />
        </CardContent>
      </Card>

      {/* Dialog Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin hapus modul?</AlertDialogTitle>
            <AlertDialogDescription>
              Modul <strong>{module.name}</strong> akan dihapus permanen.
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
