// lib/api.ts
import { v4 as uuidv4 } from "uuid";
import {
  Category,
  Column,
  SubCategory,
  StatistikData,
} from "@/components/builder/form/crud-builder-page";
import { BackendMenu, CrudBuilderOption, MenuItem } from "@/types/menu";

export const API_URL = "http://localhost:8080/api";

export async function fetchData(entity: string) {
  const res = await fetch(`${API_URL}/${entity}`, { cache: "no-store" });

  if (!res.ok) {
    console.error("HTTP Error:", res.status, await res.text());
    throw new Error(`Gagal mengambil data ${entity}`);
  }

  const response = await res.json();
  const rawData = Array.isArray(response) ? response : response.data;

  return rawData.map((item: any) => ({
    id: String(item.id),
    name: item.judul ?? item.name,
    kategoriCrud: item.kategori_crud,
    menuTitle: item.judul_menu ?? item.menu_title,
    tableName: item.nama_tabel ?? item.table_name,
    description: item.deskripsi ?? item.description,
    totalCategories:
      item.total_categories ?? item.modules?.total_categories ?? 0,
    totalColumns: item.total_columns ?? item.modules?.total_columns ?? 0,
    totalStats: item.total_stats ?? item.modules?.total_stats ?? 0,
    status: item.status ?? "draft",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by ?? "Unknown",
    product: item.product ?? "",
  }));
}

export async function createData(entity: string, data: any) {
  const res = await fetch(`${API_URL}/${entity}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Gagal membuat ${entity}`);
  }

  return res.json();
}

export async function updateData(entity: string, id: string, data: any) {
  const res = await fetch(`${API_URL}/${entity}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Gagal memperbarui ${entity}`);
  }

  return res.json();
}

export async function getDataById(entity: string, id: string) {
  const res = await fetch(`${API_URL}/${entity}/${id}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data ${entity}`);
  }

  const response = await res.json();
  const item = response.data || response; // jaga-jaga kalau API tidak pakai {data:...}

  // --- Stats (snake_case -> FE)
  const rawStats = item.stats || [];
  const mappedStats = rawStats.map((stat: any) => ({
    id: String(stat.id ?? (crypto.randomUUID?.() || `${Math.random()}`)),
    judulStatistik: stat.judul_statistik_id ?? "",
    judulStatistikEn: stat.judul_statistik_en ?? "",
    queryAngka: stat.query_angka ?? "",
    queryResume: stat.query_resume ?? "",
    icon: stat.icon ?? "BarChart3",
  }));

  // --- Categories:
  // 1) Prioritas: field_categories dari backend (sesuai struktur baru)
  // 2) Fallback: fields lama (kalau ada)
  let mappedCategories: Category[] = [];

  if (Array.isArray(item.field_categories) && item.field_categories.length) {
    mappedCategories = mapFieldCategoriesToCategories(item.field_categories);
  } else if (Array.isArray(item.fields) && item.fields.length) {
    mappedCategories = mapFieldsToCategories(item.fields); // fungsi lamamu tetap dipakai sbg fallback
  } else {
    mappedCategories = [];
  }

  return {
    id: String(item.id),
    kategori_crud: item.kategori_crud,
    judul: item.judul,
    judul_en: item.judul_en, // simpan juga versi en snake_case biar konsisten
    judulEn: item.judul_en,
    judulMenu: item.judul_menu,
    judulMenuEn: item.judul_menu_en,
    namaTabel: item.nama_tabel,
    deskripsi: item.deskripsi,
    deskripsiEn: item.deskripsi_en,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by,
    product_id: String(item.product_id),
    menuIcon: item.menu_icon,

    // penting utk parent page
    categories: mappedCategories,
    stats: mappedStats,

    // lempar mentah ke parent (biar parent translate source_column -> columnId)
    table_layout: item.table_layout ?? null,
    field_categories: item.field_categories ?? null,
    card_layout: item.card_layout,
  };
}

/** NEW: map backend field_categories -> Category[] (format FE) */
function mapFieldCategoriesToCategories(fieldCategories: any[]): Category[] {
  return (fieldCategories || []).map((fc: any) => {
    const cols: Column[] = (fc.columns || []).map((col: any) => ({
      id: String(col.id ?? (crypto.randomUUID?.() || `${Math.random()}`)),
      namaKolom: col.nama_kolom ?? "",
      labelTampilan: col.label_id ?? "",
      labelTampilanEn: col.label_en ?? "",
      placeholder_id: col.placeholder_id ?? "",
      placeholder_en: col.placeholder_en ?? "",
      tipeData: col.tipe_data ?? "",
      length: col.length ?? "",
      tipeInput: col.tipe_input ?? "",
      enumValues: Array.isArray(col.enum_options)
        ? col.enum_options
        : col.enum_options
        ? tryParse(col.enum_options)
        : [],
      // enumValuesEn: Array.isArray(col.enum_values_en)
      //   ? col.enum_values_en
      //   : col.enum_values_en
      //   ? tryParse(col.enum_values_en)
      //   : [],
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
      options: Array.isArray(col.options)
        ? col.options
        : col.options
        ? tryParse(col.options)
        : [],
      optionsEn: Array.isArray(col.options_en)
        ? col.options_en
        : col.options_en
        ? tryParse(col.options_en)
        : [],
    }));

    return {
      id: String(fc.id ?? (crypto.randomUUID?.() || `${Math.random()}`)),
      nama: fc.nama_kategori ?? "",
      namaEn: "",
      columns: cols,
      subCategories: [], // backend tidak kirim subCategories
    };
  });
}

