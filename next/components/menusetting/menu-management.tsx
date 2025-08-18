"use client";

import { useState, useEffect } from "react";
import * as Icons from "lucide-react";

import {
  Plus,
  Eye,
  EyeOff,
  ChevronRight,
  Folder,
  FileText,
  MenuIcon,
  Edit,
  Trash2,
  MoreHorizontal,
  Zap, // tombol Generate
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleGroupForm } from "./module-group-form";
import { ModuleForm } from "./module-form";
import { MenuItemForm } from "./menu-item-form";
import { MenuTrash } from "./menu-trash";
import { MenuTree } from "./menu-tree";
import { MenuPreview } from "./menu-preview";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import type {
  ModuleGroup,
  Module,
  MenuItem,
  MenuStructure,
  BackendMenu,
  CrudBuilderOption,
} from "@/types/menu";

import {
  fetchMenus,
  fetchMenusTreeWithTrashed,
  fetchMenusOnlyTrashed,
  createData,
  updateData,
  fetchCrudBuilders,
  deleteMenu,
  restoreMenu,
  forceDeleteMenu,
  generateFrontendMenu, // helper API generate
} from "@/lib/api";

/* ===== util icon lucide agar nama bebas (file-text, file_text, FileText) ===== */
const normalizeLucideName = (name?: string) => {
  if (!name) return "Folder";
  const cleaned = String(name)
    .replace(/\s+/g, "")
    .replace(/[-_](.)/g, (_: any, c: string) => c.toUpperCase());
  const pascal = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  const map: Record<string, string> = {
    filetext: "FileText",
    arrowrightleft: "ArrowRightLeft",
    rotateccw: "RotateCcw",
    creditcard: "CreditCard",
    barchart3: "BarChart3",
    usercheck: "UserCheck",
    dollarsign: "DollarSign",
    piechart: "PieChart",
  };
  return map[pascal.toLowerCase()] ?? pascal;
};

const renderIcon = (name?: string, className = "h-4 w-4") => {
  const key = normalizeLucideName(name);
  const Cmp = (Icons as any)[key] ?? Icons.Folder;
  return <Cmp className={className} />;
};

/* ================================
   Mapper: Backend -> UI (AKTIF)
   ================================ */
function mapApiToMenuStructure(apiMenus: BackendMenu[]): {
  groups: ModuleGroup[];
} {
  const groups: ModuleGroup[] = [];

  const rawChildren = (node: BackendMenu): BackendMenu[] =>
    node.recursive_children ?? (node as any).recursiveChildren ?? [];

  // filter out yang soft-deleted untuk struktur AKTIF
  const getChildren = (node: BackendMenu): BackendMenu[] =>
    (rawChildren(node) || []).filter((c: any) => !c?.deleted_at);

  const palette = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const topGroups = (apiMenus || [])
    .filter((g: any) => g.type === "group" && !g?.deleted_at)
    .sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));

  topGroups.forEach((groupApi, gi) => {
    const group: ModuleGroup = {
      id: String(groupApi.id),
      name: groupApi.title,
      description: groupApi.note ?? "",
      icon: groupApi.icon ?? undefined,
      order: groupApi.order_number ?? gi + 1,
      color: (groupApi as any).color || palette[gi % palette.length],
      is_active: groupApi.is_active,
      is_deleted: !!groupApi.deleted_at,
      deleted_at: groupApi.deleted_at,
      modules: [],
      created_at: groupApi.created_at,
      updated_at: groupApi.updated_at,
    };

    const moduleNodes = getChildren(groupApi)
      .filter((m: any) => m.type === "module" && !m?.deleted_at)
      .sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));

    moduleNodes.forEach((moduleApi) => {
      const module: Module = {
        id: String(moduleApi.id),
        name: moduleApi.title,
        description: moduleApi.note ?? "",
        icon: moduleApi.icon ?? undefined,
        order: moduleApi.order_number ?? 0,
        module_group_id: String(groupApi.id),
        is_active: moduleApi.is_active,
        is_deleted: !!moduleApi.deleted_at,
        deleted_at: moduleApi.deleted_at,
        menus: [],
        created_at: moduleApi.created_at,
        updated_at: moduleApi.updated_at,
      };

      const menuMap: Record<string, MenuItem> = {};

      const collectMenus = (parentNode: BackendMenu) => {
        const children = getChildren(parentNode) || [];
        children.forEach((child: any) => {
          if (child?.deleted_at) return;

          if (child.type === "menu") {
            const isTopLevel =
              child.parent_id === null ||
              String(child.parent_id) === String(moduleApi.id);

            const item: MenuItem = {
              id: String(child.id),
              title: child.title,
              url: child.route_path ?? undefined,
              icon: child.icon ?? undefined,
              order: child.order_number ?? 0,
              parent_id: isTopLevel
                ? undefined
                : child.parent_id
                ? String(child.parent_id)
                : undefined,
              level:
                typeof child.level === "number" && child.level > 0
                  ? child.level
                  : isTopLevel
                  ? ((moduleApi as any).level ?? 2) + 1
                  : ((parentNode as any).level ?? 2) + 1,
              crud_builder_id:
                (child as any).crud_builder_id != null
                  ? String((child as any).crud_builder_id)
                  : undefined,
              is_active: child.is_active,
              is_deleted: !!child.deleted_at,
              deleted_at: child.deleted_at,
              created_at: child.created_at,
              updated_at: child.updated_at,
            };

            menuMap[item.id] = item;
            collectMenus(child);
          } else {
            collectMenus(child);
          }
        });
      };

      collectMenus(moduleApi);

      Object.values(menuMap)
        .sort((a, b) => a.order - b.order)
        .forEach((m) => module.menus.push(m));

      group.modules.push(module);
    });

    groups.push(group);
  });

  return { groups };
}

