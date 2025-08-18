"use client";

import { useEffect, useState } from "react";
import { KendaraanHeader, KendaraanFilters, MobileKendaraanCard, KendaraanTable as KendaraanContents } from "./kendaraan-page-contents";
import { fetchData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function KendaraanPage() {
    const [items, setItems] = useState<Record<string, any>[]>([]);
    // const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const [dataItems] = await Promise.all([
                // const [dataItems, dataStats] = await Promise.all([
                    fetchData("kendaraans"),
                    // fetchModuleStats(),
                ]);

                setItems(dataItems);
                // setStats(dataStats);
            } catch (err) {
                toast({
                    title: "Gagal Memuat Data",
                    description: "Terjadi kesalahan saat mengambil data dari server",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [])

    return <KendaraanContents items={items}/>;
    // return <KendaraanContents items={ENTITY_CAMEL} loading={loading} stats={stats} />;
}