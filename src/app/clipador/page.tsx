import { ClipadorApp } from "@/components/clipador/ClipadorApp";
import { loadClipadorData } from "@/lib/clipador/data";

// Sempre renderiza na hora (os números mudam ao longo do dia)
export const dynamic = "force-dynamic";

export default async function ClipadorPage() {
  const { data, mode } = await loadClipadorData();
  return <ClipadorApp initialData={data} mode={mode} />;
}
