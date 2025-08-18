"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import type { Module } from "@/lib/api";
import type { ModuleGroup } from "@/types/menu";
import { IconSelector } from "@/components/ui/icon-selector";

interface ModuleFormData {
  name: string;
  description: string;
  icon: string;
}

interface ModuleFormProps {
  module: Module | null;
  group: ModuleGroup;
  onSave: (module: Partial<Module>) => void;
  onCancel: () => void;
}

const moduleGroups = [
  { value: "Master", label: "Master", icon: X, color: "#3498db" },
  { value: "Transaksi", label: "Transaksi", icon: X, color: "#e74c3c" },
  { value: "System", label: "System", icon: X, color: "#2ecc71" },
  { value: "Users", label: "Users", icon: X, color: "#9b59b6" },
  { value: "Products", label: "Products", icon: X, color: "#f39c12" },
  { value: "Support", label: "Support", icon: X, color: "#1abc9c" },
];

export function ModuleForm({
  module,
  group,
  onSave,
  onCancel,
}: ModuleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    if (module) {
      setFormData({
        name: module.name,
        description: module.description,
        icon: module.icon || "",
      });
    }
  }, [module]);

  useEffect(() => {}, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Nama modul harus diisi.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      onSave(formData);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message ||
          `Gagal ${
            module ? "memperbarui" : "membuat"
          } modul. Silakan coba lagi.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">
              {module ? "Edit Modul" : "Tambah Modul"}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <Badge variant="outline" className="text-xs">
                {group.name}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Modul *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Masukkan nama modul"
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
                placeholder="Masukkan deskripsi modul"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <IconSelector
                label="Icon Modul"
                value={formData.icon}
                onChange={(icon) => setFormData((prev) => ({ ...prev, icon }))}
                placeholder="Pilih icon untuk modul"
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
                {isSubmitting
                  ? module
                    ? "Menyimpan..."
                    : "Membuat..."
                  : module
                  ? "Perbarui"
                  : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
