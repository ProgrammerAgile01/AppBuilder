import { ModuleView } from "@/components/modules/module-view-detail";

export default function ViewModulePage({ params }: { params: { id: string } }) {
  return <ModuleView moduleId={params.id} />;
}
