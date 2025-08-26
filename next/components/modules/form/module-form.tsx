"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createData, updateData } from "@/lib/api";
import {
  ModuleFormFields,
  ModuleFormData,
  defaultFormData,
} from "./module-form-fields";

interface ModuleFormProps {
  initialData?: ModuleFormData;
  mode: "create" | "edit";
}

export function ModuleForm({ initialData, mode }: ModuleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ModuleFormData>(
    initialData || defaultFormData
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createData("modules", formData);
        toast({ title: "Berhasil!", description: "Modul berhasil dibuat." });
      } else {
        await updateData("modules", formData.id!, formData);
        toast({
          title: "Berhasil!",
          description: "Modul berhasil diperbarui.",
        });
      }
      router.push("/admin/modules");
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {mode === "create" ? "Buat Modul Baru" : "Edit Modul"}
            </h1>
            <p className="text-slate-600 mt-2">
              {mode === "create"
                ? "Buat modul CRUD baru"
                : "Perbarui informasi modul"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <ModuleFormFields
            mode={mode}
            formData={formData}
            setFormData={setFormData}
          />

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="relative min-w-[200px] px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                )}
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Modul"}</span>
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
