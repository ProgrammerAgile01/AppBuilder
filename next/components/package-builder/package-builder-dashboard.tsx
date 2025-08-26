"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Settings, Zap } from "lucide-react";
import { PackageBuilderPage } from "./package-builder-page";
import {
  PackageDTO,
  fetchPackages,
  createPackage,
  updatePackage,
} from "@/lib/api";

export function PackageBuilderDashboard() {
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageDTO | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPackages();
        if (alive) setPackages(data);
      } catch (e) {
        console.error("Gagal memuat packages:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filteredPackages = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [packages, searchTerm]);

  const totalSubscribers = useMemo(
    () => packages.reduce((sum, p) => sum + (p.subscribers ?? 0), 0),
    [packages]
  );

  const activePackages = useMemo(
    () => packages.filter((p) => p.status === "active").length,
    [packages]
  );

  const totalRevenue = useMemo(
    () =>
      packages.reduce(
        (sum, p) => sum + (p.price ?? 0) * (p.subscribers ?? 0),
        0
      ),
    [packages]
  );

  if (showCreateForm || editingPackage) {
    return (
      <PackageBuilderPage
        packageData={editingPackage}
        onSave={async (packageData) => {
          try {
            if (editingPackage && editingPackage.id) {
              const updated = await updatePackage(
                editingPackage.id,
                packageData as PackageDTO
              );
              setPackages((prev) =>
                prev.map((x) => (x.id === updated.id ? updated : x))
              );
            } else {
              const created = await createPackage(packageData as PackageDTO);
              setPackages((prev) => [created, ...prev]);
            }
            setShowCreateForm(false);
            setEditingPackage(null);
          } catch (e) {
            console.error("Simpan paket gagal:", e);
          }
        }}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingPackage(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Builder</h1>
          <p className="text-muted-foreground">
            Kelola paket berlangganan dan fitur akses
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingPackage(null);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Buat Paket Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paket</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : packages.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : `${activePackages} aktif`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriber
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : totalSubscribers}
            </div>
            <p className="text-xs text-muted-foreground">Pengguna aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : `Rp ${totalRevenue.toLocaleString("id-ID")}`}
            </div>
            <p className="text-xs text-muted-foreground">Per bulan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paket Terpopuler
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold">-</div>
            ) : (
              (() => {
                const top = [...packages].sort(
                  (a, b) => (b.subscribers ?? 0) - (a.subscribers ?? 0)
                )[0];
                return (
                  <>
                    <div className="text-2xl font-bold">
                      {top ? top.name : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {top ? `${top.subscribers} subscriber` : ""}
                    </p>
                  </>
                );
              })()
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari paket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <Badge
                  variant={pkg.status === "active" ? "default" : "secondary"}
                >
                  {pkg.status}
                </Badge>
              </div>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-blue-600">
                Rp {pkg.price.toLocaleString("id-ID")}
                <span className="text-sm font-normal text-muted-foreground">
                  /bulan
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Max Users:</span>
                  <span className="font-medium">
                    {pkg.maxUsers === -1 ? "Unlimited" : pkg.maxUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Subscribers:</span>
                  <span className="font-medium">{pkg.subscribers ?? 0}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Fitur:</h4>
                <div className="flex flex-wrap gap-1">
                  {(pkg.features ?? [])
                    .filter((f) => f.type === "boolean" && f.value)
                    .slice(0, 3)
                    .map((f) => (
                      <Badge key={f.id} variant="outline" className="text-xs">
                        {f.name}
                      </Badge>
                    ))}
                  {(pkg.features ?? []).filter(
                    (f) => f.type === "boolean" && f.value
                  ).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +
                      {(pkg.features ?? []).filter(
                        (f) => f.type === "boolean" && f.value
                      ).length - 3}{" "}
                      lainnya
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Akses Menu:</h4>
                <div className="flex flex-wrap gap-1">
                  {(pkg.menuAccess ?? [])
                    .filter((m) => m.enabled)
                    .slice(0, 2)
                    .map((m) => (
                      <Badge key={m.id} variant="secondary" className="text-xs">
                        {m.name}
                      </Badge>
                    ))}
                  {(pkg.menuAccess ?? []).filter((m) => m.enabled).length >
                    2 && (
                    <Badge variant="secondary" className="text-xs">
                      +
                      {(pkg.menuAccess ?? []).filter((m) => m.enabled).length -
                        2}{" "}
                      menu
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPackage(pkg)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditingPackage({
                      ...pkg,
                      id: "", // kosongkan supaya onSave melakukan create
                      name: `${pkg.name} (Copy)`,
                    });
                    setShowCreateForm(true);
                  }}
                >
                  Duplikat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Tidak ada paket ditemukan
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Coba ubah kata kunci pencarian"
              : "Mulai dengan membuat paket pertama"}
          </p>
        </div>
      )}
    </div>
  );
}