function mapFieldsToCategories(fields: any[]): Category[] {
  const categoriesMap = new Map<string, Category>();

  fields.forEach((field) => {
    const categoryKey = field.kategori || "Tanpa Kategori";
    const subCategoryKey = field.sub_kategori || "";

    if (!categoriesMap.has(categoryKey)) {
      categoriesMap.set(categoryKey, {
        id: uuidv4(),
        nama: categoryKey,
        namaEn: "",
        columns: [],
        subCategories: [],
      });
    }

    const category = categoriesMap.get(categoryKey)!;

    const mappedColumn: Column = {
      id: uuidv4(),
      namaKolom: field.nama_kolom,
      labelTampilan: field.label_id,
      labelTampilanEn: field.label_en,
      tipeData: field.tipe_data,
      length: field.panjang,
      tipeInput: field.tipe_input,
      enumValues: field.enum_options ? JSON.parse(field.enum_options) : [],
      // enumValuesEn: field.enum_values_en
      //   ? JSON.parse(field.enum_values_en)
      //   : [],
      aktifkanRelasi: field.aktifkan_relasi,
      tipeRelasi: field.tipe_relasi,
      tabelRelasi: field.tabel_relasi,
      kolomRelasi: field.kolom_relasi,
      isNullable: field.is_nullable,
      isUnique: field.is_unique,
      isRequired: field.is_required,
      isHide: field.is_hide,
      isReadonly: field.is_readonly,
      noUrutKolom: field.urutan,
      alignKolom: field.align,
      defaultValue: field.default_value,
      options: field.options ? JSON.parse(field.options) : [],
      optionsEn: field.options_en ? JSON.parse(field.options_en) : [],
      placeholder_id: field.placeholder_id || "",
      placeholder_en: field.placeholder_en,
    };

    if (subCategoryKey) {
      let subCategory = category.subCategories.find(
        (sub) => sub.nama === subCategoryKey
      );
      if (!subCategory) {
        subCategory = {
          id: uuidv4(),
          nama: subCategoryKey,
          namaEn: "",
          columns: [],
        };
        category.subCategories.push(subCategory);
      }
      subCategory.columns.push(mappedColumn);
    } else {
      category.columns.push(mappedColumn);
    }
  });

  return Array.from(categoriesMap.values());
}

// helper kecil buat parse json string aman
function tryParse(val: any) {
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export async function deleteData(entity: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${entity}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Gagal menghapus ${entity}.`);
  }
}

export async function fetchModuleStats() {
  const res = await fetch(`${API_URL}/total-modules`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Gagal mengambil statistik modul");
  }

  return res.json();
}

export async function fetchStats(entity: string) {
  const res = await fetch(`${API_URL}/total-${entity}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Gagal mengambil statistik untuk ${entity}`);
  }

  const response = await res.json();

  return response.data ?? response;
}

export async function fetchOptions(entity: string) {
  const res = await fetch(`http://localhost:8080/api/${entity}`);
  const json = await res.json();
  return (json.data || []).map((item: any) => ({
    value: String(item.id),
    label: item.name || item.menu_title || item.label || item.value,
  }));
}

export async function fetchProductsOnBuilder(path: string, params: { status?: string }) {
  const url = new URL(`${API_URL}/${path}`);
  if (params.status) url.searchParams.set("status", params.status.toLowerCase());

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  const json = await res.json();

  const arr: any[] = Array.isArray(json?.data) ? json.data : [];

  return arr.map((item: any) => ({
    value: String(item.id), // UUID
    label: String(item.product_name ?? ""), // pakai product_name
    code: item.product_code ?? null, // opsional, kalau mau dipakai
    status: item.status ?? null,
  }));
}

export async function generate(entity: string, id: string) {
  const res = await fetch(`${API_URL}/${entity}/generate/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Gagal meng-generate ${entity}.`);
  }

  return res.json();
}

