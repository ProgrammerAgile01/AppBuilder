"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Zap,
  CheckCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import * as Icons from "lucide-react";

import {
  API_URL,
  fetchMenusTreeWithTrashed,
  fetchFiturTree,
  fetchFeatureBuilderSelection,
  saveFeatureBuilderSelection,
  toReadableApiError,
} from "@/lib/api";

/* =================== TYPES (UI) =================== */
interface MenuAccess {
  id: string;
  title: string;
  type: "group" | "module" | "menu" | "submenu";
  enabled: boolean;
  icon?: string;
  children?: MenuAccess[];
  level: number;
}
interface MenuGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  menuAccess: MenuAccess[];
}
interface Feature {
  id: string;
  title: string;
  type: "category" | "feature" | "subfeature";
  enabled: boolean;
  icon?: string;
  children?: Feature[];
  level: number;
  code?: string;
  module?: string;
}
interface FeatureCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  features: Feature[];
}
type PackageOption = { id: string; name: string };

/* =================== HELPERS =================== */
const asArray = (v: any) =>
  Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : [];
const getMenuChildren = (n: any): any[] =>
  (n?.children ??
    n?.recursiveChildren ??
    n?.recursive_children ??
    n?.items ??
    []) ||
  [];
const getMenuTitle = (n: any): string =>
  String(n?.title ?? n?.name ?? n?.menu_title ?? n?.menuTitle ?? "-");

/* Menu mapper: tampilkan anak-anak root (module → menu → submenu) */
function mapBackendMenusToGroups(roots: any[]): MenuGroup[] {
  const toAccess = (node: any, level = 1): MenuAccess => ({
    id: String(node?.id),
    title: getMenuTitle(node),
    type:
      (node?.type as MenuAccess["type"]) ||
      (level === 1 ? "module" : level === 2 ? "menu" : "submenu"),
    enabled: false,
    icon: node?.icon || undefined,
    level,
    children: getMenuChildren(node).map((c: any) => toAccess(c, level + 1)),
  });

  return (roots || []).map((root: any) => {
    const groupColor = root?.color || "#6d28d9";
    const groupIcon = root?.icon || "Cog";
    const groupName = getMenuTitle(root);
    const groupId = String(root?.id);
    const rootChildren = getMenuChildren(root).map((c: any) => toAccess(c, 1));

    return {
      id: groupId,
      name: groupName,
      icon: groupIcon,
      color: groupColor,
      menuAccess: rootChildren,
    };
  });
}

/* Feature mapper: parent + children; cascade centang parent → anak */
function mapBackendFeaturesToCategories(roots: any[]): FeatureCategory[] {
  const toFeature = (n: any, level = 1): Feature => ({
    id: String(n?.id),
    title: String(n?.name ?? n?.title ?? "-"),
    type:
      (n?.type as Feature["type"]) || (level === 1 ? "feature" : "subfeature"),
    enabled: false,
    icon: undefined,
    level,
    code: n?.code ?? undefined,
    module: undefined,
    children: (
      n?.children ||
      n?.childrenRecursive ||
      n?.children_recursive ||
      []
    ).map((c: any) => toFeature(c, level + 1)),
  });

  return (roots || []).map((r: any) => {
    const parentAsRow = toFeature(r, 1);
    return {
      id: String(r?.id),
      name: String(r?.name ?? r?.title ?? "Kategori"),
      icon: "Puzzle",
      color: "#f59e0b",
      features: [parentAsRow],
    };
  });
}

/* Kumpulkan id aktif dari tree */
function collectMenuIdsFromTree(groups: MenuGroup[]): number[] {
  const out: number[] = [];
  const walk = (items?: MenuAccess[]) => {
    for (const n of items || []) {
      if (n.enabled) out.push(Number(n.id));
      if (n.children?.length) walk(n.children);
    }
  };
  for (const g of groups) walk(g.menuAccess);
  return Array.from(new Set(out));
}
function collectFeatureIdsFromTree(categories: FeatureCategory[]): number[] {
  const out: number[] = [];
  const walk = (items?: Feature[]) => {
    for (const n of items || []) {
      if (n.enabled) out.push(Number(n.id));
      if (n.children?.length) walk(n.children);
    }
  };
  for (const c of categories) walk(c.features);
  return Array.from(new Set(out));
}

