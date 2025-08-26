"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Users, Eye } from "lucide-react";
import type { PackageDTO, MenuAccessDTO } from "@/lib/api";
import { fetchMenuAccessTree } from "@/lib/api";

interface Feature {
  id: string;
  name: string;
  type: "boolean" | "number" | "text";
  value: boolean | number | string;
  description: string;
}

type MenuAccess = MenuAccessDTO;
type PackageData = PackageDTO;

const defaultFeatures: Feature[] = [
  {
    id: "1",
    name: "Dashboard Basic",
    type: "boolean",
    value: true,
    description: "Akses dashboard dasar",
  },
  {
    id: "2",
    name: "Laporan Sederhana",
    type: "boolean",
    value: true,
    description: "Laporan basic",
  },
  {
    id: "3",
    name: "Support Email",
    type: "boolean",
    value: true,
    description: "Dukungan via email",
  },
  {
    id: "4",
    name: "Dashboard Advanced",
    type: "boolean",
    value: false,
    description: "Dashboard dengan fitur lanjutan",
  },
  {
    id: "5",
    name: "Laporan Lengkap",
    type: "boolean",
    value: false,
    description: "Laporan detail dan analitik",
  },
  {
    id: "6",
    name: "Support Chat",
    type: "boolean",
    value: false,
    description: "Dukungan via live chat",
  },
  {
    id: "7",
    name: "WhatsApp Reminder",
    type: "boolean",
    value: false,
    description: "Notifikasi WhatsApp otomatis",
  },
  {
    id: "8",
    name: "API Access",
    type: "boolean",
    value: false,
    description: "Akses API untuk integrasi",
  },
  {
    id: "9",
    name: "Backup Data",
    type: "boolean",
    value: false,
    description: "Backup otomatis data",
  },
  {
    id: "10",
    name: "Support 24/7",
    type: "boolean",
    value: false,
    description: "Dukungan 24 jam",
  },
];

interface PackageBuilderPageProps {
  packageData?: PackageData | null;
  onSave: (data: PackageData) => void | Promise<void>;
  onCancel: () => void;
}