export async function deletedBuilder(entity: string) {
  const res = await fetch(`${API_URL}/${entity}-deleted`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function restore(entity: string, id: string) {
  const res = await fetch(`${API_URL}/${entity}/restore/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function forceDelete(entity: string, id: string) {
  const res = await fetch(`${API_URL}/${entity}/force/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

/* ========== Trash box & restore/force ========== */

export interface TrashBoxResponse {
  success: boolean;
  totals: {
    all: number;
    category: number;
    feature: number;
    subfeature: number;
  };
  items: {
    category: FeatureTreeNode[];
    feature: FeatureTreeNode[];
    subfeature: FeatureTreeNode[];
  };
}

export async function fetchTrashBoxFeatures(params?: {
  product_id?: string | number;
}): Promise<TrashBoxResponse> {
  const q = new URLSearchParams();
  if (params?.product_id) q.set("product_id", String(params.product_id));

  const res = await fetch(`${API_URL}/fitur/trash-box?${q.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json().catch(() => ({}));
  // Normalisasi agar selalu punya shape {success, totals, items}
  return {
    success: !!json?.success || true,
    totals: json?.totals ?? { all: 0, category: 0, feature: 0, subfeature: 0 },
    items: json?.items ??
      json?.data ?? { category: [], feature: [], subfeature: [] },
  };
}

/* ========== Generate fitur per product ========== */

export async function generateFiturForProduct(
  productId: string | number
): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${API_URL}/fitur/generate/${productId}`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json().catch(() => ({}))) as any;
}

// =======Menus=====

function extractArray(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.rows)) return json.rows;
  return [];
}


/* =========================
   PRODUCTS (dropdown)
   ========================= */
// src/lib/api.ts

export type Product = {
  id: string;
  name: string;
  product_code: string;
  status: "active" | "inactive";
};

function mapProduct(p: any): Product {
  return {
    id: String(p.id),
    name: p.product_name ?? p.name ?? "",
    product_code: p.product_code ?? p.slug ?? "",
    status: (p.status === "inactive" ? "inactive" : "active") as
      | "active"
      | "inactive",
  };
}

export async function fetchProduct(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Gagal memuat produk: ${res.status} ${txt}`);
  }
  const json = await res.json().catch(() => ({}));

  // dukung berbagai bentuk respons (array langsung / {data:[]} / {data:{data:[]}} / {rows:[]})
  const rows = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json?.data?.data)
    ? json.data.data
    : Array.isArray(json?.rows)
    ? json.rows
    : [];

  return rows.map(mapProduct);
}

export async function fetchMenus(opts?: {
  trash?: "none" | "with" | "only";
  product_id?: string | number;
}) {
  const url = new URL(`${API_URL}/menus`);
  url.searchParams.set("trash", opts?.trash ?? "none");
  if (opts?.product_id != null) {
    url.searchParams.set("product_id", String(opts.product_id));
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Gagal mengambil menu: ${res.status} ${txt}`);
  }

  const json = await res.json().catch(() => ({}));
  return extractArray(json) as BackendMenu[];
}

export async function fetchMenusTreeWithTrashed(product_id?: string | number) {
  return fetchMenus({ trash: "with", product_id });
}

export async function fetchMenusOnlyTrashed(product_id?: string | number) {
  return fetchMenus({ trash: "only", product_id });
}

/* =========================
   MENUS: helpers
   ========================= */

// Normalisasi payload sebelum kirim ke backend
function normalizeMenuPayload(data: any) {
  const payload: any = { ...data };

  const toNumOrUndef = (v: any) => {
    if (v === undefined || v === null || v === "") return undefined;
    if (typeof v === "number") return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
    return v; // biarkan string non-numeric (mis. uuid)
  };

  if ("parent_id" in payload) {
    payload.parent_id = toNumOrUndef(payload.parent_id);
  }
  if ("crud_builder_id" in payload) {
    payload.crud_builder_id = toNumOrUndef(payload.crud_builder_id);
  }
  if ("url" in payload && typeof payload.url === "string") {
    payload.url = payload.url.trim();
    if (payload.url === "") payload.url = undefined;
  }

  return payload;
}

export async function createMenu(data: any) {
  const payload = normalizeMenuPayload(data);
  return createData("menus", payload);
}

export async function updateMenu(id: string, data: any) {
  const payload = normalizeMenuPayload(data);
  return updateData("menus", id, payload);
}

export async function deleteMenu(id: string) {
  return deleteData("menus", id);
}

export async function restoreMenu(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/menus/${id}/restore`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Gagal memulihkan item");
  }
}

export async function forceDeleteMenu(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/menus/${id}/force`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Gagal menghapus permanen");
  }
}

export async function reorderMenus(payload: {
  items: { id: string | number; order_number: number }[];
  parent_id?: string | number | null;
}) {
  const body = {
    items: payload.items.map((it) => ({
      id: String(it.id),
      order_number: Number(it.order_number),
    })),
    parent_id:
      payload.parent_id === null || payload.parent_id === undefined
        ? null
        : String(payload.parent_id),
  };

  const res = await fetch(`${API_URL}/menus/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Gagal menyusun ulang urutan");
  }
  return res.json().catch(() => ({}));
}

export async function toggleMenuActive(id: string) {
  const res = await fetch(`${API_URL}/menus/${id}/toggle`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Gagal mengubah status aktif");
  }
  return res.json().catch(() => ({}));
}

/* =========================
   CRUD BUILDERS (dropdown)
   ========================= */
export async function fetchCrudBuilders(
  signal?: AbortSignal
): Promise<CrudBuilderOption[]> {
  const res = await fetch(`${API_URL}/builder`, {
    cache: "no-store",
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Gagal mengambil daftar CRUD builders: ${res.status} ${txt}`
    );
  }

  const json = await res.json().catch(() => ({}));
  const rows = extractArray(json);

  const mapped: CrudBuilderOption[] = rows
    .map((r: any) => ({
      id: String(r.id),
      name: String(r.name ?? r.menu_title ?? r.table_name ?? "Untitled"),
      menu_title: String(r.judul_menu ?? r.name ?? "Untitled"),
      table_name: String(r.table_name ?? "").replace(/^\//, ""),
    }))
    .filter((x) => x.id && x.menu_title);

  const uniq = new Map<string, CrudBuilderOption>();
  for (const m of mapped) if (!uniq.has(m.id)) uniq.set(m.id, m);
  return Array.from(uniq.values()).sort((a, b) =>
    a.menu_title.localeCompare(b.menu_title)
  );
}

/* =========================
   Generator Sidebar
   ========================= */
