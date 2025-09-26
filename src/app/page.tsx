import {
  FileText,
  FileUp,
  Gavel,
  Bell,
  Search,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { RiskOverviewChart } from '@/components/dashboard/risk-overview-chart';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s a summary of your contract landscape.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              className="pl-9"
              aria-label="Search contracts"
            />
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle />
            New Contract
          </Button>
        </div>
      </header>

      <main className="grid flex-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Contracts"
          value="1,284"
          change="+20.1% from last month"
          icon={FileText}
        />
        <StatsCard
          title="Active Agreements"
          value="932"
          change="+18.3% from last month"
          icon={Gavel}
        />
        <StatsCard
          title="Pending Renewal"
          value="57"
          change="12 expiring in 30 days"
          icon={Bell}
        />
        <StatsCard
          title="High-Risk"
          value="23"
          change="+4 since last week"
          icon={FileUp}
        />

        <div className="grid gap-6 lg:col-span-2">
          <RecentActivityTable />
        </div>

        <div className="grid gap-6 lg:col-span-2">
          <UpcomingDeadlines />
          <RiskOverviewChart />
        </div>
      </main>
    </div>
  );
}