/* Tandai enabled berdasarkan daftar id */
function markEnabledMenus(
  groups: MenuGroup[],
  allowedIds: number[]
): MenuGroup[] {
  const allow = new Set((allowedIds || []).map(Number));
  const toggle = (items: MenuAccess[]): MenuAccess[] =>
    items.map((n) => ({
      ...n,
      enabled: allow.has(Number(n.id)),
      children: n.children?.length ? toggle(n.children) : n.children,
    }));
  return groups.map((g) => ({ ...g, menuAccess: toggle(g.menuAccess) }));
}
function markEnabledFeatures(
  categories: FeatureCategory[],
  allowedIds: number[]
): FeatureCategory[] {
  const allow = new Set((allowedIds || []).map(Number));
  const toggle = (items: Feature[]): Feature[] =>
    items.map((n) => ({
      ...n,
      enabled: allow.has(Number(n.id)),
      children: n.children?.length ? toggle(n.children) : n.children,
    }));
  return categories.map((c) => ({ ...c, features: toggle(c.features) }));
}

/* Cascade toggle */
function cascadeToggleFeatures(
  nodes: Feature[],
  targetId: string,
  enabled: boolean
): Feature[] {
  const toggleAllBelow = (n: Feature, on: boolean): Feature => ({
    ...n,
    enabled: on,
    children: n.children?.map((c) => toggleAllBelow(c, on)) || n.children,
  });
  const walk = (arr: Feature[]): Feature[] =>
    arr.map((n) => {
      if (n.id === targetId) return toggleAllBelow(n, enabled);
      if (n.children?.length) return { ...n, children: walk(n.children) };
      return n;
    });
  return walk(nodes);
}
function cascadeToggleMenus(
  nodes: MenuAccess[],
  targetId: string,
  enabled: boolean
): MenuAccess[] {
  const toggleAllBelow = (n: MenuAccess, on: boolean): MenuAccess => ({
    ...n,
    enabled: on,
    children: n.children?.map((c) => toggleAllBelow(c, on)) || n.children,
  });
  const walk = (arr: MenuAccess[]): MenuAccess[] =>
    arr.map((n) => {
      if (n.id === targetId) return toggleAllBelow(n, enabled);
      if (n.children?.length) return { ...n, children: walk(n.children) };
      return n;
    });
  return walk(nodes);
}

