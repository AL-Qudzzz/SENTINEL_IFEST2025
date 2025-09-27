
'use client';

import { useMemo } from 'react';
import { FileText, Gavel, Bell, ShieldAlert } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { RiskOverviewChart } from '@/components/dashboard/risk-overview-chart';
import { UploadContractDialog } from '@/components/dashboard/upload-contract-dialog';
import { useCollection, useFirebase, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, getDocs } from 'firebase/firestore';
import type { Contract, User as AppUser, ApprovalStep, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { SpendingAnalysisChart } from '@/components/dashboard/spending-analysis-chart';
import { ProcessBottleneckChart } from '@/components/dashboard/process-bottleneck-chart';

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
  const { firestore } = useFirebase();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  const contractsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'contracts'), orderBy('createdAt', 'desc')) : null),
    [firestore]
  );
  const { data: contracts, isLoading: isLoadingContracts } = useCollection<WithId<Contract>>(contractsQuery);
  

  const welcomeMessage = `Welcome back, ${appUser?.displayName}! Here's a summary of your contract landscape.`;
  const defaultWelcomeMessage = "Welcome back! Here's a summary of your contract landscape.";


  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
            {isAppUserLoading ? (
                <Skeleton className="h-5 w-64 mt-1" />
            ) : (
                <p className="text-muted-foreground min-h-5">
                    {appUser?.displayName ? welcomeMessage : defaultWelcomeMessage}
                </p>
            )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell>
            <Button variant="outline" size="icon" className="relative h-10 w-10 shrink-0">
                <Bell />
                <span className="sr-only">Toggle notifications</span>
            </Button>
          </NotificationBell>
          <UploadContractDialog />
        </div>
      </header>

      <main className="grid flex-1 items-start gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStats />
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <RecentActivityTable />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
            <UpcomingDeadlines />
            <RiskOverviewChart contracts={contracts} isLoading={isLoadingContracts} />
            <SpendingAnalysisChart contracts={contracts} isLoading={isLoadingContracts} />
            <ProcessBottleneckChart contracts={contracts} isLoading={isLoadingContracts} />
        </div>
      </main>
    </div>
  );
}
