"use client";

import React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { DataCustomerHeader, DataCustomerFilters, DataCustomerTable, ResultsInfo, PaginationControls } from "./data-customer-page-contents";
import { deleteData, fetchPaginatedData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SidebarTrigger } from "../ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";

import ActionBar from "@/components/actions/ActionBar";

const ITEMS_PER_PAGE = 10

export function DataCustomerPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [items, setItems] = useState<Record<string, any>[]>([]);
    // const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [meta, setMeta] = useState<{
        current_page?: number;
        per_page?: number;
        total?: number | null;
        last_page?: number | null;
        from?: number | null;
        to?: number | null;
    }>({});

    const refetch = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            // kalau nanti butuh stats juga:
            // const [dataItems/*, dataStats*/] = await Promise.all([
            //   fetchData("data-customers", { signal }),
            //   fetchModuleStats({ signal }),
            // ]);
            const dataItems = await fetchPaginatedData("data-customers", {
                signal,
                params: {
                    page: currentPage,
                    per_page: ITEMS_PER_PAGE,
                }
            });
            if (signal?.aborted) return;
            setItems(dataItems?.data ?? []);
            setMeta(dataItems?.meta ?? {});
            // setStats(dataStats);
        } catch (err: any) {
            if (err?.name === "AbortError") return;
            toast({
                title: "Gagal Memuat Data",
                description: err?.message || "Terjadi kesalahan saat mengambil data dari server",
                variant: "destructive",
            });
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [toast, currentPage]);

    // scroll awal (tetap terpisah)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // initial load
    useEffect(() => {
        const ctrl = new AbortController();
        refetch(ctrl.signal);
        return () => ctrl.abort();
    }, [refetch]);

    const filteredDataCustomer = useMemo(() => {
        // return items.filter((item) => {
           // const matchesSearch =
            
            // const matchesStatus = statusFilter === "all" || item?.status === statusFilter
            // const matchesType = typeFilter === "all" || item?.type === typeFilter

            // return matchesSearch && matchesStatus && matchesType

            // return matchesSearch;

            const toSearchStr = (v: unknown): string => (v == null ? "" : Array.isArray(v) ? v.join(" ") : String(v)).toLowerCase();

            const q = (searchTerm ?? "").toLowerCase();
            if (!q) return items;

            const SEARCH_KEYS = ["nama_lengkap","alamat","nama_instansi"] as const;

            return items.filter((item) => SEARCH_KEYS.some((k) => toSearchStr((item as any)[k]).includes(q)));

        // })
    }, [items, searchTerm]);

    const handleDelete = async (id: string) => {
        try {
            await deleteData("data-customers", id);
            toast({ title: "Success!", description: "DataCustomer Deleted Successfully." });
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (error: any) {
            toast({
            title: "Delete failed",
            description: error.message || "There Is An Error",
            variant: "destructive",
            });
        }
    };

    const handleAdd = () => {
        router.push("/data-customer/create");
    };

    const handleView = (id: string) => {
        router.push(`/data-customer/view/${id}`);
    };

    const CRUMBS = [{"title":"Master Data","route_path":null,"level":1,"type":"group"},{"title":"Customer","route_path":null,"level":2,"type":"module"},{"title":"Data Customer","route_path":"/data-customer","level":3,"type":"menu"}] as { title: string; route_path?: string|null; level: number; type: string }[];

    return (
        <>
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger className="-ml-1 h-7 w-7 border border-black/20 text-black hover:bg-black/10 hover:text-black dark:border-white/30 dark:text-white dark:hover:bg-white/20 dark:hover:text-white" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {/* <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink
                                href="/"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Dashboard
                            </BreadcrumbLink>
                        </BreadcrumbItem> */}
                        {CRUMBS.map((c, i) => (
                            <React.Fragment key={i}>
                                {i < CRUMBS.length - 1 ? (
                                    <>
                                        <BreadcrumbItem className="md:block">
                                            {/* <BreadcrumbLink href={c.route_path || "#"} className="text-muted-foreground hover:text-foreground"> */}
                                                {c.title}
                                            {/* </BreadcrumbLink> */}
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="md:block" />
                                    </>
                                ) : (
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-foreground">
                                            {c.title /* item terakhir = halaman saat ini */}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                )}
                                </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <div className="flex flex-1 flex-col">
                <div className="space-y-6 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <DataCustomerHeader onAdd={handleAdd} />
                        <ActionBar entity="data-customers" onDone={() => refetch()} />
                    </div>
                    <DataCustomerFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    <ResultsInfo
                        total={meta?.total ?? filteredDataCustomer.length}
                        currentPage={meta?.current_page ?? 1}
                        itemsPerPage={meta?.per_page ?? ITEMS_PER_PAGE}
                        from={
                            meta?.from ??
                            ((meta?.current_page ?? 1) - 1) *
                                (meta?.per_page ?? ITEMS_PER_PAGE) +
                                1
                        }
                        to={
                            meta?.to ??
                            (meta?.current_page ?? 1) * (meta?.per_page ?? ITEMS_PER_PAGE)
                        }
                    />
                    <DataCustomerTable handleView={handleView} handleDelete={handleDelete} filteredDataCustomer={filteredDataCustomer} />
                    <PaginationControls
                        currentPage={meta?.current_page ?? 1}
                        lastPage={
                            meta?.last_page ??
                            Math.max(
                                1,
                                Math.ceil(
                                (meta?.total ?? filteredDataCustomer.length) /
                                    (meta?.per_page ?? ITEMS_PER_PAGE)
                                )
                            )
                        }
                        onPageChange={setCurrentPage}
                        loading={loading}
                    />
                </div>
            </div>
        </>
    );
    // return <DataCustomerContents items={items} loading={loading} stats={stats} />;
}