"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, LinkIcon } from "lucide-react";
import type { MenuItem, Module, CrudBuilderOption } from "@/types/menu";
import { IconSelector } from "@/components/ui/icon-selector";

interface MenuItemFormProps {
  menuItem: MenuItem | null;
  module: Module;
  crudBuilders: CrudBuilderOption[];
  existingMenus: MenuItem[];
  onSave: (menuItem: Partial<MenuItem>) => void;
  onCancel: () => void;
}

export function MenuItemForm({
  menuItem,
  module,
  crudBuilders,
  existingMenus,
  onSave,
  onCancel,
}: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    icon: "",
    parent_id: "",
    crud_builder_id: "",
    is_active: true,
    order: undefined as number | undefined,
    level: undefined as number | undefined,
  });

  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [useCustomTitle, setUseCustomTitle] = useState(false);

  // Hanya top-level menu (tanpa parent) selain dirinya
  const availableParentMenus = useMemo(
    () => existingMenus.filter((m) => !m.parent_id && m.id !== menuItem?.id),
    [existingMenus, menuItem?.id]
  );

  const selectedCrudBuilder = useMemo(
    () => crudBuilders.find((c) => c.id === formData.crud_builder_id),
    [crudBuilders, formData.crud_builder_id]
  );

  useEffect(() => {
    if (menuItem && menuItem.id) {
      setFormData({
        title: menuItem.title,
        url: menuItem.url || "",
        icon: menuItem.icon || "",
        parent_id: menuItem.parent_id || "",
        crud_builder_id: menuItem.crud_builder_id || "",
        is_active: menuItem.is_active,
        order: menuItem.order,
        level: menuItem.level,
      });
      const isCrudBased = !!menuItem.crud_builder_id;
      setUseCustomUrl(!isCrudBased);
      setUseCustomTitle(!isCrudBased);
    } else if (menuItem?.parent_id) {
      // Tambah submenu dari tombol “+ submenu”
      setFormData((prev) => ({
        ...prev,
        parent_id: String(menuItem.parent_id),
      }));
      setUseCustomUrl(true);
      setUseCustomTitle(true);
    } else {
      // Tambah menu utama di modul
      setFormData({
        title: "",
        url: "",
        icon: "",
        parent_id: "",
        crud_builder_id: "",
        is_active: true,
        order: undefined,
        level: undefined,
      });
      setUseCustomUrl(false);
      setUseCustomTitle(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItem?.id, menuItem?.parent_id]);

  useEffect(() => {
    if (!useCustomTitle && !useCustomUrl && formData.crud_builder_id) {
      const selectedCrud = crudBuilders.find(
        (c) => c.id === formData.crud_builder_id
      );
      if (selectedCrud) {
        setFormData((prev) => ({ ...prev, title: selectedCrud.menu_title }));
      }
    }
  }, [formData.crud_builder_id, crudBuilders, useCustomTitle, useCustomUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = formData.url;
    if (!useCustomUrl && formData.crud_builder_id) {
      const selectedCrud = crudBuilders.find(
        (c) => c.id === formData.crud_builder_id
      );
      if (selectedCrud) {
        finalUrl = `/admin/${selectedCrud.table_name}`;
      }
    }

    onSave({
      title: formData.title,
      url: finalUrl,
      icon: formData.icon || undefined,
      parent_id:
        formData.parent_id === "none" ? "" : formData.parent_id || undefined,
      crud_builder_id: useCustomUrl
        ? undefined
        : formData.crud_builder_id || undefined,
      is_active: formData.is_active,
      order: formData.order,
      level: formData.level, // tidak dipakai backend (auto), tapi biarkan ikut state untuk edit
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">
              {menuItem?.id
                ? "Edit Menu"
                : menuItem?.parent_id
                ? "Tambah Submenu"
                : "Tambah Menu"}
            </CardTitle>
            <Badge variant="outline" className="text-xs mt-1">
              {module.name}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Judul Menu *</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-title" className="text-sm">
                    Judul Custom
                  </Label>
                  <Switch
                    id="custom-title"
                    checked={useCustomTitle}
                    onCheckedChange={(checked) => {
                      setUseCustomTitle(checked);
                      if (!checked && formData.crud_builder_id) {
                        const selectedCrud = crudBuilders.find(
                          (c) => c.id === formData.crud_builder_id
                        );
                        if (selectedCrud) {
                          setFormData((prev) => ({
                            ...prev,
                            title: selectedCrud.menu_title,
                          }));
                        }
                      } else if (checked) {
                        setFormData((prev) => ({
                          ...prev,
                          title: prev.title || "",
                        }));
                      }
                    }}
                    disabled={useCustomUrl}
                  />
                </div>
              </div>

              {useCustomTitle || useCustomUrl ? (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Masukkan judul menu"
                  required
                />
              ) : (
                <Select
                  value={formData.crud_builder_id}
                  onValueChange={(value) => {
                    const selectedCrud = crudBuilders.find(
                      (c) => c.id === value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      crud_builder_id: value,
                      title: selectedCrud?.menu_title || "",
                    }));
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih CRUD Builder untuk judul" />
                  </SelectTrigger>
                  <SelectContent>
                    {crudBuilders.map((crud) => (
                      <SelectItem key={crud.id} value={crud.id}>
                        {crud.menu_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {availableParentMenus.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Menu (Opsional)</Label>
                <Select
                  value={formData.parent_id || "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      parent_id: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih parent menu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Tidak ada parent (Menu utama)
                    </SelectItem>
                    {availableParentMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sumber URL</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-url" className="text-sm">
                    Custom URL
                  </Label>
                  <Switch
                    id="custom-url"
                    checked={useCustomUrl}
                    onCheckedChange={(checked) => {
                      setUseCustomUrl(checked);
                      if (checked) {
                        setUseCustomTitle(true);
                        setFormData((prev) => ({
                          ...prev,
                          crud_builder_id: "",
                          url: prev.url || "",
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          url: "",
                          crud_builder_id: "",
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              {useCustomUrl ? (
                <div className="space-y-2">
                  <Label htmlFor="url">URL Custom</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="/admin/custom-page"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="crud-builder">CRUD Builder</Label>
                  <Select
                    value={formData.crud_builder_id}
                    onValueChange={(value) => {
                      const selectedCrud = crudBuilders.find(
                        (c) => c.id === value
                      );
                      setFormData((prev) => ({
                        ...prev,
                        crud_builder_id: value,
                        title: useCustomTitle
                          ? prev.title
                          : selectedCrud?.menu_title || prev.title,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih CRUD Builder" />
                    </SelectTrigger>
                    <SelectContent>
                      {crudBuilders.map((crud) => (
                        <SelectItem key={crud.id} value={crud.id}>
                          <div className="flex items-center gap-2">
                            <span>{crud.menu_title}</span>
                            <Badge variant="outline" className="text-xs">
                              {crud.table_name}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCrudBuilder && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LinkIcon className="h-3 w-3" />
                      <span>URL: /admin/{selectedCrudBuilder.table_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <IconSelector
                value={formData.icon}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, icon: value }))
                }
                label="Icon"
                placeholder="Pilih icon untuk menu"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-active">Menu Aktif</Label>
              <Switch
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                {menuItem?.id ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
