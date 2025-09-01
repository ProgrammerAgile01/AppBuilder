"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataCustomerFormFields } from "./data-customer-form-fields";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { createData, updateData } from "@/lib/api";

export function DataCustomerForm({
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
      nama_lengkap: formData.nama_lengkap ?? undefined,
      alamat: formData.alamat ?? undefined,
      nama_instansi: formData.nama_instansi ?? undefined,
        };

    return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = buildPayload();
            
            if (mode === "create") {
                await createData("data-customers", payload);
                toast({ title: "Success!", description: "Data Customer created"})
            } else {
                await updateData("data-customers", formData.id!, payload)
                toast({
                    title: "Success!",
                    description: "Data Customer updated"
                })
            }
            router.push("/data-customer");
        } catch (error: any) {
            toast({
                title: "Failed",
                description: error.message || "There Is An Error.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const CRUMBS = [{"title":"Master Data","route_path":null,"level":1,"type":"group"},{"title":"Customer","route_path":null,"level":2,"type":"module"},{"title":"Data Customer","route_path":"/data-customer","level":3,"type":"menu"}] as { title: string; route_path?: string|null; level: number; type: string }[];

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1 h-7 w-7 border border-white/20 text-black hover:bg-black/50 hover:text-white dark:border-white/30 dark:text-white dark:hover:bg-white/20 dark:hover:text-white" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {/* <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                                Dashboard
                            </BreadcrumbLink>
                        </BreadcrumbItem> */}
                        {CRUMBS.map((c, i) => (
                            <React.Fragment key={i}>
                                {i < CRUMBS.length - 1 ? (
                                    <>
                                        <BreadcrumbItem className="md:block">
                                            {/* <BreadcrumbLink href={c.route_path || "#"} className="text-muted-foreground hover:text-foreground"> */}
                                                {c.title}
                                            {/* </BreadcrumbLink> */}
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="md:block" />
                                    </>
                                ) : (
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-foreground">
                                            {mode === "create" ? `Add ${c.title}` : `Edit ${c.title}`}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Data Customer
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {mode === "create" ? "Add New Data Customer" : "Edit Data Customer"}
                        </h1>
                        <p className="text-muted_foreground">
                            {mode === "create" ? "Add Information for Data Customer" : "Update Information for Data Customer"}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset disabled={isSubmitting} className="space-y-6">
                        <div>
                            <DataCustomerFormFields mode={mode} formData={formData} setFormData={setFormData} />
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
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === "create" ? "Saving..." : "Updating..."}
                                </>
                            ) : mode === "create" ? ( "Add Data Customer" ) : ( "Update Data Customer" )}
                            </Button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </>
    )
}