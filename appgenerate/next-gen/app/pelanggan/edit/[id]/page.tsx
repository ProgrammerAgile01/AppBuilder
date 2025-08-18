"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PelangganForm } from "@/components/pelanggan/form/pelanggan-form";
import { getDataById } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function EditPelangganPage() {
    const params = useParams();
    const id = params?.id as string;

    const [data, setData] = useState<Record<string, any> | null>(null);

    useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getDataById("pelanggans", id);
        setData(result);
      } catch (err: any) {
        toast({
          title: "Gagal memuat data",
          description: err.message || "Terjadi kesalahan.",
          variant: "destructive",
        });
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  if (!data) {
    return <p className="p-4 text-muted-foreground">Data tidak ditemukan.</p>;
  }

  return (
    <PelangganForm mode="edit" initialData={data} />
  )
}