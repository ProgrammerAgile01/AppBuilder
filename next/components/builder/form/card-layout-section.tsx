"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Eye,
  Trash2,
  ImageIcon,
  Car,
  Users,
  MapPin,
  Fuel,
  Edit,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CardLayoutSchema } from "./crud-builder-page";

/* ======================================
   PILIHAN (langsung token schema)
====================================== */
const SIZE_OPTIONS: Array<{
  value: CardLayoutSchema["judul"]["size"];
  label: string;
}> = [
  { value: "xs", label: "Extra Small (12px)" },
  { value: "sm", label: "Small (14px)" },
  { value: "base", label: "Normal (16px)" },
  { value: "lg", label: "Large (18px)" },
  { value: "xl", label: "Extra Large (20px)" },
];

const WEIGHT_OPTIONS: Array<{
  value: CardLayoutSchema["judul"]["weight"];
  label: string;
}> = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

const TEXT_COLORS = [
  { value: "text-gray-900", label: "Hitam" },
  { value: "text-gray-600", label: "Abu-abu Gelap" },
  { value: "text-gray-500", label: "Abu-abu" },
  { value: "text-blue-600", label: "Biru" },
  { value: "text-green-600", label: "Hijau" },
  { value: "text-red-600", label: "Merah" },
  { value: "text-yellow-600", label: "Kuning" },
  { value: "text-purple-600", label: "Ungu" },
];

const ICON_OPTIONS = [
  { value: "Car", label: "Mobil", icon: "🚗" },
  { value: "Fuel", label: "Bahan Bakar", icon: "⛽" },
  { value: "Users", label: "Penumpang", icon: "👥" },
  { value: "MapPin", label: "Lokasi", icon: "📍" },
  { value: "Calendar", label: "Tanggal", icon: "📅" },
  { value: "Clock", label: "Waktu", icon: "🕐" },
  { value: "Star", label: "Rating", icon: "⭐" },
  { value: "Phone", label: "Telepon", icon: "📞" },
];

const IMAGE_WIDTH_OPTIONS = [
  { value: "80", label: "80px" },
  { value: "96", label: "96px" },
  { value: "112", label: "112px" },
  { value: "128", label: "128px" },
  { value: "144", label: "144px" },
  { value: "160", label: "160px" },
  { value: "176", label: "176px" },
  { value: "192", label: "192px" },
];
const IMAGE_HEIGHT_OPTIONS = [
  { value: "64", label: "64px" },
  { value: "80", label: "80px" },
  { value: "96", label: "96px" },
  { value: "112", label: "112px" },
  { value: "128", label: "128px" },
  { value: "144", label: "144px" },
  { value: "160", label: "160px" },
  { value: "176", label: "176px" },
];

/* ======================================
   UTIL
====================================== */
const NONE = "__NONE__"; // sentinel "tidak digunakan"

const getIconComp = (name?: string) => {
  switch (name) {
    case "Car":
      return Car;
    case "Fuel":
      return Fuel;
    case "Users":
      return Users;
    case "MapPin":
      return MapPin;
    default:
      return Car;
  }
};

const guessBadgeBg = (textColor?: string) => {
  switch (textColor) {
    case "green":
      return "bg-green-100";
    case "red":
      return "bg-red-100";
    case "yellow":
      return "bg-yellow-100";
    case "blue":
      return "bg-blue-100";
    case "purple":
      return "bg-purple-100";
    default:
      return "bg-gray-100";
  }
};

// map token -> kelas Tailwind (kunci agar preview cocok)
const sizeToClass = (t?: CardLayoutSchema["judul"]["size"]) =>
  ((
    {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    } as const
  )[t || "sm"]);

const weightToClass = (t?: CardLayoutSchema["judul"]["weight"]) =>
  ((
    {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    } as const
  )[t || "normal"]);

