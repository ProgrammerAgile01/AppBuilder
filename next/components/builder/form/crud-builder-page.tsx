// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { createData, updateData, getDataById } from "@/lib/api";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import {
//   Save,
//   Database,
//   Columns,
//   BarChart3,
//   ArrowLeft,
//   Plus,
//   Table,
//   CreditCard,
// } from "lucide-react";
// import { DataMasterSection } from "./data-master-section";
// import { CategoryBlock } from "./category-block";
// import { StatistikBuilderSection } from "./statistik-builder-section";
// import { toast } from "@/hooks/use-toast";
// import { v4 as uuidv4 } from "uuid";
// import { useRouter } from "next/navigation";
// import { TabelLayoutSection } from "@/components/builder/form/tabel-layout-section";
// import { CardLayoutSection } from "./card-layout-section";

// /* =========================
//    TYPINGS
// ========================= */
// export interface DataMaster {
//   judul: string;
//   judulEn: string;
//   judulMenu: string;
//   judulMenuEn: string;
//   namaTabel: string;
//   deskripsi: string;
//   deskripsiEn: string;
//   moduleGroup: string;
//   menuIcon: string;
//   kategoriCrud: "utama" | "pendukung";
// }
// export interface StatistikData {
//   id: string;
//   judulStatistik: string;
//   judulStatistikEn: string;
//   queryAngka: string;
//   queryResume: string;
//   icon: string;
// }
// export interface Column {
//   id: string;
//   namaKolom: string;
//   labelTampilan: string;
//   labelTampilanEn: string;
//   placeholder_id: string;
//   placeholder_en: string;
//   tipeData: string;
//   length: string;
//   tipeInput: string;
//   enumValues: string[];
//   // enumValuesEn: string[];
//   aktifkanRelasi: boolean;
//   tipeRelasi: string;
//   tabelRelasi: string;
//   kolomRelasi: string;
//   isNullable: boolean;
//   isUnique: boolean;
//   isRequired: boolean;
//   isHide: boolean;
//   isReadonly: boolean;
//   noUrutKolom: number;
//   alignKolom: string;
//   defaultValue: string;
//   options: string[];
//   optionsEn: string[];
// }
// export interface SubCategory {
//   id: string;
//   nama: string;
//   namaEn: string;
//   columns: Column[];
// }
// export interface Category {
//   id: string;
//   nama: string;
//   namaEn: string;
//   columns: Column[];
//   subCategories: SubCategory[];
// }
// export interface TableColumnContent {
//   id: string;
//   columnId: string; // UI pakai UUID kolom
//   displayType: "text" | "image" | "badge" | "currency" | "date" | "icon_text";
//   label: string;
//   labelEn: string;
//   position: number;
//   styling: {
//     fontSize?: string;
//     fontWeight?: string;
//     color?: string;
//     backgroundColor?: string;
//     textAlign?: string;
//   };
//   imageSettings?: {
//     width: string;
//     height: string;
//     objectFit: "cover" | "contain" | "fill" | "scale-down";
//     borderRadius: string;
//   };
//   badgeConfig?: Array<{ value: string; label: string; color: string }>;
// }
// export interface TableColumn {
//   id: string;
//   headerLabel: string;
//   headerLabelEn: string;
//   width: string;
//   alignment: "left" | "center" | "right";
//   isVisible: boolean;
//   position: number;
//   layout: "single" | "two_columns";
//   contents: TableColumnContent[];
//   imageColumnContents: TableColumnContent[];
// }
// export interface TableLayout {
//   id: string;
//   name: string;
//   nameEn: string;
//   columns: TableColumn[];
//   showActions: boolean;
//   actionsPosition: "left" | "right";
//   rowHeight: "compact" | "normal" | "comfortable";
//   showBorders: boolean;
//   alternateRowColors: boolean;
// }

// export interface CardLayoutSchema {
//   mainImage: {
//     field?: string;
//     width: number;
//     height: number;
//     rounded: boolean;
//   };
//   judul: {
//     field?: string;
//     size: "xs" | "sm" | "base" | "lg";
//     weight: "normal" | "medium" | "semibold" | "bold";
//     color: string;
//   };
//   subjudul: {
//     field?: string;
//     size: "xs" | "sm" | "base" | "lg";
//     weight: "normal" | "medium" | "semibold" | "bold";
//     color: string;
//   };
//   status: {
//     field?: string;
//     size: "xs" | "sm" | "base" | "lg";
//     weight: "normal" | "medium" | "semibold" | "bold";
//     color: string;
//     badge_options?: BadgeOption[];
//   };
//   infos: { field?: string; icon?: string }[]; // up to 4
//   value: {
//     field?: string;
//     prefix?: string;
//     suffix?: string;
//     size: "xs" | "sm" | "base" | "lg";
//     weight: "normal" | "medium" | "semibold" | "bold";
//     color: string;
//   };
//   actions: { view: boolean; edit: boolean; delete: boolean };
// }

// export interface BadgeOption {
//   value: string;
//   label: string;
//   color: string;
// }

// const defaultCardLayoutSchema: CardLayoutSchema = {
//   mainImage: { field: undefined, width: 128, height: 96, rounded: true },
//   judul: {
//     field: undefined,
//     size: "lg",
//     weight: "semibold",
//     color: "text-gray-900",
//   },
//   subjudul: {
//     field: undefined,
//     size: "sm",
//     weight: "normal",
//     color: "text-gray-600",
//   },
//   status: {
//     field: undefined,
//     size: "xs",
//     weight: "medium",
//     color: "text-green-700",
//     badge_options: [],
//   },
//   infos: [{}, {}, {}, {}],
//   value: {
//     field: undefined,
//     prefix: "Rp ",
//     suffix: "/day",
//     size: "lg",
//     weight: "bold",
//     color: "text-blue-600",
//   },
//   actions: { view: true, edit: true, delete: true },
// };

// /* =========================
//    VALIDATOR FE
// ========================= */
// const validateColumns = (categories: Category[]): string[] => {
//   const errors: string[] = [];
//   categories.forEach((cat) => {
//     cat.columns.forEach((col, i) => {
//       const prefix = `Kategori \"${cat.nama}\" kolom ke-${i + 1}`;
//       if (!col.namaKolom?.trim())
//         errors.push(`${prefix}: Nama Kolom wajib diisi`);
//       if (!col.labelTampilan?.trim())
//         errors.push(`${prefix}: Label wajib diisi`);
//       if (!col.tipeData?.trim())
//         errors.push(`${prefix}: Tipe Data wajib dipilih`);
//       if (!col.tipeInput?.trim())
//         errors.push(`${prefix}: Tipe Input wajib dipilih`);
//       if (col.aktifkanRelasi) {
//         if (!col.tipeRelasi?.trim())
//           errors.push(`${prefix}: Tipe Relasi wajib diisi`);
//         if (!col.tabelRelasi?.trim())
//           errors.push(`${prefix}: Tabel Relasi wajib diisi`);
//         if (!col.kolomRelasi?.trim())
//           errors.push(`${prefix}: Kolom Relasi wajib diisi`);
//       }
//     });
//     cat.subCategories.forEach((sub) => {
//       sub.columns.forEach((col, i) => {
//         const prefix = `Subkategori \"${sub.nama}\" kolom ke-${i + 1}`;
//         if (!col.namaKolom?.trim())
//           errors.push(`${prefix}: Nama Kolom wajib diisi`);
//         if (!col.labelTampilan?.trim())
//           errors.push(`${prefix}: Label wajib diisi`);
//         if (!col.tipeData?.trim())
//           errors.push(`${prefix}: Tipe Data wajib dipilih`);
//         if (!col.tipeInput?.trim())
//           errors.push(`${prefix}: Tipe Input wajib dipilih`);
//         if (col.aktifkanRelasi) {
//           if (!col.tipeRelasi?.trim())
//             errors.push(`${prefix}: Tipe Relasi wajib diisi`);
//           if (!col.tabelRelasi?.trim())
//             errors.push(`${prefix}: Tabel Relasi wajib diisi`);
//           if (!col.kolomRelasi?.trim())
//             errors.push(`${prefix}: Kolom Relasi wajib diisi`);
//         }
//       });
//     });
//   });
//   return errors;
// };

// /* =========================
//    HELPERS (KUNCI)
// ========================= */

// // 1) Deserialize dari backend: field_categories -> Category (UI)
// function deserializeCategoriesFromApi(fieldCategories: any[] = []): Category[] {
//   return (fieldCategories || []).map((fc: any) => {
//     const cols = (fc.columns || []).map((col: any) => ({
//       id: col.id ? String(col.id) : crypto.randomUUID?.() || `${Math.random()}`,
//       namaKolom: col.nama_kolom ?? "",
//       labelTampilan: col.label_id ?? "",
//       labelTampilanEn: col.label_en ?? "",
//       placeholder_id: col.placeholder_id ?? "",
//       placeholder_en: col.placeholder_en ?? "",
//       tipeData: col.tipe_data ?? "",
//       length: col.length ?? "",
//       tipeInput: col.tipe_input ?? "",
//       enumValues: col.enum_options ?? null,
//       // enumValuesEn: col.enum_values_en ?? [],
//       aktifkanRelasi: !!col.aktifkan_relasi,
//       tipeRelasi: col.tipe_relasi ?? "",
//       tabelRelasi: col.tabel_relasi ?? "",
//       kolomRelasi: col.kolom_relasi ?? "",
//       isNullable: !!col.is_nullable,
//       isUnique: !!col.is_unique,
//       isRequired: !!col.is_required,
//       isHide: !!col.is_hide,
//       isReadonly: !!col.is_readonly,
//       noUrutKolom: col.no_urut_kolom ?? 0,
//       alignKolom: col.align_kolom ?? "left",
//       defaultValue: col.default_value ?? "",
//       options: col.options ?? [],
//       optionsEn: col.options_en ?? [],
//     }));
//     return {
//       id: fc.id ? String(fc.id) : crypto.randomUUID?.() || `${Math.random()}`,
//       nama: fc.nama_kategori ?? "",
//       namaEn: "",
//       columns: cols,
//       subCategories: [], // backend tidak punya subCategories
//     } as Category;
//   });
// }

// // 2) Map ID <-> Nama Kolom (untuk translate UI<->API)
// function buildColumnMaps(categories: Category[]) {
//   const idToName: Record<string, string> = {};
//   const nameToId: Record<string, string> = {};
//   categories.forEach((cat) => {
//     (cat.columns || []).forEach((col) => {
//       if (col.id && col.namaKolom) {
//         idToName[col.id] = col.namaKolom;
//         nameToId[col.namaKolom] = col.id;
//       }
//     });
//     (cat.subCategories || []).forEach((sub) => {
//       (sub.columns || []).forEach((col) => {
//         if (col.id && col.namaKolom) {
//           idToName[col.id] = col.namaKolom;
//           nameToId[col.namaKolom] = col.id;
//         }
//       });
//     });
//   });
//   return { idToName, nameToId };
// }

