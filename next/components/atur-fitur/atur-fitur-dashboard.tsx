"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Settings,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Link as LinkIcon,
  Component as ComponentIcon,
  Folder,
  Package,
  Eye,
  ArrowLeft,
  BarChart3,
  GripVertical,
} from "lucide-react";

import { toast } from "sonner";

// ===== API (gunakan file api.ts final yang sudah diberikan) =====
import {
  API_URL,
  listFitur,
  fetchFiturTree,
  createFitur,
  updateFitur,
  deleteFitur,
  toggleFitur,
  fetchCrudMenusForProduct,
  type FeatureTreeNode,
  type CrudMenuOption,
} from "@/lib/api";

// ======================
// Tipe lokal (UI asli)
// ======================

interface FeatureParent {
  id: string;
  product_id: string;
  name: string;
  code: string; // tampil di UI sebagai "kode/slug" -> backend = feature_code
  description?: string;
  price_addon: number;
  trial_available: boolean;
  trial_days?: number;
  status: "active" | "hidden";
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface FeatureChild {
  id: string;
  feature_parent_id: string;
  product_id: string;
  feature_code: string;
  name: string;
  crud_menu_id: string;
  description?: string;
  status: "active" | "hidden";
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface CrudMenu {
  id: string;
  product_id?: string | null;
  path: string; // "Group › Module › Menu"
  label: string;
  status: "active" | "inactive";
}

interface Product {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  status: "active" | "inactive";
  product_code?: string;
}

// ======================
// Helpers mapping
// ======================

const toUIParent = (n: FeatureTreeNode): FeatureParent => ({
  id: String(n.id),
  product_id: String(n.product_id ?? ""),
  name: n.name,
  code: n.feature_code ?? n.code ?? "",
  description: n.description ?? "",
  price_addon:
    typeof n.price_addon === "number"
      ? n.price_addon
      : n.price_addon == null
      ? 0
      : Number(n.price_addon),
  trial_available: !!n.trial_available,
  trial_days:
    n.trial_days == null
      ? 0
      : typeof n.trial_days === "number"
      ? n.trial_days
      : Number(n.trial_days),
  status: n.is_active ? "active" : "hidden",
  order:
    n.order_number == null
      ? 0
      : typeof n.order_number === "number"
      ? n.order_number
      : Number(n.order_number),
  created_at: n.created_at ?? "",
  updated_at: n.updated_at ?? "",
  deleted_at: n.deleted_at ?? undefined,
});

const toUIChild = (n: FeatureTreeNode): FeatureChild => ({
  id: String(n.id),
  feature_parent_id: String(n.parent_id ?? ""),
  product_id: String(n.product_id ?? ""),
  feature_code: n.feature_code ?? n.code ?? "",
  name: n.name,
  crud_menu_id:
    n.crud_menu_id == null
      ? ""
      : typeof n.crud_menu_id === "number"
      ? String(n.crud_menu_id)
      : n.crud_menu_id,
  description: n.description ?? "",
  status: n.is_active ? "active" : "hidden",
  order:
    n.order_number == null
      ? 0
      : typeof n.order_number === "number"
      ? n.order_number
      : Number(n.order_number),
  created_at: n.created_at ?? "",
  updated_at: n.updated_at ?? "",
  deleted_at: n.deleted_at ?? undefined,
});

function mapCrudOptionsToUI(opts: CrudMenuOption[]): CrudMenu[] {
  return (opts || [])
    .map((o) => ({
      id: String(o.id),
      path: o.path,
      label: o.label,
      status: o.status,
      product_id: o.product_id ?? null,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

// ======================
// Komponen utama
// ======================

export function AturFiturDashboard() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featureParents, setFeatureParents] = useState<FeatureParent[]>([]);
  const [featureChildren, setFeatureChildren] = useState<FeatureChild[]>([]);
  const [crudMenus, setCrudMenus] = useState<CrudMenu[]>([]);
  const [selectedParent, setSelectedParent] = useState<FeatureParent | null>(
    null
  );

  // cache tree untuk preview
  const [treeCache, setTreeCache] = useState<Record<string, FeatureChild[]>>(
    {}
  );

  const [loading, setLoading] = useState(true);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // Tabs (struktur | preview)
  const [activeTab, setActiveTab] = useState<"struktur" | "preview">(
    "struktur"
  );

  // Dialog states
  const [isCreateParentOpen, setIsCreateParentOpen] = useState(false);
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);
  const [isCreateChildOpen, setIsCreateChildOpen] = useState(false);
  const [isEditChildOpen, setIsEditChildOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<FeatureParent | null>(
    null
  );
  const [editingChild, setEditingChild] = useState<FeatureChild | null>(null);

  const [deleteParentId, setDeleteParentId] = useState<string | null>(null);
  const [deleteChildId, setDeleteChildId] = useState<string | null>(null);

  // Form states
  const [parentForm, setParentForm] = useState({
    name: "",
    code: "",
    description: "",
    price_addon: 0,
    trial_available: false,
    trial_days: 0,
    status: "active" as "active" | "hidden",
  });

  const [childForm, setChildForm] = useState({
    feature_code: "",
    name: "",
    crud_menu_id: "",
    description: "",
    status: "active" as "active" | "hidden",
  });

  const [parentFormErrors, setParentFormErrors] = useState<
    Record<string, string>
  >({});
  const [childFormErrors, setChildFormErrors] = useState<
    Record<string, string>
  >({});

  // ======================
  // Helpers
  // ======================

  const generateCodeFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, ".")
      .substring(0, 20);
  };

  // ======================
  // Validasi Form
  // ======================

  const validateParentForm = () => {
    const errors: Record<string, string> = {};

    if (!parentForm.name.trim()) errors.name = "Nama fitur wajib diisi";

    if (!parentForm.code.trim()) {
      errors.code = "Kode wajib diisi";
    } else {
      const isDuplicate = featureParents.some(
        (p) =>
          p.code.toLowerCase() === parentForm.code.toLowerCase() &&
          (!editingParent || p.id !== editingParent.id)
      );
      if (isDuplicate) errors.code = "Kode sudah digunakan untuk produk ini";
    }

    if (parentForm.trial_available && parentForm.trial_days <= 0) {
      errors.trial_days = "Trial days harus lebih dari 0";
    }

    setParentFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateChildForm = () => {
    const errors: Record<string, string> = {};

    if (!childForm.feature_code.trim()) {
      errors.feature_code = "Kode fitur wajib diisi";
    } else {
      const isDuplicate = featureChildren.some(
        (c) =>
          c.feature_code.toLowerCase() ===
            childForm.feature_code.toLowerCase() &&
          (!editingChild || c.id !== editingChild.id)
      );
      if (isDuplicate)
        errors.feature_code = "Kode fitur sudah digunakan untuk produk ini";
    }

    if (!childForm.name.trim()) errors.name = "Nama child wajib diisi";
    if (!childForm.crud_menu_id) errors.crud_menu_id = "Menu wajib dipilih";

    setChildFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ======================
  // Handlers CRUD
  // ======================

  const handleCreateParent = async () => {
    if (!selectedProduct || !validateParentForm()) return;
    try {
      const payload = {
        product_id: selectedProduct.id,
        product_code: selectedProduct.product_code ?? null,
        parent_id: null,
        name: parentForm.name,
        feature_code: parentForm.code,
        type: "feature" as const,
        description: parentForm.description || null,
        price_addon: Number(parentForm.price_addon) || 0,
        trial_available: parentForm.trial_available,
        trial_days: parentForm.trial_available
          ? Number(parentForm.trial_days || 7)
          : null,
        is_active: parentForm.status === "active",
        order_number:
          (featureParents[featureParents.length - 1]?.order ?? 0) + 1,
      };
      const saved = await createFitur(payload);
      const ui = toUIParent(saved);
      setFeatureParents((prev) => [...prev, ui]);

      // update tree cache preview
      setTreeCache((prev) => ({ ...prev, [ui.id]: [] }));

      setIsCreateParentOpen(false);
      setParentForm({
        name: "",
        code: "",
        description: "",
        price_addon: 0,
        trial_available: false,
        trial_days: 0,
        status: "active",
      });
      setParentFormErrors({});
      toast.success("Berhasil disimpan.");
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleEditParent = async () => {
    if (!editingParent || !validateParentForm()) return;
    try {
      const payload = {
        // ⬇️ Wajib ikutkan di update agar lolos validasi backend
        product_id: editingParent.product_id || selectedProduct?.id || "",
        product_code: selectedProduct?.product_code ?? null,

        name: parentForm.name,
        feature_code: parentForm.code,
        type: "feature" as const,
        parent_id: null,
        description: parentForm.description || null,
        is_active: parentForm.status === "active",
        order_number: editingParent.order,
        price_addon: Number(parentForm.price_addon) || 0,
        trial_available: parentForm.trial_available,
        trial_days: parentForm.trial_available
          ? Number(parentForm.trial_days || 7)
          : null,
      };
      const updated = await updateFitur(editingParent.id, payload);
      const ui = toUIParent(updated);

      setFeatureParents((prev) =>
        prev.map((p) => (p.id === editingParent.id ? ui : p))
      );
      if (selectedParent?.id === editingParent.id) setSelectedParent(ui);

      setIsEditParentOpen(false);
      setEditingParent(null);
      setParentFormErrors({});
      toast.success("Berhasil disimpan.");
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleCreateChild = async () => {
    if (!selectedParent || !validateChildForm()) return;
    try {
      const payload = {
        product_id: selectedParent.product_id,
        product_code: selectedProduct?.product_code ?? null,
        parent_id: selectedParent.id,
        name: childForm.name,
        feature_code: childForm.feature_code,
        type: "subfeature" as const,
        description: childForm.description || null,
        crud_menu_id: childForm.crud_menu_id
          ? Number(childForm.crud_menu_id)
          : null,
        is_active: childForm.status === "active",
        order_number:
          (featureChildren[featureChildren.length - 1]?.order ?? 0) + 1,
      };
      const saved = await createFitur(payload);
      const ui = toUIChild(saved);
      setFeatureChildren((prev) => [...prev, ui]);

      // tree cache
      setTreeCache((prev) => {
        const arr = prev[selectedParent.id] ?? [];
        return { ...prev, [selectedParent.id]: [...arr, ui] };
      });

      setIsCreateChildOpen(false);
      setChildForm({
        feature_code: "",
        name: "",
        crud_menu_id: "",
        description: "",
        status: "active",
      });
      setChildFormErrors({});
      toast.success("Berhasil disimpan.");
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleEditChild = async () => {
    if (!editingChild || !validateChildForm()) return;
    try {
      const payload = {
        // ⬇️ Wajib ikutkan di update agar lolos validasi backend
        product_id: selectedProduct?.id || editingChild.product_id || "",
        product_code: selectedProduct?.product_code ?? null,

        name: childForm.name,
        feature_code: childForm.feature_code,
        type: "subfeature" as const,
        parent_id: editingChild.feature_parent_id,
        description: childForm.description || null,
        crud_menu_id: childForm.crud_menu_id
          ? Number(childForm.crud_menu_id)
          : null,
        is_active: childForm.status === "active",
        order_number: editingChild.order,
      };
      const updated = await updateFitur(editingChild.id, payload);
      const ui = toUIChild(updated);

      setFeatureChildren((prev) =>
        prev.map((c) => (c.id === editingChild.id ? ui : c))
      );

      // tree cache
      setTreeCache((prev) => {
        const pid = String(ui.feature_parent_id);
        const list = (prev[pid] ?? []).map((c) => (c.id === ui.id ? ui : c));
        return { ...prev, [pid]: list };
      });

      setIsEditChildOpen(false);
      setEditingChild(null);
      setChildFormErrors({});
      toast.success("Berhasil disimpan.");
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleDeleteParent = async (parentId: string) => {
    try {
      await deleteFitur(parentId);
      setFeatureParents((prev) => prev.filter((p) => p.id !== parentId));
      if (selectedParent?.id === parentId) {
        setSelectedParent(null);
        setFeatureChildren([]);
      }
      // hapus di cache
      setTreeCache((prev) => {
        const cp = { ...prev };
        delete cp[parentId];
        return cp;
      });
      setDeleteParentId(null);
      toast.success("Berhasil dihapus.");
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      await deleteFitur(childId);
      setFeatureChildren((prev) => prev.filter((c) => c.id !== childId));
      // cache
      setTreeCache((prev) => {
        const pid = selectedParent?.id ? String(selectedParent.id) : "";
        if (!pid) return prev;
        const list = (prev[pid] ?? []).filter((c) => c.id !== childId);
        return { ...prev, [pid]: list };
      });
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setDeleteChildId(null);
    }
  };

  const handleToggleParentStatus = async (parentId: string) => {
    try {
      const updated = await toggleFitur(parentId);
      const ui = toUIParent(updated);
      setFeatureParents((prev) =>
        prev.map((p) => (p.id === parentId ? ui : p))
      );
      if (selectedParent?.id === parentId) setSelectedParent(ui);
      toast.success("Status diperbarui.");
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    }
  };

  const handleToggleChildStatus = async (childId: string) => {
    try {
      const updated = await toggleFitur(childId);
      const ui = toUIChild(updated);
      setFeatureChildren((prev) =>
        prev.map((c) => (c.id === childId ? ui : c))
      );
      // cache
      setTreeCache((prev) => {
        const pid = String(ui.feature_parent_id);
        const list = (prev[pid] ?? []).map((c) => (c.id === ui.id ? ui : c));
        return { ...prev, [pid]: list };
      });
      toast.success("Status diperbarui.");
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan. Coba lagi.");
    }
  };

  // ======================
  // Load per-produk & menu
  // ======================

  const handleProductChange = async (product: Product) => {
    setSelectedProduct(product);
    setSelectedParent(null);
    setSearchTerm("");
    setParentsLoading(true);
    setChildrenLoading(false);

    try {
      // Parent root milik produk
      const roots = await listFitur({
        root_only: true,
        with_tree: false,
        product_id: product.id,
      });

      const parentsForProduct = roots
        .filter((n) => String(n.product_id ?? "") === String(product.id))
        .map(toUIParent);

      setFeatureParents(parentsForProduct);

      // Ambil tree untuk preview (sekali panggil)
      try {
        const rootTree = await fetchFiturTree({
          product_id: product.id,
          trash: "none",
        });
        // isi cache anak per parent
        const mapChildren: Record<string, FeatureChild[]> = {};
        for (const parentNode of rootTree) {
          const pId = String(parentNode.id);
          const kids = (
            parentNode.children ??
            parentNode.recursiveChildren ??
            []
          ).map(toUIChild);
          mapChildren[pId] = kids;
        }
        setTreeCache(mapChildren);
      } catch {
        setTreeCache({});
      }

      // Dropdown menu CRUD sesuai produk
      const menus = await fetchCrudMenusForProduct({
        product_id: product.id,
        active_only: true,
      });
      setCrudMenus(mapCrudOptionsToUI(menus));
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat data fitur/menu");
      setFeatureParents([]);
      setCrudMenus([]);
      setTreeCache({});
    } finally {
      setParentsLoading(false);
    }
  };

  const handleParentSelect = async (parent: FeatureParent) => {
    setSelectedParent(parent);
    setChildrenLoading(true);
    try {
      const childs = await listFitur({
        root_only: false,
        parent_id: parent.id,
        with_tree: false,
        product_id: selectedProduct?.id,
      });
      const uiChildren = childs.map(toUIChild);
      setFeatureChildren(uiChildren);

      // refresh cache untuk parent yg dipilih
      setTreeCache((prev) => ({ ...prev, [parent.id]: uiChildren }));
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat fitur child");
      setFeatureChildren([]);
    } finally {
      setChildrenLoading(false);
    }
  };

  // ======================
  // Bootstrap load: products + menus awal
  // ======================

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Products
        const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const rows = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        const prods: Product[] = rows.map((p: any) => ({
          id: String(p.id),
          name: p.product_name || p.name || "",
          slug: p.slug || p.product_code || "",
          status: (p.status === "inactive" ? "inactive" : "active") as
            | "active"
            | "inactive",
          icon: "📦",
          product_code: p.product_code || p.slug || "",
        }));
        if (!mounted) return;
        setProducts(prods);
      } catch (e: any) {
        toast.error(e?.message || "Gagal memuat produk");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ======================
  // Pencarian (debounce)
  // ======================

  useEffect(() => {
    const debouncedSearch = debounce(() => {}, 300);
    debouncedSearch();
  }, [searchTerm]);

  const filteredParents = useMemo(
    () =>
      featureParents.filter(
        (parent) =>
          parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.code.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [featureParents, searchTerm]
  );

  const filteredChildren = useMemo(
    () =>
      featureChildren.filter(
        (child) =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.feature_code.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [featureChildren, searchTerm]
  );

  // ======================
  // RENDER — UI as-is (dengan TAB preview terpisah)
  // ======================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Atur Fitur</h1>
                <p className="text-gray-600 mt-1">
                  Kelola fitur dan link ke menu CRUD Builder berdasarkan produk
                  yang dipilih
                </p>
              </div>
            </div>
          </div>
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-xl shadow-sm">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6">
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Atur Fitur</h1>
              <p className="text-gray-600 mt-1">
                Kelola fitur dan link ke menu CRUD Builder berdasarkan produk
                yang dipilih
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Select
                value={selectedProduct?.id || ""}
                onValueChange={(value) => {
                  const product = products.find((p) => p.id === value);
                  if (product) handleProductChange(product);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Pilih Produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span>{product.icon || "📦"}</span>
                        <span>{product.name}</span>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProduct && (
                <Input
                  placeholder="Cari fitur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              )}
            </div>
          </div>

          {selectedProduct && (
            <div className="mt-4">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Perubahan berlaku untuk {selectedProduct.name}
              </Badge>
            </div>
          )}
        </div>

        {!selectedProduct ? (
          <div className="flex items-center justify-center h-96">
            <Card className="w-full max-w-md shadow-sm rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-12 px-4">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pilih Produk
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Pilih produk dari dropdown di atas untuk mengelola fitur.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab((v as "struktur" | "preview") ?? "struktur")
            }
            className="w-full"
          >
            <div className="mb-4">
              {/* full width */}
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="struktur" className="w-full">
                  Struktur Fitur
                </TabsTrigger>
                <TabsTrigger value="preview" className="w-full">
                  Preview Fitur
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ===== TAB STRUKTUR ===== */}
            <TabsContent value="struktur" className="m-0">
              <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Card Parent */}
                <Card className="shadow-sm rounded-xl border-0 bg-white">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Folder className="h-5 w-5 text-blue-600" />
                        Fitur Parent
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={() => setIsCreateParentOpen(true)}
                        className="rounded-lg"
                        disabled={!selectedProduct}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {parentsLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : filteredParents.length === 0 ? (
                      <div className="text-center py-8">
                        <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Belum ada fitur parent
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsCreateParentOpen(true)}
                          disabled={!selectedProduct}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah Fitur Parent
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredParents.map((parent) => (
                          <div
                            key={parent.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedParent?.id === parent.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-accent/50"
                            }`}
                            onClick={() => handleParentSelect(parent)}
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {parent.name}
                                </h4>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {parent.code}
                                </p>
                                {parent.price_addon > 0 && (
                                  <p className="text-xs text-green-600">
                                    +Rp{" "}
                                    {Number(
                                      parent.price_addon
                                    ).toLocaleString()}
                                    /bulan
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant={
                                    parent.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleParentStatus(parent.id);
                                  }}
                                >
                                  {parent.status}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingParent(parent);
                                        setParentForm({
                                          name: parent.name,
                                          code: parent.code,
                                          description: parent.description || "",
                                          price_addon: parent.price_addon || 0,
                                          trial_available:
                                            !!parent.trial_available,
                                          trial_days: parent.trial_days || 0,
                                          status: parent.status,
                                        });
                                        setParentFormErrors({});
                                        setIsEditParentOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteParentId(parent.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Card Child */}
                <Card className="shadow-sm rounded-xl border-0 bg-white">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <ComponentIcon className="h-5 w-5 text-green-600" />
                        {selectedParent
                          ? `Child: ${selectedParent.name}`
                          : "Fitur Child"}
                      </CardTitle>
                      {selectedParent && (
                        <Button
                          size="sm"
                          onClick={() => setIsCreateChildOpen(true)}
                          className="rounded-lg"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {!selectedParent ? (
                      <div className="text-center py-8">
                        <ArrowLeft className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Pilih fitur parent terlebih dahulu
                        </p>
                      </div>
                    ) : childrenLoading ? (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : filteredChildren.length === 0 ? (
                      <div className="text-center py-8">
                        <ComponentIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Belum ada fitur child
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsCreateChildOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah Fitur Child
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredChildren.map((child) => {
                          const linkedMenu = crudMenus.find(
                            (m) => m.id === child.crud_menu_id
                          );
                          return (
                            <div
                              key={child.id}
                              className="p-3 rounded-lg border border-gray-200 hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab mt-1" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium">{child.name}</h4>
                                  <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded mt-1 inline-block">
                                    {child.feature_code}
                                  </p>
                                  {linkedMenu && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <LinkIcon className="h-3 w-3 text-green-600" />
                                      <span className="text-xs text-green-700">
                                        {linkedMenu.path}
                                      </span>
                                    </div>
                                  )}
                                  {child.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {child.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant={
                                      child.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleToggleChildStatus(child.id)
                                    }
                                  >
                                    {child.status}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingChild(child);
                                          setChildForm({
                                            feature_code: child.feature_code,
                                            name: child.name,
                                            crud_menu_id: child.crud_menu_id,
                                            description:
                                              child.description || "",
                                            status: child.status,
                                          });
                                          setChildFormErrors({});
                                          setIsEditChildOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          setDeleteChildId(child.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Card Statistik */}
                <Card className="shadow-sm rounded-xl border-0 bg-white">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Statistik
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {featureParents.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Parent
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {featureChildren.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Child
                        </div>
                      </div>
                    </div>

                    {selectedProduct && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Produk Aktif</h4>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="text-lg">
                            {selectedProduct.icon || "📦"}
                          </span>
                          <span className="font-medium">
                            {selectedProduct.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ===== TAB PREVIEW ===== */}
            <TabsContent value="preview" className="m-0">
              <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm rounded-xl border-0 bg-white md:col-span-2 lg:col-span-3">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Eye className="h-5 w-5 text-indigo-600" />
                      Preview Tree
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      {featureParents.map((parent) => (
                        <div key={parent.id} className="space-y-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Folder className="h-4 w-4 text-blue-600" />
                            {parent.name}
                          </div>
                          {(treeCache[parent.id] ?? [])
                            .filter((c) => !c.deleted_at)
                            .map((child) => {
                              const menu = crudMenus.find(
                                (m) => m.id === child.crud_menu_id
                              );
                              return (
                                <div
                                  key={child.id}
                                  className="ml-6 flex items-center gap-2 text-sm"
                                >
                                  <ComponentIcon className="h-3 w-3 text-green-600" />
                                  <span>{child.name}</span>
                                  <code className="text-xs bg-muted px-1 rounded">
                                    {child.feature_code}
                                  </code>
                                  {menu && (
                                    <span className="text-xs text-muted-foreground">
                                      → {menu.path}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Dialog Tambah Parent */}
      <Dialog open={isCreateParentOpen} onOpenChange={setIsCreateParentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Fitur Parent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Input
                value={selectedProduct?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="name">Nama Fitur *</Label>
              <Input
                id="name"
                value={parentForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setParentForm((prev) => ({
                    ...prev,
                    name,
                    code: prev.code || generateCodeFromName(name),
                  }));
                  if (parentFormErrors.name)
                    setParentFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={parentFormErrors.name ? "border-red-500" : ""}
              />
              {parentFormErrors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {parentFormErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="code">Kode/Slug *</Label>
              <Input
                id="code"
                value={parentForm.code}
                onChange={(e) => {
                  setParentForm((prev) => ({ ...prev, code: e.target.value }));
                  if (parentFormErrors.code)
                    setParentFormErrors((prev) => ({ ...prev, code: "" }));
                }}
                className={parentFormErrors.code ? "border-red-500" : ""}
                placeholder="contoh: wa.core"
              />
              {parentFormErrors.code && (
                <p className="text-sm text-red-500 mt-1">
                  {parentFormErrors.code}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={parentForm.description}
                onChange={(e) =>
                  setParentForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="price_addon">Harga Add-on</Label>
              <div className="relative">
                <Input
                  id="price_addon"
                  type="number"
                  value={parentForm.price_addon}
                  onChange={(e) =>
                    setParentForm((prev) => ({
                      ...prev,
                      price_addon: Number(e.target.value),
                    }))
                  }
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  /bulan
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="trial_available"
                checked={parentForm.trial_available}
                onCheckedChange={(checked) =>
                  setParentForm((prev) => ({
                    ...prev,
                    trial_available: checked,
                    trial_days: checked ? prev.trial_days || 7 : 0,
                  }))
                }
              />
              <Label htmlFor="trial_available">Trial tersedia?</Label>
            </div>

            {parentForm.trial_available && (
              <div>
                <Label htmlFor="trial_days">Trial Days</Label>
                <Input
                  id="trial_days"
                  type="number"
                  value={parentForm.trial_days}
                  onChange={(e) =>
                    setParentForm((prev) => ({
                      ...prev,
                      trial_days: Number(e.target.value),
                    }))
                  }
                  min="1"
                  className={
                    parentFormErrors.trial_days ? "border-red-500" : ""
                  }
                />
                {parentFormErrors.trial_days && (
                  <p className="text-sm text-red-500 mt-1">
                    {parentFormErrors.trial_days}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>Status</Label>
              <Select
                value={parentForm.status}
                onValueChange={(value: "active" | "hidden") =>
                  setParentForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateParentOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateParent}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Parent */}
      <Dialog open={isEditParentOpen} onOpenChange={setIsEditParentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Fitur Parent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Input
                value={selectedProduct?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="edit-name">Nama Fitur *</Label>
              <Input
                id="edit-name"
                value={parentForm.name}
                onChange={(e) => {
                  setParentForm((prev) => ({ ...prev, name: e.target.value }));
                  if (parentFormErrors.name)
                    setParentFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={parentFormErrors.name ? "border-red-500" : ""}
              />
              {parentFormErrors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {parentFormErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-code">Kode/Slug *</Label>
              <Input
                id="edit-code"
                value={parentForm.code}
                onChange={(e) => {
                  setParentForm((prev) => ({ ...prev, code: e.target.value }));
                  if (parentFormErrors.code)
                    setParentFormErrors((prev) => ({ ...prev, code: "" }));
                }}
                className={parentFormErrors.code ? "border-red-500" : ""}
              />
              {parentFormErrors.code && (
                <p className="text-sm text-red-500 mt-1">
                  {parentFormErrors.code}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={parentForm.description}
                onChange={(e) =>
                  setParentForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-price_addon">Harga Add-on</Label>
              <div className="relative">
                <Input
                  id="edit-price_addon"
                  type="number"
                  value={parentForm.price_addon}
                  onChange={(e) =>
                    setParentForm((prev) => ({
                      ...prev,
                      price_addon: Number(e.target.value),
                    }))
                  }
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  /bulan
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-trial_available"
                checked={parentForm.trial_available}
                onCheckedChange={(checked) =>
                  setParentForm((prev) => ({
                    ...prev,
                    trial_available: checked,
                    trial_days: checked ? prev.trial_days || 7 : 0,
                  }))
                }
              />
              <Label htmlFor="edit-trial_available">Trial tersedia?</Label>
            </div>

            {parentForm.trial_available && (
              <div>
                <Label htmlFor="edit-trial_days">Trial Days</Label>
                <Input
                  id="edit-trial_days"
                  type="number"
                  value={parentForm.trial_days}
                  onChange={(e) =>
                    setParentForm((prev) => ({
                      ...prev,
                      trial_days: Number(e.target.value),
                    }))
                  }
                  min="1"
                  className={
                    parentFormErrors.trial_days ? "border-red-500" : ""
                  }
                />
                {parentFormErrors.trial_days && (
                  <p className="text-sm text-red-500 mt-1">
                    {parentFormErrors.trial_days}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label>Status</Label>
              <Select
                value={parentForm.status}
                onValueChange={(value: "active" | "hidden") =>
                  setParentForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditParentOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditParent}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Child */}
      <Dialog open={isCreateChildOpen} onOpenChange={setIsCreateChildOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Fitur Child</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Input
                value={selectedProduct?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label>Fitur Parent</Label>
              <Input
                value={
                  selectedParent
                    ? `${selectedParent.name} (${selectedParent.code})`
                    : ""
                }
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="feature_code">Kode Fitur *</Label>
              <Input
                id="feature_code"
                value={childForm.feature_code}
                onChange={(e) => {
                  setChildForm((prev) => ({
                    ...prev,
                    feature_code: e.target.value,
                  }));
                  if (childFormErrors.feature_code)
                    setChildFormErrors((prev) => ({
                      ...prev,
                      feature_code: "",
                    }));
                }}
                className={`font-mono ${
                  childFormErrors.feature_code ? "border-red-500" : ""
                }`}
                placeholder="wa.send_booking"
              />
              {childFormErrors.feature_code && (
                <p className="text-sm text-red-500 mt-1">
                  {childFormErrors.feature_code}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="child-name">Nama Child *</Label>
              <Input
                id="child-name"
                value={childForm.name}
                onChange={(e) => {
                  setChildForm((prev) => ({ ...prev, name: e.target.value }));
                  if (childFormErrors.name)
                    setChildFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={childFormErrors.name ? "border-red-500" : ""}
              />
              {childFormErrors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {childFormErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label>Pilih Menu *</Label>
              <Select
                value={childForm.crud_menu_id}
                onValueChange={(value) => {
                  setChildForm((prev) => ({ ...prev, crud_menu_id: value }));
                  if (childFormErrors.crud_menu_id)
                    setChildFormErrors((prev) => ({
                      ...prev,
                      crud_menu_id: "",
                    }));
                }}
              >
                <SelectTrigger
                  className={
                    childFormErrors.crud_menu_id ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Pilih menu dari CRUD Builder" />
                </SelectTrigger>
                <SelectContent>
                  {crudMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {childFormErrors.crud_menu_id && (
                <p className="text-sm text-red-500 mt-1">
                  {childFormErrors.crud_menu_id}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="child-description">Deskripsi</Label>
              <Textarea
                id="child-description"
                value={childForm.description}
                onChange={(e) =>
                  setChildForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={childForm.status}
                onValueChange={(value: "active" | "hidden") =>
                  setChildForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateChildOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateChild}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Child */}
      <Dialog open={isEditChildOpen} onOpenChange={setIsEditChildOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Fitur Child</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Input
                value={selectedProduct?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label>Fitur Parent</Label>
              <Input
                value={
                  selectedParent
                    ? `${selectedParent.name} (${selectedParent.code})`
                    : ""
                }
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="edit-feature_code">Kode Fitur *</Label>
              <Input
                id="edit-feature_code"
                value={childForm.feature_code}
                onChange={(e) => {
                  setChildForm((prev) => ({
                    ...prev,
                    feature_code: e.target.value,
                  }));
                  if (childFormErrors.feature_code)
                    setChildFormErrors((prev) => ({
                      ...prev,
                      feature_code: "",
                    }));
                }}
                className={`font-mono ${
                  childFormErrors.feature_code ? "border-red-500" : ""
                }`}
              />
              {childFormErrors.feature_code && (
                <p className="text-sm text-red-500 mt-1">
                  {childFormErrors.feature_code}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-child-name">Nama Child *</Label>
              <Input
                id="edit-child-name"
                value={childForm.name}
                onChange={(e) => {
                  setChildForm((prev) => ({ ...prev, name: e.target.value }));
                  if (childFormErrors.name)
                    setChildFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={childFormErrors.name ? "border-red-500" : ""}
              />
              {childFormErrors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {childFormErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label>Pilih Menu *</Label>
              <Select
                value={childForm.crud_menu_id}
                onValueChange={(value) => {
                  setChildForm((prev) => ({ ...prev, crud_menu_id: value }));
                  if (childFormErrors.crud_menu_id)
                    setChildFormErrors((prev) => ({
                      ...prev,
                      crud_menu_id: "",
                    }));
                }}
              >
                <SelectTrigger
                  className={
                    childFormErrors.crud_menu_id ? "border-red-500" : ""
                  }
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crudMenus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {childFormErrors.crud_menu_id && (
                <p className="text-sm text-red-500 mt-1">
                  {childFormErrors.crud_menu_id}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-child-description">Deskripsi</Label>
              <Textarea
                id="edit-child-description"
                value={childForm.description}
                onChange={(e) =>
                  setChildForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={childForm.status}
                onValueChange={(value: "active" | "hidden") =>
                  setChildForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditChildOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditChild}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Hapus Parent */}
      <AlertDialog
        open={!!deleteParentId}
        onOpenChange={() => setDeleteParentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Fitur Parent</AlertDialogTitle>
            <AlertDialogDescription>
              Hapus fitur parent ini? Semua child terkait akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteParentId && handleDeleteParent(deleteParentId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Konfirmasi Hapus Child */}
      <AlertDialog
        open={!!deleteChildId}
        onOpenChange={() => setDeleteChildId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Fitur Child</AlertDialogTitle>
            <AlertDialogDescription>
              Hapus fitur child ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteChildId && handleDeleteChild(deleteChildId)}
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

// debounce helper
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}