export async function generateFrontendMenu(opts?: {
  groupId?: string | number;
  moduleId?: string | number;
  productId?: string | number;
}) {
  const url = new URL(`${API_URL}/generate-menu`);
  if (opts?.groupId != null)
    url.searchParams.set("group_id", String(opts.groupId));
  if (opts?.moduleId != null)
    url.searchParams.set("module_id", String(opts.moduleId));
  if (opts?.productId != null)
    url.searchParams.set("product_id", String(opts.productId));

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Gagal generate sidebar");
  }
  return res.json().catch(() => ({}));
}

// =================== PACKAGES (Package Builder) ===================

export interface FeatureDTO {
  id: string;
  name: string;
  type: "boolean" | "number" | "text";
  value: boolean | number | string;
  description: string;
}

export interface MenuAccessDTO {
  id: string;
  name: string;
  enabled: boolean;
  children?: MenuAccessDTO[];
}

export interface PackageDTO {
  id: string;
  menu_id?: string | null;
  parent_id?: string | null;

  name: string;
  description: string;
  price: number;
  maxUsers: number; // maps to max_users
  status: "active" | "inactive" | "draft";
  subscribers: number;

  features: FeatureDTO[];
  menuAccess: MenuAccessDTO[];

  createdAt: string;
}

// =================== PACKAGE BUILDER – HELPERS ===================

/** Flatten tree menuAccess -> array of enabled menu IDs */
function collectEnabledMenuIds(nodes: MenuAccessDTO[]): number[] {
  const ids: number[] = [];
  const walk = (arr: MenuAccessDTO[]) => {
    arr.forEach((n) => {
      if (n.enabled) ids.push(Number(n.id));
      if (n.children?.length) walk(n.children);
    });
  };
  walk(nodes || []);
  return Array.from(new Set(ids)).map((x) => Number(x));
}

/** Map raw API -> DTO FE (server sudah kirim menuAccess tree) */
function mapApiToPackageDTO(item: any): PackageDTO {
  return {
    id: String(item.id),
    menu_id: item.menu_id ? String(item.menu_id) : null,
    parent_id: item.parent_id ? String(item.parent_id) : null,

    name: item.name ?? "",
    description: item.description ?? "",
    price: Number(item.price ?? 0),
    maxUsers: Number(item.maxUsers ?? item.max_users ?? 1),
    status: (item.status ?? "draft") as PackageDTO["status"],
    subscribers: Number(item.subscribers ?? 0),

    features: Array.isArray(item.features) ? item.features : [],
    menuAccess: Array.isArray(item.menuAccess) ? item.menuAccess : [],

    createdAt: item.createdAt ?? item.created_at ?? "",
  };
}

/** Normalisasi DTO -> payload API */
function toApiPayloadFromDTO(data: PackageDTO) {
  const menu_access = collectEnabledMenuIds(data.menuAccess || []);
  return {
    menu_id: data.menu_id ?? null,
    parent_id: data.parent_id ?? null,

    name: data.name,
    description: data.description,
    price: data.price,
    max_users: data.maxUsers,
    status: data.status,
    subscribers: data.subscribers ?? 0,

    features: data.features ?? [],
    menu_access, // kirim array of menu IDs
  };
}

/** Helper: tarik pesan error yang manusiawi dari response */
async function toReadableApiError(res: Response): Promise<Error> {
  let msg = `HTTP ${res.status}`;
  try {
    const txt = await res.text();
    try {
      const json = JSON.parse(txt);
      msg = json?.message || txt || msg;
    } catch {
      msg = txt || msg;
    }
  } catch {}
  return new Error(msg);
}

// =================== PACKAGE BUILDER – HTTP FUNCS ===================

/** LIST (GET /api/package) – route singular sesuai apiResource('package', ...) */
export async function fetchPackages(params?: {
  menu_id?: string;
  root_only?: boolean;
  with_trashed?: boolean;
  only_trashed?: boolean;
}): Promise<PackageDTO[]> {
  const url = new URL(`${API_URL}/package`);
  if (params?.menu_id) url.searchParams.set("menu_id", params.menu_id);
  if (params?.root_only) url.searchParams.set("root_only", "1");
  if (params?.with_trashed) url.searchParams.set("with_trashed", "1");
  if (params?.only_trashed) url.searchParams.set("only_trashed", "1");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok)
    throw new Error(
      `Gagal mengambil packages: ${res.status} ${await res.text()}`
    );

  const json = await res.json();
  const arr = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : [];
  return arr.map(mapApiToPackageDTO);
}

