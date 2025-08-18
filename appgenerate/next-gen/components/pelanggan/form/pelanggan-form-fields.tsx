"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PelangganFormFields({
    formData,
    setFormData,
    mode,
}: {
    formData: Record<string, any>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    mode: "create" | "edit";
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
  <Label htmlFor="nama">Nama</Label>
  <Input
    type="text"
    value={formData.nama || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "nama": e.target.value }))}
  />
</div>


        </div>
    )
}