// // 3) FE -> API: flatten categories -> field_categories
// function buildFieldCategories(categories: Category[]) {
//   return categories
//     .filter((cat) => (cat?.nama || "").trim())
//     .map((cat) => {
//       const ownCols = (cat.columns || []).filter((c) =>
//         (c?.namaKolom || "").trim()
//       );
//       const subCols = (cat.subCategories || [])
//         .flatMap((sc) => sc.columns || [])
//         .filter((c) => (c?.namaKolom || "").trim());
//       const allCols = [...ownCols, ...subCols];
//       return {
//         nama_kategori: cat.nama.trim(),
//         columns: allCols.map((col) => ({
//           nama_kolom: col.namaKolom.trim(),
//           label_id: col.labelTampilan || null,
//           label_en: col.labelTampilanEn || null,
//           placeholder_id: col.placeholder_id || null,
//           placeholder_en: col.placeholder_en || null,
//           tipe_data: col.tipeData || null,
//           length: col.length || null,
//           tipe_input: col.tipeInput || null,
//           enum_options: col.enumValues || null,
//           // enum_values_en: col.enumValuesEn || [],
//           aktifkan_relasi: !!col.aktifkanRelasi,
//           tipe_relasi: col.tipeRelasi || null,
//           tabel_relasi: col.tabelRelasi || null,
//           kolom_relasi: col.kolomRelasi || null,
//           is_nullable: !!col.isNullable,
//           is_unique: !!col.isUnique,
//           is_required: !!col.isRequired,
//           is_hide: !!col.isHide,
//           is_readonly: !!col.isReadonly,
//           no_urut_kolom: col.noUrutKolom ?? null,
//           align_kolom: col.alignKolom || null,
//           default_value: col.defaultValue || null,
//           options: col.options || [],
//           options_en: col.optionsEn || [],
//         })),
//       };
//     });
// }

// // 4) FE -> API: map rowHeight
// function mapRowHeightFEToApi(
//   v: TableLayout["rowHeight"]
// ): "compact" | "normal" | "tall" {
//   if (v === "compact" || v === "normal") return v;
//   return "tall"; // FE "comfortable" → API "tall"
// }

// // 5) API -> FE: map rowHeight
// function mapRowHeightApiToFE(v: string): TableLayout["rowHeight"] {
//   if (v === "compact" || v === "normal") return v;
//   if (v === "tall") return "comfortable";
//   return "normal";
// }

// // 6) FE -> API: build table_layout (translate columnId(UUID) -> source_column(nama_kolom))
// function buildTableLayout(
//   table: TableLayout | undefined,
//   idToName: Record<string, string>
// ) {
//   if (!table) return undefined;
//   const cols = (table.columns || []).filter((c) =>
//     (c?.headerLabel || "").trim()
//   );
//   if (!cols.length) return undefined;

//   return {
//     layout_name_id: table.name || "Default",
//     layout_name_en: table.nameEn || "Default",
//     show_actions: !!table.showActions,
//     actions_position: table.actionsPosition,
//     row_height: mapRowHeightFEToApi(table.rowHeight),
//     show_border: !!table.showBorders,
//     alternate_row_colors: !!table.alternateRowColors,
//     columns: cols.map((c, idx) => {
//       // === column-level image_settings (untuk layout two_columns kiri) ===
//       let columnImageSettings: any = null;
//       if (c.layout === "two_columns" && c.imageColumnContents?.length) {
//         const img = c.imageColumnContents[0];
//         if (img?.imageSettings && img.columnId) {
//           columnImageSettings = {
//             source_column: idToName[img.columnId] ?? img.columnId,
//             width: img.imageSettings.width,
//             height: img.imageSettings.height,
//             fit: img.imageSettings.objectFit, // backend: 'fit'
//             border_radius: img.imageSettings.borderRadius,
//           };
//         }
//       }

//       return {
//         label_id: c.headerLabel,
//         label_en: c.headerLabelEn || null,
//         alignment: c.alignment || "left",
//         width: c.width || null,
//         position: Number.isInteger(c.position) ? c.position : idx,
//         column_layout: c.layout || "single",

//         // kirim object jika ada
//         image_settings: columnImageSettings,

//         contents: (c.contents || []).map((ct, cti) => {
//           const base: any = {
//             source_column: idToName[ct.columnId] ?? ct.columnId, // UUID -> nama_kolom
//             display_type: ct.displayType,
//             label_id: ct.label || null,
//             label_en: ct.labelEn || null, // opsional
//             styling: ct.styling || null,
//             position: Number.isInteger(ct.position) ? ct.position : cti,
//           };

//           // content-level image settings
//           if (ct.displayType === "image" && ct.imageSettings) {
//             base.image_settings = {
//               width: ct.imageSettings.width,
//               height: ct.imageSettings.height,
//               fit: ct.imageSettings.objectFit,
//               border_radius: ct.imageSettings.borderRadius,
//             };
//           }

//           // content-level badge config
//           if (ct.displayType === "badge" && ct.badgeConfig?.length) {
//             base.badge_config = ct.badgeConfig.map((b) => ({
//               value: b.value,
//               label: b.label,
//               color: b.color,
//             }));
//           }

//           return base;
//         }),
//       };
//     }),
//   };
// }

// // 7) FE -> API: stats (judul_statistik_id = NAMA IDN)
// function buildStatsForApi(stats: StatistikData[]) {
//   return (stats || []).map((s) => ({
//     judul_statistik_id: s.judulStatistik || "",
//     judul_statistik_en: s.judulStatistikEn || null,
//     query_angka: s.queryAngka || "",
//     query_resume: s.queryResume || null,
//     icon: s.icon || null,
//   }));
// }

// // to API Card Layout
// const toApiCardLayout = (s: CardLayoutSchema) => ({
//   mainImage: {
//     field: s.mainImage?.field,
//     width: s.mainImage?.width ?? 128,
//     height: s.mainImage?.height ?? 96,
//     rounded: !!s.mainImage?.rounded,
//   },
//   judul: {
//     field: s.judul?.field,
//     size: s.judul?.size || "lg",
//     weight: s.judul?.weight || "semibold",
//     color: s.judul?.color || "text-gray-900",
//   },
//   subjudul: {
//     field: s.subjudul?.field,
//     size: s.subjudul?.size || "sm",
//     weight: s.subjudul?.weight || "normal",
//     color: s.subjudul?.color || "text-gray-600",
//   },
//   status: {
//     field: s.status?.field,
//     size: s.status?.size || "xs",
//     weight: s.status?.weight || "medium",
//     color: s.status?.color || "text-green-700",
//     badge_options: (s.status?.badge_options || []).map(b => ({
//       value: b.value,
//       label: b.label,
//       color: b.color || "text-gray-700", // tailwind class
//     })),
//   },
//   infos: (s.infos || []).slice(0, 4).map(i => ({ field: i.field, icon: i.icon })),
//   value: {
//     field: s.value?.field,
//     prefix: s.value?.prefix ?? "Rp",
//     suffix: s.value?.suffix ?? "/day",
//     size: s.value?.size || "lg",
//     weight: s.value?.weight || "bold",
//     color: s.value?.color || "text-blue-600",
//   },
//   actions: {
//     view: !!s.actions?.view,
//     edit: !!s.actions?.edit,
//     delete: !!s.actions?.delete,
//   },
// });

// // 8) Utility: buang undefined/empty agar nggak memicu 422 nested
// function cleanup<T>(obj: T): T {
//   return JSON.parse(JSON.stringify(obj));
// }

// function normalizeCardLayoutFromApi(raw: any): CardLayoutSchema {
//   // Bisa datang dalam 3 bentuk:
//   // A) { name, schema: {...} }
//   // B) { name, mainImage, judul, ... }  // flat
//   // C) string JSON (schema) atau langsung {...} (flat)

//   let container = raw;
//   // kalau array, ambil elemen pertama
//   if (Array.isArray(container)) container = container[0] ?? {};

//   // coba deteksi "schema"
//   let schema = container?.schema ?? container ?? {};

//   // kalau string, parse
//   if (typeof schema === "string") {
//     try { schema = JSON.parse(schema); } catch {}
//   }

//   // Jika ternyata container adalah flat dan tidak punya "schema",
//   // maka 'container' mengandung 'name', dan 'schema' juga sama dengan container.
//   // Ambil name dari container, kalau tidak ada pakai default.
//   const name = container?.name ?? schema?.name ?? "Default";

//   // fallback alias key
//   const pick = (o: any, ...keys: string[]) => {
//     for (const k of keys) if (o && o[k] != null) return o[k];
//     return undefined;
//   };

//   const mainImage = pick(schema, "mainImage", "main_image") ?? {};
//   const judul     = schema?.judul ?? {};
//   const subjudul  = schema?.subjudul ?? {};
//   const status    = schema?.status ?? {};
//   const value     = schema?.value ?? {};
//   const infosArr  = Array.isArray(schema?.infos) ? schema.infos : [];

//   const readField = (o: any) => pick(o || {}, "field", "column", "source_column");

//   return {
//     name,
//     mainImage: {
//       field: readField(mainImage),
//       width: Number(mainImage.width ?? 128),
//       height: Number(mainImage.height ?? 96),
//       rounded: Boolean(mainImage.rounded ?? true),
//     },
//     judul: {
//       field: readField(judul),
//       size: judul.size ?? "lg",
//       weight: judul.weight ?? "semibold",
//       color: judul.color ?? "text-gray-900",
//     },
//     subjudul: {
//       field: readField(subjudul),
//       size: subjudul.size ?? "sm",
//       weight: subjudul.weight ?? "normal",
//       color: subjudul.color ?? "text-gray-600",
//     },
//     status: {
//       field: readField(status),
//       size: status.size ?? "xs",
//       weight: status.weight ?? "medium",
//       color: status.color ?? "text-green-700",
//       badge_options: Array.isArray(status.badge_options)
//         ? status.badge_options.map((b:any)=>({
//             value: String(b.value ?? ""),
//             label: String(b.label ?? b.value ?? ""),
//             color: String(b.color ?? "text-gray-700"),
//           }))
//         : [],
//     },
//     infos: [
//       { field: readField(infosArr[0]||{}), icon: infosArr[0]?.icon },
//       { field: readField(infosArr[1]||{}), icon: infosArr[1]?.icon },
//       { field: readField(infosArr[2]||{}), icon: infosArr[2]?.icon },
//       { field: readField(infosArr[3]||{}), icon: infosArr[3]?.icon },
//     ],
//     value: {
//       field: readField(value),
//       prefix: value.prefix ?? "Rp ",
//       suffix: value.suffix ?? "/day",
//       size: value.size ?? "lg",
//       weight: value.weight ?? "bold",
//       color: value.color ?? "text-blue-600",
//     },
//     actions: {
//       view: Boolean(schema?.actions?.view ?? true),
//       edit: Boolean(schema?.actions?.edit ?? true),
//       delete: Boolean(schema?.actions?.delete ?? true),
//     },
//   };
// }

