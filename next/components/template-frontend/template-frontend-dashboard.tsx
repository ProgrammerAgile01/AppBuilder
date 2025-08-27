"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  Edit,
  Plus,
  Search,
  Package,
  Activity,
  Archive,
  Users,
  RotateCcw,
} from "lucide-react";
import { API_URL, createData, updateData, deleteData } from "@/lib/api";
import { toast } from "sonner";

interface TemplateFrontend {
  id: string;
  templateCode: string;
  templateName: string;
  status: "Active" | "Inactive" | "Archived";
  createdAt: string;
  updatedAt: string;
}

// Helper status mapping
const toTitle = (s: string) =>
  s === "active"
    ? "Active"
    : s === "inactive"
    ? "Inactive"
    : s === "archived"
    ? "Archived"
    : s ?? "Active";
const toLower = (s: TemplateFrontend["status"]) => s.toLowerCase();

export function TemplateFrontendDashboard() {
  const [templateFrontend, setTemplateFrontend] = useState<TemplateFrontend[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplateFrontend, setEditingTemplateFrontend] =
    useState<TemplateFrontend | null>(null);
  const [formData, setFormData] = useState({
    templateCode: "",
    templateName: "",
    status: "Active" as TemplateFrontend["status"],
  });

  // ====== Trash modal & badge state ======
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashed, setTrashed] = useState<TemplateFrontend[]>([]);
  const [trashCount, setTrashCount] = useState<number>(0);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ====== Confirm delete dialog state ======
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTemplateFrontend, setDeletingTemplateFrontend] =
    useState<TemplateFrontend | null>(null);

  // --- Fetch list dari API ---
  async function reload() {
    try {
      const url = new URL(`${API_URL}/template-frontend`);
      const res = await fetch(url.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const arr: any[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];
      const mapped: TemplateFrontend[] = arr.map((it) => ({
        id: String(it.id),
        templateCode: it.template_code,
        templateName: it.template_name,
        status: toTitle(it.status) as TemplateFrontend["status"],
        createdAt: (it.created_at ?? "").slice(0, 10),
        updatedAt: (it.updated_at ?? "").slice(0, 10),
      }));
      setTemplateFrontend(mapped);

      // update badge sampah (pakai meta jika disediakan controller)
      if (json?.meta?.trashed != null) {
        setTrashCount(Number(json.meta.trashed) || 0);
      } else {
        // fallback hitung langsung dari endpoint trash=only
        const c = await countTrash();
        setTrashCount(c);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Gagal memuat template frontend");
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const filteredTemplateFrontend = useMemo(() => {
    return templateFrontend.filter((tf) => {
      const matchesSearch =
        tf.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tf.templateCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        tf.status === (statusFilter as TemplateFrontend["status"]);
      return matchesSearch && matchesStatus;
    });
  }, [templateFrontend, searchTerm, statusFilter]);

  async function handleCreateTemplateFrontend() {
    try {
      if (!formData.templateCode || !formData.templateName) {
        toast.error("Semua field harus diisi");
        return;
      }

      const exists = templateFrontend.find(
        (p) =>
          p.templateCode.toUpperCase() === formData.templateCode.toUpperCase()
      );
      if (exists) {
        toast.error("Template Code sudah digunakan");
        return;
      }

      const payload = {
        template_code: formData.templateCode.toUpperCase(),
        template_name: formData.templateName,
        status: toLower(formData.status),
      };

      await createData("template-frontend", payload);
      toast.success("Template frontend berhasil ditambahkan");
      setIsCreateDialogOpen(false);
      setFormData({ templateCode: "", templateName: "", status: "Active" });
      await reload();
    } catch (e: any) {
      toast.error(e?.message || "Gagal menambah template frontend");
    }
  }

  async function handleEditTemplateFrontend() {
    try {
      if (
        !editingTemplateFrontend ||
        !formData.templateCode ||
        !formData.templateName
      ) {
        toast.error("Semua field harus diisi");
        return;
      }

      const exists = templateFrontend.find(
        (p) =>
          p.templateCode.toUpperCase() ===
            formData.templateCode.toUpperCase() &&
          p.id !== editingTemplateFrontend.id
      );
      if (exists) {
        toast.error("Product Code sudah digunakan");
        return;
      }

      const payload = {
        template_code: formData.templateCode.toUpperCase(),
        template_name: formData.templateName,
        status: toLower(formData.status),
      };

      await updateData(
        "template-frontend",
        editingTemplateFrontend.id,
        payload
      );
      toast.success("Template frontend berhasil diperbarui");
      setIsEditDialogOpen(false);
      setEditingTemplateFrontend(null);
      setFormData({ templateCode: "", templateName: "", status: "Active" });
      await reload();
    } catch (e: any) {
      toast.error(e?.message || "Gagal memperbarui Template frontend");
    }
  }

  // Buka dialog konfirmasi hapus
  function confirmDelete(tf: TemplateFrontend) {
    setDeletingTemplateFrontend(tf);
    setIsConfirmOpen(true);
  }

  // Eksekusi hapus (soft delete)
  async function doDeleteTemplateFrontend() {
    if (!deletingTemplateFrontend) return;
    try {
      await deleteData("template-frontend", deletingTemplateFrontend.id); // backend = soft delete
      toast.success("Template frontend dipindahkan ke Sampah");
      setIsConfirmOpen(false);
      setDeletingTemplateFrontend(null);
      await reload();
    } catch (e: any) {
      toast.error(e?.message || "Gagal menghapus Template frontend");
    }
  }

  const openEditDialog = (tf: TemplateFrontend) => {
    setEditingTemplateFrontend(tf);
    setFormData({
      templateCode: tf.templateCode,
      templateName: tf.templateName,
      status: tf.status,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: TemplateFrontend["status"]) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Inactive
          </Badge>
        );
      case "Archived":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = useMemo(
    () => ({
      total: templateFrontend.length,
      active: templateFrontend.filter((p) => p.status === "Active").length,
      inactive: templateFrontend.filter((p) => p.status === "Inactive").length,
      archived: templateFrontend.filter((p) => p.status === "Archived").length,
    }),
    [templateFrontend]
  );

  // ====== Trash (soft-deleted) handlers ======
  async function countTrash(): Promise<number> {
    try {
      const url = new URL(`${API_URL}/template-frontend`);
      url.searchParams.set("trash", "only");
      const res = await fetch(url.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return 0;
      const json = await res.json();
      const arr: any[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];
      return arr.length;
    } catch {
      return 0;
    }
  }

  async function loadTrash() {
    try {
      setLoadingTrash(true);
      const url = new URL(`${API_URL}/template-frontend`);
      url.searchParams.set("trash", "only");
      const res = await fetch(url.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const arr: any[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];
      const mapped: TemplateFrontend[] = arr.map((it) => ({
        id: String(it.id),
        templateCode: it.template_code,
        templateName: it.template_name,
        status: toTitle(it.status) as TemplateFrontend["status"],
        createdAt: (it.created_at ?? "").slice(0, 10),
        updatedAt: (it.updated_at ?? "").slice(0, 10),
      }));
      setTrashed(mapped);
      setTrashCount(mapped.length);
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat sampah");
    } finally {
      setLoadingTrash(false);
    }
  }

  function openTrash() {
    setIsTrashOpen(true);
    loadTrash();
  }

  async function restoreItem(id: string) {
    try {
      setProcessingId(id);
      const res = await fetch(`${API_URL}/template-frontend/${id}/restore`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Template frontend dipulihkan");
      await Promise.all([loadTrash(), reload()]);
    } catch (e: any) {
      toast.error(e?.message || "Gagal memulihkan");
    } finally {
      setProcessingId(null);
    }
  }

  async function forceDeleteItem(id: string) {
    try {
      setProcessingId(id);
      const res = await fetch(`${API_URL}/template-frontend/${id}/force`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Template frontend dihapus permanen");
      await loadTrash();
    } catch (e: any) {
      toast.error(e?.message || "Gagal hapus permanen");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Template Frontend Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola Template frontend yang tersedia dalam sistem
          </p>
        </div>

        {/* Action buttons on the right: Sampah + Add template */}
        <div className="flex items-center gap-2">
          {/* Tombol Sampah (outline merah) + badge count */}
          <Dialog open={isTrashOpen} onOpenChange={setIsTrashOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={openTrash}
                className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 relative"
                title="Lihat Sampah"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sampah
                {/* badge bulat kecil di kanan teks */}
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 text-xs px-2 py-0.5">
                  {trashCount}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Sampah Template Frontend</DialogTitle>
                <DialogDescription>
                  Kelola Template yang telah dihapus. Pulihkan atau hapus
                  permanen.
                </DialogDescription>
              </DialogHeader>

              {/* Body Trash */}
              <div className="space-y-4">
                {loadingTrash ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Memuat…
                  </div>
                ) : trashed.length === 0 ? (
                  <div className="text-center py-12">
                    <Trash2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Tidak ada Template frontend di sampah
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template Code</TableHead>
                          <TableHead>Template Name</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trashed.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-mono">
                              {p.templateCode}
                            </TableCell>
                            <TableCell>{p.templateName}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => restoreItem(p.id)}
                                  disabled={processingId === p.id}
                                  className="text-green-700 hover:text-green-800"
                                  title="Pulihkan"
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Pulihkan
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => forceDeleteItem(p.id)}
                                  disabled={processingId === p.id}
                                  className="text-red-600 hover:text-red-700"
                                  title="Hapus Permanen"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Hapus Permanen
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTrashOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Tombol Add Template (tetap) */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Template Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan Template frontend baru ke dalam sistem
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateCode">template Code</Label>
                  <Input
                    id="templateCode"
                    placeholder="NATURAL"
                    value={formData.templateCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        templateCode: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    placeholder="Template Natural"
                    value={formData.templateName}
                    onChange={(e) =>
                      setFormData({ ...formData, templateName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: TemplateFrontend["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleCreateTemplateFrontend}>
                  Tambah Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Templates
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua template dalam sistem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Templates
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              Template yang sedang aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Templates
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground">
              Template yang tidak aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Archived templates
            </CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.archived}
            </div>
            <p className="text-xs text-muted-foreground">
              Template yang diarsipkan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Templates</CardTitle>
          <CardDescription>Kelola semua template dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari template..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Code</TableHead>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplateFrontend.map((tf) => (
                  <TableRow key={tf.id}>
                    <TableCell className="font-mono font-medium">
                      {tf.templateCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tf.templateName}
                    </TableCell>
                    <TableCell>{getStatusBadge(tf.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tf.createdAt}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tf.updatedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tf)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* ubah: buka dialog konfirmasi saat menghapus */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(tf)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTemplateFrontend.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada template ditemukan
              </h3>
              <p className="text-gray-500">
                Coba ubah filter atau tambah template baru
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template Frontend</DialogTitle>
            <DialogDescription>Perbarui informasi template</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTemplateCode">Template Code</Label>
              <Input
                id="editTemplateCode"
                value={formData.templateCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    templateCode: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="editTemplateName">Template Name</Label>
              <Input
                id="editTemplateName"
                value={formData.templateName}
                onChange={(e) =>
                  setFormData({ ...formData, templateName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TemplateFrontend["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleEditTemplateFrontend}>
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog (soft delete) */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Trash2 className="mr-2 h-5 w-5 text-red-600" />
              Hapus Template Frontend?
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan memindahkan template ke{" "}
              <span className="font-medium text-red-600">Sampah</span>. Anda
              masih bisa memulihkannya dari menu Sampah.
            </DialogDescription>
          </DialogHeader>

          {deletingTemplateFrontend && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="font-medium">
                {deletingTemplateFrontend.templateName}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-mono">
                  {deletingTemplateFrontend.templateCode}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                  {deletingTemplateFrontend.status.toLowerCase()}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={doDeleteTemplateFrontend}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
