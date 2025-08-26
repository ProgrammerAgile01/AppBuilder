// export const API_URL = "http://localhost:8000/api";

// /* ================================
//    Helpers
// ================================ */
// const SKIP_KEYS_REGEX = /(_preview|_url)$/i;

// function isFileLike(v: any): v is File | Blob {
//   return (
//     typeof window !== "undefined" && (v instanceof File || v instanceof Blob)
//   );
// }

// function containsFile(input: any): boolean {
//   if (!input || typeof input !== "object") return false;
//   if (isFileLike(input)) return true;
//   if (Array.isArray(input)) return input.some(containsFile);
//   return Object.values(input).some(containsFile);
// }

// function appendDeep(fd: FormData, key: string, value: any) {
//   if (value === undefined || value === null) return;

//   if (isFileLike(value)) {
//     fd.append(key, value);
//     return;
//   }
//   if (Array.isArray(value)) {
//     value.forEach((v, i) => appendDeep(fd, `${key}[${i}]`, v));
//     return;
//   }
//   if (typeof value === "object") {
//     Object.entries(value).forEach(([k, v]) =>
//       appendDeep(fd, `${key}[${k}]`, v)
//     );
//     return;
//   }
//   fd.append(key, String(value)); // primitive -> string
// }

// function toFormData(data: Record<string, any>) {
//   const fd = new FormData();
//   Object.entries(data).forEach(([key, val]) => {
//     if (SKIP_KEYS_REGEX.test(key)) return; // skip *_preview / *_url
//     appendDeep(fd, key, val);
//   });
//   return fd;
// }

// function buildUrl(entity: string, params?: Record<string, any>) {
//   const base = `${API_URL}/${entity.replace(/^\/+/, "")}`;
//   if (!params) return base;
//   const q = new URLSearchParams();
//   Object.entries(params).forEach(([k, v]) => {
//     if (v === undefined || v === null) return;
//     if (Array.isArray(v)) v.forEach((item) => q.append(`${k}[]`, String(item)));
//     else q.append(k, String(v));
//   });
//   const qs = q.toString();
//   return qs ? `${base}?${qs}` : base;
// }

// /**
//  * Ambil data dari entitas tertentu
//  */
// export async function fetchData(entity: string) {
//   const res = await fetch(`${API_URL}/${entity}`, { cache: "no-store" });

//   if (!res.ok) {
//     console.error("HTTP Error:", res.status, await res.text());
//     throw new Error(`Gagal mengambil data ${entity}`);
//   }

//   const response = await res.json();
//   const rawData = Array.isArray(response) ? response : response.data;

//   return rawData;
// }

// /**
//  * Create data baru
//  */
// export async function createData(entity: string, data: any) {
//   const hasFile = containsFile(data);
//   const headers: HeadersInit = { Accept: "application/json" };
//   const body: BodyInit = hasFile ? toFormData(data) : JSON.stringify(data);
//   if (!hasFile) headers["Content-Type"] = "application/json";

//   const res = await fetch(buildUrl(entity), {
//     method: "POST",
//     headers,
//     body,
//     mode: "cors",
//   });
//   if (res.redirected) {
//     throw new Error(
//       `Unexpected redirect to ${res.url}. Pastikan route ada di routes/api.php.`
//     );
//   }
//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`Gagal membuat ${entity} [${res.status}]: ${err}`);
//   }
//   return res.json();
// }

// // export async function createData(entity: string, data: any) {
// //   const res = await fetch(`${API_URL}/${entity}`, {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify(data),
// //   });

// //   if (!res.ok) {
// //     throw new Error(`Gagal membuat ${entity}`);
// //   }

// //   return await res.json();
// // }

// /**
//  * Ambil satu data by ID
//  */
// export async function getDataById(entity: string, id: string | number) {
//   const res = await fetch(`${API_URL}/${entity}/${id}`);
//   console.log("ini api", `${API_URL}/${entity}/${id}`);
//   if (!res.ok) {
//     throw new Error(`Gagal mengambil data ${entity} dengan ID ${id}`);
//   }

//   const response = await res.json();
//   return response.data || response;
// }

// /**
//  * Update data
//  */
// // --- patch kecil di updateData: tambahkan guard redirect & (opsional) credentials --- //
// export async function updateData(
//   entity: string,
//   id: string | number,
//   data: any
// ) {
//   const hasFile = containsFile(data);
//   const headers: HeadersInit = { Accept: "application/json" };
//   let method = "PUT";
//   let body: BodyInit;

//   if (hasFile) {
//     const fd = toFormData(data);
//     fd.append("_method", "PUT");
//     method = "POST";
//     body = fd; // JANGAN set Content-Type manual!
//   } else {
//     headers["Content-Type"] = "application/json";
//     body = JSON.stringify(data);
//   }

//   const res = await fetch(`${API_URL}/${entity}/${id}`, {
//     method,
//     headers,
//     body,
//     mode: "cors",
//     // credentials: "include", // <- aktifkan kalau pakai cookie auth (Sanctum/session)
//   });

