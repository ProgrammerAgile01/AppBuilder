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
  // Pindah ke field id builder, bukan table name:
  crud_builder_id?: number | string | null;
  // Legacy (kalau masih ada di response lama):
  builder_table_name?: string | null;
  route_path: string | null;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  note: string | null;
  created_at: string;
  updated_at: string;

  // Hasil with('recursiveChildren') default snake_case:
  recursive_children?: BackendMenu[];
  // Kadang ada tim yang menamai camelCase:
  recursiveChildren?: BackendMenu[];
}

// Kalau kamu punya endpoint CRUD builders:
export interface BackendCrudBuilder {
  id: number | string;
  name: string;
  menu_title: string; // atau menuTitle (ditangani saat normalisasi di api.ts)
  table_name: string; // atau tableName (ditangani saat normalisasi di api.ts)
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
}

export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  icon?: string;
  order: number;
  parent_id?: string; // undefined untuk top-level menu di dalam module
  level: number;
  // FRONTEND menyimpan id builder, bukan table:
  crud_builder_id?: string;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CrudBuilderOption {
  id: string; // string agar Select stabil
  name: string;
  menu_title: string;
  table_name: string;
}

export interface MenuStructure {
  groups: ModuleGroup[];
  crud_builders: CrudBuilderOption[];
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
  order_number?: number | null;
  crud_builder_id?: string | number | null;
  route_path?: string | null;
  is_active?: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  note?: string | null;
}

export interface UpdateMenuRequest extends CreateMenuRequest {
  id: string | number;
}
