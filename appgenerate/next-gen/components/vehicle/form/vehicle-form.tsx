"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleFormFields } from "./vehicle-form-fields";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { createData, updateData } from "@/lib/api";

export function VehicleForm({
    mode,
    initialData,
}: {
    mode: "create" | "edit";
    initialData?: Record<string, any>;
}) {
    const router = useRouter();
    const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const buildPayload = () => {
        const payload: any = {
      plate_number: formData.plate_number ?? undefined,
      brand: formData.brand ?? undefined,
      model: formData.model ?? undefined,
      year: formData.year ? Number(formData.year) : undefined,
      color: formData.color ?? undefined,
      vehicle_type: formData.vehicle_type ?? undefined,
      fuel_type: formData.fuel_type ?? undefined,
      transmission: formData.transmission ?? undefined,
      number_of_seats: formData.number_of_seats ? Number(formData.number_of_seats) : undefined,
      mileage: formData.mileage ? Number(formData.mileage) : undefined,
      daily_rate: formData.daily_rate ? Number(formData.daily_rate) : undefined,
      location: formData.location ?? undefined,
      status: formData.status ?? undefined,
      features: formData.features ?? undefined,
      description: formData.description ?? undefined,
        };
    if (formData.front_photo instanceof File) payload.front_photo = formData.front_photo;
    if (formData.side_photo instanceof File) payload.side_photo = formData.side_photo;
    if (formData.back_photo instanceof File) payload.back_photo = formData.back_photo;
    return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = buildPayload();
            
            if (mode === "create") {
                await createData("vehicles", payload);
                toast({ title: "Berhasil!", description: "Vehicle berhasil dibuat"})
            } else {
                await updateData("vehicles", formData.id!, payload)
                toast({
                    title: "Berhasil!",
                    description: "Vehicle berhasil diperbarui"
                })
            }
            router.push("/vehicle");
        } catch (error: any) {
            toast({
                title: "Gagal",
                description: error.message || "Terjadi kesalahan.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1 h-7 w-7 border border-white/20 text-white hover:bg-white/10 hover:text-white dark:border-white/30 dark:text-white dark:hover:bg-white/20 dark:hover:text-white" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                                    Dashboard
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/vehicle" className="text-muted-foreground hover:text-foreground">
                                    Vehicle Management
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            {/* <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href={`/vehicle/edit/(id)`} className="text-muted-foreground hover:text-foreground">
                                    nama kolom
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" /> */}
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-foreground">
                                    {mode === "create" ? "Add Vehicle Management" : "Edit Vehicle Management"}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Vehicle Management
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {mode === "create" ? "Add New Vehicle Management" : "Edit Vehicle Management"}
                            </h1>
                            <p className="text-muted_foreground">
                                {mode === "create" ? "Add Information for Vehicle Management" : "Update Information for Vehicle Management"}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <VehicleFormFields mode={mode} formData={formData} setFormData={setFormData} />
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {mode === "create" ? "Add Vehicle" : "Update Vehicle"}
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
            
        
    )
}