// /* =========================
//    PAGE
// ========================= */
// interface CrudBuilderPageProps {
//   builderId?: string;
// }

// export function CrudBuilderPage({ builderId }: CrudBuilderPageProps) {
//   const router = useRouter();
//   const isEditing = !!builderId;

//   const [dataMaster, setDataMaster] = useState<DataMaster>({
//     judul: "",
//     judulEn: "",
//     judulMenu: "",
//     judulMenuEn: "",
//     namaTabel: "",
//     deskripsi: "",
//     deskripsiEn: "",
//     moduleGroup: "",
//     menuIcon: "Database",
//     kategoriCrud: "utama",
//   });

//   const [categories, setCategories] = useState<Category[]>([
//     {
//       id: uuidv4(),
//       nama: "General",
//       namaEn: "General",
//       columns: [],
//       subCategories: [],
//     },
//   ]);

//   // Ambil enum options (array string) dari sebuah kolom berdasarkan columnId (UUID UI)
//   const getEnumOptionsByColumnId = (columnId: string): string[] => {
//     // 1) cek kategori utama
//     for (const cat of categories) {
//       for (const col of cat.columns) {
//         if (col.id === columnId) return col.enumValues || [];
//       }
//       // 2) cek subkategori (kalau kamu pakai)
//       for (const sub of cat.subCategories || []) {
//         for (const col of sub.columns) {
//           if (col.id === columnId) return col.enumValues || [];
//         }
//       }
//     }
//     return []; // fallback kalau tidak ketemu
//   };

//   const [statistikData, setStatistikData] = useState<StatistikData[]>([]);
//   const [tableLayout, setTableLayout] = useState<TableLayout>({
//     id: uuidv4(),
//     name: "Default Layout",
//     nameEn: "Default Layout",
//     columns: [],
//     showActions: true,
//     actionsPosition: "right",
//     rowHeight: "normal",
//     showBorders: true,
//     alternateRowColors: true,
//   });

//   const [cardLayout, setCardLayout] = useState<CardLayoutSchema>(
//     defaultCardLayoutSchema
//   );

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [activeTab, setActiveTab] = useState("master-data");
//   const [builderData, setBuilderData] = useState<any>(null);

//   // ========== EDIT: FETCH & DESERIALIZE ==========
//   useEffect(() => {
//     const fetchBuilder = async () => {
//       try {
//         if (!builderId) return;
//         const data = await getDataById("builder", builderId);
//         setBuilderData(data);

//         // Master
//         setDataMaster({
//           judul: data.judul,
//           judulEn: data.judul_en ?? data.judulEn ?? "",
//           judulMenu: data.judul_menu ?? data.judulMenu ?? "",
//           judulMenuEn: data.judul_menu_en ?? data.judulMenuEn ?? "",
//           namaTabel: data.nama_tabel ?? data.namaTabel ?? "",
//           deskripsi: data.deskripsi ?? "",
//           deskripsiEn: data.deskripsi_en ?? data.deskripsiEn ?? "",
//           moduleGroup: String(data.modules_id ?? data.moduleGroup ?? ""),
//           menuIcon: data.menu_icon ?? data.menuIcon ?? "Database",
//           kategoriCrud:
//             (data.kategori_crud as DataMaster["kategoriCrud"]) ?? "utama",
//         });

//         // Categories: pakai data.categories kalau ada, else field_categories
//         const cats: Category[] = Array.isArray(data.categories)
//           ? data.categories
//           : deserializeCategoriesFromApi(data.field_categories || []);
//         setCategories(cats);

//         function mapRowHeightApiToFE(
//           v: string
//         ): "compact" | "normal" | "comfortable" {
//           if (v === "compact" || v === "normal") return v;
//           if (v === "tall") return "comfortable";
//           return "normal";
//         }

//         // Stats (kalau backend kirim snake_case, map singkat)
//         const rawStats = data.stats || [];
//         const mappedStats: StatistikData[] = rawStats.map((stat: any) => ({
//           id: String(stat.id ?? uuidv4()),
//           judulStatistik: stat.judul_statistik_id ?? stat.judulStatistik ?? "",
//           judulStatistikEn:
//             stat.judul_statistik_en ?? stat.judulStatistikEn ?? "",
//           queryAngka: stat.query_angka ?? stat.queryAngka ?? "",
//           queryResume: stat.query_resume ?? stat.queryResume ?? "",
//           icon: stat.icon ?? "BarChart3",
//         }));
//         setStatistikData(mappedStats);

//         // Table layout (snake_case -> UI) + translate source_column -> columnId
//         if (data.table_layout && Array.isArray(data.table_layout.columns)) {
//           const tl = data.table_layout;
//           const { nameToId } = buildColumnMaps(cats); // cats = categories hasil deserialize

//           setTableLayout({
//             id: tl.id ?? uuidv4(),
//             name: tl.layout_name_id ?? "Default Layout",
//             nameEn: tl.layout_name_en ?? "Default Layout",
//             showActions: !!tl.show_actions,
//             actionsPosition: tl.actions_position ?? "right",
//             rowHeight: mapRowHeightApiToFE(tl.row_height ?? "normal"),
//             showBorders: !!tl.show_border,
//             alternateRowColors: !!tl.alternate_row_colors,
//             columns: (tl.columns || []).map((c: any, i: number) => {
//               // siapkan image content kalau pakai two_columns + image_settings di kolom
//               const imageContents =
//                 c.column_layout === "two_columns" && c.image_settings
//                   ? [
//                       {
//                         id: `${i}-img`,
//                         columnId:
//                           nameToId[c.image_settings.source_column] ?? "",
//                         displayType: "image",
//                         label: "Image",
//                         labelEn: "Image",
//                         position: 0,
//                         styling: {
//                           fontSize: "text-sm",
//                           fontWeight: "font-normal",
//                           color: "text-gray-900",
//                           textAlign: "left",
//                         },
//                         imageSettings: {
//                           width: c.image_settings.width ?? "64px",
//                           height: c.image_settings.height ?? "48px",
//                           objectFit: c.image_settings.fit ?? "cover",
//                           borderRadius: c.image_settings.border_radius ?? "8px",
//                         },
//                       },
//                     ]
//                   : [];

//               return {
//                 id: String(c.id ?? i),
//                 headerLabel: c.label_id ?? "",
//                 headerLabelEn: c.label_en ?? "",
//                 width: c.width ?? "auto",
//                 alignment:
//                   (c.alignment as "left" | "center" | "right") ?? "left",
//                 isVisible: true,
//                 position: Number.isInteger(c.position) ? c.position : i,
//                 layout:
//                   (c.column_layout as "single" | "two_columns") ?? "single",
//                 // contents text/badge/date/currency/icon_text
//                 contents: (c.contents || []).map((ct: any, j: number) => ({
//                   id: String(ct.id ?? `${i}-${j}`),
//                   columnId: nameToId[ct.source_column] ?? "", // KUNCI: nama_kolom -> UUID
//                   displayType: ct.display_type, // "text" | "image" | ...
//                   label: ct.label_id ?? "",
//                   labelEn: ct.label_en ?? "",
//                   position: Number.isInteger(ct.position) ? ct.position : j,
//                   styling: ct.styling || {
//                     fontSize: "text-sm",
//                     fontWeight: "font-normal",
//                     color: "text-gray-900",
//                     textAlign: "left",
//                   },
//                   imageSettings:
//                     ct.display_type === "image"
//                       ? {
//                           width: ct.image_settings?.width ?? "64px",
//                           height: ct.image_settings?.height ?? "48px",
//                           objectFit: ct.image_settings?.fit ?? "cover",
//                           borderRadius:
//                             ct.image_settings?.border_radius ?? "8px",
//                         }
//                       : undefined,
//                   badgeConfig: Array.isArray(ct.badge_config)
//                     ? ct.badge_config.map((r: any) => ({
//                         value: String(r.value ?? "").trim(),
//                         label: String(r.label ?? r.value ?? "").trim(),
//                         color: r.color ?? "gray",
//                       }))
//                     : undefined,
//                 })),
//                 // image-only slot untuk two_columns (kiri)
//                 imageColumnContents: imageContents,
//               } as TableColumn;
//             }),
//           });
//         } else {
//           // kalau API belum punya layout, pastikan reset default agar UI gak nunggu data ga ada
//           setTableLayout((prev) => ({
//             ...prev,
//             columns: [],
//           }));
//         }

//         // Card layout: gunakan dari backend jika ada; fallback ke default
//         if (data.card_layout) {
//           const normalized = normalizeCardLayoutFromApi(data.card_layout);
//           setCardLayout(normalized)
//           console.log(data.card_layout)
//         } else {
//           setCardLayout(defaultCardLayoutSchema);
//         }

//         // console.log(data.card_layout.schema)

//       } catch (error) {
//         console.error("Gagal memuat data builder:", error);
//       }
//     };
//     fetchBuilder();
//   }, [builderId]);

//   // ===== util kolom untuk TabelLayoutSection =====
//   const getAllColumns = (): Array<{
//     id: string;
//     label: string;
//     namaKolom: string;
//   }> => {
//     const all: Array<{ id: string; label: string; namaKolom: string }> = [];
//     categories.forEach((category) => {
//       category.columns.forEach((column) => {
//         all.push({
//           id: column.id,
//           label: column.labelTampilan || column.namaKolom,
//           namaKolom: column.namaKolom,
//         });
//       });
//       category.subCategories.forEach((subCategory) => {
//         subCategory.columns.forEach((column) => {
//           all.push({
//             id: column.id,
//             label: column.labelTampilan || column.namaKolom,
//             namaKolom: column.namaKolom,
//           });
//         });
//       });
//     });
//     return all.filter((c) => c.namaKolom && c.namaKolom.trim());
//   };