/** SHOW (GET /api/package/{id}) */
export async function getPackageById(id: string): Promise<PackageDTO> {
  const res = await fetch(`${API_URL}/package/${id}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return mapApiToPackageDTO(json.data ?? json);
}

/** CREATE (POST /api/package) */
export async function createPackage(data: PackageDTO): Promise<PackageDTO> {
  const payload = toApiPayloadFromDTO(data);
  const res = await fetch(`${API_URL}/package`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toReadableApiError(res);
  const json = await res.json();
  return mapApiToPackageDTO(json.data ?? json);
}

/** UPDATE (PUT /api/package/{id}) */
export async function updatePackage(
  id: string,
  data: PackageDTO
): Promise<PackageDTO> {
  const payload = toApiPayloadFromDTO(data);
  const res = await fetch(`${API_URL}/package/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toReadableApiError(res);
  const json = await res.json();
  return mapApiToPackageDTO(json.data ?? json);
}

/** DELETE (DELETE /api/package/{id}) */
export async function deletePackage(id: string) {
  const res = await fetch(`${API_URL}/package/${id}`, { method: "DELETE" });
  if (!res.ok) throw await toReadableApiError(res);
}

/** RESTORE (POST /api/packages/{id}/restore) – ops plural sesuai routes kamu */
export async function restorePackage(id: string): Promise<PackageDTO> {
  const res = await fetch(`${API_URL}/packages/${id}/restore`, {
    method: "POST",
  });
  if (!res.ok) throw await toReadableApiError(res);
  const json = await res.json();
  return mapApiToPackageDTO(json.data ?? json);
}

/** FORCE DELETE (DELETE /api/packages/{id}/force) – ops plural sesuai routes kamu */
export async function forceDeletePackage(id: string) {
  const res = await fetch(`${API_URL}/packages/${id}/force`, {
    method: "DELETE",
  });
  if (!res.ok) throw await toReadableApiError(res);
}

// =================== MENU ACCESS TREE (ambil dari tabel menus) ===================

/**
 * Ambil tree menu dari backend dan map ke shape UI {id,name,enabled,children}.
 * Dukung berbagai nama field anak: children | recursiveChildren | recursive_children | items
 * dan berbagai nama judul: title | name | menu_title | menuTitle
 *
 * NOTE: fungsi ini mengandalkan fetchMenusTreeWithTrashed() yang sudah ada di file ini.
 */
export async function fetchMenuAccessTree(): Promise<MenuAccessDTO[]> {
  const raw = await fetchMenusTreeWithTrashed(); // harus mengembalikan root + children

  const getChildren = (n: any): any[] =>
    (n?.children ??
      n?.recursiveChildren ??
      n?.recursive_children ??
      n?.items ??
      []) ||
    [];

  const getName = (n: any): string =>
    String(n?.title ?? n?.name ?? n?.menu_title ?? n?.menuTitle ?? "");

  const mapNode = (n: any): MenuAccessDTO => ({
    id: String(n?.id),
    name: getName(n),
    enabled: false,
    children: getChildren(n).map(mapNode),
  });

  const roots: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.data)
    ? (raw as any).data
    : [];
  return roots.map(mapNode);
}

// ====== FEATURE BUILDER + MENUS (Relasi langsung ke `menus`) ======
export type FeatureType = "category" | "feature" | "subfeature";

export interface FeatureTreeNode {
  id: string;

  // UI lama masih membaca "code", backend pakai "feature_code"
  code: string;
  feature_code?: string;

  name: string;
  description: string | null;
  type: FeatureType;

  // relasi & meta (snake_case)
  parent_id: string | null;
  is_active: boolean;
  order_number?: number | null;
  crud_menu_id?: string | null;
  product_id?: string | null;
  product_code?: string | null;

  // opsi parent
  price_addon?: number | null;
  trial_available?: boolean | null;
  trial_days?: number | null;

  // timestamps
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  // (opsional, kalau backend kirim tree)
  children?: FeatureTreeNode[];
  recursiveChildren?: FeatureTreeNode[];
}

type _Raw = Record<string, any>;

function _bool(v: any, d = false) {
  if (v === true || v === "1" || v === 1) return true;
  if (v === false || v === "0" || v === 0) return false;
  return d;
}
function _num(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function _mapNode(raw: _Raw): FeatureTreeNode {
  const parent_id =
    raw.parent_id != null
      ? String(raw.parent_id)
      : raw.parentId != null
      ? String(raw.parentId)
      : null;

  const order_number =
    raw.order_number != null ? _num(raw.order_number) : _num(raw.orderNumber);

  const is_active =
    raw.is_active != null ? _bool(raw.is_active) : _bool(raw.isActive, true);

  const crud_menu_id =
    raw.crud_menu_id != null
      ? String(raw.crud_menu_id)
      : raw.menu_id != null
      ? String(raw.menu_id)
      : null;

  const node: FeatureTreeNode = {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    code: String(raw.feature_code ?? raw.code ?? ""),
    feature_code: String(raw.feature_code ?? raw.code ?? ""),
    description: raw.description ?? null,
    type: (raw.type ?? "feature") as FeatureType,

    parent_id,
    is_active,
    order_number,

    crud_menu_id,
    product_id: raw.product_id != null ? String(raw.product_id) : null,
    product_code: raw.product_code != null ? String(raw.product_code) : null,

    price_addon:
      raw.price_addon != null ? _num(raw.price_addon) : (null as number | null),
    trial_available:
      raw.trial_available != null ? _bool(raw.trial_available) : null,
    trial_days:
      raw.trial_days != null ? _num(raw.trial_days) : (null as number | null),

    created_at: raw.created_at,
    updated_at: raw.updated_at,
    deleted_at: raw.deleted_at ?? null,
  };

  // ikutkan anak kalau backend kirim
  if (Array.isArray(raw.children)) node.children = raw.children.map(_mapNode);
  if (Array.isArray(raw.recursiveChildren))
    node.recursiveChildren = raw.recursiveChildren.map(_mapNode);

  return node;
}

function _extractArray(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.rows)) return json.rows;
  return [];
}

// ===== Error helper agar 422 Laravel kebaca jelas =====
async function _throwIfNotOk(res: Response) {
  if (res.ok) return;
  try {
    const j = await res.json();
    if (j?.errors) {
      const msg = Object.entries(j.errors)
        .map(([f, arr]) => `${f}: ${(arr as any[]).join(", ")}`)
        .join("\n");
      throw new Error(msg || j.message || `${res.status} ${res.statusText}`);
    }
    throw new Error(j?.message || `${res.status} ${res.statusText}`);
  } catch {
    throw new Error(await res.text());
  }
}

