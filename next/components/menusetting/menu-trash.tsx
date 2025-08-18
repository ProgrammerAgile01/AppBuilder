"use client";

import { useState } from "react";
import { Trash2, RotateCcw, X, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import type { ModuleGroup, Module, MenuItem } from "@/types/menu";
import * as Icons from "lucide-react";

interface MenuTrashProps {
  deletedGroups: ModuleGroup[];
  deletedModules: Module[];
  deletedMenus: MenuItem[];
  onRestore: (type: "group" | "module" | "menu", item: any) => void;
  onPermanentDelete: (type: "group" | "module" | "menu", item: any) => void;
  onClose: () => void;
}

export function MenuTrash({
  deletedGroups,
  deletedModules,
  deletedMenus,
  onRestore,
  onPermanentDelete,
  onClose,
}: MenuTrashProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "restore" | "permanent";
    itemType: "group" | "module" | "menu";
    item: any;
  }>({ open: false, type: "restore", itemType: "group", item: null });
  const { toast } = useToast();

  const renderIcon = (iconName?: string, size = 16) => {
    if (!iconName) return null;
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRestore = () => {
    const { itemType, item } = confirmDialog;
    onRestore(itemType, item);
    setConfirmDialog({
      open: false,
      type: "restore",
      itemType: "group",
      item: null,
    });
    toast({
      title: "Berhasil",
      description: `${
        itemType === "group"
          ? "Kelompok modul"
          : itemType === "module"
          ? "Modul"
          : "Menu"
      } berhasil dipulihkan`,
    });
  };

  const handlePermanentDelete = () => {
    const { itemType, item } = confirmDialog;
    onPermanentDelete(itemType, item);
    setConfirmDialog({
      open: false,
      type: "permanent",
      itemType: "group",
      item: null,
    });
    toast({
      title: "Berhasil",
      description: `${
        itemType === "group"
          ? "Kelompok modul"
          : itemType === "module"
          ? "Modul"
          : "Menu"
      } berhasil dihapus permanen`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            <CardTitle className="text-lg">Sampah Menu</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {deletedGroups.length +
                deletedModules.length +
                deletedMenus.length}{" "}
              item
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <Tabs defaultValue="groups" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="groups" className="flex items-center gap-2">
                Kelompok ({deletedGroups.length})
              </TabsTrigger>
              <TabsTrigger value="modules" className="flex items-center gap-2">
                Modul ({deletedModules.length})
              </TabsTrigger>
              <TabsTrigger value="menus" className="flex items-center gap-2">
                Menu ({deletedMenus.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="groups" className="space-y-3 mt-4">
              {deletedGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Tidak ada kelompok modul yang dihapus
                  </p>
                </div>
              ) : (
                deletedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 border rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        {renderIcon(group.icon, 18)}
                        <div>
                          <h4 className="font-medium">{group.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {group.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dihapus:{" "}
                            {group.deleted_at
                              ? formatDate(group.deleted_at)
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {group.modules.filter((m) => !m.is_deleted).length}{" "}
                          modul
                        </Badge>
                        {group.is_active ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "restore",
                              itemType: "group",
                              item: group,
                            })
                          }
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Pulihkan
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "permanent",
                              itemType: "group",
                              item: group,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus Permanen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="modules" className="space-y-3 mt-4">
              {deletedModules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada modul yang dihapus</p>
                </div>
              ) : (
                deletedModules.map((module) => (
                  <div
                    key={module.id}
                    className="p-4 border rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {renderIcon(module.icon, 18)}
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dihapus:{" "}
                            {module.deleted_at
                              ? formatDate(module.deleted_at)
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {module.menus.filter((m) => !m.is_deleted).length}{" "}
                          menu
                        </Badge>
                        {module.is_active ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "restore",
                              itemType: "module",
                              item: module,
                            })
                          }
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Pulihkan
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "permanent",
                              itemType: "module",
                              item: module,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus Permanen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="menus" className="space-y-3 mt-4">
              {deletedMenus.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada menu yang dihapus</p>
                </div>
              ) : (
                deletedMenus.map((menu) => (
                  <div
                    key={menu.id}
                    className="p-4 border rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {renderIcon(menu.icon, 18)}
                        <div>
                          <h4 className="font-medium">{menu.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {menu.url || "Tidak ada URL"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dihapus:{" "}
                            {menu.deleted_at
                              ? formatDate(menu.deleted_at)
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {menu.crud_builder_id && (
                          <Badge variant="outline" className="text-xs">
                            CRUD
                          </Badge>
                        )}
                        {menu.parent_id && (
                          <Badge variant="secondary" className="text-xs">
                            Submenu
                          </Badge>
                        )}
                        {menu.is_active ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "restore",
                              itemType: "menu",
                              item: menu,
                            })
                          }
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Pulihkan
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "permanent",
                              itemType: "menu",
                              item: menu,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus Permanen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.type === "restore" ? (
                <RotateCcw className="h-5 w-5 text-blue-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              {confirmDialog.type === "restore"
                ? "Konfirmasi Pulihkan"
                : "Konfirmasi Hapus Permanen"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "restore" ? (
                <>
                  Apakah Anda yakin ingin memulihkan{" "}
                  {confirmDialog.itemType === "group"
                    ? "kelompok modul"
                    : confirmDialog.itemType === "module"
                    ? "modul"
                    : "menu"}{" "}
                  "{confirmDialog.item?.name || confirmDialog.item?.title}"?
                  <br />
                  Item ini akan dikembalikan ke struktur menu aktif.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin menghapus permanen{" "}
                  {confirmDialog.itemType === "group"
                    ? "kelompok modul"
                    : confirmDialog.itemType === "module"
                    ? "modul"
                    : "menu"}{" "}
                  "{confirmDialog.item?.name || confirmDialog.item?.title}"?
                  <br />
                  <strong className="text-red-600">
                    Tindakan ini tidak dapat dibatalkan dan data akan hilang
                    selamanya.
                  </strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                confirmDialog.type === "restore"
                  ? handleRestore
                  : handlePermanentDelete
              }
              className={
                confirmDialog.type === "restore"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {confirmDialog.type === "restore" ? "Pulihkan" : "Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