//   // ===== Category ops (UI tetap punyamu) =====
//   const addCategory = (nama: string) => {
//     const newCategory: Category = {
//       id: uuidv4(),
//       nama: nama.trim(),
//       namaEn: "",
//       columns: [],
//       subCategories: [],
//     };
//     setCategories((prev) => [...prev, newCategory]);
//   };
//   const updateCategory = (categoryId: string, updated: Category) => {
//     setCategories(categories.map((c) => (c.id === categoryId ? updated : c)));
//   };
//   const deleteCategory = (categoryId: string) => {
//     if (categories.length > 1)
//       setCategories(categories.filter((c) => c.id !== categoryId));
//     else
//       toast({
//         title: "Cannot Delete",
//         description: "At least one category is required.",
//         variant: "destructive",
//       });
//   };
//   const addSubCategory = (categoryId: string, subCategoryName: string) => {
//     const newSub: SubCategory = {
//       id: uuidv4(),
//       nama: subCategoryName.trim(),
//       namaEn: "",
//       columns: [],
//     };
//     setCategories(
//       categories.map((c) =>
//         c.id === categoryId
//           ? { ...c, subCategories: [...c.subCategories, newSub] }
//           : c
//       )
//     );
//   };
//   const updateSubCategory = (
//     categoryId: string,
//     subId: string,
//     updated: SubCategory
//   ) => {
//     setCategories(
//       categories.map((c) =>
//         c.id === categoryId
//           ? {
//               ...c,
//               subCategories: c.subCategories.map((s) =>
//                 s.id === subId ? updated : s
//               ),
//             }
//           : c
//       )
//     );
//   };
//   const deleteSubCategory = (categoryId: string, subId: string) => {
//     setCategories(
//       categories.map((c) =>
//         c.id === categoryId
//           ? {
//               ...c,
//               subCategories: c.subCategories.filter((s) => s.id !== subId),
//             }
//           : c
//       )
//     );
//   };
//   const moveColumn = (
//     fromCategoryId: string,
//     columnId: string,
//     toCategoryId: string,
//     fromSubCategoryId?: string,
//     toSubCategoryId?: string
//   ) => {
//     let columnToMove: Column | undefined;
//     const updated = categories
//       .map((cat) => {
//         // remove
//         if (cat.id === fromCategoryId) {
//           if (fromSubCategoryId) {
//             return {
//               ...cat,
//               subCategories: cat.subCategories.map((s) => {
//                 if (s.id !== fromSubCategoryId) return s;
//                 const found = s.columns.find((c) => c.id === columnId);
//                 if (found) columnToMove = found;
//                 return {
//                   ...s,
//                   columns: s.columns.filter((c) => c.id !== columnId),
//                 };
//               }),
//             };
//           }
//           return {
//             ...cat,
//             columns: cat.columns.filter((c) => c.id !== columnId),
//           };
//         }
//         return cat;
//       })
//       .map((cat) => {
//         // add
//         if (cat.id === toCategoryId && columnToMove) {
//           if (toSubCategoryId) {
//             return {
//               ...cat,
//               subCategories: cat.subCategories.map((s) =>
//                 s.id === toSubCategoryId
//                   ? { ...s, columns: [...s.columns, columnToMove!] }
//                   : s
//               ),
//             };
//           }
//           return { ...cat, columns: [...cat.columns, columnToMove!] };
//         }
//         return cat;
//       });
//     setCategories(updated);
//   };
//   const getAllDestinations = () => {
//     const dest: Array<{
//       id: string;
//       nama: string;
//       categoryId?: string;
//       subCategoryId?: string;
//     }> = [];
//     categories.forEach((cat) => {
//       dest.push({ id: cat.id, nama: cat.nama, categoryId: cat.id });
//       cat.subCategories.forEach((s) =>
//         dest.push({
//           id: `${cat.id}-${s.id}`,
//           nama: `${cat.nama} > ${s.nama}`,
//           categoryId: cat.id,
//           subCategoryId: s.id,
//         })
//       );
//     });
//     return dest;
//   };

//   // ========== SUBMIT (CREATE / UPDATE) ==========
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     // Validasi ringan
//     if (
//       !dataMaster.judul ||
//       !dataMaster.judulMenu ||
//       !dataMaster.namaTabel ||
//       !dataMaster.kategoriCrud
//     ) {
//       toast({
//         title: "Validation Error",
//         description:
//           "Please fill in all required fields in Master Data section.",
//         variant: "destructive",
//       });
//       setIsSubmitting(false);
//       return;
//     }
//     if (!dataMaster.moduleGroup) {
//       toast({
//         title: "Validation Error",
//         description: "Silakan pilih Module Group terlebih dahulu.",
//         variant: "destructive",
//       });
//       setIsSubmitting(false);
//       return;
//     }
//     for (const cat of categories) {
//       if (!cat.nama?.trim()) {
//         toast({
//           title: "Validation Error",
//           description: "Nama Kategori wajib diisi.",
//           variant: "destructive",
//         });
//         setIsSubmitting(false);
//         return;
//       }
//     }
//     const invalidCats = categories.filter(
//       (cat) =>
//         cat.columns.length === 0 &&
//         cat.subCategories.every((s) => s.columns.length === 0)
//     );
//     if (invalidCats.length) {
//       toast({
//         title: "Validation Error",
//         description: `Categories "${invalidCats
//           .map((c) => c.nama)
//           .join('", "')}" must have at least one column.`,
//         variant: "destructive",
//       });
//       setIsSubmitting(false);
//       return;
//     }
//     const colErrs = validateColumns(categories);
//     if (colErrs.length) {
//       toast({
//         title: "Validation Error",
//         description: colErrs.slice(0, 3).join("\n"),
//         variant: "destructive",
//       });
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const { idToName } = buildColumnMaps(categories);

//       const payload = cleanup({
//         modules_id: dataMaster.moduleGroup,
//         kategori_crud: dataMaster.kategoriCrud,
//         judul: dataMaster.judul,
//         judul_en: dataMaster.judulEn || null,
//         judul_menu: dataMaster.judulMenu || null,
//         judul_menu_en: dataMaster.judulMenuEn || null,
//         nama_tabel: dataMaster.namaTabel,
//         deskripsi: dataMaster.deskripsi || null,
//         deskripsi_en: dataMaster.deskripsiEn || null,
//         status: "draft",
//         field_categories: buildFieldCategories(categories),
//         stats: buildStatsForApi(statistikData),
//         table_layout: buildTableLayout(tableLayout, idToName),
//         card_layout: toApiCardLayout(cardLayout),
//       });

//       if (isEditing && builderId) {
//         await updateData("builder", builderId, payload);
//       } else {
//         await createData("builder", payload);
//       }

//       toast({
//         title: "Success!",
//         description: `CRUD Builder has been ${
//           isEditing ? "updated" : "created"
//         } successfully.`,
//       });
//       router.push("/admin/builder");
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description:
//           error?.response?.data?.message ||
//           error.message ||
//           "Failed to save CRUD Builder. Please try again.",
//         variant: "destructive",
//       });
//       console.error("Save builder failed:", {
//         message: error?.response?.data?.message || error?.message,
//         errors: error?.response?.data?.errors,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ========== RENDER (UI PUNYAMU – TIDAK DIUBAH) ==========
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
//       {/* Header */}
//       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => router.push("/admin/builder")}
//                 className="flex items-center space-x-2"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 <span>Back to Builders</span>
//               </Button>
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//                   <Database className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-semibold text-slate-900">
//                     {isEditing ? "Edit CRUD Builder" : "Create CRUD Builder"}
//                   </h1>
//                   <p className="text-sm text-slate-500">
//                     Build your data structure with ease
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <Button
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               {isSubmitting
//                 ? "Saving..."
//                 : isEditing
//                 ? "Update Builder"
//                 : "Save Builder"}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Main */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* Desktop Tabs */}
//           <div className="hidden md:block">
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="w-full"
//             >
//               <TabsList className="grid w-full grid-cols-5 bg-slate-100/50 p-1 rounded-xl">
//                 <TabsTrigger
//                   value="master-data"
//                   className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
//                 >
//                   <Database className="h-4 w-4" />
//                   <span className="hidden sm:inline">Master Data</span>
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="column-data"
//                   className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
//                 >
//                   <Columns className="h-4 w-4" />
//                   <span className="hidden sm:inline">Column Data</span>
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="table-layout"
//                   className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
//                 >
//                   <Table className="h-4 w-4" />
//                   <span className="hidden sm:inline">Table Layout</span>
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="card-layout"
//                   className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
//                 >
//                   <CreditCard className="h-4 w-4" />
//                   <span className="hidden sm:inline">Card Layout</span>
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="statistics"
//                   className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
//                 >
//                   <BarChart3 className="h-4 w-4" />
//                   <span className="hidden sm:inline">Statistics</span>
//                 </TabsTrigger>
//               </TabsList>

//               <div className="mt-8">
//                 <TabsContent value="master-data" className="space-y-6">
//                   <DataMasterSection
//                     dataMaster={dataMaster}
//                     setDataMaster={setDataMaster}
//                   />
//                 </TabsContent>

//                 <TabsContent value="column-data" className="space-y-6">
//                   <KolomBuilderSection
//                     categories={categories}
//                     setCategories={setCategories}
//                     addCategory={addCategory}
//                     updateCategory={updateCategory}
//                     deleteCategory={deleteCategory}
//                     addSubCategory={addSubCategory}
//                     updateSubCategory={updateSubCategory}
//                     deleteSubCategory={deleteSubCategory}
//                     moveColumn={moveColumn}
//                     getAllDestinations={getAllDestinations}
//                   />
//                 </TabsContent>

//                 <TabsContent value="table-layout" className="space-y-6">
//                   <TabelLayoutSection
//                     tableLayout={tableLayout}
//                     setTableLayout={setTableLayout}
//                     availableColumns={getAllColumns()}
//                     getEnumOptionsForColumn={getEnumOptionsByColumnId}
//                   />
//                 </TabsContent>

//                 <TabsContent value="card-layout" className="space-y-6">
//                   <CardLayoutSection
//                     cardLayout={cardLayout}
//                     setCardLayout={setCardLayout}
//                     availableColumns={getAllColumns()}
//                   />
//                 </TabsContent>

//                 <TabsContent value="statistics" className="space-y-6">
//                   <StatistikBuilderSection
//                     statistikData={statistikData}
//                     setStatistikData={setStatistikData}
//                   />
//                 </TabsContent>
//               </div>
//             </Tabs>
//           </div>

//           {/* Mobile segmented (punyamu) */}
//           {/* ... (biarkan punyamu di sini jika ada) ... */}
//         </form>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    KolomBuilderSection (UI)
// ========================= */
// interface KolomBuilderSectionProps {
//   categories: Category[];
//   setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
//   addCategory: (name: string) => void;
//   updateCategory: (categoryId: string, updatedCategory: Category) => void;
//   deleteCategory: (categoryId: string) => void;
//   addSubCategory: (categoryId: string, subCategoryName: string) => void;
//   updateSubCategory: (
//     categoryId: string,
//     subCategoryId: string,
//     updatedSubCategory: SubCategory
//   ) => void;
//   deleteSubCategory: (categoryId: string, subCategoryId: string) => void;
//   moveColumn: (
//     fromCategoryId: string,
//     columnId: string,
//     toCategoryId: string,
//     fromSubCategoryId?: string,
//     toSubCategoryId?: string
//   ) => void;
//   getAllDestinations: () => Array<{
//     id: string;
//     nama: string;
//     categoryId?: string;
//     subCategoryId?: string;
//   }>;
// }
// function KolomBuilderSection({
//   categories,
//   setCategories,
//   addCategory,
//   updateCategory,
//   deleteCategory,
//   addSubCategory,
//   updateSubCategory,
//   deleteSubCategory,
//   moveColumn,
//   getAllDestinations,
// }: KolomBuilderSectionProps) {
//   const [newCategoryName, setNewCategoryName] = useState("");
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-semibold text-slate-900">Column Data</h2>
//           <p className="text-slate-600 mt-1">
//             Define your database columns and organize them into categories
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex-1 sm:w-64">
//             <input
//               type="text"
//               placeholder="Enter category name..."
//               value={newCategoryName}
//               onChange={(e) => setNewCategoryName(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   if (newCategoryName.trim()) {
//                     addCategory(newCategoryName);
//                     setNewCategoryName("");
//                   }
//                 }
//               }}
//               className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//             />
//           </div>
//           <Button
//             onClick={() => {
//               if (newCategoryName.trim()) {
//                 addCategory(newCategoryName);
//                 setNewCategoryName("");
//               }
//             }}
//             disabled={!newCategoryName.trim()}
//             className="bg-gradient-to-r from-blue-600 to purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
//           >
//             <Plus className="h-4 w-4 mr-2" /> Add Category
//           </Button>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {categories.map((category, index) => (
//           <CategoryBlock
//             key={category.id}
//             category={category}
//             onUpdate={updateCategory}
//             onDelete={deleteCategory}
//             onAddSubCategory={addSubCategory}
//             onUpdateSubCategory={updateSubCategory}
//             onDeleteSubCategory={deleteSubCategory}
//             onMoveColumn={moveColumn}
//             getAllDestinations={getAllDestinations}
//             canDelete={categories.length > 1}
//             isFirst={index === 0}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// // AI Translation function using Gemini API with better error handling
// async function translateText(text: string): Promise<string> {
//   if (!text || !text.trim()) {
//     console.warn("No text provided for translation");
//     return text;
//   }

//   try {
//     const response = await fetch("/api/translate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         text: text.trim(),
//         targetLanguage: "en",
//       }),
//     });

//     // Always try to parse the response, even if not ok
//     let data;
//     try {
//       data = await response.json();
//     } catch (parseError) {
//       console.error("Failed to parse translation response:", parseError);
//       return text; // Return original text if we can't parse response
//     }

//     // Check if we got a valid translation
//     if (
//       data.translatedText &&
//       data.translatedText !== text &&
//       data.translatedText.trim()
//     ) {
//       return data.translatedText;
//     }

//     // Log any errors but don't throw
//     if (data.error) {
//       console.warn("Translation service error:", data.error);
//     }

//     // Always return original text as fallback
//     return text;
//   } catch (error) {
//     console.error("Translation request failed:", error);
//     // Return original text as fallback instead of throwing
//     return text;
//   }
// }

// // Export the translation function for use in other components
// export { translateText };

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { createData, updateData, getDataById } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Save,
  Database,
  Columns,
  BarChart3,
  ArrowLeft,
  Plus,
  Table,
  CreditCard,
} from "lucide-react";
import { DataMasterSection } from "./data-master-section";
import { CategoryBlock } from "./category-block";
import { StatistikBuilderSection } from "./statistik-builder-section";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { TabelLayoutSection } from "@/components/builder/form/tabel-layout-section";
import { CardLayoutSection } from "./card-layout-section";