// helper: camelCase -> snake_case utk Laravel (normalisasi lengkap)
function toSnakePayload(input: Record<string, any>) {
  const out: Record<string, any> = {};

  const toNullIfEmptyId = (val: any) =>
    val === "" || val === undefined ? null : val;

  const toNumberIfNumeric = (val: any) =>
    typeof val === "string" && /^\d+$/.test(val) ? Number(val) : val;

  for (const [k, vRaw] of Object.entries(input)) {
    let v = vRaw;

    switch (k) {
      // alias camel yang sering muncul
      case "parentId":
        v = toNullIfEmptyId(v);
        out["parent_id"] = toNumberIfNumeric(v);
        break;
      case "productId":
        v = toNullIfEmptyId(v);
        out["product_id"] = toNumberIfNumeric(v);
        break;
      case "productCode":
        out["product_code"] = v ?? null;
        break;
      case "featureCode":
        out["feature_code"] = v;
        break;
      case "crudMenuId":
        v = toNullIfEmptyId(v);
        out["crud_menu_id"] = toNumberIfNumeric(v);
        break;
      case "isActive":
        out["is_active"] = !!v;
        break;
      case "orderNumber":
      case "order":
        out["order_number"] = v ?? 0;
        break;

      // snake-case yang sudah benar
      case "parent_id":
      case "product_id":
      case "product_code":
      case "feature_code":
      case "crud_menu_id":
      case "is_active":
      case "order_number":
        out[k] = k.endsWith("_id") ? toNumberIfNumeric(toNullIfEmptyId(v)) : v;
        break;

      case "trial_available":
        out[k] = !!v;
        break;

      case "trial_days":
        // kalau trial_available false -> kirim null
        out[k] = input["trial_available"] ? v ?? null : null;
        break;

      default:
        out[k] = v;
    }
  }
  return out;
}

/** Ambil full tree root -> children (GET /api/fitur/tree) */
export async function fetchFiturTree(params?: {
  trash?: "with" | "only";
  product_id?: string;
}) {
  const url = new URL(`${API_URL}/fitur/tree`);
  if (params?.trash) url.searchParams.set("trash", params.trash);
  if (params?.product_id) url.searchParams.set("product_id", params.product_id);
  url.searchParams.set("root_only", "1");
  url.searchParams.set("with_tree", "1");

  const res = await fetch(url.toString(), { cache: "no-store" });
  await _throwIfNotOk(res);

  const json = await res.json();
  return _extractArray(json).map(_mapNode) as FeatureTreeNode[];
}

/** List fitur (GET /api/fitur) – default root_only=1, with_tree=1 */
export async function listFitur(params?: {
  search?: string;
  type?: FeatureType;
  root_only?: boolean;
  parent_id?: string;
  with_tree?: boolean;
  trash?: "with" | "only";
  product_id?: string;
}): Promise<FeatureTreeNode[]> {
  const url = new URL(`${API_URL}/fitur`);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.type) url.searchParams.set("type", params.type);
  if (params?.parent_id) url.searchParams.set("parent_id", params.parent_id);
  url.searchParams.set("root_only", params?.root_only ?? true ? "1" : "0");
  url.searchParams.set("with_tree", params?.with_tree ?? true ? "1" : "0");
  if (params?.trash) url.searchParams.set("trash", params.trash);
  if (params?.product_id) url.searchParams.set("product_id", params.product_id);

  const res = await fetch(url.toString(), { cache: "no-store" });
  await _throwIfNotOk(res);

  const json = await res.json();
  return _extractArray(json).map(_mapNode);
}

