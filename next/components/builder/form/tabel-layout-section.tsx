"use client";

/**
 * TabelLayoutSection.tsx — Opsi A (Sinkron real-time) + Edit-friendly
 * -------------------------------------------------------------------
 * - StatusMappings (global) → DISINKRONKAN otomatis ke semua content badge
 *   di kolom terpilih (selectedColumn)
 * - Preview badge warna pakai fallback ke StatusMappings global bila per-content kosong
 * - Mode edit: saat pilih kolom, badge_config lama diangkat jadi statusMappings (panel langsung terisi)
 * - Saat ganti displayType → "badge", konten disemai (seed) dari rules global
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Type,
  Tag,
  DollarSign,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Palette,
  X,
  Edit,
  Eye,
  Maximize2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import type {
  TableLayout,
  TableColumn,
  TableColumnContent,
} from "../../crud-builder-page";

/* =======================
   Types & helpers
======================= */
interface StatusMapping {
  id: string;
  value: string;
  label: string;
  color: string; // "green" | "red" | ...
  bgColor: string; // only for UI preview chip
}

type BadgeRule = { value: string; label: string; color: string };

type ContentWithBadge = TableColumnContent & {
  badgeConfig?: BadgeRule[];
};

interface TabelLayoutSectionProps {
  tableLayout: TableLayout & { statusMappings?: StatusMapping[] };
  setTableLayout: (
    layout: TableLayout & { statusMappings?: StatusMapping[] }
  ) => void;
  availableColumns: Array<{ id: string; label: string; namaKolom: string }>;
  getEnumOptionsForColumn: (columnId: string) => string[];
}

const DISPLAY_TYPES = [
  { value: "text", label: "Text", icon: Type, description: "Simple text" },
  { value: "image", label: "Image", icon: ImageIcon, description: "Image" },
  { value: "badge", label: "Badge", icon: Tag, description: "Status badge" },
  {
    value: "currency",
    label: "Currency",
    icon: DollarSign,
    description: "Rp / $, etc.",
  },
  { value: "date", label: "Date", icon: Calendar, description: "Date" },
  {
    value: "icon_text",
    label: "Icon + Text",
    icon: Star,
    description: "Icon with text",
  },
];

const FONT_SIZES = [
  { value: "text-xs", label: "Extra Small" },
  { value: "text-sm", label: "Small" },
  { value: "text-base", label: "Normal" },
  { value: "text-lg", label: "Large" },
  { value: "text-xl", label: "Extra Large" },
];

const FONT_WEIGHTS = [
  { value: "font-normal", label: "Normal" },
  { value: "font-medium", label: "Medium" },
  { value: "font-semibold", label: "Semibold" },
  { value: "font-bold", label: "Bold" },
];

const TEXT_COLORS = [
  { value: "text-gray-900", label: "Dark Gray", color: "#111827" },
  { value: "text-gray-600", label: "Gray", color: "#4B5563" },
  { value: "text-blue-600", label: "Blue", color: "#2563EB" },
  { value: "text-green-600", label: "Green", color: "#059669" },
  { value: "text-red-600", label: "Red", color: "#DC2626" },
  { value: "text-yellow-600", label: "Yellow", color: "#D97706" },
  { value: "text-purple-600", label: "Purple", color: "#9333EA" },
];

