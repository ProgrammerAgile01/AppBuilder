"use client";

import { useEffect, useState } from "react";
import { ModuleContents } from "./module-contents";
import { fetchData, fetchModuleStats } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface Module {
  id: string;
  name: string;
  menuTitle: string;
  description?: string;
  totalCategories: number;
  totalColumns: number;
  totalStats: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function ModulePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [dataModules, dataStats] = await Promise.all([
          fetchData("modules"),
          fetchModuleStats(),
        ]);

        setModules(dataModules);
        setStats(dataStats);
      } catch (err) {
        toast({
          title: "Gagal Memuat Modul",
          description: "Terjadi kesalahan saat mengambil data dari server",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return <ModuleContents modules={modules} loading={loading} stats={stats} />;
}