/* =========================================
   Mapper: Backend (TRASH) -> tipe UI (TRASH)
   ========================================= */
function mapTrashGroups(apiMenus: BackendMenu[]): ModuleGroup[] {
  return apiMenus
    .filter((g) => g.type === "group" && !!g.deleted_at && g.parent_id === null)
    .map((g) => ({
      id: String(g.id),
      name: g.title,
      description: g.note ?? "",
      icon: g.icon ?? undefined,
      order: g.order_number ?? 0,
      color: undefined,
      is_active: g.is_active,
      is_deleted: true,
      deleted_at: g.deleted_at,
      modules: [],
      created_at: g.created_at,
      updated_at: g.updated_at,
    }));
}

function mapTrashModules(apiMenus: BackendMenu[]): Module[] {
  return apiMenus
    .filter((m) => m.type === "module" && !!m.deleted_at)
    .map((m) => ({
      id: String(m.id),
      name: m.title,
      description: m.note ?? "",
      icon: m.icon ?? undefined,
      order: m.order_number ?? 0,
      module_group_id: m.parent_id ? String(m.parent_id) : "",
      is_active: m.is_active,
      is_deleted: true,
      deleted_at: m.deleted_at,
      menus: [],
      created_at: m.created_at,
      updated_at: m.updated_at,
    }));
}

function mapTrashMenus(apiMenus: BackendMenu[]): MenuItem[] {
  return apiMenus
    .filter((n) => n.type === "menu" && !!n.deleted_at)
    .map((n) => ({
      id: String(n.id),
      title: n.title,
      url: n.route_path ?? undefined,
      icon: n.icon ?? undefined,
      order: n.order_number ?? 0,
      parent_id: n.parent_id ? String(n.parent_id) : undefined,
      level: typeof n.level === "number" ? n.level : 0,
      crud_builder_id:
        (n as any).crud_builder_id != null
          ? String((n as any).crud_builder_id)
          : undefined,
      is_active: n.is_active,
      is_deleted: true,
      deleted_at: n.deleted_at,
      created_at: n.created_at,
      updated_at: n.updated_at,
    }));
}

