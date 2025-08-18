import { ModuleForm } from "@/components/modules/form/module-form";
import { getDataById } from "@/lib/api";

interface EditModulePageProps {
  params: { id: string };
}

export default async function EditModulePage({ params }: EditModulePageProps) {
  const data = await getDataById("modules", params.id);
  return <ModuleForm mode="edit" initialData={data} />;
}
