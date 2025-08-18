"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { ModuleGroup } from "@/types/menu";
import { IconSelector } from "@/components/ui/icon-selector";

interface ModuleGroupFormProps {
  group: ModuleGroup | null;
  onSave: (group: Partial<ModuleGroup>) => void;
  onCancel: () => void;
}

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

export function ModuleGroupForm({
  group,
  onSave,
  onCancel,
}: ModuleGroupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3b82f6",
  });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description,
        icon: group.icon || "",
        color: group.color || "#3b82f6",
      });
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            {group ? "Edit Kelompok Modul" : "Tambah Kelompok Modul"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelompok *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Masukkan nama kelompok modul"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Masukkan deskripsi kelompok modul"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <IconSelector
                label="Icon Kelompok"
                value={formData.icon}
                onChange={(icon) => setFormData((prev) => ({ ...prev, icon }))}
                placeholder="Pilih icon untuk kelompok modul"
              />
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? "border-primary scale-105"
                        : "border-border hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: color.value }))
                    }
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm text-muted-foreground">
                  Warna terpilih:{" "}
                  {colorOptions.find((c) => c.value === formData.color)?.name}
                </span>
              </div>
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
                {group ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