/* =========================
   TYPINGS
========================= */
export interface DataMaster {
  judul: string;
  judulEn: string;
  judulMenu: string;
  judulMenuEn: string;
  namaTabel: string;
  deskripsi: string;
  deskripsiEn: string;
  moduleGroup: string;
  menuIcon: string;
  kategoriCrud: "utama" | "pendukung";
}
export interface StatistikData {
  id: string;
  judulStatistik: string;
  judulStatistikEn: string;
  queryAngka: string;
  queryResume: string;
  icon: string;
}
export interface Column {
  id: string;
  namaKolom: string;
  labelTampilan: string;
  labelTampilanEn: string;
  placeholder_id: string;
  placeholder_en: string;
  tipeData: string;
  length: string;
  tipeInput: string;
  enumValues: string[];
  aktifkanRelasi: boolean;
  tipeRelasi: string;
  tabelRelasi: string;
  kolomRelasi: string;
  isNullable: boolean;
  isUnique: boolean;
  isRequired: boolean;
  isHide: boolean;
  isReadonly: boolean;
  noUrutKolom: number;
  alignKolom: string;
  defaultValue: string;
  options: string[];
  optionsEn: string[];
}
export interface SubCategory {
  id: string;
  nama: string;
  namaEn: string;
  columns: Column[];
}
export interface Category {
  id: string;
  nama: string;
  namaEn: string;
  columns: Column[];
  subCategories: SubCategory[];
}
export interface TableColumnContent {
  id: string;
  columnId: string; // UI pakai UUID kolom
  displayType: "text" | "image" | "badge" | "currency" | "date" | "icon_text";
  label: string;
  labelEn: string;
  position: number;
  styling: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
  };
  imageSettings?: {
    width: string;
    height: string;
    objectFit: "cover" | "contain" | "fill" | "scale-down";
    borderRadius: string;
  };
  badgeConfig?: Array<{ value: string; label: string; color: string }>;
}
export interface TableColumn {
  id: string;
  headerLabel: string;
  headerLabelEn: string;
  width: string;
  alignment: "left" | "center" | "right";
  isVisible: boolean;
  position: number;
  layout: "single" | "two_columns";
  contents: TableColumnContent[];
  imageColumnContents: TableColumnContent[];
}
export interface TableLayout {
  id: string;
  name: string;
  nameEn: string;
  columns: TableColumn[];
  showActions: boolean;
  actionsPosition: "left" | "right";
  rowHeight: "compact" | "normal" | "comfortable";
  showBorders: boolean;
  alternateRowColors: boolean;
}

export interface BadgeOption {
  value: string;
  label: string;
  color: string;
}

export interface CardLayoutSchema {
  // (optional) name?: string  // aktifkan jika ingin menyimpan nama layout
  mainImage: {
    field?: string;
    width: number;
    height: number;
    rounded: boolean;
  };
  judul: {
    field?: string;
    size: "xs" | "sm" | "base" | "lg" | "xl";
    weight: "normal" | "medium" | "semibold" | "bold";
    color: string;
  };
  subjudul: {
    field?: string;
    size: "xs" | "sm" | "base" | "lg" | "xl";
    weight: "normal" | "medium" | "semibold" | "bold";
    color: string;
  };
  status: {
    field?: string;
    size: "xs" | "sm" | "base" | "lg" | "xl";
    weight: "normal" | "medium" | "semibold" | "bold";
    color: string;
    badge_options?: BadgeOption[];
  };
  infos: {
    field?: string;
    icon?: string;
    size: "xs" | "sm" | "base" | "lg";
    weight: "normal" | "medium" | "semibold" | "bold";
    color: string; // tailwind text-xxx-yyy
  }[]; // up to 4
  value: {
    field?: string;
    prefix?: string;
    suffix?: string;
    size: "xs" | "sm" | "base" | "lg" | "xl";
    weight: "normal" | "medium" | "semibold" | "bold";
    color: string;
  };
  actions: { view: boolean; edit: boolean; delete: boolean };
}

const defaultCardLayoutSchema: CardLayoutSchema = {
  mainImage: { field: undefined, width: 128, height: 96, rounded: true },
  judul: {
    field: undefined,
    size: "lg",
    weight: "semibold",
    color: "text-gray-900",
  },
  subjudul: {
    field: undefined,
    size: "sm",
    weight: "normal",
    color: "text-gray-600",
  },
  status: {
    field: undefined,
    size: "xs",
    weight: "medium",
    color: "text-green-700",
    badge_options: [],
  },
  infos: [
    {
      field: undefined,
      icon: "Car",
      size: "sm",
      weight: "normal",
      color: "text-gray-700",
    },
    {
      field: undefined,
      icon: "Fuel",
      size: "sm",
      weight: "normal",
      color: "text-gray-700",
    },
    {
      field: undefined,
      icon: "Users",
      size: "sm",
      weight: "normal",
      color: "text-gray-700",
    },
    {
      field: undefined,
      icon: "MapPin",
      size: "sm",
      weight: "normal",
      color: "text-gray-700",
    },
  ],
  value: {
    field: undefined,
    prefix: "",
    suffix: "",
    size: "lg",
    weight: "bold",
    color: "text-blue-600",
  },
  actions: { view: true, edit: true, delete: true },
};

/* =========================
   VALIDATOR FE
========================= */
const validateColumns = (categories: Category[]): string[] => {
  const errors: string[] = [];
  categories.forEach((cat) => {
    cat.columns.forEach((col, i) => {
      const prefix = `Kategori \"${cat.nama}\" kolom ke-${i + 1}`;
      if (!col.namaKolom?.trim())
        errors.push(`${prefix}: Nama Kolom wajib diisi`);
      if (!col.labelTampilan?.trim())
        errors.push(`${prefix}: Label wajib diisi`);
      if (!col.tipeData?.trim())
        errors.push(`${prefix}: Tipe Data wajib dipilih`);
      if (!col.tipeInput?.trim())
        errors.push(`${prefix}: Tipe Input wajib dipilih`);
      if (col.aktifkanRelasi) {
        if (!col.tipeRelasi?.trim())
          errors.push(`${prefix}: Tipe Relasi wajib diisi`);
        if (!col.tabelRelasi?.trim())
          errors.push(`${prefix}: Tabel Relasi wajib diisi`);
        if (!col.kolomRelasi?.trim())
          errors.push(`${prefix}: Kolom Relasi wajib diisi`);
      }
    });
    cat.subCategories.forEach((sub) => {
      sub.columns.forEach((col, i) => {
        const prefix = `Subkategori \"${sub.nama}\" kolom ke-${i + 1}`;
        if (!col.namaKolom?.trim())
          errors.push(`${prefix}: Nama Kolom wajib diisi`);
        if (!col.labelTampilan?.trim())
          errors.push(`${prefix}: Label wajib diisi`);
        if (!col.tipeData?.trim())
          errors.push(`${prefix}: Tipe Data wajib dipilih`);
        if (!col.tipeInput?.trim())
          errors.push(`${prefix}: Tipe Input wajib dipilih`);
        if (col.aktifkanRelasi) {
          if (!col.tipeRelasi?.trim())
            errors.push(`${prefix}: Tipe Relasi wajib diisi`);
          if (!col.tabelRelasi?.trim())
            errors.push(`${prefix}: Tabel Relasi wajib diisi`);
          if (!col.kolomRelasi?.trim())
            errors.push(`${prefix}: Kolom Relasi wajib diisi`);
        }
      });
    });
  });
  return errors;
};

