"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MenuItem } from "@/types/menu";

interface MenuTreeProps {
  menus: MenuItem[];
  onSelectMenu: (menu: MenuItem) => void;
  selectedMenu: MenuItem | null;
  onAddSubmenu: (parentId: string) => void;
  onEditMenu?: (menu: MenuItem) => void;
  onDeleteMenu?: (menu: MenuItem) => void;
}

const renderIcon = (iconName?: string, size = 16) => {
  if (!iconName) return <Icons.MenuIcon size={size} />;
  const IconComponent = (Icons as any)[iconName];
  if (!IconComponent) return <Icons.MenuIcon size={size} />;
  return <IconComponent size={size} />;
};

export function MenuTree({
  menus,
  onSelectMenu,
  selectedMenu,
  onAddSubmenu,
  onEditMenu,
  onDeleteMenu,
}: MenuTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (menuId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedItems(newExpanded);
  };

  const renderMenuItem = (menu: MenuItem, level = 0) => {
    const hasChildren = menus.some((m) => m.parent_id === menu.id);
    const isExpanded = expandedItems.has(menu.id);
    const children = menus.filter((m) => m.parent_id === menu.id);

    return (
      <div key={menu.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
            selectedMenu?.id === menu.id
              ? "border border-primary bg-primary/5"
              : "hover:bg-muted/50"
          }`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <div
            className="flex items-center gap-1 flex-1"
            onClick={() => onSelectMenu(menu)}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(menu.id);
                }}
              >
                {isExpanded ? (
                  <Icons.ChevronDown className="h-3 w-3" />
                ) : (
                  <Icons.ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <div className="w-4" />
            )}
            {renderIcon(menu.icon)}
            <span className="text-sm font-medium">{menu.title}</span>
            {menu.crud_builder_id && (
              <Badge variant="outline" className="text-xs">
                CRUD
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onAddSubmenu(menu.id);
              }}
            >
              <Icons.Plus className="h-3 w-3" />
            </Button>
            {menu.is_active ? (
              <Icons.Eye className="h-3 w-3 text-green-500" />
            ) : (
              <Icons.EyeOff className="h-3 w-3 text-gray-400" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Icons.MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMenu?.(menu);
                  }}
                >
                  <Icons.Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubmenu(menu.id);
                  }}
                >
                  <Icons.Plus className="h-3 w-3 mr-2" />
                  Tambah Submenu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMenu?.(menu);
                  }}
                  className="text-destructive"
                >
                  <Icons.Trash2 className="h-3 w-3 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {children.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootMenus = menus.filter((menu) => !menu.parent_id);

  if (rootMenus.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icons.MenuIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Belum ada menu</p>
        <p className="text-xs">Klik tombol + untuk menambah menu</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rootMenus.map((menu) => renderMenuItem(menu))}
    </div>
  );
}