//   // tambahkan guard redirect biar cepat ketahuan route/api.php belum benar
//   if (res.redirected) {
//     throw new Error(
//       `Unexpected redirect to ${res.url}. Pastikan route ada di routes/api.php.`
//     );
//   }

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`Gagal update ${entity}/${id} [${res.status}]: ${err}`);
//   }
//   return res.json();
// }

// /**
//  * Hapus data
//  */
// export async function deleteData(entity: string, id: string | number) {
//   const res = await fetch(`${API_URL}/${entity}/${id}`, {
//     method: "DELETE",
//   });

//   if (!res.ok) {
//     throw new Error(`Gagal menghapus ${entity} dengan ID ${id}`);
//   }

//   return await res.json();
// }

export const API_URL = "http://localhost:8000/api";

/* ========== Helpers ========== */
function isFileLike(v: any) {
  return (
    typeof File !== "undefined" && (v instanceof File || v instanceof Blob)
  );
}

function hasBinary(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  return Object.values(data).some((v) => isFileLike(v));
}

/**
 * Hati-hati: JANGAN kirim 'foto' kalau bukan File/Blob.
 * Untuk object/array non-file tetap stringify.
 */
function toFormData(data: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    // skip foto jika bukan File/Blob (hindari fail validasi image)
    if (k === "foto" && !isFileLike(v)) return;

    if (isFileLike(v)) {
      fd.append(k, v as Blob);
      return;
    }

    if (typeof v === "object") {
      fd.append(k, JSON.stringify(v));
      return;
    }

    fd.append(k, String(v));
  });
  return fd;
}

async function parseError(res: Response): Promise<never> {
  let msg = `HTTP ${res.status}`;
  try {
    const text = await res.text();
    if (text) {
      try {
        const j = JSON.parse(text);
        const base = j.message || msg;
        if (j.errors && typeof j.errors === "object") {
          const parts = Object.entries(j.errors).flatMap(([field, arr]) => {
            const vs = Array.isArray(arr) ? arr : [arr];
            return vs.map((s: any) => `${field}: ${String(s)}`);
          });
          msg = parts.length ? `${base} — ${parts.join(" | ")}` : base;
        } else {
          msg = base;
        }
      } catch {
        msg = text;
      }
    }
  } catch {}
  throw new Error(msg);
}

/* ========== Fetch list ========== */
export async function fetchData(entity: string) {
  const res = await fetch(`${API_URL}/${entity}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return parseError(res);
  const response = await res.json();
  const rawData = Array.isArray(response) ? response : response.data;
  return rawData;
}

/* ========== Create (auto JSON/FormData) ========== */
export async function createData(entity: string, data: any) {
  const multipart = hasBinary(data);
  const res = await fetch(`${API_URL}/${entity}`, {
    method: "POST",
    headers: multipart
      ? { Accept: "application/json" }
      : { "Content-Type": "application/json", Accept: "application/json" },
    body: multipart ? toFormData(data) : JSON.stringify(data),
  });
  if (!res.ok) return parseError(res);
  return await res.json();
}

/* ========== Get by id ========== */
export async function getDataById(entity: string, id: string | number) {
  const res = await fetch(`${API_URL}/${entity}/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return parseError(res);
  const response = await res.json();
  return response.data || response;
}

/* ========== Update (auto JSON/FormData) ========== */
export async function updateData(
  entity: string,
  id: string | number,
  data: any
) {
  const multipart = hasBinary(data);

  if (multipart) {
    // *** Kunci perbaikan ***
    // Kirim POST + spoof _method=PUT agar file kebaca di Laravel
    const fd = toFormData(data);
    fd.append("_method", "PUT");

    const res = await fetch(`${API_URL}/${entity}/${id}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: fd,
    });
    if (!res.ok) return parseError(res);
    return await res.json();
  } else {
    // Tanpa file, boleh PUT JSON biasa
    // BONUS: jangan kirim 'foto' kalau hanya string path lama
    const payload = { ...data };
    if ("foto" in payload && typeof payload.foto === "string")
      delete payload.foto;

    const res = await fetch(`${API_URL}/${entity}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return parseError(res);
    return await res.json();
  }
}

/* ========== Delete ========== */
export async function deleteData(entity: string, id: string | number) {
  const res = await fetch(`${API_URL}/${entity}/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return parseError(res);
  return await res.json();
}

export async function fetchStats(entity: string) {
  const res = await fetch(`${API_URL}/${entity}/stats`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Gagal mengambil statistik untuk ${entity}`);
  }

  const response = await res.json();

  return response.data ?? response;
}
export async function syncAccessControlMatrix(
  user_level_id: string | number,
  items: Array<{
    menu_id: string | number;
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  }>
) {
  const res = await fetch(`${API_URL}/access_control_matrices/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ user_level_id, items }),
  });
  if (!res.ok) return parseError(res);
  return await res.json();
}