/* =========================
   HELPERS (KUNCI)
========================= */

// 1) Deserialize dari backend: field_categories -> Category (UI)
function deserializeCategoriesFromApi(fieldCategories: any[] = []): Category[] {
  return (fieldCategories || []).map((fc: any) => {
    const cols = (fc.columns || []).map((col: any) => ({
      id: col.id ? String(col.id) : crypto.randomUUID?.() || `${Math.random()}`,
      namaKolom: col.nama_kolom ?? "",
      labelTampilan: col.label_id ?? "",
      labelTampilanEn: col.label_en ?? "",
      placeholder_id: col.placeholder_id ?? "",
      placeholder_en: col.placeholder_en ?? "",
      tipeData: col.tipe_data ?? "",
      length: col.length ?? "",
      tipeInput: col.tipe_input ?? "",
      // <- penting: selalu array agar aman di FE
      enumValues: Array.isArray(col.enum_options) ? col.enum_options : [],
      aktifkanRelasi: !!col.aktifkan_relasi,
      tipeRelasi: col.tipe_relasi ?? "",
      tabelRelasi: col.tabel_relasi ?? "",
      kolomRelasi: col.kolom_relasi ?? "",
      isNullable: !!col.is_nullable,
      isUnique: !!col.is_unique,
      isRequired: !!col.is_required,
      isHide: !!col.is_hide,
      isReadonly: !!col.is_readonly,
      noUrutKolom: col.no_urut_kolom ?? 0,
      alignKolom: col.align_kolom ?? "left",
      defaultValue: col.default_value ?? "",
      options: col.options ?? [],
      optionsEn: col.options_en ?? [],
    }));
    return {
      id: fc.id ? String(fc.id) : crypto.randomUUID?.() || `${Math.random()}`,
      nama: fc.nama_kategori ?? "",
      namaEn: "",
      columns: cols,
      subCategories: [], // backend tidak punya subCategories
    } as Category;
  });
}

// 2) Map ID <-> Nama Kolom (untuk translate UI<->API)
function buildColumnMaps(categories: Category[]) {
  const idToName: Record<string, string> = {};
  const nameToId: Record<string, string> = {};
  categories.forEach((cat) => {
    (cat.columns || []).forEach((col) => {
      if (col.id && col.namaKolom) {
        idToName[col.id] = col.namaKolom;
        nameToId[col.namaKolom] = col.id;
      }
    });
    (cat.subCategories || []).forEach((sub) => {
      (sub.columns || []).forEach((col) => {
        if (col.id && col.namaKolom) {
          idToName[col.id] = col.namaKolom;
          nameToId[col.namaKolom] = col.id;
        }
      });
    });
  });
  return { idToName, nameToId };
}

// 3) FE -> API: flatten categories -> field_categories
function buildFieldCategories(categories: Category[]) {
  return categories
    .filter((cat) => (cat?.nama || "").trim())
    .map((cat) => {
      const ownCols = (cat.columns || []).filter((c) =>
        (c?.namaKolom || "").trim()
      );
      const subCols = (cat.subCategories || [])
        .flatMap((sc) => sc.columns || [])
        .filter((c) => (c?.namaKolom || "").trim());
      const allCols = [...ownCols, ...subCols];
      return {
        nama_kategori: cat.nama.trim(),
        columns: allCols.map((col) => ({
          nama_kolom: col.namaKolom.trim(),
          label_id: col.labelTampilan || null,
          label_en: col.labelTampilanEn || null,
          placeholder_id: col.placeholder_id || null,
          placeholder_en: col.placeholder_en || null,
          tipe_data: col.tipeData || null,
          length: col.length || null,
          tipe_input: col.tipeInput || null,
          enum_options: col.enumValues || [],
          aktifkan_relasi: !!col.aktifkanRelasi,
          tipe_relasi: col.tipeRelasi || null,
          tabel_relasi: col.tabelRelasi || null,
          kolom_relasi: col.kolomRelasi || null,
          is_nullable: !!col.isNullable,
          is_unique: !!col.isUnique,
          is_required: !!col.isRequired,
          is_hide: !!col.isHide,
          is_readonly: !!col.isReadonly,
          no_urut_kolom: col.noUrutKolom ?? null,
          align_kolom: col.alignKolom || null,
          default_value: col.defaultValue || null,
          options: col.options || [],
          options_en: col.optionsEn || [],
        })),
      };
    });
}

// 4) FE -> API: map rowHeight
function mapRowHeightFEToApi(
  v: TableLayout["rowHeight"]
): "compact" | "normal" | "tall" {
  if (v === "compact" || v === "normal") return v;
  return "tall"; // FE "comfortable" → API "tall"
}

// 5) API -> FE: map rowHeight
function mapRowHeightApiToFE(v: string): TableLayout["rowHeight"] {
  if (v === "compact" || v === "normal") return v;
  if (v === "tall") return "comfortable";
  return "normal";
}

// 6) FE -> API: build table_layout (translate columnId(UUID) -> source_column(nama_kolom))
function buildTableLayout(
  table: TableLayout | undefined,
  idToName: Record<string, string>
) {
  if (!table) return undefined;
  const cols = (table.columns || []).filter((c) =>
    (c?.headerLabel || "").trim()
  );
  if (!cols.length) return undefined;

  return {
    layout_name_id: table.name || "Default",
    layout_name_en: table.nameEn || "Default",
    show_actions: !!table.showActions,
    actions_position: table.actionsPosition,
    row_height: mapRowHeightFEToApi(table.rowHeight),
    show_border: !!table.showBorders,
    alternate_row_colors: !!table.alternateRowColors,
    columns: cols.map((c, idx) => {
      // === column-level image_settings (untuk layout two_columns kiri) ===
      let columnImageSettings: any = null;
      if (c.layout === "two_columns" && c.imageColumnContents?.length) {
        const img = c.imageColumnContents[0];
        if (img?.imageSettings && img.columnId) {
          columnImageSettings = {
            source_column: idToName[img.columnId] ?? img.columnId,
            width: img.imageSettings.width,
            height: img.imageSettings.height,
            fit: img.imageSettings.objectFit, // backend: 'fit'
            border_radius: img.imageSettings.borderRadius,
          };
        }
      }

      return {
        label_id: c.headerLabel,
        label_en: c.headerLabelEn || null,
        alignment: c.alignment || "left",
        width: c.width || null,
        position: Number.isInteger(c.position) ? c.position : idx,
        column_layout: c.layout || "single",

        // kirim object jika ada
        image_settings: columnImageSettings,

        contents: (c.contents || []).map((ct, cti) => {
          const base: any = {
            source_column: idToName[ct.columnId] ?? ct.columnId, // UUID -> nama_kolom
            display_type: ct.displayType,
            label_id: ct.label || null,
            label_en: ct.labelEn || null, // opsional
            styling: ct.styling || null,
            position: Number.isInteger(ct.position) ? ct.position : cti,
          };

          // content-level image settings
          if (ct.displayType === "image" && ct.imageSettings) {
            base.image_settings = {
              width: ct.imageSettings.width,
              height: ct.imageSettings.height,
              fit: ct.imageSettings.objectFit,
              border_radius: ct.imageSettings.borderRadius,
            };
          }

          // content-level badge config
          if (ct.displayType === "badge" && ct.badgeConfig?.length) {
            base.badge_config = ct.badgeConfig.map((b) => ({
              value: b.value,
              label: b.label,
              color: b.color,
            }));
          }

          return base;
        }),
      };
    }),
  };
}

// 7) FE -> API: stats (judul_statistik_id = NAMA IDN)
function buildStatsForApi(stats: StatistikData[]) {
  return (stats || []).map((s) => ({
    judul_statistik_id: s.judulStatistik || "",
    judul_statistik_en: s.judulStatistikEn || null,
    query_angka: s.queryAngka || "",
    query_resume: s.queryResume || null,
    icon: s.icon || null,
  }));
}

// to API Card Layout
const toApiCardLayout = (s: CardLayoutSchema) => ({
  mainImage: {
    field: s.mainImage?.field,
    width: s.mainImage?.width ?? 128,
    height: s.mainImage?.height ?? 96,
    rounded: !!s.mainImage?.rounded,
  },
  judul: {
    field: s.judul?.field,
    size: s.judul?.size || "lg",
    weight: s.judul?.weight || "semibold",
    color: s.judul?.color || "text-gray-900",
  },
  subjudul: {
    field: s.subjudul?.field,
    size: s.subjudul?.size || "sm",
    weight: s.subjudul?.weight || "normal",
    color: s.subjudul?.color || "text-gray-600",
  },
  status: {
    field: s.status?.field,
    size: s.status?.size || "xs",
    weight: s.status?.weight || "medium",
    color: s.status?.color || "text-green-700",
    badge_options: (s.status?.badge_options || []).map((b) => ({
      value: b.value,
      label: b.label,
      color: b.color || "text-gray-700",
    })),
  },
  infos: (s.infos || []).slice(0, 4).map((i) => ({
    field: i.field,
    icon: i.icon,
    size: i.size || "sm",
    weight: i.weight || "normal",
    color: i.color || "text-gray-700",
  })),
  value: {
    field: s.value?.field,
    prefix: s.value?.prefix ?? "Rp",
    suffix: s.value?.suffix ?? "/day",
    size: s.value?.size || "lg",
    weight: s.value?.weight || "bold",
    color: s.value?.color || "text-blue-600",
  },
  actions: {
    view: !!s.actions?.view,
    edit: !!s.actions?.edit,
    delete: !!s.actions?.delete,
  },
});

