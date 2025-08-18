import { AdminLayout } from "@/components/layout/admin-layout"
import { FontPreview } from "@/components/font-preview"

export default function FontTestPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Font Testing</h1>
          <p className="text-muted-foreground">Test font consistency across different operating systems</p>
        </div>

        <FontPreview />
      </div>
    </AdminLayout>
  )
}