export function PackageBuilderPage({
  packageData,
  onSave,
  onCancel,
}: PackageBuilderPageProps) {
  const [formData, setFormData] = useState<PackageData>({
    id: "",
    menu_id: null,
    parent_id: null,

    name: "",
    description: "",
    price: 0,
    maxUsers: 1,
    status: "draft",
    subscribers: 0,

    features: defaultFeatures as any,
    menuAccess: [],

    createdAt: new Date().toISOString().split("T")[0],
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let alive = true;

    // EDIT: gunakan data dari backend (menuAccess sudah enabled)
    if (packageData && packageData.id) {
      setFormData((prev) => ({
        ...prev,
        ...packageData,
        features:
          Array.isArray(packageData.features) && packageData.features.length
            ? packageData.features
            : (defaultFeatures as any),
        menuAccess: Array.isArray(packageData.menuAccess)
          ? (packageData.menuAccess as any)
          : [],
      }));
      return () => {
        alive = false;
      };
    }

    // CREATE: ambil tree dari tabel menus → bukan dummy
    (async () => {
      try {
        const tree = await fetchMenuAccessTree();
        if (!alive) return;
        setFormData((prev) => ({
          ...prev,
          id: "",
          name: "",
          description: "",
          price: 0,
          maxUsers: 1,
          status: "draft",
          subscribers: 0,
          features: defaultFeatures as any,
          menuAccess: (tree as any) ?? [],
        }));
      } catch (e) {
        console.error("Gagal memuat menu tree:", e);
        // fallback aman: kosong (biar user centang manual)
        setFormData((prev) => ({ ...prev, menuAccess: [] as any }));
      }
    })();

    return () => {
      alive = false;
    };
  }, [packageData]);

  const handleFeatureChange = (
    featureId: string,
    value: boolean | number | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features ?? []).map((feature) =>
        feature.id === featureId ? { ...feature, value } : feature
      ),
    }));
  };

  const handleMenuAccessChange = (menuId: string, enabled: boolean) => {
    const updateMenuAccess = (menus: MenuAccess[]): MenuAccess[] =>
      menus.map((menu) => {
        if (menu.id === menuId) return { ...menu, enabled };
        if (menu.children)
          return { ...menu, children: updateMenuAccess(menu.children) };
        return menu;
      });

    setFormData((prev) => ({
      ...prev,
      menuAccess: updateMenuAccess((prev.menuAccess as any) ?? []),
    }));
  };

  const updateMenuAccessByIds = (
    menus: MenuAccess[],
    enabledIds: string[]
  ): MenuAccess[] =>
    menus.map((menu) => ({
      ...menu,
      enabled: enabledIds.includes(menu.id),
      children: menu.children
        ? updateMenuAccessByIds(menu.children, enabledIds)
        : undefined,
    }));

  const generatePresetPackage = (
    type: "standard" | "intermediate" | "ultimate"
  ) => {
    const presets = {
      standard: {
        name: "Paket Standar",
        description: "Paket dasar untuk usaha kecil",
        price: 99000,
        maxUsers: 2,
        enabledFeatures: ["1", "2", "3"],
        enabledMenus: ["1", "2", "2-1", "2-2", "2-3", "4", "4-1", "5"],
      },
      intermediate: {
        name: "Paket Intermediate",
        description: "Paket menengah untuk usaha berkembang",
        price: 199000,
        maxUsers: 5,
        enabledFeatures: ["1", "2", "3", "4", "5", "6", "9"],
        enabledMenus: [
          "1",
          "2",
          "2-1",
          "2-2",
          "2-3",
          "3",
          "3-1",
          "3-2",
          "4",
          "4-1",
          "4-2",
          "5",
        ],
      },
      ultimate: {
        name: "Paket Ultimate",
        description: "Paket lengkap untuk usaha besar",
        price: 399000,
        maxUsers: -1,
        enabledFeatures: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        enabledMenus: [
          "1",
          "2",
          "2-1",
          "2-2",
          "2-3",
          "3",
          "3-1",
          "3-2",
          "4",
          "4-1",
          "4-2",
          "4-3",
          "5",
        ],
      },
    } as const;

    const preset = presets[type];

    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      description: preset.description,
      price: preset.price,
      maxUsers: preset.maxUsers,
      features: (prev.features ?? []).map((feature: any) => ({
        ...feature,
        value:
          feature.type === "boolean"
            ? preset.enabledFeatures.includes(feature.id)
            : feature.value,
      })) as any,
      menuAccess: updateMenuAccessByIds(
        (prev.menuAccess as any) ?? [],
        preset.enabledMenus
      ),
    }));
  };

  const renderMenuAccess = (menus: MenuAccess[], level = 0) =>
    menus.map((menu) => (
      <div key={menu.id} className={`${level > 0 ? "ml-8" : ""}`}>
        <div
          className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
            menu.enabled
              ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          } ${level > 0 ? "my-2" : "my-3"}`}
        >
          <Checkbox
            id={`menu-${menu.id}`}
            checked={!!menu.enabled}
            onCheckedChange={(checked) =>
              handleMenuAccessChange(menu.id, !!checked)
            }
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <Label
            htmlFor={`menu-${menu.id}`}
            className={`text-sm font-medium cursor-pointer flex-1 ${
              menu.enabled ? "text-blue-900" : "text-gray-700"
            }`}
          >
            {menu.name}
          </Label>
          {menu.enabled && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 text-xs px-2 py-1"
            >
              Aktif
            </Badge>
          )}
        </div>
        {menu.children && (
          <div className="ml-4">
            {renderMenuAccess(menu.children, level + 1)}
          </div>
        )}
      </div>
    ));

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Editor
          </Button>
          <h1 className="text-2xl font-bold">Preview Paket</h1>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{formData.name}</CardTitle>
            <CardDescription>{formData.description}</CardDescription>
            <div className="text-3xl font-bold text-blue-600 mt-4">
              Rp {Number(formData.price ?? 0).toLocaleString("id-ID")}
              <span className="text-sm font-normal text-muted-foreground">
                /bulan
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {formData.maxUsers === -1
                    ? "Unlimited Users"
                    : `Maksimal ${formData.maxUsers} Users`}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Fitur Termasuk:</h4>
              {(formData.features ?? [])
                .filter(
                  (feature: any) => feature.type === "boolean" && feature.value
                )
                .map((feature: any) => (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>{feature.name}</span>
                  </div>
                ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Akses Menu:</h4>
              <div className="flex flex-wrap gap-1">
                {(formData.menuAccess as any)
                  ?.filter((menu: any) => menu.enabled)
                  ?.map((menu: any) => (
                    <Badge
                      key={menu.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {menu.name}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {packageData?.id ? "Edit Paket" : "Buat Paket Baru"}
            </h1>
            <p className="text-muted-foreground">
              Konfigurasi fitur dan akses menu untuk paket berlangganan
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => onSave(formData)}>Simpan Paket</Button>
        </div>
      </div>

      {/* Template Paket */}
      <Card>
        <CardHeader>
          <CardTitle>Template Paket</CardTitle>
          <CardDescription>
            Gunakan template untuk memulai dengan cepat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generatePresetPackage("standard")}
            >
              Paket Standar
            </Button>
            <Button
              variant="outline"
              onClick={() => generatePresetPackage("intermediate")}
            >
              Paket Intermediate
            </Button>
            <Button
              variant="outline"
              onClick={() => generatePresetPackage("ultimate")}
            >
              Paket Ultimate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
          <TabsTrigger value="features">Fitur</TabsTrigger>
          <TabsTrigger value="menu">Akses Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Paket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Paket</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Masukkan nama paket"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (Rp/bulan)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={Number(formData.price ?? 0)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Deskripsi paket"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Maksimal Users</Label>
                  <Select
                    value={String(formData.maxUsers)}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxUsers: value === "-1" ? -1 : Number(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 User</SelectItem>
                      <SelectItem value="2">2 Users</SelectItem>
                      <SelectItem value="5">5 Users</SelectItem>
                      <SelectItem value="10">10 Users</SelectItem>
                      <SelectItem value="25">25 Users</SelectItem>
                      <SelectItem value="-1">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "draft") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Fitur</CardTitle>
              <CardDescription>
                Tentukan fitur yang tersedia untuk paket ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {(formData.features ?? []).map((feature: any) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {feature.description}
                      </div>
                    </div>
                    {feature.type === "boolean" && (
                      <Switch
                        checked={!!feature.value}
                        onCheckedChange={(checked) =>
                          handleFeatureChange(feature.id, checked)
                        }
                      />
                    )}
                    {feature.type === "number" && (
                      <Input
                        type="number"
                        value={Number(feature.value ?? 0)}
                        onChange={(e) =>
                          handleFeatureChange(
                            feature.id,
                            Number.parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Akses Menu
              </CardTitle>
              <CardDescription className="text-gray-600">
                Tentukan menu yang dapat diakses oleh paket ini
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {renderMenuAccess((formData.menuAccess as any) ?? [])}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
