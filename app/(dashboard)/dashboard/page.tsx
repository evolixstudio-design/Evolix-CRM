import { requireAuth } from "@/lib/permissions";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { CoFounderDashboard } from "@/components/dashboard/cofounder-dashboard";
import { InternDashboard } from "@/components/dashboard/intern-dashboard";
import { ErrorState } from "@/components/ui/error-state";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const user = await requireAuth();
    const data = await getDashboardData(user);

    if (data.role === "CO_FOUNDER") {
      return <CoFounderDashboard data={data} />;
    } else {
      return <InternDashboard data={data} />;
    }
  } catch (error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="An unexpected error occurred while fetching your dashboard metrics. Please refresh or try again."
      />
    );
  }
}
