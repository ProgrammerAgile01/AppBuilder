import { BuilderViewDetail } from "@/components/builder/builder-view-detail";

interface BuilderViewPageProps {
  params: {
    id: string;
  };
}

export default function BuilderViewPage({ params }: BuilderViewPageProps) {
  return <BuilderViewDetail builderId={params.id} />;
}