// 8) Utility: buang undefined/empty agar nggak memicu 422 nested
function cleanup<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Normalizer tahan banting untuk berbagai bentuk payload card_layout */
function normalizeCardLayoutFromApi(raw: any): CardLayoutSchema {
  let container = Array.isArray(raw) ? raw[0] ?? {} : raw ?? {};
  let schema: any = container?.schema ?? container ?? {};
  if (typeof schema === "string") {
    try {
      schema = JSON.parse(schema);
    } catch {}
  }

  const pick = (o: any, ...keys: string[]) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
    return undefined;
  };
  const readField = (o: any) =>
    pick(o || {}, "field", "column", "source_column");

  const mainImage = pick(schema, "mainImage", "main_image") ?? {};
  const judul = schema?.judul ?? {};
  const subjudul = schema?.subjudul ?? {};
  const status = schema?.status ?? {};
  const value = schema?.value ?? {};
  const infosArr = Array.isArray(schema?.infos) ? schema.infos : [];

  return {
    mainImage: {
      field: readField(mainImage),
      width: Number(mainImage.width ?? 128),
      height: Number(mainImage.height ?? 96),
      rounded: Boolean(mainImage.rounded ?? true),
    },
    judul: {
      field: readField(judul),
      size: judul.size ?? "lg",
      weight: judul.weight ?? "semibold",
      color: judul.color ?? "text-gray-900",
    },
    subjudul: {
      field: readField(subjudul),
      size: subjudul.size ?? "sm",
      weight: subjudul.weight ?? "normal",
      color: subjudul.color ?? "text-gray-600",
    },
    status: {
      field: readField(status),
      size: status.size ?? "xs",
      weight: status.weight ?? "medium",
      color: status.color ?? "text-green-700",
      badge_options: Array.isArray(status.badge_options)
        ? status.badge_options.map((b: any) => ({
            value: String(b.value ?? ""),
            label: String(b.label ?? b.value ?? ""),
            color: String(b.color ?? "text-gray-700"),
          }))
        : [],
    },
    infos: [
      {
        field: readField(infosArr[0] || {}),
        icon: infosArr[0]?.icon,
        size: infosArr[0]?.size ?? "sm",
        weight: infosArr[0]?.weight ?? "normal",
        color: infosArr[0]?.color ?? "text-gray-700",
      },
      {
        field: readField(infosArr[1] || {}),
        icon: infosArr[1]?.icon,
        size: infosArr[1]?.size ?? "sm",
        weight: infosArr[1]?.weight ?? "normal",
        color: infosArr[1]?.color ?? "text-gray-700",
      },
      {
        field: readField(infosArr[2] || {}),
        icon: infosArr[2]?.icon,
        size: infosArr[2]?.size ?? "sm",
        weight: infosArr[2]?.weight ?? "normal",
        color: infosArr[2]?.color ?? "text-gray-700",
      },
      {
        field: readField(infosArr[3] || {}),
        icon: infosArr[3]?.icon,
        size: infosArr[3]?.size ?? "sm",
        weight: infosArr[3]?.weight ?? "normal",
        color: infosArr[3]?.color ?? "text-gray-700",
      },
    ],
    value: {
      field: readField(value),
      prefix: value.prefix ?? "Rp",
      suffix: value.suffix ?? "/day",
      size: value.size ?? "lg",
      weight: value.weight ?? "bold",
      color: value.color ?? "text-blue-600",
    },
    actions: {
      view: Boolean(schema?.actions?.view ?? true),
      edit: Boolean(schema?.actions?.edit ?? true),
      delete: Boolean(schema?.actions?.delete ?? true),
    },
  };
}

/* =========================
   PAGE
========================= */
interface CrudBuilderPageProps {
  builderId?: string;
}

