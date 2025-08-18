"use client";

import { useEffect, useMemo, useState } from "react";
import {
  VehicleHeader,
  VehicleFilters,
  VehicleTable,
  ResultsInfo,
} from "./vehicle-page-contents";
import { deleteData, fetchData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
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

const ITEMS_PER_PAGE = 10;

export function VehiclePage() {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, any>[]>([]);
  // const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [dataItems] = await Promise.all([
          // const [dataItems, dataStats] = await Promise.all([
          fetchData("vehicles"),
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
  }, []);

  const filteredVehicle = useMemo(() => {
    // return items.filter((item) => {
    // const matchesSearch =

    // const matchesStatus = statusFilter === "all" || item?.status === statusFilter
    // const matchesType = typeFilter === "all" || item?.type === typeFilter

    // return matchesSearch && matchesStatus && matchesType

    // return matchesSearch;

    const toSearchStr = (v: unknown): string =>
      (v == null
        ? ""
        : Array.isArray(v)
        ? v.join(" ")
        : String(v)
      ).toLowerCase();

    const q = (searchTerm ?? "").toLowerCase();
    if (!q) return items;

    const SEARCH_KEYS = [
      "plateNumber",
      "brand",
      "model",
      "year",
      "color",
      "vehicleType",
      "fuelType",
      "transmission",
      "numberOfSeats",
      "mileage",
      "dailyRate",
      "location",
      "status",
      "features",
      "frontPhoto",
      "sidePhoto",
      "backPhoto",
      "description",
    ] as const;

    return items.filter((item) =>
      SEARCH_KEYS.some((k) => toSearchStr((item as any)[k]).includes(q))
    );

    // })
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filteredVehicle.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredVehicle.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteData("vehicles", id);
      toast({
        title: "Berhasil!",
        description: "Data Vehicle berhasil dihapus.",
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      toast({
        title: "Gagal menghapus",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleAdd = () => {
    router.push("/vehicle/create");
  };

  const handleView = (id: string) => {
    router.push(`/vehicle/view/${id}`);
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* NOTEE BREADCUMB DI SESUAIKAN SAMA ROUTE MENU NANTI */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1 h-7 w-7 border border-white/20 text-white hover:bg-white/10 hover:text-white dark:border-white/30 dark:text-white dark:hover:bg-white/20 dark:hover:text-white" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/vehicles" // linknya juga diubah ketika sudah ada modul menu
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {/* Operations */} {/* diisi nama modul menu y */}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">
                    Vehicle Management
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col">
            <div className="space-y-6 p-4">
              <VehicleHeader onAdd={handleAdd} />
              <VehicleFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <ResultsInfo
                total={filteredVehicle.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
              />
              <VehicleTable
                handleView={handleView}
                handleDelete={handleDelete}
                filteredVehicle={filteredVehicle}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
  // return <VehicleContents items={items} loading={loading} stats={stats} />;
}
