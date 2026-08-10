import { requireAuth } from "@/lib/permissions";
import { ReportsContainer } from "@/components/reports/reports-container";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await requireAuth();

  return <ReportsContainer userRole={user.role} />;
}