export function CrudBuilderPage({ builderId }: CrudBuilderPageProps) {
  const router = useRouter();
  const isEditing = !!builderId;

  const [dataMaster, setDataMaster] = useState<DataMaster>({
    judul: "",
    judulEn: "",
    judulMenu: "",
    judulMenuEn: "",
    namaTabel: "",
    deskripsi: "",
    deskripsiEn: "",
    moduleGroup: "",
    menuIcon: "Database",
    kategoriCrud: "utama",
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      id: uuidv4(),
      nama: "General",
      namaEn: "General",
      columns: [],
      subCategories: [],
    },
  ]);

  // Ambil enum options (array string) dari sebuah kolom berdasarkan columnId (UUID UI)
  const getEnumOptionsByColumnId = (columnId: string): string[] => {
    for (const cat of categories) {
      for (const col of cat.columns) {
        if (col.id === columnId) return col.enumValues || [];
      }
      for (const sub of cat.subCategories || []) {
        for (const col of sub.columns) {
          if (col.id === columnId) return col.enumValues || [];
        }
      }
    }
    return [];
  };

  const [statistikData, setStatistikData] = useState<StatistikData[]>([]);
  const [tableLayout, setTableLayout] = useState<TableLayout>({
    id: uuidv4(),
    name: "Default Layout",
    nameEn: "Default Layout",
    columns: [],
    showActions: true,
    actionsPosition: "right",
    rowHeight: "normal",
    showBorders: true,
    alternateRowColors: true,
  });

  const [cardLayout, setCardLayout] = useState<CardLayoutSchema>(
    defaultCardLayoutSchema
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("master-data");

  // simpan hasil GET biar bisa dipakai efek lanjutan
  const [builderData, setBuilderData] = useState<any>(null);

  // ========== EDIT: FETCH ==========
  useEffect(() => {
    const fetchBuilder = async () => {
      try {
        if (!builderId) return;
        const data = await getDataById("builder", builderId);
        setBuilderData(data);

        // Master
        setDataMaster({
          judul: data.judul,
          judulEn: data.judul_en ?? data.judulEn ?? "",
          judulMenu: data.judul_menu ?? data.judulMenu ?? "",
          judulMenuEn: data.judul_menu_en ?? data.judulMenuEn ?? "",
          namaTabel: data.nama_tabel ?? data.namaTabel ?? "",
          deskripsi: data.deskripsi ?? "",
          deskripsiEn: data.deskripsi_en ?? data.deskripsiEn ?? "",
          moduleGroup: String(data.modules_id ?? data.moduleGroup ?? ""),
          menuIcon: data.menu_icon ?? data.menuIcon ?? "Database",
          kategoriCrud:
            (data.kategori_crud as DataMaster["kategoriCrud"]) ?? "utama",
        });

        // Categories
        const cats: Category[] = Array.isArray(data.categories)
          ? data.categories
          : deserializeCategoriesFromApi(data.field_categories || []);
        setCategories(cats);

        // Stats
        const rawStats = data.stats || [];
        const mappedStats: StatistikData[] = rawStats.map((stat: any) => ({
          id: String(stat.id ?? uuidv4()),
          judulStatistik: stat.judul_statistik_id ?? stat.judulStatistik ?? "",
          judulStatistikEn:
            stat.judul_statistik_en ?? stat.judulStatistikEn ?? "",
          queryAngka: stat.query_angka ?? stat.queryAngka ?? "",
          queryResume: stat.query_resume ?? stat.queryResume ?? "",
          icon: stat.icon ?? "BarChart3",
        }));
        setStatistikData(mappedStats);

        // Table layout (gunakan cats lokal untuk mapping nama->UUID)
        if (data.table_layout && Array.isArray(data.table_layout.columns)) {
          const tl = data.table_layout;
          const { nameToId } = buildColumnMaps(cats);

          setTableLayout({
            id: tl.id ?? uuidv4(),
            name: tl.layout_name_id ?? "Default Layout",
            nameEn: tl.layout_name_en ?? "Default Layout",
            showActions: !!tl.show_actions,
            actionsPosition: tl.actions_position ?? "right",
            rowHeight: mapRowHeightApiToFE(tl.row_height ?? "normal"),
            showBorders: !!tl.show_border,
            alternateRowColors: !!tl.alternate_row_colors,
            columns: (tl.columns || []).map((c: any, i: number) => {
              const imageContents =
                c.column_layout === "two_columns" && c.image_settings
                  ? [
                      {
                        id: `${i}-img`,
                        columnId:
                          nameToId[c.image_settings.source_column] ?? "",
                        displayType: "image",
                        label: "Image",
                        labelEn: "Image",
                        position: 0,
                        styling: {
                          fontSize: "text-sm",
                          fontWeight: "font-normal",
                          color: "text-gray-900",
                          textAlign: "left",
                        },
                        imageSettings: {
                          width: c.image_settings.width ?? "64px",
                          height: c.image_settings.height ?? "48px",
                          objectFit: c.image_settings.fit ?? "cover",
                          borderRadius: c.image_settings.border_radius ?? "8px",
                        },
                      },
                    ]
                  : [];

              return {
                id: String(c.id ?? i),
                headerLabel: c.label_id ?? "",
                headerLabelEn: c.label_en ?? "",
                width: c.width ?? "auto",
                alignment:
                  (c.alignment as "left" | "center" | "right") ?? "left",
                isVisible: true,
                position: Number.isInteger(c.position) ? c.position : i,
                layout:
                  (c.column_layout as "single" | "two_columns") ?? "single",
                contents: (c.contents || []).map((ct: any, j: number) => ({
                  id: String(ct.id ?? `${i}-${j}`),
                  columnId: nameToId[ct.source_column] ?? "",
                  displayType: ct.display_type,
                  label: ct.label_id ?? "",
                  labelEn: ct.label_en ?? "",
                  position: Number.isInteger(ct.position) ? ct.position : j,
                  styling: ct.styling || {
                    fontSize: "text-sm",
                    fontWeight: "font-normal",
                    color: "text-gray-900",
                    textAlign: "left",
                  },
                  imageSettings:
                    ct.display_type === "image"
                      ? {
                          width: ct.image_settings?.width ?? "64px",
                          height: ct.image_settings?.height ?? "48px",
                          objectFit: ct.image_settings?.fit ?? "cover",
                          borderRadius:
                            ct.image_settings?.border_radius ?? "8px",
                        }
                      : undefined,
                  badgeConfig: Array.isArray(ct.badge_config)
                    ? ct.badge_config.map((r: any) => ({
                        value: String(r.value ?? "").trim(),
                        label: String(r.label ?? r.value ?? "").trim(),
                        color: r.color ?? "gray",
                      }))
                    : undefined,
                })),
                imageColumnContents: imageContents,
              } as TableColumn;
            }),
          });
        } else {
          setTableLayout((prev) => ({
            ...prev,
            columns: [],
          }));
        }

        // ⚠️ PENTING: JANGAN setCardLayout di sini — tunggu categories siap (efek terpisah)
      } catch (error) {
        console.error("Gagal memuat data builder:", error);
      }
    };
    fetchBuilder();
  }, [builderId]);

  // Setelah categories siap, barulah normalisasi + set cardLayout
  useEffect(() => {
    if (!builderId) return;
    if (!builderData?.card_layout) return;
    if (!categories?.length) return;

    const normalized = normalizeCardLayoutFromApi(builderData.card_layout);
    setCardLayout(normalized);
  }, [builderId, builderData?.card_layout, categories]);

  // ===== util kolom untuk TabelLayoutSection =====
  const getAllColumns = (): Array<{
    id: string;
    label: string;
    namaKolom: string;
  }> => {
    const all: Array<{ id: string; label: string; namaKolom: string }> = [];
    categories.forEach((category) => {
      category.columns.forEach((column) => {
        all.push({
          id: column.id,
          label: column.labelTampilan || column.namaKolom,
          namaKolom: column.namaKolom,
        });
      });
      category.subCategories.forEach((subCategory) => {
        subCategory.columns.forEach((column) => {
          all.push({
            id: column.id,
            label: column.labelTampilan || column.namaKolom,
            namaKolom: column.namaKolom,
          });
        });
      });
    });
    return all.filter((c) => c.namaKolom && c.namaKolom.trim());
  };

  // ===== Category ops (UI tetap punyamu) =====
  const addCategory = (nama: string) => {
    const newCategory: Category = {
      id: uuidv4(),
      nama: nama.trim(),
      namaEn: "",
      columns: [],
      subCategories: [],
    };
    setCategories((prev) => [...prev, newCategory]);
  };
  const updateCategory = (categoryId: string, updated: Category) => {
    setCategories(categories.map((c) => (c.id === categoryId ? updated : c)));
  };
  const deleteCategory = (categoryId: string) => {
    if (categories.length > 1)
      setCategories(categories.filter((c) => c.id !== categoryId));
    else
      toast({
        title: "Cannot Delete",
        description: "At least one category is required.",
        variant: "destructive",
      });
  };
  const addSubCategory = (categoryId: string, subCategoryName: string) => {
    const newSub: SubCategory = {
      id: uuidv4(),
      nama: subCategoryName.trim(),
      namaEn: "",
      columns: [],
    };
    setCategories(
      categories.map((c) =>
        c.id === categoryId
          ? { ...c, subCategories: [...c.subCategories, newSub] }
          : c
      )
    );
  };
  const updateSubCategory = (
    categoryId: string,
    subId: string,
    updated: SubCategory
  ) => {
    setCategories(
      categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.id === subId ? updated : s
              ),
            }
          : c
      )
    );
  };
  const deleteSubCategory = (categoryId: string, subId: string) => {
    setCategories(
      categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.filter((s) => s.id !== subId),
            }
          : c
      )
    );
  };
  const moveColumn = (
    fromCategoryId: string,
    columnId: string,
    toCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string
  ) => {
    let columnToMove: Column | undefined;
    const updated = categories
      .map((cat) => {
        if (cat.id === fromCategoryId) {
          if (fromSubCategoryId) {
            return {
              ...cat,
              subCategories: cat.subCategories.map((s) => {
                if (s.id !== fromSubCategoryId) return s;
                const found = s.columns.find((c) => c.id === columnId);
                if (found) columnToMove = found;
                return {
                  ...s,
                  columns: s.columns.filter((c) => c.id !== columnId),
                };
              }),
            };
          }
          return {
            ...cat,
            columns: cat.columns.filter((c) => c.id !== columnId),
          };
        }
        return cat;
      })
      .map((cat) => {
        if (cat.id === toCategoryId && columnToMove) {
          if (toSubCategoryId) {
            return {
              ...cat,
              subCategories: cat.subCategories.map((s) =>
                s.id === toSubCategoryId
                  ? { ...s, columns: [...s.columns, columnToMove!] }
                  : s
              ),
            };
          }
          return { ...cat, columns: [...cat.columns, columnToMove!] };
        }
        return cat;
      });
    setCategories(updated);
  };
  const getAllDestinations = () => {
    const dest: Array<{
      id: string;
      nama: string;
      categoryId?: string;
      subCategoryId?: string;
    }> = [];
    categories.forEach((cat) => {
      dest.push({ id: cat.id, nama: cat.nama, categoryId: cat.id });
      cat.subCategories.forEach((s) =>
        dest.push({
          id: `${cat.id}-${s.id}`,
          nama: `${cat.nama} > ${s.nama}`,
          categoryId: cat.id,
          subCategoryId: s.id,
        })
      );
    });
    return dest;
  };

  // ========== SUBMIT (CREATE / UPDATE) ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !dataMaster.judul ||
      !dataMaster.judulMenu ||
      !dataMaster.namaTabel ||
      !dataMaster.kategoriCrud
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields in Master Data section.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (!dataMaster.moduleGroup) {
      toast({
        title: "Validation Error",
        description: "Silakan pilih Module Group terlebih dahulu.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    for (const cat of categories) {
      if (!cat.nama?.trim()) {
        toast({
          title: "Validation Error",
          description: "Nama Kategori wajib diisi.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }
    const invalidCats = categories.filter(
      (cat) =>
        cat.columns.length === 0 &&
        cat.subCategories.every((s) => s.columns.length === 0)
    );
    if (invalidCats.length) {
      toast({
        title: "Validation Error",
        description: `Categories "${invalidCats
          .map((c) => c.nama)
          .join('", "')}" must have at least one column.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    const colErrs = validateColumns(categories);
    if (colErrs.length) {
      toast({
        title: "Validation Error",
        description: colErrs.slice(0, 3).join("\n"),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { idToName } = buildColumnMaps(categories);

      const payload = cleanup({
        modules_id: dataMaster.moduleGroup,
        kategori_crud: dataMaster.kategoriCrud,
        judul: dataMaster.judul,
        judul_en: dataMaster.judulEn || null,
        judul_menu: dataMaster.judulMenu || null,
        judul_menu_en: dataMaster.judulMenuEn || null,
        nama_tabel: dataMaster.namaTabel,
        deskripsi: dataMaster.deskripsi || null,
        deskripsi_en: dataMaster.deskripsiEn || null,
        status: "draft",
        field_categories: buildFieldCategories(categories),
        stats: buildStatsForApi(statistikData),
        table_layout: buildTableLayout(tableLayout, idToName),
        card_layout: toApiCardLayout(cardLayout),
      });

      if (isEditing && builderId) {
        await updateData("builder", builderId, payload);
      } else {
        await createData("builder", payload);
      }

      toast({
        title: "Success!",
        description: `CRUD Builder has been ${
          isEditing ? "updated" : "created"
        } successfully.`,
      });
      router.push("/admin/builder");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Failed to save CRUD Builder. Please try again.",
        variant: "destructive",
      });
      console.error("Save builder failed:", {
        message: error?.response?.data?.message || error?.message,
        errors: error?.response?.data?.errors,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/builder")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Builders</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {isEditing ? "Edit CRUD Builder" : "Create CRUD Builder"}
                  </h1>
                  <p className="text-sm text-slate-500">
                    Build your data structure with ease
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Builder"
                : "Save Builder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger
                  value="master-data"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Master Data</span>
                </TabsTrigger>
                <TabsTrigger
                  value="column-data"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <Columns className="h-4 w-4" />
                  <span className="hidden sm:inline">Column Data</span>
                </TabsTrigger>
                <TabsTrigger
                  value="table-layout"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <Table className="h-4 w-4" />
                  <span className="hidden sm:inline">Table Layout</span>
                </TabsTrigger>
                <TabsTrigger
                  value="card-layout"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Card Layout</span>
                </TabsTrigger>
                <TabsTrigger
                  value="statistics"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistics</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="master-data" className="space-y-6">
                  <DataMasterSection
                    dataMaster={dataMaster}
                    setDataMaster={setDataMaster}
                  />
                </TabsContent>

                <TabsContent value="column-data" className="space-y-6">
                  <KolomBuilderSection
                    categories={categories}
                    setCategories={setCategories}
                    addCategory={addCategory}
                    updateCategory={updateCategory}
                    deleteCategory={deleteCategory}
                    addSubCategory={addSubCategory}
                    updateSubCategory={updateSubCategory}
                    deleteSubCategory={deleteSubCategory}
                    moveColumn={moveColumn}
                    getAllDestinations={getAllDestinations}
                  />
                </TabsContent>

                <TabsContent value="table-layout" className="space-y-6">
                  <TabelLayoutSection
                    tableLayout={tableLayout}
                    setTableLayout={setTableLayout}
                    availableColumns={getAllColumns()}
                    getEnumOptionsForColumn={getEnumOptionsByColumnId}
                  />
                </TabsContent>

                <TabsContent value="card-layout" className="space-y-6">
                  <CardLayoutSection
                    cardLayout={cardLayout}
                    setCardLayout={setCardLayout}
                    availableColumns={getAllColumns()}
                    getEnumOptionsForColumn={getEnumOptionsByColumnId}
                  />
                </TabsContent>

                <TabsContent value="statistics" className="space-y-6">
                  <StatistikBuilderSection
                    statistikData={statistikData}
                    setStatistikData={setStatistikData}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Mobile segmented (jika ada) */}
        </form>
      </div>
    </div>
  );
}

/* =========================
   KolomBuilderSection (UI)
========================= */
interface KolomBuilderSectionProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (name: string) => void;
  updateCategory: (categoryId: string, updatedCategory: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addSubCategory: (categoryId: string, subCategoryName: string) => void;
  updateSubCategory: (
    categoryId: string,
    subCategoryId: string,
    updatedSubCategory: SubCategory
  ) => void;
  deleteSubCategory: (categoryId: string, subCategoryId: string) => void;
  moveColumn: (
    fromCategoryId: string,
    columnId: string,
    toCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string
  ) => void;
  getAllDestinations: () => Array<{
    id: string;
    nama: string;
    categoryId?: string;
    subCategoryId?: string;
  }>;
}
function KolomBuilderSection({
  categories,
  setCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  moveColumn,
  getAllDestinations,
}: KolomBuilderSectionProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Column Data</h2>
          <p className="text-slate-600 mt-1">
            Define your database columns and organize them into categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Enter category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newCategoryName.trim()) {
                    addCategory(newCategoryName);
                    setNewCategoryName("");
                  }
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <Button
            onClick={() => {
              if (newCategoryName.trim()) {
                addCategory(newCategoryName);
                setNewCategoryName("");
              }
            }}
            disabled={!newCategoryName.trim()}
            className="bg-gradient-to-r from-blue-600 to purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <CategoryBlock
            key={category.id}
            category={category}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            onAddSubCategory={addSubCategory}
            onUpdateSubCategory={updateSubCategory}
            onDeleteSubCategory={deleteSubCategory}
            onMoveColumn={moveColumn}
            getAllDestinations={getAllDestinations}
            canDelete={categories.length > 1}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  );
}

// AI Translation function using Gemini API with better error handling
async function translateText(text: string): Promise<string> {
  if (!text || !text.trim()) {
    console.warn("No text provided for translation");
    return text;
  }

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage: "en",
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse translation response:", parseError);
      return text;
    }

    if (
      data.translatedText &&
      data.translatedText !== text &&
      data.translatedText.trim()
    ) {
      return data.translatedText;
    }

    if (data.error) {
      console.warn("Translation service error:", data.error);
    }

    return text;
  } catch (error) {
    console.error("Translation request failed:", error);
    return text;
  }
}

export { translateText };
