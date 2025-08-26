"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";

// Common icons for menu items
const MENU_ICONS = [
  { name: "Users", label: "Users" },
  { name: "Settings", label: "Settings" },
  { name: "FileText", label: "File Text" },
  { name: "Database", label: "Database" },
  { name: "ShoppingCart", label: "Shopping Cart" },
  { name: "Package", label: "Package" },
  { name: "Truck", label: "Truck" },
  { name: "MapPin", label: "Map Pin" },
  { name: "Calendar", label: "Calendar" },
  { name: "Clock", label: "Clock" },
  { name: "BarChart3", label: "Bar Chart" },
  { name: "PieChart", label: "Pie Chart" },
  { name: "TrendingUp", label: "Trending Up" },
  { name: "DollarSign", label: "Dollar Sign" },
  { name: "CreditCard", label: "Credit Card" },
  { name: "Wallet", label: "Wallet" },
  { name: "Receipt", label: "Receipt" },
  { name: "FileSpreadsheet", label: "Spreadsheet" },
  { name: "Clipboard", label: "Clipboard" },
  { name: "CheckSquare", label: "Check Square" },
  { name: "AlertTriangle", label: "Alert Triangle" },
  { name: "Info", label: "Info" },
  { name: "Bell", label: "Bell" },
  { name: "Mail", label: "Mail" },
  { name: "Phone", label: "Phone" },
  { name: "MessageSquare", label: "Message Square" },
  { name: "Share2", label: "Share" },
  { name: "Download", label: "Download" },
  { name: "Upload", label: "Upload" },
  { name: "Save", label: "Save" },
  { name: "Edit", label: "Edit" },
  { name: "Trash2", label: "Trash" },
  { name: "Plus", label: "Plus" },
  { name: "Minus", label: "Minus" },
  { name: "X", label: "Close" },
  { name: "Eye", label: "Eye" },
  { name: "EyeOff", label: "Eye Off" },
  { name: "Lock", label: "Lock" },
  { name: "Unlock", label: "Unlock" },
  { name: "Shield", label: "Shield" },
  { name: "Key", label: "Key" },
  { name: "Home", label: "Home" },
  { name: "Building", label: "Building" },
  { name: "Store", label: "Store" },
  { name: "Factory", label: "Factory" },
  { name: "Car", label: "Car" },
  { name: "Plane", label: "Plane" },
  { name: "Ship", label: "Ship" },
  { name: "Train", label: "Train" },
  { name: "Bike", label: "Bike" },
  { name: "Fuel", label: "Fuel" },
  { name: "Wrench", label: "Wrench" },
  { name: "Hammer", label: "Hammer" },
  { name: "Cog", label: "Cog" },
  { name: "Sliders", label: "Sliders" },
  { name: "Filter", label: "Filter" },
  { name: "Search", label: "Search" },
  { name: "Zap", label: "Zap" },
  { name: "Activity", label: "Activity" },
  { name: "Wifi", label: "Wifi" },
  { name: "Bluetooth", label: "Bluetooth" },
  { name: "Smartphone", label: "Smartphone" },
  { name: "Tablet", label: "Tablet" },
  { name: "Laptop", label: "Laptop" },
  { name: "Monitor", label: "Monitor" },
  { name: "Server", label: "Server" },
  { name: "HardDrive", label: "Hard Drive" },
  { name: "Folder", label: "Folder" },
  { name: "FolderOpen", label: "Folder Open" },
  { name: "Archive", label: "Archive" },
  { name: "BookOpen", label: "Book Open" },
  { name: "Bookmark", label: "Bookmark" },
  { name: "Tag", label: "Tag" },
  { name: "Star", label: "Star" },
  { name: "Heart", label: "Heart" },
  { name: "ThumbsUp", label: "Thumbs Up" },
  { name: "Award", label: "Award" },
  { name: "Trophy", label: "Trophy" },
  { name: "Target", label: "Target" },
  { name: "Flag", label: "Flag" },
  { name: "MapPin", label: "Map Pin" },
  { name: "Navigation", label: "Navigation" },
  { name: "Compass", label: "Compass" },
  { name: "Globe", label: "Globe" },
  { name: "Map", label: "Map" },
];

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function IconSelector({
  value,
  onChange,
  label,
  placeholder,
}: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedIcon = MENU_ICONS.find((icon) => icon.name === value);

  const filteredIcons = MENU_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      icon.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const renderIcon = (iconName: string, size = 16) => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} />;
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
          >
            <div className="flex items-center gap-2">
              {selectedIcon ? (
                <>
                  {renderIcon(selectedIcon.name)}
                  <span>{selectedIcon.label}</span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  {placeholder || "Pilih icon..."}
                </span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Cari icon..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Tidak ada icon ditemukan.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {filteredIcons.map((icon) => (
                  <CommandItem
                    key={icon.name}
                    value={icon.name}
                    onSelect={() => {
                      onChange(icon.name);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    {renderIcon(icon.name)}
                    <span>{icon.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {icon.name}
                    </Badge>
                    {value === icon.name && <Check className="ml-2 h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedIcon && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Preview:</span>
          {renderIcon(selectedIcon.name, 20)}
          <code className="bg-muted px-1 rounded text-xs">
            {selectedIcon.name}
          </code>
        </div>
      )}
    </div>
  );
}
