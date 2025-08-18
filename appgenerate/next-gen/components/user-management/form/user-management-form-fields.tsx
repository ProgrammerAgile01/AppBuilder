"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserManagementFormFields({
    formData,
    setFormData,
    mode,
}: {
    formData: Record<string, any>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    mode: "create" | "edit";
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
    <CardHeader>
        <CardTitle className="text-foreground">General</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
  <Label htmlFor="nama">Nama*</Label>
  <Input
    type="text"
    id="nama"
    placeholder="e.g., John Doe"
    value={formData.nama || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "nama": e.target.value }))}
  />
</div>

<div className="space-y-1">
  <Label htmlFor="email">Email*</Label>
  <Input
    type="email"
    id="email"
    placeholder="e.g., johndoe@example"
    value={formData.email || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "email": e.target.value }))}
  />
</div>

<div className="space-y-1">
  <Label htmlFor="nomor_telp">Nomor Telepon*</Label>
  <Input
    type="number"
    id="nomor_telp"
    placeholder="e.g., 087162..."
    value={formData.nomor_telp || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "nomor_telp": e.target.value }))}
  />
</div>

<div className="space-y-1">
  <Label htmlFor="role">Role*</Label>
  <Input
    type="select"
    id="role"
    placeholder="e.g., Super Admin"
    value={formData.role || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "role": e.target.value }))}
  />
</div>

<div className="space-y-1">
  <Label htmlFor="status">Status*</Label>
  <select
    id="status"
    value={formData.status || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "status": e.target.value }))}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">-- Pilih --</option>
    <option value="Aktif">Aktif</option>
    <option value="Tidak Aktif">Tidak Aktif</option>
  </select>
</div>

<div className="space-y-1">
  <Label htmlFor="foto">Foto*</Label>
  <Input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          "foto": file,
          "foto_preview": URL.createObjectURL(file),
        }));
      }
    }}
  />
  {formData.foto_preview || formData.foto_url ? (
    <img
      src={formData.foto_preview || formData.foto_url}
      alt="Foto Preview"
      className="mt-2 rounded border w-48"
    />
  ) : null}
</div>


        </div>
    </CardContent>
</Card>


        </div>
    )
}