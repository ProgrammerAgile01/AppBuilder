// // src/types/menu.ts

// // Base interface for menu items from API
// export interface MenuApiItem {
//   id: string;
//   parent_id?: string;
//   level: number;
//   type: "group" | "module" | "menu";
//   title: string;
//   icon?: string;
//   order_number: number;
//   builder_table_name?: string;
//   route_path?: string;
//   is_active: boolean;
//   note?: string;
//   created_at: string;
//   updated_at: string;
//   created_by?: string;
//   recursiveChildren?: MenuApiItem[];
// }

// // Transformed interfaces for UI components
// export interface ModuleGroup {
//   id: string;
//   name: string;
//   description: string;
//   icon?: string;
//   order: number;
//   color?: string;
//   is_active: boolean;
//   modules: Module[];
//   created_at: string;
//   updated_at: string;
// }

// export interface Module {
//   id: string;
//   name: string;
//   description: string;
//   icon?: string;
//   order: number;
//   module_group_id: string;
//   is_active: boolean;
//   menus: MenuItem[];
//   created_at: string;
//   updated_at: string;
// }

// export interface MenuItem {
//   id: string;
//   title: string;
//   url?: string;
//   icon?: string;
//   order: number;
//   parent_id?: string;
//   level: number;
//   crud_builder_id?: string;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export interface CrudBuilderOption {
//   id: string;
//   name: string;
//   menu_title: string;
//   table_name: string;
// }

// export interface MenuStructure {
//   groups: ModuleGroup[];
//   crud_builders: CrudBuilderOption[];
// }

// // API request interfaces
// export interface CreateMenuRequest {
//   parent_id?: string;
//   level: number;
//   type: "group" | "module" | "menu";
//   title: string;
//   icon?: string;
//   order_number: number;
//   builder_table_name?: string;
//   route_path?: string;
//   is_active?: boolean;
//   note?: string;
// }

// export interface UpdateMenuRequest extends CreateMenuRequest {
//   id: string;
// }
// src/types/menu.ts

// =====================
// BACKEND RAW (Laravel)
// =====================
// src/types/menu.ts
// =====================
// BACKEND RAW (Laravel)
// =====================
export type BackendMenuType = "group" | "module" | "menu";

export interface BackendMenu {
  id: number | string;
  parent_id: number | string | null;
  level: number | null;
  type: BackendMenuType;
  title: string;
  icon: string | null;
  color?: string | null;
  order_number: number | null;
  crud_builder_id?: number | string | null;
  builder_table_name?: string | null;
  route_path: string | null;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  note: string | null;
  created_at: string;
  updated_at: string;

  // NEW: per-product
  product_id?: string | null;
  product_code?: string | number | null;

  // Recursive children (nama bisa snake/camel tergantung backend)
  recursive_children?: BackendMenu[];
  recursiveChildren?: BackendMenu[];
}

export interface BackendCrudBuilder {
  id: number | string;
  name: string;
  menu_title: string;
  table_name: string;
}

// =====================
// FRONTEND (Dipakai UI)
// =====================
export interface ModuleGroup {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
  color?: string;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  modules: Module[];
  created_at: string;
  updated_at: string;

  // per-product (opsional)
  product_id?: string;
  product_code?: string | number;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
  module_group_id: string;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  menus: MenuItem[];
  created_at: string;
  updated_at: string;

  product_id?: string;
  product_code?: string | number;
}

export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  icon?: string;
  order: number;
  parent_id?: string;
  level: number;
  crud_builder_id?: string;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;

  product_id?: string;
  product_code?: string | number;
}

export interface CrudBuilderOption {
  id: string;
  name: string;
  menu_title: string;
  table_name: string;
}

export interface MenuStructure {
  groups: ModuleGroup[];
  crud_builders: CrudBuilderOption[];
}

// Produk (untuk dropdown)
export type ProductStatus = "active" | "inactive";
export interface Product {
  id: string;                 // UUID pada tabel mst_products
  name: string;               // product_name
  product_code: string;       // simpan sebagai string supaya aman (int/char)
  status: ProductStatus;
}

// =====================
// API REQUEST PAYLOADS
// =====================
export interface CreateMenuRequest {
  parent_id?: string | number | null;
  level?: number | null;
  type: "group" | "module" | "menu";
  title: string;
  icon?: string | null;
  color?: string | null;
  order_number?: number | null;
  crud_builder_id?: string | number | null;
  route_path?: string | null;
  is_active?: boolean;
  note?: string | null;

  // per-product
  product_id?: string | null;
  product_code?: string | number | null;
}

export interface UpdateMenuRequest extends CreateMenuRequest {
  id: string | number;
}
