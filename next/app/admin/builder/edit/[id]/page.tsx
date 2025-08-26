import { CrudBuilderPage } from "@/components/builder/form/crud-builder-page";

interface EditBuilderPageProps {
  params: {
    id: string;
  };
}

export default function EditBuilderPage({ params }: EditBuilderPageProps) {
  return <CrudBuilderPage builderId={params.id} />;
}
