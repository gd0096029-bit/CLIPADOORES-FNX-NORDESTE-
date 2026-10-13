import { AdminApp } from "@/components/admin/AdminApp";
import { buildAdminDemoData } from "@/lib/clipador/admin-demo-data";

export const dynamic = "force-dynamic";

// MODO DEMO: dados fictícios. Quando o Supabase entrar, carregue os dados reais aqui
// e libere a página só pra quem tem role = 'admin'.
export default function AdminPage() {
  return <AdminApp initialData={buildAdminDemoData()} />;
}
