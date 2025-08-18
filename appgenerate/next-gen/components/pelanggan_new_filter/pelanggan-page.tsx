"use client";

import { useEffect, useMemo, useState } from "react";
// Import komponen-komponen UI
import {
  PelangganHeader,
  PelangganFilters,
  PelangganTable,
  ResultsInfo,
  ColumnFilterConfig, // Import interface
} from "./pelanggan-page-contents";
import { fetchData, getDataById } from "@/lib/api";
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
import { Separator } from "@/components/ui/separator"; // Ganti import yang ambigu
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

// Fungsi helper untuk memetakan data mentah ke format yang diinginkan
const mapData = (rawData: any[]) => {
  if (!rawData) return [];
  return rawData.map((item: any) => ({
    id: String(item.id),
    nama: item.nama ?? item.name,
    // Tambahkan properti lain yang relevan untuk tabel
    status: item.status ?? "N/A",
    type: item.type ?? "N/A",
    ...item,
  }));
};

export function PelangganPage() {
  const router = useRouter();
  const [rawItems, setRawItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // State untuk filter dinamis
  const [filterConfigs, setFilterConfigs] = useState<ColumnFilterConfig[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Effect untuk memuat konfigurasi filter dari API
  useEffect(() => {
    const loadFilterConfigs = async () => {
      try {
        // Ganti 'ID_PELANGGAN_BUILDER' dengan ID dari builder pelanggan Anda
        const masterData = await getDataById(
          "crud-builders",
          "ID_PELANGGAN_BUILDER"
        );
        const filterCols = masterData?.filter_columns || [];
        setFilterConfigs(filterCols);

        const initialFilters: Record<string, string> = {};
        filterCols.forEach((config: ColumnFilterConfig) => {
          initialFilters[config.nama_kolom] = "all";
        });
        setFilters(initialFilters);
      } catch (err) {
        console.error("Failed to load filter configurations:", err);
      }
    };
    loadFilterConfigs();
  }, []);

  // Effect untuk memuat data berdasarkan filter dan search term
  useEffect(() => {
    const loadFilteredData = async () => {
      setLoading(true);
      try {
        const activeFilters = {
          ...filters,
          search: searchTerm,
        };

        const cleanedFilters = Object.fromEntries(
          Object.entries(activeFilters).filter(
            ([_, value]) => value !== "all" && value !== ""
          )
        );

        const dataItems = await fetchData("pelanggans", cleanedFilters);
        setRawItems(dataItems);
        setCurrentPage(1); // Reset halaman ke 1 setiap kali filter berubah
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

    // Pastikan filterConfigs sudah dimuat sebelum memuat data
    if (Object.keys(filters).length > 0) {
      loadFilteredData();
    }
  }, [filters, searchTerm]);

  const mappedItems = useMemo(() => mapData(rawItems), [rawItems]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const totalPages = Math.ceil(mappedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = mappedItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleDelete = (id: string) => {
    setRawItems(rawItems.filter((item) => String(item.id) !== String(id)));
  };

  const handleAdd = () => {
    router.push("/pelanggan/create");
  };

  const handleView = (id: string) => {
    router.push(`/pelanggan/view/${id}`);
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
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
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground">
                    Manajemen Pelanggan
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col">
            <div className="space-y-6 p-4">
              <PelangganHeader onAdd={handleAdd} />

              <PelangganFilters
                searchTerm={searchTerm}
                setSearchTerm={handleSearchChange}
                filterConfigs={filterConfigs}
                filters={filters}
                onFilterChange={handleFilterChange}
              />

              <ResultsInfo
                total={mappedItems.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
              />
              <PelangganTable
                handleView={handleView}
                handleDelete={handleDelete}
                filteredPelanggan={paginatedItems}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
