import { DatabaseTableView } from "@/components/database-table-view"

interface ViewTablePageProps {
  params: {
    id: string
  }
}

export default function ViewTablePage({ params }: ViewTablePageProps) {
  return <DatabaseTableView tableId={params.id} />
}