/** Create fitur (POST /api/fitur) */
export async function createFitur(payload: {
  product_id: string | number;
  product_code?: string | null;
  name: string;
  feature_code: string;
  type: FeatureType;
  parent_id?: string | number | null;
  description?: string | null;
  crud_menu_id?: string | number | null;
  is_active?: boolean;
  order_number?: number;
  price_addon?: number;
  trial_available?: boolean;
  trial_days?: number | null;
}): Promise<FeatureTreeNode> {
  const body = toSnakePayload(payload as any);
  const res = await fetch(`${API_URL}/fitur`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  await _throwIfNotOk(res);
  const json = await res.json();
  return _mapNode(json.data ?? json);
}

/** Update fitur (PUT /api/fitur/{id}) */
export async function updateFitur(
  id: string | number,
  payload: {
    name: string;
    feature_code: string;
    type: FeatureType;
    parent_id?: string | number | null;
    description?: string | null;
    crud_menu_id?: string | number | null;
    is_active?: boolean;
    order_number?: number;
    price_addon?: number;
    trial_available?: boolean;
    trial_days?: number | null;
    // ⬇️ ikutkan agar validasi backend tidak 422
    product_id?: string | number | null;
    product_code?: string | null;
  }
): Promise<FeatureTreeNode> {
  const body = toSnakePayload(payload as any);
  const res = await fetch(`${API_URL}/fitur/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  await _throwIfNotOk(res);
  const json = await res.json();
  return _mapNode(json.data ?? json);
}

/** Soft delete (DELETE /api/fitur/{id}) */
export async function deleteFitur(id: string | number): Promise<void> {
  const res = await fetch(`${API_URL}/fitur/${id}`, { method: "DELETE" });
  await _throwIfNotOk(res);
}

/** Toggle aktif/non (POST /api/fitur/{id}/toggle) */
export async function toggleFitur(
  id: string | number
): Promise<FeatureTreeNode> {
  const res = await fetch(`${API_URL}/fitur/${id}/toggle`, { method: "POST" });
  await _throwIfNotOk(res);
  const json = await res.json();
  return _mapNode(json.data ?? json);
}

/** Restore (POST /api/fitur/{id}/restore) */
export async function restoreFitur(
  id: string | number
): Promise<FeatureTreeNode> {
  const res = await fetch(`${API_URL}/fitur/${id}/restore`, { method: "POST" });
  await _throwIfNotOk(res);
  const json = await res.json();
  return _mapNode(json.data ?? json);
}

/** Hard delete (DELETE /api/fitur/{id}/force) */
export async function forceDeleteFitur(id: string | number): Promise<void> {
  const res = await fetch(`${API_URL}/fitur/${id}/force`, { method: "DELETE" });
  await _throwIfNotOk(res);
}

/** Ambil tree fitur yang soft-deleted */
export async function fetchDeletedFiturTree(productId?: string | number) {
  const url = new URL(`${API_URL}/fitur/tree`);
  url.searchParams.set("trash", "only");
  if (productId) url.searchParams.set("product_id", String(productId));
  const res = await fetch(url.toString(), { cache: "no-store" });
  await _throwIfNotOk(res);
  const json = await res.json();
  return _extractArray(json).map(_mapNode);
}

// =================== MENUS LOOKUP (Dropdown relasi langsung ke menus) ===================

export interface CrudMenuOption {
  id: string; // dipakai sebagai crud_menu_id
  path: string; // "Group › Module › Menu"
  label: string; // title
  status: "active" | "inactive";
  product_id?: string | null; // bila tersedia dari join crud_builders
}

// Ambil tree dari /menus
async function _fetchMenusTree(params?: { trash?: "none" | "with" | "only" }) {
  const url = new URL(`${API_URL}/menus`);
  url.searchParams.set("trash", params?.trash ?? "none");
  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  await _throwIfNotOk(res);
  const json = await res.json();
  // controller Anda mengembalikan { data: [...] }
  return Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : [];
}

// Flatten: tampilkan hanya node type "menu" + trail Group/Module/Menu
function _flattenMenusToOptions(roots: any[]): CrudMenuOption[] {
  const out: CrudMenuOption[] = [];

  const walk = (node: any, trail: string[]) => {
    const title = String(node?.title ?? "");
    const thisTrail = title ? [...trail, title] : trail;

    if ((node?.type ?? "menu") === "menu") {
      out.push({
        id: String(node.id),
        path: thisTrail.join(" › "),
        label: title,
        status: node?.is_active ? "active" : "inactive",
        product_id:
          node?.crud_builder?.product_id != null
            ? String(node.crud_builder.product_id)
            : node?.crudBuilder?.product_id != null
            ? String(node.crudBuilder.product_id)
            : null,
      });
    }

    const children =
      node?.recursiveChildren ??
      node?.recursive_children ??
      node?.children ??
      node?.items ??
      [];

    if (Array.isArray(children)) {
      for (const ch of children) walk(ch, thisTrail);
    }
  };

  for (const r of roots || []) walk(r, []);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

/** Ambil opsi dropdown menu dari /api/menus, dengan filter opsional product_id */
export async function fetchCrudMenusForProduct(params?: {
  product_id?: string | number;
  active_only?: boolean;
  search?: string;
}): Promise<CrudMenuOption[]> {
  const roots = await _fetchMenusTree({ trash: "none" });
  let options = _flattenMenusToOptions(roots);

  if (params?.active_only !== false) {
    options = options.filter((m) => m.status === "active");
  }

  if (params?.product_id) {
    const pid = String(params.product_id);
    // kalau product_id tersedia di data, filter; jika semuanya null, jangan kosongkan dropdown
    const filtered = options.filter(
      (m) => m.product_id == null || m.product_id === pid
    );
    options = filtered.length > 0 ? filtered : options;
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    options = options.filter(
      (m) =>
        m.path.toLowerCase().includes(q) || m.label.toLowerCase().includes(q)
    );
  }

  return options;
}

// =============== FEATURE BUILDER (integrasi penuh) ===============
/** Flatten tree generic -> array of enabled node IDs (string/number) */
export function flattenEnabledIds(
  nodes: { id: string | number; enabled?: boolean; children?: any[] }[] = []
): number[] {
  const out: number[] = [];
  const walk = (arr: any[]) => {
    for (const n of arr || []) {
      if (n?.enabled) out.push(Number(n.id));
      if (n?.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  // uniq + to number
  return Array.from(new Set(out)).map(Number);
}

/** Apply enabled flags to a base tree using allowed IDs */
export function markEnabledIds<
  T extends { id: string | number; enabled?: boolean; children?: T[] }
>(tree: T[], allowedIds: Array<string | number>): T[] {
  const allow = new Set(allowedIds.map(Number));
  const walk = (arr: T[]): T[] =>
    (arr || []).map((n) => ({
      ...n,
      enabled: allow.has(Number(n.id)),
      children: n.children?.length ? walk(n.children as T[]) : n.children,
    }));
  return walk(tree);
}

/** Baris raw di tabel feature_builders (SETIAP baris = 1 mapping) */
export interface FeatureBuilderRow {
  id: string;
  package_id: number;
  menu_id: number | null;
  feature_id: number | null;
  status: "active" | "draft" | "archived";
  created_at?: string;
  updated_at?: string;
}

/** Hasil agregasi untuk 1 paket: kumpulan id menu & fitur */
export interface FeatureBuilderSelection {
  packageId: number;
  menuIds: number[];
  featureIds: number[];
}

/** GET semua baris feature_builder untuk suatu package_id, lalu agregasi jadi {menuIds, featureIds} */
export async function fetchFeatureBuilderSelection(
  packageId: string | number
): Promise<FeatureBuilderSelection> {
  const url = new URL(`${API_URL}/feature-builders`);
  url.searchParams.set("package_id", String(packageId));

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw await toReadableApiError(res);
  const json = await res.json();

  const rows: FeatureBuilderRow[] = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : [];

  const menuIds = new Set<number>();
  const featureIds = new Set<number>();
  for (const r of rows) {
    if (r?.menu_id != null) menuIds.add(Number(r.menu_id));
    if (r?.feature_id != null) featureIds.add(Number(r.feature_id));
  }

  return {
    packageId: Number(packageId),
    menuIds: Array.from(menuIds),
    featureIds: Array.from(featureIds),
  };
}

/**
 * SAVE pilihan ke backend (bulk):
 * Backend-mu sudah kita buat menerima:
 *  - POST /feature-builders  { package_id, menu_ids: number[], feature_ids: number[] }
 * Kontroler akan meng-*insert or ignore* baris per id.
 */
export async function saveFeatureBuilderSelection(payload: {
  package_id: number | string;
  menu_ids: number[];
  feature_ids: number[];
  status?: "active" | "draft" | "archived";
}) {
  const res = await fetch(`${API_URL}/feature-builders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      package_id: Number(payload.package_id),
      menu_ids: Array.from(new Set(payload.menu_ids.map(Number))),
      feature_ids: Array.from(new Set(payload.feature_ids.map(Number))),
      status: payload.status ?? "active",
    }),
  });

  if (!res.ok) throw await toReadableApiError(res);
  return res.json(); // { success: true, data: rows[] }
}

