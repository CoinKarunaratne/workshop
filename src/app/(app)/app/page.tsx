import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/app/dashboard-header";
import { KpiCards } from "@/components/app/kpi-cards";
import { JobPipeline } from "@/components/app/job-pipeline";
import { BookingsList } from "@/components/app/bookings-list";
import { FinancialSnapshot } from "@/components/app/financial-snapshot";
import { RecentActivity } from "@/components/app/recent-activity";
import { AiInsights } from "@/components/app/ai-insights";
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardPage() {

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) redirect("/signin")

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <DashboardHeader />
      <Separator />

      {/* Grid: main + right rail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <KpiCards />
          <JobPipeline />
          <div className="grid gap-6 lg:grid-cols-2">
            <BookingsList />
            <FinancialSnapshot />
          </div>
          <RecentActivity />
        </div>

        <div className="space-y-6">
          <AiInsights />
          {/* space for “Tasks” or “Parts orders” later */}
        </div>
      </div>
    </div>
  )
}


