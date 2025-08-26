import { DatabaseTableForm } from "@/components/database-table-form"

interface EditTablePageProps {
  params: {
    id: string
  }
}

export default function EditTablePage({ params }: EditTablePageProps) {
  return <DatabaseTableForm tableId={params.id} />
}
