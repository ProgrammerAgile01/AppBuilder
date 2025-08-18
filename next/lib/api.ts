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
    moduleGroup: item.module_group ?? item.modules?.name ?? "",
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
    modules_id: String(item.modules_id),
    menuIcon: item.menu_icon,

    // penting utk parent page
    categories: mappedCategories,
    stats: mappedStats,

    // lempar mentah ke parent (biar parent translate source_column -> columnId)
    table_layout: item.table_layout ?? null,
    field_categories: item.field_categories ?? null,
    card_layout: item.card_layout
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

export async function fetchMenus(opts?: { trash?: "none" | "with" | "only" }) {
  const url = new URL(`${API_URL}/menus`);
  if (opts?.trash) url.searchParams.set("trash", opts.trash);

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

// Opsional: alias biar pemakaian jelas di MenuManagement
export async function fetchMenusTreeWithTrashed() {
  return fetchMenus({ trash: "with" }); // tree root + children (include trashed di relasi)
}

export async function fetchMenusOnlyTrashed() {
  return fetchMenus({ trash: "only" }); // flat list semua yang trashed
}
export async function createMenu(data: Partial<MenuItem>) {
  return createData("menus", data);
}

export async function updateMenu(id: string, data: Partial<MenuItem>) {
  return updateData("menus", id, data);
}

export async function deleteMenu(id: string) {
  return deleteData("menus", id);
}
// Perbaikan di api.ts
export async function restoreMenu(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/menus/${id}/restore`, { method: "POST" });
  if (!res.ok) {
    let errorMessage = "Terjadi kesalahan saat memulihkan item.";
    try {
      // Coba ambil pesan dari respons JSON
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Jika respons bukan JSON, ambil teksnya
      errorMessage = await res.text();
    }
    throw new Error(errorMessage);
  }
}

export async function forceDeleteMenu(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/menus/${id}/force`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

// export async function fetchCrudBuilders() {
//   const res = await fetch(`${API_URL}/builder`, { cache: "no-store" });
//   if (!res.ok) {
//     throw new Error("Gagal mengambil daftar CRUD builders");
//   }
//   const json = await res.json();
//   return json.data || [];
// }
// Helper: ubah 1 record builder ke CrudBuilderOption
function normalizeBuilder(raw: any): CrudBuilderOption | null {
  if (!raw) return null;

  const id = raw.id ?? raw._id ?? raw.uuid;
  if (id === undefined || id === null) return null;

  const name = raw.name ?? raw.nama ?? raw.title ?? raw.judul ?? "";

  const menu_title =
    raw.menu_title ??
    raw.menuTitle ??
    raw.title ??
    raw.judul ??
    name ?? // fallback ke name
    "";

  const table_name =
    raw.table_name ?? raw.tableName ?? raw.table ?? raw.slug ?? raw.route ?? "";

  return {
    id: String(id),
    name: String(name || menu_title || table_name || "Untitled"),
    menu_title: String(menu_title || name || "Untitled"),
    table_name: String(table_name || "").replace(/^\//, ""), // buang leading slash kalau ada
  };
}

// Helper: ambil array `items` dari berbagai bentuk response
function extractArray(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data; // { data: [...] }
  if (Array.isArray(json?.data?.data)) return json.data.data; // { data: { data: [...] } } (paginate)
  if (Array.isArray(json?.rows)) return json.rows; // { rows: [...] }
  return [];
}

export async function fetchCrudBuilders(
  signal?: AbortSignal
): Promise<CrudBuilderOption[]> {
  const res = await fetch(`${API_URL}/builder`, {
    cache: "no-store",
    // credentials: "include", // kalau pakai auth cookie/JWT di cookie
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Gagal mengambil daftar CRUD builders: ${res.status} ${txt}`
    );
  }

  const json = await res.json().catch(() => ({}));
  const items = extractArray(json);

  const mapped = items
    .map(normalizeBuilder)
    .filter((x): x is CrudBuilderOption => !!x);

  // de-dupe by id + sort by menu_title
  const uniq = new Map<string, CrudBuilderOption>();
  for (const m of mapped) {
    if (!uniq.has(m.id)) uniq.set(m.id, m);
  }

  return Array.from(uniq.values()).sort((a, b) =>
    a.menu_title.localeCompare(b.menu_title)
  );
}
export async function generateFrontendMenu(opts?: {
  groupId?: string;
  moduleId?: string;
}) {
  const url = new URL(`${API_URL}/generate-menu`);
  if (opts?.groupId) url.searchParams.set("group_id", String(opts.groupId));
  if (opts?.moduleId) url.searchParams.set("module_id", String(opts.moduleId));

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Gagal generate sidebar");
  }
  return res.json().catch(() => ({}));
}