/**
 * HELPER: sinkronkan UI tree (menu & fitur) berdasarkan data tersimpan di DB untuk package tertentu
 * - menuTree: tree dari fetchMenuAccessTree()
 * - featureTree: tree dari fetchFiturTree() atau yang sudah kamu punya di state
 */
export async function hydrateFeatureBuilderTreesForPackage(
  packageId: string | number,
  menuTree: MenuAccessDTO[],
  featureTree: any[] // bentuk tree fitur kamu (punya field id, enabled, children)
) {
  const { menuIds, featureIds } = await fetchFeatureBuilderSelection(packageId);
  return {
    menuTree: markEnabledIds(menuTree, menuIds),
    featureTree: markEnabledIds(featureTree, featureIds),
  };
}

/** CONVENIENCE: ambil -> enable -> kembalikan hanya daftar id (kalau kamu ingin one-shot save) */
export function collectSelectionFromTrees(
  menuTree: MenuAccessDTO[],
  featureTree: any[]
) {
  return {
    menu_ids: flattenEnabledIds(menuTree),
    feature_ids: flattenEnabledIds(featureTree),
  };
}
// === PRODUCTS with trash support ===

// List products, dukung opsi trash= "none" | "with" | "only"
export async function fetchProducts(opts?: {
  search?: string;
  status?: "active" | "inactive" | "archived";
  trash?: "none" | "with" | "only";
}) {
  const url = new URL(`${API_URL}/products`);
  if (opts?.search) url.searchParams.set("search", opts.search);
  if (opts?.status) url.searchParams.set("status", opts.status);
  if (opts?.trash && opts.trash !== "none")
    url.searchParams.set("trash", opts.trash);

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Gagal mengambil products: ${res.status} ${txt}`);
  }
  const json = await res.json().catch(() => ({}));
  // Kembalikan array polos + meta jika ada
  return {
    data: Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : [],
    meta: json?.meta || {},
  };
}

// Soft delete sudah otomatis via deleteData("products", id)

export async function restoreProduct(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}/restore`, {
    method: "POST",
  });
  if (!res.ok) {
    let msg = await res.text().catch(() => "");
    try {
      const j = JSON.parse(msg);
      msg = j.message || msg;
    } catch {}
    throw new Error(msg || "Gagal memulihkan product");
  }
}

export async function forceDeleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/${id}/force`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let msg = await res.text().catch(() => "");
    try {
      const j = JSON.parse(msg);
      msg = j.message || msg;
    } catch {}
    throw new Error(msg || "Gagal menghapus permanen product");
  }
}

// template load api
export async function fetchTemplateFrontend(
  path: string,
  params: { status?: string }
) {
  const url = new URL(`${API_URL}/${path}`);
  if (params.status) url.searchParams.set("status", params.status.toLowerCase());

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  const json = await res.json();

  const arr: any[] = Array.isArray(json?.data) ? json.data : [];

  return arr.map((item: any) => ({
    value: String(item.id), // UUID
    label: String(item.template_name ?? ""), // pakai template_name
    code: item.template_code ?? null, // opsional, kalau mau dipakai
    status: item.status ?? null,
  }));
}
