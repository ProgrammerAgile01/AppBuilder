import { MenuManagement } from "@/components/menusetting/menu-management";

export default function MenuSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Atur Menu</h1>
        <p className="text-muted-foreground mt-2">
          Kelola struktur menu aplikasi dengan kelompok modul, modul, dan menu
          bertingkat
        </p>
      </div>
      <MenuManagement />
    </div>
  );
}