const BADGE_COLORS = [
  {
    value: "green",
    label: "Green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  {
    value: "blue",
    label: "Blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  {
    value: "yellow",
    label: "Yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  {
    value: "red",
    label: "Red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
  {
    value: "purple",
    label: "Purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  },
  {
    value: "gray",
    label: "Gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
  {
    value: "orange",
    label: "Orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
  },
];

const IMAGE_SIZES = [
  { value: "32", label: "Small (32px)" },
  { value: "48", label: "Medium (48px)" },
  { value: "64", label: "Large (64px)" },
  { value: "80", label: "Extra Large (80px)" },
  { value: "96", label: "XXL (96px)" },
  { value: "128", label: "Huge (128px)" },
];

const OBJECT_FIT_OPTIONS = [
  { value: "cover", label: "Cover", description: "Crop to fill container" },
  { value: "contain", label: "Contain", description: "Fit entire image" },
  { value: "fill", label: "Fill", description: "Stretch to fill" },
  {
    value: "scale-down",
    label: "Scale Down",
    description: "Scale down if needed",
  },
];

const BORDER_RADIUS_OPTIONS = [
  { value: "0px", label: "None" },
  { value: "4px", label: "Small" },
  { value: "8px", label: "Medium" },
  { value: "12px", label: "Large" },
  { value: "16px", label: "Extra Large" },
  { value: "50%", label: "Circle" },
];

function isStatusColumn(column: TableColumn) {
  return (
    column.headerLabel.toLowerCase().includes("status") ||
    column.contents.some((c) => c.displayType === "badge")
  );
}

function toBadgeConfig(mappings: StatusMapping[]) {
  return (mappings || [])
    .filter((m) => (m.value || "").trim())
    .map<BadgeRule>((m) => ({
      value: String(m.value).trim(),
      label: (m.label || m.value || "").trim(),
      color: m.color || "gray",
    }));
}

function badgeColorClass(color: string) {
  const c = BADGE_COLORS.find((x) => x.value === color);
  return c ? `${c.bgColor} ${c.textColor}` : "bg-gray-100 text-gray-800";
}

/** Ambil class warna badge dengan fallback ke rules global */
function getBadgeClass(
  content: ContentWithBadge,
  status: string,
  globalRules: BadgeRule[]
) {
  const value = (status || "").toLowerCase();
  const rules =
    (content.badgeConfig?.length ? content.badgeConfig : globalRules) || [];
  const match = rules.find((r) => (r.value || "").toLowerCase() === value);
  return badgeColorClass(match?.color || "gray");
}

/** Mapping dari column (per-content badge_config) → StatusMapping[] untuk UI panel */
function mappingsFromColumn(column?: TableColumn): StatusMapping[] {
  if (!column) return [];
  const badge = (column.contents || []).find(
    (c) => c.displayType === "badge"
  ) as ContentWithBadge | undefined;

  if (!badge || !Array.isArray(badge.badgeConfig)) return [];
  return badge.badgeConfig.map((r) => {
    const palette = BADGE_COLORS.find((c) => c.value === r.color);
    return {
      id: uuidv4(),
      value: r.value || "",
      label: r.label || r.value || "",
      color: r.color || "gray",
      bgColor: palette
        ? `${palette.bgColor} ${palette.textColor}`
        : "bg-gray-100 text-gray-800",
    };
  });
}

/* =======================
   Component
======================= */
export function TabelLayoutSection({
  tableLayout,
  setTableLayout,
  availableColumns,
  getEnumOptionsForColumn,
}: TabelLayoutSectionProps) {
  const [activeTab, setActiveTab] = useState("columns");
  const [selectedColumn, setSelectedColumn] = useState<TableColumn | null>(
    null
  );

  /* -------- Global rules seed untuk kartu content -------- */
  const globalBadgeSeed: BadgeRule[] = useMemo(
    () => toBadgeConfig(tableLayout.statusMappings || []),
    [tableLayout.statusMappings]
  );
  const getGlobalBadgeSeed = () => globalBadgeSeed;

  /* ----------------------------------
     Column CRUD
  ---------------------------------- */
  const addTableColumn = () => {
    const newColumn: TableColumn = {
      id: uuidv4(),
      headerLabel: "New Column",
      headerLabelEn: "New Column",
      width: "auto",
      alignment: "left",
      isVisible: true,
      position: tableLayout.columns.length + 1,
      layout: "single",
      contents: [],
      imageColumnContents: [],
    };
    setTableLayout({
      ...tableLayout,
      columns: [...tableLayout.columns, newColumn],
    });
    setSelectedColumn(newColumn);
  };

  const updateTableColumn = (
    columnId: string,
    updates: Partial<TableColumn>
  ) => {
    const updatedColumns = tableLayout.columns.map((col) =>
      col.id === columnId ? { ...col, ...updates } : col
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
    if (selectedColumn?.id === columnId) {
      setSelectedColumn({ ...selectedColumn, ...updates });
    }
  };

  const deleteTableColumn = (columnId: string) => {
    const updatedColumns = tableLayout.columns.filter(
      (col) => col.id !== columnId
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
    if (selectedColumn?.id === columnId) setSelectedColumn(null);
    toast({ title: "Column Deleted", description: "Table column removed." });
  };

  /* ----------------------------------
     Content CRUD (single layout)
  ---------------------------------- */
  const addColumnContent = (columnId: string) => {
    if (!availableColumns.length) {
      toast({
        title: "Tidak ada kolom sumber",
        description: "Tambahkan kolom di tab Column Data terlebih dahulu.",
        variant: "destructive",
      });
    }
    const newContent: ContentWithBadge = {
      id: uuidv4(),
      columnId: availableColumns[0]?.id || "",
      displayType: "text",
      label: "New Content",
      labelEn: "New Content",
      position: 1,
      styling: {
        fontSize: "text-sm",
        fontWeight: "font-normal",
        color: "text-gray-900",
        textAlign: "left",
      },
      imageSettings: {
        width: "64px",
        height: "48px",
        objectFit: "cover",
        borderRadius: "8px",
      },
    };
    const updatedColumns = tableLayout.columns.map((col) =>
      col.id === columnId
        ? { ...col, contents: [...col.contents, newContent] }
        : col
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
  };

  const updateColumnContent = (
    columnId: string,
    contentId: string,
    updates: Partial<ContentWithBadge>
  ) => {
    const updatedColumns = tableLayout.columns.map((col) =>
      col.id === columnId
        ? {
            ...col,
            contents: col.contents.map((content) =>
              content.id === contentId
                ? ({ ...content, ...updates } as any)
                : content
            ),
          }
        : col
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
  };

  const deleteColumnContent = (columnId: string, contentId: string) => {
    const updatedColumns = tableLayout.columns.map((col) =>
      col.id === columnId
        ? {
            ...col,
            contents: col.contents.filter(
              (content) => content.id !== contentId
            ),
          }
        : col
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
  };

  const moveColumnContent = (
    columnId: string,
    contentId: string,
    direction: "up" | "down"
  ) => {
    const column = tableLayout.columns.find((col) => col.id === columnId);
    if (!column) return;

    const idx = column.contents.findIndex(
      (content) => content.id === contentId
    );
    if (idx === -1) return;

    const newContents = [...column.contents];
    if (direction === "up" && idx > 0) {
      [newContents[idx], newContents[idx - 1]] = [
        newContents[idx - 1],
        newContents[idx],
      ];
    } else if (direction === "down" && idx < newContents.length - 1) {
      [newContents[idx], newContents[idx + 1]] = [
        newContents[idx + 1],
        newContents[idx],
      ];
    }

    updateTableColumn(columnId, { contents: newContents });
  };

  /* ----------------------------------
     Image-only slot (two_columns)
  ---------------------------------- */
  const addImageColumnContent = (columnId: string) => {
    if (!availableColumns.length) {
      toast({
        title: "Tidak ada kolom sumber",
        description: "Tambahkan kolom di tab Column Data terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    const newContent: TableColumnContent = {
      id: uuidv4(),
      columnId: availableColumns[0]?.id || "",
      displayType: "image",
      label: "Image",
      labelEn: "Image",
      position: 1,
      styling: {
        fontSize: "text-sm",
        fontWeight: "font-normal",
        color: "text-gray-900",
        textAlign: "left",
      },
      imageSettings: {
        width: "80px",
        height: "60px",
        objectFit: "cover",
        borderRadius: "8px",
      },
    };
    const updatedColumns = tableLayout.columns.map((col) =>
      col.id === columnId ? { ...col, imageColumnContents: [newContent] } : col
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
  };

  const updateImageColumnContent = (
    columnId: string,
    contentId: string,
    updates: Partial<TableColumnContent>
  ) => {
    const updatedColumns = tableLayout.columns.map((col) =>
      col.id === columnId
        ? {
            ...col,
            imageColumnContents:
              col.imageColumnContents?.map((content) =>
                content.id === contentId ? { ...content, ...updates } : content
              ) || [],
          }
        : col
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
  };

  const deleteImageColumnContent = (columnId: string) => {
    const updatedColumns = tableLayout.columns.map((col) =>
      col.id === columnId ? { ...col, imageColumnContents: [] } : col
    );
    setTableLayout({ ...tableLayout, columns: updatedColumns });
  };

  /* ----------------------------------
     Opsi A: Sinkron real-time
     - Saat statusMappings berubah, salin ke SEMUA content badge
       pada kolom yang DIPILIH (selectedColumn)
  ---------------------------------- */
  function applyStatusMappingsToColumn(columnId: string) {
    const column = tableLayout.columns.find((c) => c.id === columnId);
    if (!column) return;

    const rules = toBadgeConfig(tableLayout.statusMappings || []);
    const updatedCol: TableColumn = {
      ...column,
      contents: column.contents.map((ct) =>
        ct.displayType === "badge" ? ({ ...ct, badgeConfig: rules } as any) : ct
      ),
    };
    setTableLayout({
      ...tableLayout,
      columns: tableLayout.columns.map((c) =>
        c.id === columnId ? updatedCol : c
      ),
    });
  }

  useEffect(() => {
    if (selectedColumn) applyStatusMappingsToColumn(selectedColumn.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableLayout.statusMappings, selectedColumn?.id]);

  /* ----------------------------------
     Mode Edit UX:
     - Saat pilih kolom, baca badge_config pertama → isi statusMappings (panel muncul & terisi)
  ---------------------------------- */
  const handleSelectColumn = (column: TableColumn) => {
    setSelectedColumn(column);
    const mapped = mappingsFromColumn(column);
    if (mapped.length) {
      setTableLayout((prev) => ({ ...prev, statusMappings: mapped }));
    }
  };

  // In case selectedColumn sudah ada (mis. dari parent), saat ID berubah lakukan inisialisasi juga
  useEffect(() => {
    if (!selectedColumn) return;
    const mapped = mappingsFromColumn(selectedColumn);
    if (mapped.length) {
      setTableLayout((prev) => ({ ...prev, statusMappings: mapped }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColumn?.id]);

  /* ----------------------------------
     Preview helpers
  ---------------------------------- */
  const renderImageWithSettings = (
    content: TableColumnContent,
    src: string,
    alt: string
  ) => {
    const imageSettings = content.imageSettings || {
      width: "64px",
      height: "48px",
      objectFit: "cover",
      borderRadius: "8px",
    };

    const placeholderSrc = src.includes("placeholder.svg")
      ? src
      : `/placeholder.svg?height=${parseInt(
          imageSettings.height
        )}px&width=${parseInt(imageSettings.width)}px&text=${encodeURIComponent(
          alt
        )}`;

    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={placeholderSrc || "/placeholder.svg"}
        alt={alt}
        className="bg-gray-200"
        style={{
          width: `${imageSettings.width}px`,
          height: `${imageSettings.height}px`,
          objectFit: imageSettings.objectFit,
          borderRadius: imageSettings.borderRadius,
        }}
      />
    );
  };

  // Kumpulkan kandidat status untuk 1 kolom (dari per-content badgeConfig; kalau kosong → global; kalau kosong juga → fallback)
  const getStatusCandidatesForColumn = (
    col: TableColumn,
    globalRules: BadgeRule[]
  ) => {
    // ambil semua aturan dari semua content yang displayType=badge
    const perContent = (col.contents || [])
      .filter((c) => (c as any).displayType === "badge")
      .flatMap((c) => ((c as any).badgeConfig || []) as BadgeRule[])
      .map((r) => r.value?.trim())
      .filter(Boolean) as string[];

    const unique = Array.from(new Set(perContent));

    if (unique.length) return unique;

    const fromGlobal = (globalRules || [])
      .map((r) => r.value?.trim())
      .filter(Boolean) as string[];
    if (fromGlobal.length) return Array.from(new Set(fromGlobal));

    // fallback terakhir (kalau sama sekali belum ada aturan)
    return ["Available", "Rented", "Maintenance"];
  };

  function formatCurrency(
    value: number,
    currency: string = "IDR",
    locale: string = "id-ID"
  ) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return `Rp ${value.toLocaleString("id-ID")}`;
    }
  }

  function getCurrencyDemo(i: number) {
    // angka dummy biar ada variasi
    const base = 250_000;
    return base + i * 10_000;
  }

  const renderPreview = () => {
    const globalRules = toBadgeConfig(tableLayout.statusMappings || []);

    // Bangun 4 baris dummy, statusnya diambil dari kandidat status kolom "status" (kalau ada)
    // Cari kolom yang mengandung badge
    const statusColumn = tableLayout.columns.find(
      (c) =>
        c.isVisible &&
        c.contents.some((ct) => (ct as any).displayType === "badge")
    );
    const statusPool = statusColumn
      ? getStatusCandidatesForColumn(statusColumn, globalRules)
      : [];

    // fungsi helper untuk ambil status by index
    const pickStatus = (i: number) => {
      if (!statusPool.length)
        return ["Available", "Rented", "Maintenance"][i % 3];
      return statusPool[i % statusPool.length];
    };

    const renderContentItem = (
      content: ContentWithBadge,
      column: TableColumn,
      row: any,
      rowIndex: number,
      contentIndex: number,
      globalRules: BadgeRule[]
    ) => {
      // 1) IMAGE
      if (content.displayType === "image") {
        return (
          <div key={content.id} className="flex items-center space-x-3">
            {renderImageWithSettings(content, row?.vehicle?.image, "Image")}
          </div>
        );
      }

      // 2) BADGE (status)
      if (content.displayType === "badge") {
        const rules = (
          content.badgeConfig?.length ? content.badgeConfig : globalRules
        ) as BadgeRule[];
        const cls = getBadgeClass(content, row?.status, globalRules);
        const found = rules.find(
          (r) =>
            (r.value || "").toLowerCase() === (row?.status || "").toLowerCase()
        );
        return (
          <span
            key={content.id}
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cls}`}
          >
            {found?.label || row?.status || "—"}
          </span>
        );
      }

      // 3) CURRENCY — selalu tampil jika displayType = currency
      if (content.displayType === "currency") {
        const hitRateHeader = /(rate|price|harga|amount|total|fee)/i.test(
          column.headerLabel || ""
        );
        const raw = hitRateHeader
          ? row?.rate
          : formatCurrency(getCurrencyDemo(rowIndex));
        return (
          <div key={content.id}>
            <div className="font-semibold text-blue-600">{raw}</div>
            <div className="text-xs text-gray-500">per day</div>
          </div>
        );
      }

      // 4) Sisanya (text / icon_text)
      let displayValue = "Sample Data";
      if ((column.headerLabel || "").toLowerCase().includes("vehicle")) {
        if (contentIndex === 0) displayValue = row?.vehicle?.name;
        else if (contentIndex === 1) displayValue = row?.vehicle?.plate;
        else if (contentIndex === 2)
          displayValue = `${row?.vehicle?.year} • ${row?.vehicle?.color}`;
        else if (contentIndex === 3) displayValue = row?.vehicle?.location;
      } else if ((column.headerLabel || "").toLowerCase().includes("type")) {
        displayValue = row?.type;
      } else if ((column.headerLabel || "").toLowerCase().includes("status")) {
        displayValue = row?.status;
      } else if ((column.headerLabel || "").toLowerCase().includes("rate")) {
        displayValue = row?.rate;
      } else {
        // fallback: pakai label sourceColumn
        const sourceColumn = availableColumns.find(
          (c) => c.id === content.columnId
        );
        displayValue = sourceColumn?.label || "Sample Data";
      }

      return (
        <div
          key={content.id}
          className={`${content.styling?.fontSize} ${content.styling?.fontWeight} ${content.styling?.color}`}
          style={{ textAlign: content.styling?.textAlign as any }}
        >
          {content.displayType === "icon_text" ? (
            <span className="inline-flex items-center gap-1">
              <Star className="w-4 h-4" />
              {displayValue}
            </span>
          ) : (
            displayValue
          )}
        </div>
      );
    };

    const rows = Array.from({ length: 4 }).map((_, i) => ({
      id: i + 1,
      vehicle: {
        image: `/placeholder.svg?height=60&width=80&text=Item+${i + 1}`,
        name: `Item ${i + 1}`,
        plate: `B 1${i}${i} ${String.fromCharCode(65 + i)}${String.fromCharCode(
          65 + i
        )}`,
        year: `${2020 + (i % 4)}`,
        color: ["White", "Red", "Silver", "Black"][i % 4],
        location: ["Jakarta", "Bandung", "Surabaya", "Depok"][i % 4],
      },
      type: ["Car", "Bike", "SUV", "Van"][i % 4],
      status: pickStatus(i), // status dinamis dari rules/enum
      rate: `Rp ${250 + i * 10}.000`,
    }));

    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {tableLayout.columns
                  .filter((col) => col.isVisible)
                  .sort((a, b) => a.position - b.position)
                  .map((column) => (
                    <th
                      key={column.id}
                      className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${
                        column.alignment === "center"
                          ? "text-center"
                          : column.alignment === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                      style={{
                        width: column.width === "auto" ? "auto" : column.width,
                      }}
                    >
                      {column.headerLabel}
                    </th>
                  ))}
                {tableLayout.showActions && (
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    tableLayout.alternateRowColors && rowIndex % 2 === 1
                      ? "bg-gray-50"
                      : "bg-white"
                  }
                >
                  {tableLayout.columns
                    .filter((col) => col.isVisible)
                    .sort((a, b) => a.position - b.position)
                    .map((column) => (
                      <td
                        key={column.id}
                        className={`px-4 ${
                          tableLayout.rowHeight === "compact"
                            ? "py-2"
                            : tableLayout.rowHeight === "comfortable"
                            ? "py-6"
                            : "py-4"
                        } ${
                          column.alignment === "center"
                            ? "text-center"
                            : column.alignment === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {column.layout === "single" ? (
                          <div className="space-y-1">
                            {column.contents.map((content, contentIndex) =>
                              renderContentItem(
                                content as ContentWithBadge,
                                column,
                                row,
                                rowIndex,
                                contentIndex,
                                globalRules
                              )
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            {/* Left image slot */}
                            <div className="flex-shrink-0">
                              {column.imageColumnContents?.map((content) => (
                                <div key={content.id}>
                                  {renderImageWithSettings(
                                    content,
                                    row.vehicle.image,
                                    "Vehicle"
                                  )}
                                </div>
                              ))}
                            </div>
                            {/* Right content slot */}
                            <div className="flex-1 space-y-1">
                              {column.contents.map((content, contentIndex) =>
                                renderContentItem(
                                  content as ContentWithBadge,
                                  column,
                                  row,
                                  rowIndex,
                                  contentIndex,
                                  globalRules
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  {tableLayout.showActions && (
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button variant="ghost" size="sm" type="button">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" type="button">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" type="button">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* =======================
     Render
  ======================= */
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Table className="h-5 w-5" />
          Table Layout Configuration
        </CardTitle>
        <CardDescription>
          Configure how your data will be displayed in table format. Design
          complex column layouts with multiple content types.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* -------- Columns Tab -------- */}
          <TabsContent value="columns" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Table Columns</h3>
                <p className="text-sm text-gray-500">
                  Configure table headers and their content
                </p>
              </div>
              <Button
                onClick={addTableColumn}
                type="button"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Column
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column List */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Table Columns</h4>
                {tableLayout.columns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                    <Table className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                    <p>No columns configured</p>
                    <p className="text-sm">Add your first table column</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tableLayout.columns
                      .sort((a, b) => a.position - b.position)
                      .map((column) => (
                        <div
                          key={column.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedColumn?.id === column.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleSelectColumn(column)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-sm">
                                  {column.headerLabel}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {column.contents.length} content
                                  {column.contents.length !== 1 ? "s" : ""}
                                  {isStatusColumn(column) && (
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 text-xs"
                                    >
                                      Status
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={column.isVisible}
                                onCheckedChange={(checked) =>
                                  updateTableColumn(column.id, {
                                    isVisible: checked,
                                  })
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTableColumn(column.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Column Configuration */}
              <div className="space-y-4">
                {selectedColumn ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Configure Column
                      </h4>
                      <Badge variant="outline">
                        {selectedColumn.headerLabel}
                      </Badge>
                    </div>

                    {/* Header Settings */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h5 className="font-medium text-sm">Header Settings</h5>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Header Label (ID)</Label>
                          <Input
                            value={selectedColumn.headerLabel}
                            onChange={(e) =>
                              updateTableColumn(selectedColumn.id, {
                                headerLabel: e.target.value,
                              })
                            }
                            placeholder="e.g., Vehicle"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Header Label (EN)</Label>
                          <Input
                            value={selectedColumn.headerLabelEn}
                            onChange={(e) =>
                              updateTableColumn(selectedColumn.id, {
                                headerLabelEn: e.target.value,
                              })
                            }
                            placeholder="e.g., Vehicle"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Width</Label>
                          <Select
                            value={selectedColumn.width}
                            onValueChange={(value) =>
                              updateTableColumn(selectedColumn.id, {
                                width: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="100px">100px</SelectItem>
                              <SelectItem value="150px">150px</SelectItem>
                              <SelectItem value="200px">200px</SelectItem>
                              <SelectItem value="250px">250px</SelectItem>
                              <SelectItem value="300px">300px</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Alignment</Label>
                          <Select
                            value={selectedColumn.alignment}
                            onValueChange={(
                              value: "left" | "center" | "right"
                            ) =>
                              updateTableColumn(selectedColumn.id, {
                                alignment: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Input
                            type="number"
                            value={selectedColumn.position}
                            onChange={(e) =>
                              updateTableColumn(selectedColumn.id, {
                                position: parseInt(e.target.value) || 1,
                              })
                            }
                            min={1}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Badge Configuration (GLOBAL) */}
                    {isStatusColumn(selectedColumn) && (
                      <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-sm text-blue-900">
                              Status Badge Configuration
                            </h5>
                            <p className="text-xs text-blue-700">
                              Configure colors for different status values
                              (applies to badge contents in this column)
                            </p>
                          </div>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              const newMapping: StatusMapping = {
                                id: uuidv4(),
                                value: "",
                                label: "",
                                color: "green",
                                bgColor: "bg-green-100 text-green-800",
                              };
                              setTableLayout({
                                ...tableLayout,
                                statusMappings: [
                                  ...(tableLayout.statusMappings || []),
                                  newMapping,
                                ],
                              });
                            }}
                            className="flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Status
                          </Button>

                          <Button
                            size="sm"
                            type="button"
                            onClick={() => {
                              // Ambil enum dari konten pertama di kolom yang displayType = "badge"
                              const firstBadge = (
                                selectedColumn?.contents || []
                              ).find((c) => c.displayType === "badge");
                              if (!firstBadge) return;

                              const enums =
                                getEnumOptionsForColumn(firstBadge.columnId) ||
                                [];
                              const seed = enums.map((v) => ({
                                id: uuidv4(),
                                value: String(v).trim(),
                                label: String(v).trim(),
                                color: "green",
                                bgColor: "bg-green-100 text-green-800",
                              }));

                              setTableLayout({
                                ...tableLayout,
                                statusMappings: seed,
                              });
                            }}
                            disabled={
                              !(selectedColumn?.contents || []).some(
                                (c) => c.displayType === "badge"
                              )
                            }
                          >
                            Seed from Enum
                          </Button>
                        </div>

                        {(tableLayout.statusMappings || []).length === 0 ? (
                          <div className="text-center py-4 text-blue-600 bg-blue-100 rounded-lg border-2 border-dashed border-blue-200">
                            <Tag className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                            <p className="text-sm">
                              No status mappings configured
                            </p>
                            <p className="text-xs">
                              Add status values and their colors
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(tableLayout.statusMappings || []).map(
                              (mapping) => (
                                <div
                                  key={mapping.id}
                                  className="p-3 bg-white border rounded-lg"
                                >
                                  <div className="grid grid-cols-4 gap-3 items-end">
                                    <div className="space-y-1">
                                      <Label className="text-xs">
                                        Status Value
                                      </Label>
                                      <Input
                                        className="h-8"
                                        value={mapping.value}
                                        onChange={(e) => {
                                          const updated = (
                                            tableLayout.statusMappings || []
                                          ).map((m) =>
                                            m.id === mapping.id
                                              ? { ...m, value: e.target.value }
                                              : m
                                          );
                                          setTableLayout({
                                            ...tableLayout,
                                            statusMappings: updated,
                                          });
                                        }}
                                        placeholder="e.g., Available"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">
                                        Display Label
                                      </Label>
                                      <Input
                                        className="h-8"
                                        value={mapping.label}
                                        onChange={(e) => {
                                          const updated = (
                                            tableLayout.statusMappings || []
                                          ).map((m) =>
                                            m.id === mapping.id
                                              ? { ...m, label: e.target.value }
                                              : m
                                          );
                                          setTableLayout({
                                            ...tableLayout,
                                            statusMappings: updated,
                                          });
                                        }}
                                        placeholder="e.g., Tersedia"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">
                                        Badge Color
                                      </Label>
                                      <Select
                                        value={mapping.color}
                                        onValueChange={(value) => {
                                          const updated = (
                                            tableLayout.statusMappings || []
                                          ).map((m) =>
                                            m.id === mapping.id
                                              ? { ...m, color: value }
                                              : m
                                          );
                                          setTableLayout({
                                            ...tableLayout,
                                            statusMappings: updated,
                                          });
                                        }}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {BADGE_COLORS.map((color) => (
                                            <SelectItem
                                              key={color.value}
                                              value={color.value}
                                            >
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className={`w-3 h-3 rounded-full ${color.bgColor}`}
                                                />
                                                {color.label}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex items-end">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                          const updated = (
                                            tableLayout.statusMappings || []
                                          ).filter((m) => m.id !== mapping.id);
                                          setTableLayout({
                                            ...tableLayout,
                                            statusMappings: updated,
                                          });
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      Preview:
                                    </span>
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        BADGE_COLORS.find(
                                          (c) => c.value === mapping.color
                                        )?.bgColor || "bg-gray-100"
                                      } ${
                                        BADGE_COLORS.find(
                                          (c) => c.value === mapping.color
                                        )?.textColor || "text-gray-800"
                                      }`}
                                    >
                                      {mapping.label ||
                                        mapping.value ||
                                        "Status"}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Layout Settings */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h5 className="font-medium text-sm">Layout Settings</h5>
                      <div className="space-y-2">
                        <Label>Column Layout</Label>
                        <Select
                          value={selectedColumn.layout}
                          onValueChange={(value: "single" | "two_columns") =>
                            updateTableColumn(selectedColumn.id, {
                              layout: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">
                              Single Column
                            </SelectItem>
                            <SelectItem value="two_columns">
                              Two Columns (Image + Content)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedColumn.layout === "two_columns" && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium">Two Columns Layout:</p>
                          <p>• Left column: Image content only (max 1 item)</p>
                          <p>• Right column: Text and other content types</p>
                        </div>
                      )}
                    </div>

                    {/* Column Contents Editor */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      {selectedColumn.layout === "single" ? (
                        <>
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">
                              Column Contents
                            </h5>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() =>
                                addColumnContent(selectedColumn.id)
                              }
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Content
                            </Button>
                          </div>

                          {selectedColumn.contents.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                              <Type className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No content configured</p>
                              <p className="text-xs">
                                Add content to display in this column
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedColumn.contents.map((content, index) => (
                                <ContentConfigurationCard
                                  key={content.id}
                                  content={content as ContentWithBadge}
                                  index={index}
                                  columnId={selectedColumn.id}
                                  isLast={
                                    index === selectedColumn.contents.length - 1
                                  }
                                  onUpdate={updateColumnContent}
                                  onDelete={deleteColumnContent}
                                  onMove={moveColumnContent}
                                  availableColumns={availableColumns}
                                  getGlobalBadgeSeed={getGlobalBadgeSeed}
                                  getEnumOptionsForColumn={
                                    getEnumOptionsForColumn
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Image Column (Left) */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">
                                Image Column
                              </h5>
                              {selectedColumn.imageColumnContents.length ===
                                0 && (
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={() =>
                                    addImageColumnContent(selectedColumn.id)
                                  }
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add Image
                                </Button>
                              )}
                            </div>

                            {selectedColumn.imageColumnContents.length === 0 ? (
                              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No image configured</p>
                                <p className="text-xs">
                                  Add an image for this column
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {selectedColumn.imageColumnContents.map(
                                  (content, index) => (
                                    <ContentConfigurationCard
                                      key={content.id}
                                      content={content as ContentWithBadge}
                                      index={index}
                                      columnId={selectedColumn.id}
                                      isLast={true}
                                      onUpdate={(
                                        columnId,
                                        contentId,
                                        updates
                                      ) =>
                                        updateImageColumnContent(
                                          columnId,
                                          contentId,
                                          updates
                                        )
                                      }
                                      onDelete={(columnId, contentId) =>
                                        deleteImageColumnContent(columnId)
                                      }
                                      onMove={() => {}}
                                      availableColumns={availableColumns}
                                      isImageOnly={true}
                                      getGlobalBadgeSeed={getGlobalBadgeSeed}
                                      getEnumOptionsForColumn={
                                        getEnumOptionsForColumn
                                      }
                                    />
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          {/* Content Column (Right) */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">
                                Content Column
                              </h5>
                              <Button
                                size="sm"
                                type="button"
                                onClick={() =>
                                  addColumnContent(selectedColumn.id)
                                }
                                className="flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add Content
                              </Button>
                            </div>

                            {selectedColumn.contents.length === 0 ? (
                              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                                <Type className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No content configured</p>
                                <p className="text-xs">
                                  Add content to display
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {selectedColumn.contents.map(
                                  (content, index) => (
                                    <ContentConfigurationCard
                                      key={content.id}
                                      content={content as ContentWithBadge}
                                      index={index}
                                      columnId={selectedColumn.id}
                                      isLast={
                                        index ===
                                        selectedColumn.contents.length - 1
                                      }
                                      onUpdate={updateColumnContent}
                                      onDelete={deleteColumnContent}
                                      onMove={moveColumnContent}
                                      availableColumns={availableColumns}
                                      getGlobalBadgeSeed={getGlobalBadgeSeed}
                                      getEnumOptionsForColumn={
                                        getEnumOptionsForColumn
                                      }
                                    />
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Table className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a column to configure</p>
                    <p className="text-sm">
                      Choose a column from the list to edit its settings
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* -------- Settings Tab -------- */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Table Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Layout Name (ID)</Label>
                    <Input
                      value={tableLayout.name}
                      onChange={(e) =>
                        setTableLayout({ ...tableLayout, name: e.target.value })
                      }
                      placeholder="e.g., Vehicle List Layout"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Layout Name (EN)</Label>
                    <Input
                      value={tableLayout.nameEn}
                      onChange={(e) =>
                        setTableLayout({
                          ...tableLayout,
                          nameEn: e.target.value,
                        })
                      }
                      placeholder="e.g., Vehicle List Layout"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Row Height</Label>
                    <Select
                      value={tableLayout.rowHeight}
                      onValueChange={(
                        value: "compact" | "normal" | "comfortable"
                      ) => setTableLayout({ ...tableLayout, rowHeight: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Show Actions Column</Label>
                    <Switch
                      checked={tableLayout.showActions}
                      onCheckedChange={(checked) =>
                        setTableLayout({ ...tableLayout, showActions: checked })
                      }
                    />
                  </div>

                  {tableLayout.showActions && (
                    <div className="space-y-2">
                      <Label>Actions Position</Label>
                      <Select
                        value={tableLayout.actionsPosition}
                        onValueChange={(value: "left" | "right") =>
                          setTableLayout({
                            ...tableLayout,
                            actionsPosition: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label>Show Borders</Label>
                    <Switch
                      checked={tableLayout.showBorders}
                      onCheckedChange={(checked) =>
                        setTableLayout({ ...tableLayout, showBorders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Alternate Row Colors</Label>
                    <Switch
                      checked={tableLayout.alternateRowColors}
                      onCheckedChange={(checked) =>
                        setTableLayout({
                          ...tableLayout,
                          alternateRowColors: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* -------- Preview Tab -------- */}
          <TabsContent value="preview" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Table Preview</h3>
              <p className="text-sm text-gray-500 mb-6">
                This is how your table will look with sample data based on the
                vehicle rental example.
              </p>
              {tableLayout.columns.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                  <Table className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No columns configured</p>
                  <p className="text-sm">
                    Add columns in the Columns tab to see preview
                  </p>
                </div>
              ) : (
                renderPreview()
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/* =======================
   ContentConfigurationCard
======================= */
interface ContentConfigurationCardProps {
  content: ContentWithBadge;
  index: number;
  columnId: string;
  isLast: boolean;
  onUpdate: (
    columnId: string,
    contentId: string,
    updates: Partial<ContentWithBadge>
  ) => void;
  onDelete: (columnId: string, contentId: string) => void;
  onMove: (
    columnId: string,
    contentId: string,
    direction: "up" | "down"
  ) => void;
  availableColumns: Array<{ id: string; label: string; namaKolom: string }>;
  isImageOnly?: boolean;
  /** Ambil seed rules dari panel global saat user ganti displayType → "badge" */
  getGlobalBadgeSeed: () => BadgeRule[];
  getEnumOptionsForColumn: (columnId: string) => string[];
}

function ContentConfigurationCard({
  content,
  index,
  columnId,
  isLast,
  onUpdate,
  onDelete,
  onMove,
  availableColumns,
  isImageOnly = false,
  getGlobalBadgeSeed,
  getEnumOptionsForColumn,
}: ContentConfigurationCardProps) {
  const isImageContent = content.displayType === "image";

  const handleChangeDisplayType = (value: any) => {
    if (value === "image") {
      onUpdate(columnId, content.id, {
        displayType: value,
        imageSettings: {
          width: content.imageSettings?.width || "64px",
          height: content.imageSettings?.height || "48px",
          objectFit: content.imageSettings?.objectFit || "cover",
          borderRadius: content.imageSettings?.borderRadius || "8px",
        },
        badgeConfig: undefined,
      });
    } else if (value === "badge") {
      const seed = getGlobalBadgeSeed();
      onUpdate(columnId, content.id, {
        displayType: value,
        badgeConfig: seed, // langsung ada aturan → preview berwarna
        imageSettings: undefined,
      });
    } else {
      onUpdate(columnId, content.id, {
        displayType: value,
        imageSettings: undefined,
        badgeConfig: undefined,
      });
    }
  };

  // ambil enum options untuk source column saat ini
  const enums = React.useMemo(
    () =>
      getEnumOptionsForColumn ? getEnumOptionsForColumn(content.columnId) : [],
    [content.columnId, getEnumOptionsForColumn]
  );

  // AUTO-SEED saat masuk mode edit: kalau displayType=badge & rules kosong → isi dari enum (kalau ada), else seed global
  useEffect(() => {
    if (content.displayType !== "badge") return;

    const empty =
      !Array.isArray(content.badgeConfig) || content.badgeConfig.length === 0;
    if (!empty) return;

    const fromEnum = (enums || []).map((v) => ({
      value: String(v),
      label: String(v),
      color: "green" as const,
    }));

    const fallback = getGlobalBadgeSeed?.() || [];

    const seed = fromEnum.length ? fromEnum : fallback;
    if (seed.length) {
      onUpdate(columnId, content.id, { badgeConfig: seed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.displayType, content.columnId, enums]);

  return (
    <div className="p-3 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {index + 1}
          </Badge>
          <span className="text-sm font-medium">{content.label}</span>
          {isImageContent && (
            <Badge variant="outline" className="text-xs">
              <ImageIcon className="w-3 h-3 mr-1" />
              Image
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isImageOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onMove(columnId, content.id, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onMove(columnId, content.id, "down")}
                disabled={isLast}
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => onDelete(columnId, content.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Source Column & Display Type */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Source Column</Label>
          <Select
            value={content.columnId}
            onValueChange={(value) =>
              onUpdate(columnId, content.id, { columnId: value })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.namaKolom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Display Type</Label>
          <Select
            value={content.displayType}
            onValueChange={handleChangeDisplayType}
            disabled={isImageOnly}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(isImageOnly
                ? DISPLAY_TYPES.filter((t) => t.value === "image")
                : DISPLAY_TYPES
              ).map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-3 h-3" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Label (ID)</Label>
          <Input
            className="h-8"
            value={content.label}
            onChange={(e) =>
              onUpdate(columnId, content.id, { label: e.target.value })
            }
            placeholder="Content label"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Label (EN)</Label>
          <Input
            className="h-8"
            value={content.labelEn}
            onChange={(e) =>
              onUpdate(columnId, content.id, { labelEn: e.target.value })
            }
            placeholder="Content label"
          />
        </div>
      </div>

      {/* Image Settings (only for image) */}
      {content.displayType === "image" && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Maximize2 className="w-3 h-3" />
            <Label className="text-xs font-medium">Image Settings</Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Width</Label>
              <Select
                value={content.imageSettings?.width || "64px"}
                onValueChange={(value) =>
                  onUpdate(columnId, content.id, {
                    imageSettings: {
                      ...content.imageSettings,
                      width: value,
                      height: content.imageSettings?.height || "48px",
                      objectFit: content.imageSettings?.objectFit || "cover",
                      borderRadius:
                        content.imageSettings?.borderRadius || "8px",
                    },
                  })
                }
              >
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Height</Label>
              <Select
                value={content.imageSettings?.height || "48px"}
                onValueChange={(value) =>
                  onUpdate(columnId, content.id, {
                    imageSettings: {
                      ...content.imageSettings,
                      width: content.imageSettings?.width || "64px",
                      height: value,
                      objectFit: content.imageSettings?.objectFit || "cover",
                      borderRadius:
                        content.imageSettings?.borderRadius || "8px",
                    },
                  })
                }
              >
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Object Fit</Label>
              <Select
                value={content.imageSettings?.objectFit || "cover"}
                onValueChange={(
                  value: "cover" | "contain" | "fill" | "scale-down"
                ) =>
                  onUpdate(columnId, content.id, {
                    imageSettings: {
                      ...content.imageSettings,
                      width: content.imageSettings?.width || "64px",
                      height: content.imageSettings?.height || "48px",
                      objectFit: value,
                      borderRadius:
                        content.imageSettings?.borderRadius || "8px",
                    },
                  })
                }
              >
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBJECT_FIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Border Radius</Label>
              <Select
                value={content.imageSettings?.borderRadius || "8px"}
                onValueChange={(value) =>
                  onUpdate(columnId, content.id, {
                    imageSettings: {
                      ...content.imageSettings,
                      width: content.imageSettings?.width || "64px",
                      height: content.imageSettings?.height || "48px",
                      objectFit: content.imageSettings?.objectFit || "cover",
                      borderRadius: value,
                    },
                  })
                }
              >
                <SelectTrigger className="h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BORDER_RADIUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Preview */}
          <div className="mt-3 p-2 bg-white rounded border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Preview:</span>
            </div>
            <div className="flex items-center justify-center p-2">
              <div
                className="bg-gray-200 flex items-center justify-center"
                style={{
                  width: content.imageSettings?.width || "64px",
                  height: content.imageSettings?.height || "48px",
                  borderRadius: content.imageSettings?.borderRadius || "8px",
                }}
              >
                <ImageIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styling Options (non-image) */}
      {content.displayType !== "image" && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-3 h-3" />
            <Label className="text-xs font-medium">Styling</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={content.styling.fontSize}
              onValueChange={(value) =>
                onUpdate(columnId, content.id, {
                  styling: { ...content.styling, fontSize: value },
                })
              }
            >
              <SelectTrigger className="h-7">
                <SelectValue placeholder="Font size" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={content.styling.fontWeight}
              onValueChange={(value) =>
                onUpdate(columnId, content.id, {
                  styling: { ...content.styling, fontWeight: value },
                })
              }
            >
              <SelectTrigger className="h-7">
                <SelectValue placeholder="Font weight" />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map((weight) => (
                  <SelectItem key={weight.value} value={weight.value}>
                    {weight.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={content.styling.color}
              onValueChange={(value) =>
                onUpdate(columnId, content.id, {
                  styling: { ...content.styling, color: value },
                })
              }
            >
              <SelectTrigger className="h-7">
                <SelectValue placeholder="Text color" />
              </SelectTrigger>
              <SelectContent>
                {TEXT_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: color.color }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={content.styling.textAlign}
              onValueChange={(value) =>
                onUpdate(columnId, content.id, {
                  styling: { ...content.styling, textAlign: value },
                })
              }
            >
              <SelectTrigger className="h-7">
                <SelectValue placeholder="Text align" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
