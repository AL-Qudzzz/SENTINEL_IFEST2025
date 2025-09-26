
'use client';

import { useMemo } from 'react';
import { FileText, Gavel, Bell, ShieldAlert } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { RiskOverviewChart } from '@/components/dashboard/risk-overview-chart';
import { UploadContractDialog } from '@/components/dashboard/upload-contract-dialog';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Contract } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardStats() {
  const { firestore } = useFirebase();

  const contractsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'contracts'), orderBy('createdAt', 'desc')) : null),
    [firestore]
  );
  const { data: contracts, isLoading } = useCollection<Contract>(contractsQuery);

  const stats = useMemo(() => {
    if (!contracts) {
      return {
        totalContracts: 0,
        activeAgreements: 0,
        pendingRenewal: 0,
        highRisk: 0,
      };
    }

    const totalContracts = contracts.length;
    const activeAgreements = contracts.filter(c => c.status === 'Active').length;
    const pendingRenewal = contracts.filter(c => c.status === 'Pending Renewal').length;
    const highRisk = contracts.filter(c => (c.riskScore ?? 0) > 75).length;

    return { totalContracts, activeAgreements, pendingRenewal, highRisk };
  }, [contracts]);
  
  if (isLoading) {
    return (
      <>
        <Skeleton className="h-[126px] w-full" />
        <Skeleton className="h-[126px] w-full" />
        <Skeleton className="h-[126px] w-full" />
        <Skeleton className="h-[126px] w-full" />
      </>
    );
  }

  return (
    <>
      <StatsCard
        title="Total Contracts"
        value={stats.totalContracts.toString()}
        change="All contracts in the system"
        icon={FileText}
      />
      <StatsCard
        title="Active Agreements"
        value={stats.activeAgreements.toString()}
        change="Currently active contracts"
        icon={Gavel}
      />
      <StatsCard
        title="Pending Renewal"
        value={stats.pendingRenewal.toString()}
        change="Contracts awaiting renewal approval"
        icon={Bell}
      />
      <StatsCard
        title="High-Risk"
        value={stats.highRisk.toString()}
        change="Contracts with risk score > 75"
        icon={ShieldAlert}
      />
    </>
  );
}


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
          <UploadContractDialog />
        </div>
      </header>

      <main className="grid flex-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />

        <div className="grid gap-6 lg:col-span-2 lg:row-span-2">
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