// labelizer: "available_now" -> "Available Now"
const toNiceLabel = (raw: string) =>
  raw
    .replace(/[_\-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const colorByValue = (vRaw: string): string => {
  const v = vRaw.toLowerCase();
  const green = [
    "available",
    "active",
    "approved",
    "ready",
    "open",
    "yes",
    "paid",
    "success",
    "true",
    "valid",
  ];
  const red = [
    "unavailable",
    "inactive",
    "rejected",
    "closed",
    "no",
    "overdue",
    "cancelled",
    "failed",
    "false",
    "invalid",
  ];
  const yellow = [
    "maintenance",
    "pending",
    "hold",
    "waiting",
    "processing",
    "draft",
  ];
  const blue = ["new", "info", "scheduled"];
  if (green.includes(v)) return "text-green-700";
  if (red.includes(v)) return "text-red-700";
  if (yellow.includes(v)) return "text-yellow-700";
  if (blue.includes(v)) return "text-blue-700";
  return "text-gray-700";
};
/* ======================================
   PROPS
====================================== */
interface CardLayoutSectionProps {
  cardLayout: CardLayoutSchema;
  setCardLayout: (schema: CardLayoutSchema) => void;
  // value untuk field = namaKolom (biar match backend)
  availableColumns: Array<{ id: string; label: string; namaKolom: string }>;
  getEnumOptionsForColumn: (columnId: string) => string[];
}

/* ======================================
   KOMPONEN
====================================== */
export function CardLayoutSection({
  cardLayout,
  setCardLayout,
  availableColumns,
  getEnumOptionsForColumn,
}: CardLayoutSectionProps) {
  // jaga: selalu ada 4 info + punya default styling
  useEffect(() => {
    const infos = Array.isArray(cardLayout.infos) ? [...cardLayout.infos] : [];
    while (infos.length < 4)
      infos.push({
        field: undefined,
        icon: "Car",
        size: "sm",
        weight: "normal",
        color: "text-gray-700",
      });
    for (let i = 0; i < infos.length; i++) {
      infos[i] = {
        field: infos[i]?.field,
        icon: infos[i]?.icon ?? "Car",
        size: (infos[i] as any)?.size ?? "sm",
        weight: (infos[i] as any)?.weight ?? "normal",
        color: (infos[i] as any)?.color ?? "text-gray-700",
      } as any;
    }
    if (
      infos.length !== cardLayout.infos?.length ||
      JSON.stringify(infos) !== JSON.stringify(cardLayout.infos)
    ) {
      setCardLayout({ ...cardLayout, infos: infos.slice(0, 4) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper update nested tanpa immer
  const patch = <K extends keyof CardLayoutSchema>(
    key: K,
    obj: Partial<CardLayoutSchema[K]>
  ) =>
    setCardLayout({
      ...cardLayout,
      [key]: { ...(cardLayout[key] as any), ...(obj as any) },
    });

  const updateInfo = (
    idx: number,
    obj: Partial<CardLayoutSchema["infos"][number]>
  ) => {
    const infos = [...(cardLayout.infos || [])];
    infos[idx] = { ...(infos[idx] || {}), ...(obj as any) } as any;
    setCardLayout({ ...cardLayout, infos });
  };

  // === AUTO-SEED BADGE_OPTIONS DARI ENUM ===
  const fieldNameToColumnId = (field?: string) =>
    field ? availableColumns.find((c) => c.namaKolom === field)?.id : undefined;

  const autoSeedFromEnum = (field?: string) => {
    const colId = fieldNameToColumnId(field);
    if (!colId) return false;
    const enums = getEnumOptionsForColumn(colId) || [];
    if (!Array.isArray(enums) || enums.length === 0) return false;

    const seeded = enums.map((e) => ({
      value: String(e),
      label: toNiceLabel(String(e)),
      color: colorByValue(String(e)),
    }));
    patch("status", { badge_options: seeded });
    return true;
  };

  // auto-seed saat ganti kolom status kalau belum ada badge_options bernilai
  useEffect(() => {
    const cur = cardLayout.status?.badge_options || [];
    const hasValues = cur.some((b) => (b?.value || "").trim() !== "");
    if (!hasValues && cardLayout.status?.field) {
      autoSeedFromEnum(cardLayout.status.field);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardLayout.status?.field, availableColumns]);

  const addBadge = () => {
    const list = [...(cardLayout.status?.badge_options || [])];
    list.push({ value: "", label: "", color: "text-gray-700" });
    patch("status", { badge_options: list });
  };
  const updateBadge = (
    idx: number,
    obj: { value?: string; label?: string; color?: string }
  ) => {
    const list = [...(cardLayout.status?.badge_options || [])];
    list[idx] = { ...list[idx], ...obj } as any;
    patch("status", { badge_options: list });
  };
  const removeBadge = (idx: number) => {
    const list = [...(cardLayout.status?.badge_options || [])];
    list.splice(idx, 1);
    patch("status", { badge_options: list });
  };

  // helper SELECT kolom (tanpa value="")
  const ColumnSelect = ({
    value,
    onChange,
    placeholder = "Pilih kolom (opsional)",
  }: {
    value?: string;
    onChange?: (v: string | undefined) => void;
    placeholder?: string;
  }) => (
    <Select
      value={value ?? undefined}
      onValueChange={(v) => onChange?.(v === NONE ? undefined : v)}
    >
      <SelectTrigger className="h-8">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>— Tidak digunakan —</SelectItem>
        {availableColumns.map((c) => (
          <SelectItem key={c.id} value={c.namaKolom}>
            {c.label || c.namaKolom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  /* ======================
     PREVIEW (LIVE)
  =======================*/
  const previewRow = useMemo(() => {
    const sample: Record<string, any> = {};
    if (cardLayout.judul?.field)
      sample[cardLayout.judul.field] = "Toyota Avanza";
    if (cardLayout.subjudul?.field)
      sample[cardLayout.subjudul.field] = "B 1234 ABC";
    if (cardLayout.status?.field) sample[cardLayout.status.field] = "available";
    if (cardLayout.value?.field) sample[cardLayout.value.field] = "300.000";
    cardLayout.infos?.forEach((i, idx) => {
      if (i?.field)
        sample[i.field] = ["MPV", "Pertalite", "7 seats", "Jakarta"][idx] || "";
    });
    if (cardLayout.mainImage?.field)
      sample[cardLayout.mainImage.field] =
        "/placeholder.svg?height=120&width=120";
    return sample;
  }, [cardLayout]);

  const val = (field?: string, fallback = "") =>
    field ? previewRow?.[field] ?? fallback : "";

  const StatusBadge = () => {
    const raw = String(val(cardLayout.status?.field)).toLowerCase();
    const match = (cardLayout.status?.badge_options || []).find(
      (b) => b.value.toLowerCase() === raw
    );
    const color = match?.color || cardLayout.status?.color || "text-green-700";
    const bg = guessBadgeBg(match?.color || cardLayout.status?.color);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${bg}`}
      >
        {match?.label || toNiceLabel(raw || "Status")}
      </span>
    );
  };

  const Img = () => {
    if (!cardLayout.mainImage?.field) return null;
    return (
      <div className="flex-shrink-0">
        <div
          className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
          style={{
            width: cardLayout.mainImage.width || 128,
            height: cardLayout.mainImage.height || 96,
            borderRadius: cardLayout.mainImage.rounded ? 12 : 0,
          }}
        >
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    );
  };

  const Preview = () => (
    <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
      <div className="bg-white rounded-lg shadow-sm border p-4 w-full max-w-md">
        <div className="flex gap-4">
          <Img />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3
                className={`${sizeToClass(
                  cardLayout.judul.size
                )} ${weightToClass(cardLayout.judul.weight)} ${
                  cardLayout.judul.color
                }`}
              >
                {val(cardLayout.judul.field, "—")}
              </h3>
              <StatusBadge />
            </div>

            <p
              className={`${sizeToClass(
                cardLayout.subjudul.size
              )} ${weightToClass(cardLayout.subjudul.weight)} ${
                cardLayout.subjudul.color
              }`}
            >
              {val(cardLayout.subjudul.field)}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {(cardLayout.infos || []).map((i, idx) => {
                const Icon = getIconComp(i?.icon);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${sizeToClass(
                      i?.size
                    )} ${weightToClass(i?.weight)} ${i?.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{val(i?.field)}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span
                className={`${sizeToClass(
                  cardLayout.value.size
                )} ${weightToClass(cardLayout.value.weight)} ${
                  cardLayout.value.color
                }`}
              >
                {(cardLayout.value.prefix || "") +
                  val(cardLayout.value.field) +
                  (cardLayout.value.suffix || "")}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Konfigurasi Card Layout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* ===== PANEL KIRI: FORM ===== */}
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Gambar Utama */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Gambar Utama</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Ambil data dari kolom</Label>
                  <ColumnSelect
                    value={cardLayout.mainImage.field}
                    onChange={(v) => patch("mainImage", { field: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Lebar</Label>
                  <Select
                    value={String(cardLayout.mainImage.width ?? "128")}
                    onValueChange={(v) =>
                      patch("mainImage", { width: parseInt(v, 10) })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_WIDTH_OPTIONS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>
                          {w.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Tinggi</Label>
                  <Select
                    value={String(cardLayout.mainImage.height ?? "96")}
                    onValueChange={(v) =>
                      patch("mainImage", { height: parseInt(v, 10) })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_HEIGHT_OPTIONS.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Rounded</Label>
                  <Select
                    value={String(cardLayout.mainImage.rounded ? "1" : "0")}
                    onValueChange={(v) =>
                      patch("mainImage", { rounded: v === "1" })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ya</SelectItem>
                      <SelectItem value="0">Tidak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Judul */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Judul</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Ambil data dari kolom</Label>
                  <ColumnSelect
                    value={cardLayout.judul.field}
                    onChange={(v) => patch("judul", { field: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Ukuran</Label>
                  <Select
                    value={cardLayout.judul.size ?? undefined}
                    onValueChange={(v) => patch("judul", { size: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Ketebalan</Label>
                  <Select
                    value={cardLayout.judul.weight ?? undefined}
                    onValueChange={(v) => patch("judul", { weight: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Warna</Label>
                  <Select
                    value={cardLayout.judul.color ?? undefined}
                    onValueChange={(v) => patch("judul", { color: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Subjudul */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Subjudul</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Ambil data dari kolom</Label>
                  <ColumnSelect
                    value={cardLayout.subjudul.field}
                    onChange={(v) => patch("subjudul", { field: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Ukuran</Label>
                  <Select
                    value={cardLayout.subjudul.size ?? undefined}
                    onValueChange={(v) => patch("subjudul", { size: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Ketebalan</Label>
                  <Select
                    value={cardLayout.subjudul.weight ?? undefined}
                    onValueChange={(v) =>
                      patch("subjudul", { weight: v as any })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Warna</Label>
                  <Select
                    value={cardLayout.subjudul.color ?? undefined}
                    onValueChange={(v) => patch("subjudul", { color: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status + Badge */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Status (Badge)</h4>
                  {/* <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => autoSeedFromEnum(cardLayout.status.field)}
                  >
                    Auto-seed dari Enum
                  </Button> */}
                  <Badge variant="secondary" className="text-xs">
                    Opsional
                  </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Ambil data dari kolom</Label>
                  <ColumnSelect
                    value={cardLayout.status.field}
                    onChange={(v) => {
                      patch("status", { field: v });
                      // auto-seed langsung saat user memilih kolom
                      autoSeedFromEnum(v);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Ukuran</Label>
                  <Select
                    value={cardLayout.status.size ?? undefined}
                    onValueChange={(v) => patch("status", { size: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Ketebalan</Label>
                  <Select
                    value={cardLayout.status.weight ?? undefined}
                    onValueChange={(v) => patch("status", { weight: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Warna Teks Default</Label>
                  <Select
                    value={cardLayout.status.color ?? undefined}
                    onValueChange={(v) => patch("status", { color: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Badge Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Badge Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={addBadge}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Tambah
                  </Button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(cardLayout.status.badge_options || []).map((opt, i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Badge {i + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBadge(i)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Value</Label>
                          <Input
                            className="h-8"
                            value={opt.value}
                            onChange={(e) =>
                              updateBadge(i, { value: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Label</Label>
                          <Input
                            className="h-8"
                            value={opt.label}
                            onChange={(e) =>
                              updateBadge(i, { label: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Text Color</Label>
                          <Select
                            value={opt.color ?? undefined}
                            onValueChange={(v) => updateBadge(i, { color: v })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="green">
                                Green
                              </SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                              <SelectItem value="yellow">
                                Yellow
                              </SelectItem>
                              <SelectItem value="blue">
                                Blue
                              </SelectItem>
                              <SelectItem value="purple">
                                Purple
                              </SelectItem>
                              <SelectItem value="gray">
                                Gray
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-center pt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            opt.color
                          } ${guessBadgeBg(opt.color)}`}
                        >
                          {opt.label || "Preview"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Infos 1..4 (sekarang ada styling per-item) */}
            {(cardLayout.infos || []).map((info, idx) => (
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium text-sm">Informasi {idx + 1}</h4>
                <div className="space-y-4">
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs">Ambil data dari kolom</Label>
                      <ColumnSelect
                        value={info.field}
                        onChange={(v) => updateInfo(idx, { field: v })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Ikon</Label>
                      <Select
                        value={info.icon || "Car"}
                        onValueChange={(v) => updateInfo(idx, { icon: v })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              <div className="flex items-center gap-2">
                                <span>{o.icon}</span>
                                <span>{o.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Ukuran</Label>
                      <Select
                        value={info.size ?? "sm"}
                        onValueChange={(v) =>
                          updateInfo(idx, { size: v as any })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Ketebalan</Label>
                      <Select
                        value={info.weight ?? "normal"}
                        onValueChange={(v) =>
                          updateInfo(idx, { weight: v as any })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEIGHT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Warna</Label>
                      <Select
                        value={info.color ?? "text-gray-700"}
                        onValueChange={(v) => updateInfo(idx, { color: v })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEXT_COLORS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Nilai/Harga */}
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Value (e.g Nilai / Harga)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Kolom</Label>
                  <ColumnSelect
                    value={cardLayout.value.field}
                    onChange={(v) => patch("value", { field: v })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Prefix (Awalan)</Label>
                  <Input
                    className="h-8"
                    value={cardLayout.value.prefix ?? ""}
                    onChange={(e) => patch("value", { prefix: e.target.value })}
                    placeholder="e.g., Rp "
                  />
                </div>
                <div>
                  <Label className="text-xs">Suffix (Akhiran)</Label>
                  <Input
                    className="h-8"
                    value={cardLayout.value.suffix ?? ""}
                    onChange={(e) => patch("value", { suffix: e.target.value })}
                    placeholder="e.g., /day"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ukuran</Label>
                  <Select
                    value={cardLayout.value.size ?? undefined}
                    onValueChange={(v) => patch("value", { size: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Ketebalan</Label>
                  <Select
                    value={cardLayout.value.weight ?? undefined}
                    onValueChange={(v) => patch("value", { weight: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Warna</Label>
                  <Select
                    value={cardLayout.value.color ?? undefined}
                    onValueChange={(v) => patch("value", { color: v })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PANEL KANAN: PREVIEW ===== */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <Preview />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