export function MenuManagement() {
  const [menuStructure, setMenuStructure] = useState<MenuStructure>({
    groups: [],
    crud_builders: [],
  });

  // === Tambahan: state untuk TRASH ===
  const [trashedGroups, setTrashedGroups] = useState<ModuleGroup[]>([]);
  const [trashedModules, setTrashedModules] = useState<Module[]>([]);
  const [trashedMenus, setTrashedMenus] = useState<MenuItem[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<ModuleGroup | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "group" | "module" | "menu";
    item: any;
  }>({ open: false, type: "group", item: null });

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false); // status generate
  const { toast } = useToast();

  // Data aktif (untuk UI utama)
  const activeGroups = menuStructure.groups.filter((g) => !g.is_deleted);

  // Badge sampah menggunakan state trash baru
  const trashCount =
    trashedGroups.length + trashedModules.length + trashedMenus.length;

  useEffect(() => {
    loadMenuStructure();
  }, []);

  const loadMenuStructure = async () => {
    try {
      setLoading(true);

      // 1) Tree untuk tampilan utama (root + recursiveChildren), include trashed di relasi
      // 2) Flat only-trashed untuk modal Sampah
      const [treeWith, onlyTrashed, crudBuilders] = await Promise.all([
        fetchMenusTreeWithTrashed(),
        fetchMenusOnlyTrashed(),
        fetchCrudBuilders(),
      ]);

      // Bangun struktur aktif (mapper mem-filter deleted_at)
      const { groups } = mapApiToMenuStructure(treeWith);
      setMenuStructure({ groups, crud_builders: crudBuilders });

      // Isi sampah dari flat onlyTrashed → paling andal untuk semua level
      setTrashedGroups(mapTrashGroups(onlyTrashed));
      setTrashedModules(mapTrashModules(onlyTrashed));
      setTrashedMenus(mapTrashMenus(onlyTrashed));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Gagal memuat struktur menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroup = async (groupData: Partial<ModuleGroup>) => {
    try {
      if (selectedGroup) {
        await updateData("menus", selectedGroup.id, {
          title: groupData.name,
          note: groupData.description,
          icon: groupData.icon,
          color: (groupData as any)?.color,
          is_active: groupData.is_active,
          type: "group",
          parent_id: null,
          order_number: groupData.order ?? selectedGroup.order,
        });
        toast({
          title: "Berhasil",
          description: "Kelompok modul berhasil diperbarui",
        });
      } else {
        await createData("menus", {
          title: groupData.name,
          note: groupData.description,
          icon: groupData.icon,
          color: (groupData as any)?.color,
          type: "group",
          parent_id: null,
          is_active: true,
          order_number: (menuStructure.groups?.length ?? 0) + 1,
        });
        toast({
          title: "Berhasil",
          description: "Kelompok modul berhasil ditambahkan",
        });
      }
      setShowGroupForm(false);
      setSelectedGroup(null);
      await loadMenuStructure();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan kelompok modul",
        variant: "destructive",
      });
    }
  };

  const handleSaveModule = async (moduleData: Partial<Module>) => {
    if (!selectedGroup) return;
    try {
      if (selectedModule) {
        await updateData("menus", selectedModule.id, {
          title: moduleData.name,
          note: moduleData.description,
          icon: moduleData.icon,
          is_active: moduleData.is_active,
          type: "module",
          parent_id: selectedGroup.id,
          order_number: moduleData.order ?? selectedModule.order,
        });
        toast({ title: "Berhasil", description: "Modul berhasil diperbarui" });
      } else {
        await createData("menus", {
          title: moduleData.name,
          note: moduleData.description,
          icon: moduleData.icon,
          type: "module",
          parent_id: selectedGroup.id,
          is_active: true,
          order_number: (selectedGroup.modules?.length ?? 0) + 1,
        });
        toast({ title: "Berhasil", description: "Modul berhasil ditambahkan" });
      }
      setShowModuleForm(false);
      setSelectedModule(null);
      await loadMenuStructure();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan modul",
        variant: "destructive",
      });
    }
  };

  const handleSaveMenuItem = async (menuItemData: Partial<MenuItem>) => {
    if (!selectedModule) return;
    try {
      if (selectedMenuItem?.id) {
        await updateData("menus", selectedMenuItem.id, {
          title: menuItemData.title,
          route_path: menuItemData.url,
          icon: menuItemData.icon,
          is_active: menuItemData.is_active,
          parent_id: menuItemData.parent_id
            ? menuItemData.parent_id
            : selectedModule.id,
          crud_builder_id: menuItemData.crud_builder_id || null,
          type: "menu",
          order_number: menuItemData.order ?? selectedMenuItem.order,
        });
        toast({ title: "Berhasil", description: "Menu berhasil diperbarui" });
      } else {
        const parentId = menuItemData.parent_id || selectedModule.id;
        await createData("menus", {
          title: menuItemData.title,
          route_path: menuItemData.url,
          icon: menuItemData.icon,
          type: "menu",
          parent_id: parentId,
          is_active: menuItemData.is_active ?? true,
          crud_builder_id: menuItemData.crud_builder_id || null,
          order_number: (selectedModule.menus?.length ?? 0) + 1,
        });
        toast({ title: "Berhasil", description: "Menu berhasil ditambahkan" });
      }
      setShowMenuForm(false);
      setSelectedMenuItem(null);
      await loadMenuStructure();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan menu",
        variant: "destructive",
      });
    }
  };

  /* ==============
     Generate file
     ============== */
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      // generate keseluruhan file app-sidebar.tsx
      await generateFrontendMenu();
      toast({
        title: "Berhasil",
        description: "Sidebar berhasil digenerate.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Gagal generate sidebar",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  /* ================================
     Soft Delete / Restore / Force
     ================================ */
  const handleDelete = async () => {
    const { type, item } = deleteDialog;
    if (!item?.id) return;

    try {
      await deleteMenu(String(item.id)); // soft delete

      if (type === "group") {
        if (selectedGroup?.id === item.id) {
          setSelectedGroup(null);
          setSelectedModule(null);
          setSelectedMenuItem(null);
        }
        toast({
          title: "Berhasil",
          description: "Kelompok modul dipindahkan ke sampah",
        });
      } else if (type === "module") {
        if (selectedModule?.id === item.id) {
          setSelectedModule(null);
          setSelectedMenuItem(null);
        }
        toast({
          title: "Berhasil",
          description: "Modul dipindahkan ke sampah",
        });
      } else {
        if (selectedMenuItem?.id === item.id) setSelectedMenuItem(null);
        toast({ title: "Berhasil", description: "Menu dipindahkan ke sampah" });
      }

      await loadMenuStructure();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Gagal menghapus item",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, type: "group", item: null });
    }
  };

  const handleRestore = async (
    type: "group" | "module" | "menu",
    item: any
  ) => {
    if (!item?.id) return;
    try {
      await restoreMenu(String(item.id));
      toast({
        title: "Dipulihkan",
        description:
          type === "group"
            ? "Kelompok modul dipulihkan."
            : type === "module"
            ? "Modul dipulihkan."
            : "Menu dipulihkan.",
      });
      await loadMenuStructure();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Gagal memulihkan item",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (
    type: "group" | "module" | "menu",
    item: any
  ) => {
    if (!item?.id) return;
    try {
      await forceDeleteMenu(String(item.id));
      toast({
        title: "Terhapus Permanen",
        description:
          type === "group"
            ? "Kelompok modul dihapus permanen."
            : type === "module"
            ? "Modul dihapus permanen."
            : "Menu dihapus permanen.",
      });
      await loadMenuStructure();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Gagal menghapus permanen item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat struktur menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <h2 className="text-2xl font-bold">Pengaturan Menu</h2> */}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setShowTrash(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Sampah
          {trashCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {trashCount}
            </Badge>
          )}
        </Button>

        {/* Tombol Generate (tanpa ubah UI lainnya) */}
        <Button
          variant="outline"
          onClick={handleGenerate}
          className="flex items-center gap-2 bg-transparent"
          disabled={generating}
        >
          <Zap className="h-4 w-4" />
          {generating ? "Generating..." : "Generate"}
        </Button>
      </div>

      <Tabs defaultValue="structure" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="structure">Struktur Menu</TabsTrigger>
          <TabsTrigger value="preview">Preview Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kelompok Modul */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Kelompok Modul
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedGroup(null);
                    setShowGroupForm(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {menuStructure.groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedModule(null);
                      setSelectedMenuItem(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        {group.icon ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-muted/60">
                            {renderIcon(group.icon)}
                          </span>
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                        )}
                        <span className="font-medium text-sm">
                          {group.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {group.modules.length}
                        </Badge>
                        {group.is_active ? (
                          <Eye className="h-3 w-3 text-green-500" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
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
                                setSelectedGroup(group);
                                setShowGroupForm(true);
                              }}
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDialog({
                                  open: true,
                                  type: "group",
                                  item: group,
                                });
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {group.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Modul */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Modul
                  {selectedGroup && (
                    <Badge variant="outline" className="text-xs">
                      {selectedGroup.name}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  disabled={!selectedGroup}
                  onClick={() => {
                    setSelectedModule(null);
                    setShowModuleForm(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedGroup ? (
                  selectedGroup.modules.map((module) => (
                    <div
                      key={module.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedModule?.id === module.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        setSelectedModule(module);
                        setSelectedMenuItem(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm flex items-center gap-2">
                          {module.icon && renderIcon(module.icon)}
                          {module.name}
                        </span>

                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {module.menus.length}
                          </Badge>
                          {module.is_active ? (
                            <Eye className="h-3 w-3 text-green-500" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-gray-400" />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
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
                                  setSelectedModule(module);
                                  setShowModuleForm(true);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({
                                    open: true,
                                    type: "module",
                                    item: module,
                                  });
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Pilih kelompok modul terlebih dahulu
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MenuIcon className="h-4 w-4" />
                  Menu
                  {selectedModule && (
                    <Badge variant="outline" className="text-xs">
                      {selectedModule.name}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  disabled={!selectedModule}
                  onClick={() => {
                    setSelectedMenuItem(null);
                    setShowMenuForm(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedModule ? (
                  <MenuTree
                    menus={selectedModule.menus}
                    onSelectMenu={setSelectedMenuItem}
                    selectedMenu={selectedMenuItem}
                    onAddSubmenu={(parentId) => {
                      setSelectedMenuItem({ parent_id: parentId } as MenuItem);
                      setShowMenuForm(true);
                    }}
                    onEditMenu={(menu) => {
                      setSelectedMenuItem(menu);
                      setShowMenuForm(true);
                    }}
                    onDeleteMenu={(menu) => {
                      setDeleteDialog({ open: true, type: "menu", item: menu });
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MenuIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Pilih modul terlebih dahulu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <MenuPreview menuStructure={menuStructure} />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showGroupForm && (
        <ModuleGroupForm
          group={selectedGroup}
          onSave={handleSaveGroup}
          onCancel={() => {
            setShowGroupForm(false);
            setSelectedGroup(null);
          }}
        />
      )}

      {showModuleForm && selectedGroup && (
        <ModuleForm
          module={selectedModule}
          group={selectedGroup}
          onSave={handleSaveModule}
          onCancel={() => {
            setShowModuleForm(false);
            setSelectedModule(null);
          }}
        />
      )}

      {showMenuForm && selectedModule && (
        <MenuItemForm
          menuItem={selectedMenuItem}
          module={selectedModule}
          crudBuilders={menuStructure.crud_builders}
          existingMenus={selectedModule.menus}
          onSave={handleSaveMenuItem}
          onCancel={() => {
            setShowMenuForm(false);
            setSelectedMenuItem(null);
          }}
        />
      )}

      {/* Trash Modal */}
      {showTrash && (
        <MenuTrash
          // KIRIM dari state TRASH baru
          deletedGroups={trashedGroups}
          deletedModules={trashedModules}
          deletedMenus={trashedMenus}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onClose={() => setShowTrash(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              {deleteDialog.type === "group"
                ? "kelompok modul"
                : deleteDialog.type === "module"
                ? "modul"
                : "menu"}{" "}
              "{deleteDialog.item?.name || deleteDialog.item?.title}"?
              {deleteDialog.type === "group" &&
                " Semua modul dan menu di dalamnya akan ikut terhapus."}
              {deleteDialog.type === "module" &&
                " Semua menu di dalamnya akan ikut terhapus."}
              <br />
              <strong>Tindakan ini tidak dapat dibatalkan.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
