"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Settings,
  ShoppingCart,
  Users,
  Headphones,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchData } from "@/lib/api";

export interface ModuleFormData {
  id?: string;
  name: string;
  menu_title: string;
  //   table_name: string;
  description: string;
  total_categories: number;
  total_columns: number;
  total_stats: number;
  status: "draft" | "published" | "archived";
  created_by: string;
  //   module_group: string;
}

export const defaultFormData: ModuleFormData = {
  name: "",
  menu_title: "",
  //   table_name: "",
  description: "",
  total_categories: 0,
  total_columns: 0,
  total_stats: 0,
  status: "draft",
  created_by: "admin",
  //   module_group: "",
};

interface Props {
  formData: ModuleFormData;
  setFormData: Dispatch<SetStateAction<ModuleFormData>>;
  mode: "create" | "edit";
}

// const moduleGroups = [
//   { value: "Master", label: "Master", icon: Database },
//   { value: "Transaksi", label: "Transaksi", icon: ShoppingCart },
//   { value: "System", label: "System", icon: Settings },
//   { value: "Users", label: "Users", icon: Users },
//   { value: "Products", label: "Products", icon: Package },
//   { value: "Support", label: "Support", icon: Headphones },
// ];

export function ModuleFormFields({ formData, setFormData, mode }: Props) {
  const [groups, setGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const result = await fetchData("modules/groups");
        setGroups(result);
      } catch {
        setGroups(moduleGroups.map((g) => g.value));
        toast({
          title: "Error",
          description: "Gagal memuat grup. Gunakan default.",
          variant: "destructive",
        });
      } finally {
        setLoadingGroups(false);
      }
    };
    loadGroups();
  }, []);

  useEffect(() => {
    if (mode === "create" && formData.name) {
      const clean = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setFormData((prev) => ({
        ...prev,
        table_name: clean,
        menu_title: prev.menu_title || formData.name,
      }));
    }
  }, [formData.name]);

  const onChange = (field: keyof ModuleFormData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <Card className="shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="border-b bg-blue-50/50">
        <CardTitle>Informasi Modul</CardTitle>
        <CardDescription>Isi informasi dasar modul CRUD</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Name & Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Nama Modul</Label>
            <Input
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Judul Menu</Label>
            <Input
              value={formData.menu_title}
              onChange={(e) => onChange("menu_title", e.target.value)}
              required
            />
          </div>
        </div>
        {/* 
        Table & Group */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Nama Tabel</Label>
            <Input
              value={formData.table_name}
              onChange={(e) => onChange("table_name", e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Grup Modul</Label>
            <Select
              value={formData.module_group}
              onValueChange={(value) => onChange("module_group", value)}
              disabled={loadingGroups}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Grup" />
              </SelectTrigger>
              <SelectContent>
                {loadingGroups ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat...
                  </SelectItem>
                ) : (
                  groups.map((group) => {
                    const icon = moduleGroups.find(
                      (g) => g.value === group
                    )?.icon;
                    return (
                      <SelectItem key={group} value={group}>
                        <div className="flex items-center gap-2">
                          {icon && <>{icon({ className: "h-4 w-4" })}</>}
                          {group}
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        </div> */}

        {/* Deskripsi */}
        <div>
          <Label>Deskripsi</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Tuliskan deskripsi modul..."
          />
        </div>

        {/* Statistik untuk edit */}
        {mode === "edit" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label>Kategori</Label>
              <Input
                type="number"
                value={formData.total_categories}
                onChange={(e) =>
                  onChange("total_categories", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <Label>Kolom</Label>
              <Input
                type="number"
                value={formData.total_columns}
                onChange={(e) =>
                  onChange("total_columns", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <Label>Statistik</Label>
              <Input
                type="number"
                value={formData.total_stats}
                onChange={(e) =>
                  onChange("total_stats", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onChange("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div>
          <Label>Dibuat Oleh</Label>
          <Input
            value={formData.created_by}
            onChange={(e) => onChange("created_by", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
