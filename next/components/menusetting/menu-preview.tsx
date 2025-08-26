"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import * as Icons from "lucide-react";
import type { MenuStructure } from "@/types/menu";
import { useMemo, useState } from "react";

interface MenuPreviewProps {
  menuStructure: MenuStructure;
}

export function MenuPreview({ menuStructure }: MenuPreviewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(new Set());

  const renderIcon = (iconName?: string, size = 16) => {
    if (!iconName) return null;
    const IconComponent = (Icons as Record<string, any>)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} />;
  };

  const toggleExpanded = (id: string, type: "group" | "module" | "menu") => {
    const setters = { group: setExpandedGroups, module: setExpandedModules, menu: setExpandedMenuIds } as const;
    const getters = { group: expandedGroups, module: expandedModules, menu: expandedMenuIds } as const;
    const currentSet = getters[type];
    const setter = setters[type];
    const next = new Set(currentSet);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  type ModuleMenu = MenuStructure["groups"][number]["modules"][number]["menus"][number];

  const childrenOf = (moduleMenus: ModuleMenu[], parent: ModuleMenu | null) => {
    const active = moduleMenus.filter((m) => m.is_active);

    if (!parent) {
      // ROOTS: ambil level terkecil, tapi jika ada null level, anggap paling tinggi (root)
      const minLevel = active.reduce<number | null>((min, m) => {
        if (m.level == null) return 1; // null dianggap paling tinggi
        return min === null ? m.level : Math.min(min, m.level);
      }, null) ?? 1;
      const roots = active.filter((m) => (m.level ?? 1) === minLevel);
      if (roots.length > 0) return roots;
      return active.filter((m) => !m.parent_id);
    }

    const expectedLevel = (parent.level ?? 1) + 1;
    const byStrictLevel = active.filter(
      (m) => m.parent_id === parent.id && (m.level ?? expectedLevel) === expectedLevel
    );
    if (byStrictLevel.length > 0) return byStrictLevel;
    return active.filter((m) => m.parent_id === parent.id);
  };

  const allExpandableMenuIds = useMemo(() => {
    const ids = new Set<string>();
    menuStructure.groups.forEach((g) => {
      g.modules.forEach((mod) => {
        const menus = mod.menus.filter((m) => m.is_active);
        menus.forEach((m) => {
          const kids = childrenOf(menus, m);
          if (kids.length > 0) ids.add(m.id);
        });
      });
    });
    return ids;
  }, [menuStructure]);

  const renderMenuTree = (moduleMenus: ModuleMenu[], parent: ModuleMenu | null): JSX.Element[] => {
    const nodes = childrenOf(moduleMenus, parent);

    return nodes.map((node) => {
      const kids = childrenOf(moduleMenus, node);
      const isExpanded = expandedMenuIds.has(node.id);
      const hasKids = kids.length > 0;

      return (
        <div key={node.id}>
          <div className="flex items-center gap-2 p-1 text-sm hover:bg-muted/30 rounded">
            {hasKids ? (
              <Button variant="ghost" size="sm" className="h-3 w-3 p-0" onClick={() => toggleExpanded(node.id, "menu")}>
                {isExpanded ? <ChevronDown className="h-2 w-2" /> : <ChevronRight className="h-2 w-2" />}
              </Button>
            ) : (
              <div className="w-3" />
            )}
            {renderIcon(node.icon, 12)}
            <span>{node.title}</span>
            {node.crud_builder_id && <Badge variant="outline" className="text-xs">CRUD</Badge>}
            <span className="text-xs text-muted-foreground ml-auto">{node.url}</span>
          </div>
          {hasKids && isExpanded && (
            <div className="ml-4 space-y-1">{renderMenuTree(moduleMenus, node)}</div>
          )}
        </div>
      );
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(menuStructure.groups.map((g) => g.id)));
    setExpandedModules(new Set(menuStructure.groups.flatMap((g) => g.modules.map((m) => m.id))));
    setExpandedMenuIds(new Set(allExpandableMenuIds));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
    setExpandedModules(new Set());
    setExpandedMenuIds(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Preview Menu Navigasi</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {menuStructure.groups.filter((group) => group.is_active).map((group) => {
              const isGroupExpanded = expandedGroups.has(group.id);
              const activeModules = group.modules.filter((m) => m.is_active);
              return (
                <div key={group.id} className="border rounded-lg">
                  <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50" onClick={() => toggleExpanded(group.id, "group")}>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                      {isGroupExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }} />
                    {renderIcon(group.icon, 16)}
                    <span className="font-semibold">{group.name}</span>
                    <Badge variant="outline" className="text-xs">{activeModules.length} modul</Badge>
                    {group.is_active ? <Eye className="h-3 w-3 text-green-500 ml-auto" /> : <EyeOff className="h-3 w-3 text-gray-400 ml-auto" />}
                  </div>
                  {isGroupExpanded && activeModules.length > 0 && (
                    <div className="border-t bg-muted/20">
                      {activeModules.map((module) => {
                        const isModuleExpanded = expandedModules.has(module.id);
                        const activeMenus = module.menus.filter((m) => m.is_active);
                        return (
                          <div key={module.id} className="ml-6 border-l-2 border-muted">
                            <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50" onClick={() => toggleExpanded(module.id, "module")}>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                {isModuleExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              </Button>
                              {renderIcon(module.icon, 14)}
                              <span className="font-medium text-sm">{module.name}</span>
                              <Badge variant="secondary" className="text-xs">{activeMenus.length} menu</Badge>
                            </div>
                            {isModuleExpanded && activeMenus.length > 0 && (
                              <div className="ml-6 space-y-1 pb-2">{renderMenuTree(activeMenus as ModuleMenu[], null)}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}