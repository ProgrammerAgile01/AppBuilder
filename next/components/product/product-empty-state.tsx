"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Plus } from "lucide-react"
import Link from "next/link"

interface ProductEmptyStateProps {
  title?: string
  subtitle?: string
  showCreateButton?: boolean
}

export function ProductEmptyState({
  title = "Pilih Produk Terlebih Dahulu",
  subtitle = "Silakan pilih produk dari dropdown di atas untuk melanjutkan.",
  showCreateButton = true,
}: ProductEmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{subtitle}</p>

          {showCreateButton && (
            <Link href="/admin/product">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Produk
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