/* =================== COMPONENT =================== */
export function FeatureBuilderDashboard() {
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>(""); // simpan ID numerik as string

  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>(
    []
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("menu");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  /* INIT: load packages + menu tree + feature tree */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // 1) packages
        const pkgRes = await fetch(`${API_URL}/package`, { cache: "no-store" });
        if (!pkgRes.ok) throw await toReadableApiError(pkgRes);
        const pkgArr = asArray(await pkgRes.json()).map((p: any) => ({
          id: String(p?.id),
          name: String(p?.name ?? p?.title ?? "-"),
        })) as PackageOption[];
        if (mounted) setPackages(pkgArr);

        // 2) menus
        const rawMenus = await fetchMenusTreeWithTrashed();
        const menuRoots = asArray(rawMenus);
        const menuGroupsMapped = mapBackendMenusToGroups(menuRoots);

        // 3) fitur
        const rawFeatures = await fetchFiturTree();
        const featureRoots = asArray(rawFeatures);
        const featureCatsMapped = mapBackendFeaturesToCategories(featureRoots);

        if (mounted) {
          setMenuGroups(menuGroupsMapped);
          setFeatureCategories(featureCatsMapped);
        }
      } catch (e) {
        console.error("Init FeatureBuilder load failed:", e);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* Autosave debounce */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSave = (
    pkgId: string,
    groups: MenuGroup[],
    cats: FeatureCategory[]
  ) => {
    if (!pkgId) return;
    const package_id = Number(pkgId);
    const menu_ids = collectMenuIdsFromTree(groups);
    const feature_ids = collectFeatureIdsFromTree(cats);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveFeatureBuilderSelection({
          package_id,
          menu_ids,
          feature_ids,
          status: "active",
        });
      } catch (e) {
        console.error("Save FeatureBuilder failed:", e);
      } finally {
        setSaving(false);
      }
    }, 600);
  };

  /* Saat pilih paket: load centang dari backend */
  const handlePackageSelect = async (packageId: string) => {
    setSelectedPackage(packageId); // numeric id (stringified)
    if (!packageId) return;
    try {
      setLoading(true);
      const sel = await fetchFeatureBuilderSelection(Number(packageId));
      setMenuGroups((prev) => markEnabledMenus(prev, sel.menuIds));
      setFeatureCategories((prev) => markEnabledFeatures(prev, sel.featureIds));
    } catch (e) {
      console.error("Load selection failed:", e);
    } finally {
      setLoading(false);
    }
  };

  /* Toggles */
  const handleMenuAccessToggle = (
    groupId: string,
    menuId: string,
    enabled: boolean
  ) => {
    setMenuGroups((prev) => {
      const next = prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              menuAccess: cascadeToggleMenus(g.menuAccess, menuId, enabled),
            }
          : g
      );
      debouncedSave(selectedPackage, next, featureCategories);
      return next;
    });
  };
  const handleFeatureToggle = (
    categoryId: string,
    featureId: string,
    enabled: boolean
  ) => {
    setFeatureCategories((prev) => {
      const next = prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              features: cascadeToggleFeatures(c.features, featureId, enabled),
            }
          : c
      );
      debouncedSave(selectedPackage, menuGroups, next);
      return next;
    });
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const ns = new Set(prev);
      ns.has(itemId) ? ns.delete(itemId) : ns.add(itemId);
      return ns;
    });
  };

  /* Save manual */
  const handleSave = async () => {
    if (!selectedPackage) return;
    try {
      setSaving(true);
      const menu_ids = collectMenuIdsFromTree(menuGroups);
      const feature_ids = collectFeatureIdsFromTree(featureCategories);
      await saveFeatureBuilderSelection({
        package_id: Number(selectedPackage),
        menu_ids,
        feature_ids,
        status: "active",
      });
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  /* ===== Render helpers (UI tidak diubah) ===== */
  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[
      iconName as keyof typeof Icons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? (
      <IconComponent className="h-4 w-4" />
    ) : (
      <Settings className="h-4 w-4" />
    );
  };

  const renderMenuTree = (
    items: MenuAccess[],
    groupId: string,
    parentIndent = 0
  ) =>
    items.map((item) => {
      const hasChildren = !!item.children?.length;
      const isExpanded = expandedItems.has(item.id);
      const indent = parentIndent + (item.level - 1) * 24;

      return (
        <div key={item.id} className="space-y-2">
          <div
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
              item.enabled
                ? "bg-green-50 border-green-200 hover:bg-green-100 shadow-sm"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
            style={{ marginLeft: `${indent}px` }}
          >
            <div className="flex items-center space-x-3">
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}
              <Checkbox
                id={`menu-${item.id}`}
                checked={item.enabled}
                onCheckedChange={(checked) =>
                  handleMenuAccessToggle(groupId, item.id, checked as boolean)
                }
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <div className="flex items-center space-x-2">
                {item.icon && renderIcon(item.icon)}
                <Label
                  htmlFor={`menu-${item.id}`}
                  className={`text-sm font-medium cursor-pointer ${
                    item.enabled ? "text-green-900" : "text-gray-700"
                  }`}
                >
                  {item.title}
                </Label>
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-1 ${
                    item.type === "group"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : item.type === "module"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : item.type === "menu"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  {item.type}
                </Badge>
              </div>
            </div>
            {item.enabled && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs px-3 py-1"
                >
                  Aktif
                </Badge>
              </div>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div className="space-y-2">
              {renderMenuTree(item.children!, groupId, parentIndent)}
            </div>
          )}
        </div>
      );
    });

  const renderFeatureTree = (
    items: Feature[],
    categoryId: string,
    parentIndent = 0
  ) =>
    items.map((item) => {
      const hasChildren = !!item.children?.length;
      const isExpanded = expandedItems.has(item.id);
      const indent = parentIndent + (item.level - 1) * 24;

      return (
        <div key={item.id} className="space-y-2">
          <div
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
              item.enabled
                ? "bg-green-50 border-green-200 hover:bg-green-100 shadow-sm"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
            style={{ marginLeft: `${indent}px` }}
          >
            <div className="flex items-center space-x-3">
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}
              <Checkbox
                id={`feature-${item.id}`}
                checked={item.enabled}
                onCheckedChange={(checked) =>
                  handleFeatureToggle(categoryId, item.id, checked as boolean)
                }
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <div className="flex items-center space-x-2">
                {item.icon && renderIcon(item.icon)}
                <Label
                  htmlFor={`feature-${item.id}`}
                  className={`text-sm font-medium cursor-pointer ${
                    item.enabled ? "text-green-900" : "text-gray-700"
                  }`}
                >
                  {item.title}
                </Label>
                {item.module && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {item.module}
                  </Badge>
                )}
                {item.code && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 bg-gray-50 text-gray-700 border-gray-200"
                  >
                    {item.code}
                  </Badge>
                )}
              </div>
            </div>
            {item.enabled && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs px-3 py-1"
                >
                  Aktif
                </Badge>
              </div>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div className="space-y-2">
              {renderFeatureTree(item.children!, categoryId, parentIndent)}
            </div>
          )}
        </div>
      );
    });

  const renderMenuGroups = (groups: MenuGroup[]) =>
    groups.map((group) => {
      const IconComponent = Icons[
        group.icon as keyof typeof Icons
      ] as React.ComponentType<{ className?: string }>;
      const totalMenus = countTotalMenus(group.menuAccess);
      const activeMenus = countActiveMenus(group.menuAccess);
      return (
        <div key={group.id} className="space-y-4">
          <div
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${group.color}15, ${group.color}25)`,
              borderColor: `${group.color}40`,
            }}
          >
            <div className="flex items-center gap-3">
              {IconComponent && (
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: group.color }}
                />
              )}
              <h3 className="font-semibold" style={{ color: group.color }}>
                {group.name}
              </h3>
            </div>
            <Badge
              variant="outline"
              className="bg-white border"
              style={{ color: group.color, borderColor: `${group.color}60` }}
            >
              {activeMenus}/{totalMenus} aktif
            </Badge>
          </div>
          <div className="space-y-3 ml-2">
            {renderMenuTree(group.menuAccess, group.id)}
          </div>
        </div>
      );
    });

  const renderFeatureCategories = (categories: FeatureCategory[]) =>
    categories.map((category) => {
      const IconComponent = Icons[
        category.icon as keyof typeof Icons
      ] as React.ComponentType<{ className?: string }>;
      const totalFeatures = countTotalFeatures(category.features);
      const activeFeatures = countActiveFeatures(category.features);
      return (
        <div key={category.id} className="space-y-4">
          <div
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
              borderColor: `${category.color}40`,
            }}
          >
            <div className="flex items-center gap-3">
              {IconComponent && (
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: category.color }}
                />
              )}
              <h3 className="font-semibold" style={{ color: category.color }}>
                {category.name}
              </h3>
            </div>
            <Badge
              variant="outline"
              className="bg-white border"
              style={{
                color: category.color,
                borderColor: `${category.color}60`,
              }}
            >
              {activeFeatures}/{totalFeatures} aktif
            </Badge>
          </div>
          <div className="space-y-3 ml-2">
            {renderFeatureTree(category.features, category.id)}
          </div>
        </div>
      );
    });

  const countTotalMenus = (items: MenuAccess[]): number =>
    items.reduce(
      (count, item) =>
        count + 1 + (item.children ? countTotalMenus(item.children) : 0),
      0
    );
  const countActiveMenus = (items: MenuAccess[]): number =>
    items.reduce(
      (count, item) =>
        count +
        (item.enabled ? 1 : 0) +
        (item.children ? countActiveMenus(item.children) : 0),
      0
    );
  const countTotalFeatures = (items: Feature[]): number =>
    items.reduce(
      (count, item) =>
        count + 1 + (item.children ? countTotalFeatures(item.children) : 0),
      0
    );
  const countActiveFeatures = (items: Feature[]): number =>
    items.reduce(
      (count, item) =>
        count +
        (item.enabled ? 1 : 0) +
        (item.children ? countActiveFeatures(item.children) : 0),
      0
    );

  const totalActiveMenus = useMemo(
    () =>
      menuGroups.reduce((acc, g) => acc + countActiveMenus(g.menuAccess), 0),
    [menuGroups]
  );
  const totalMenus = useMemo(
    () => menuGroups.reduce((acc, g) => acc + countTotalMenus(g.menuAccess), 0),
    [menuGroups]
  );
  const totalActiveFeatures = useMemo(
    () =>
      featureCategories.reduce(
        (acc, c) => acc + countActiveFeatures(c.features),
        0
      ),
    [featureCategories]
  );
  const totalFeatures = useMemo(
    () =>
      featureCategories.reduce(
        (acc, c) => acc + countTotalFeatures(c.features),
        0
      ),
    [featureCategories]
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Feature Builder
            </h1>
            <p className="text-gray-600">
              {loading
                ? "Memuat konfigurasi..."
                : saving
                ? "Menyimpan perubahan..."
                : "Konfigurasi akses menu dan fitur berdasarkan paket yang dipilih"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalMenus}</div>
            <p className="text-xs text-blue-600 mt-1">Menu tersedia</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">
              Menu Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {totalActiveMenus}
            </div>
            <p className="text-xs text-green-600 mt-1">Menu diaktifkan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700">
              Total Fitur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {totalFeatures}
            </div>
            <p className="text-xs text-orange-600 mt-1">Fitur tersedia</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700">
              Fitur Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {totalActiveFeatures}
            </div>
            <p className="text-xs text-purple-600 mt-1">Fitur diaktifkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Konfigurasi Akses Menu & Fitur
              </CardTitle>
              <CardDescription className="text-gray-600">
                Pilih paket dan konfigurasi akses menu serta fitur yang tersedia
                untuk sistem
              </CardDescription>
            </div>
            {selectedPackage && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="min-w-[110px]"
              >
                {saving ? "Menyimpan..." : "Save"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Package Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="package-select"
              className="text-sm font-medium text-gray-700"
            >
              Pilih Paket
            </Label>
            <Select value={selectedPackage} onValueChange={handlePackageSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih paket untuk konfigurasi akses menu dan fitur" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          {selectedPackage && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="menu" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Menu
                </TabsTrigger>
                <TabsTrigger value="fitur" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Fitur
                </TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="space-y-6 mt-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-900">
                    Tree Akses Menu Sistem
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-white text-indigo-700 border-indigo-300 px-3 py-1"
                  >
                    {totalActiveMenus} menu aktif
                  </Badge>
                </div>
                <div className="space-y-6 max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-white">
                  {renderMenuGroups(menuGroups)}
                </div>
              </TabsContent>

              <TabsContent value="fitur" className="space-y-6 mt-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900">
                    Tree Fitur Sistem
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-white text-orange-700 border-orange-300 px-3 py-1"
                  >
                    {totalActiveFeatures} fitur aktif
                  </Badge>
                </div>
                <div className="space-y-6 max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-white">
                  {renderFeatureCategories(featureCategories)}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}