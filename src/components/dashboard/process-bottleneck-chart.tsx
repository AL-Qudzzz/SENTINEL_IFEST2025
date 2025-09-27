
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Contract, ApprovalStep, WithId } from '@/lib/types';
import { differenceInDays } from 'date-fns';

const chartConfig = {
  days: {
    label: 'Avg. Days',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface BottleneckData {
    stage: string;
    days: number;
}

async function fetchBottleneckData(firestore: any, contracts: WithId<Contract>[]): Promise<BottleneckData[]> {
    if (!contracts || contracts.length === 0) return [];
    
    const stageDurations: Record<string, number[]> = {};
    
    for (const contract of contracts) {
        const approvalsRef = collection(firestore, 'contracts', contract.id, 'approvals');
        const approvalsSnapshot = await getDocs(query(approvalsRef, where('status', '==', 'Approved')));
        
        const steps = approvalsSnapshot.docs
            .map(doc => ({ ...doc.data() as ApprovalStep, id: doc.id }))
            .sort((a, b) => a.order - b.order);

        let previousDate = (contract.createdAt as any)?.toDate ? (contract.createdAt as any).toDate() : new Date(contract.createdAt as any);

        for (const step of steps) {
            if (step.approvedAt) {
                const approvedDate = (step.approvedAt as any).toDate();
                const duration = differenceInDays(approvedDate, previousDate);

                if (!stageDurations[step.stepName]) {
                    stageDurations[step.stepName] = [];
                }
                stageDurations[step.stepName].push(duration > 0 ? duration : 1); // Minimum 1 day
                
                previousDate = approvedDate;
            }
        }
    }
    
    return Object.entries(stageDurations).map(([stage, durations]) => ({
        stage,
        days: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length), // Average
    }));
}


export function ProcessBottleneckChart({ contracts, isLoading: isLoadingContracts }: { contracts: WithId<Contract>[] | null, isLoading: boolean }) {
    const { firestore } = useFirebase();
    const [chartData, setChartData] = useState<BottleneckData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore || isLoadingContracts) return;

        setIsLoading(true);
        if (contracts && contracts.length > 0) {
            fetchBottleneckData(firestore, contracts)
                .then(data => {
                    setChartData(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching bottleneck data:", err);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
            setChartData([]);
        }

    }, [firestore, contracts, isLoadingContracts]);
    
    
  if (isLoading || isLoadingContracts) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Bottleneck</CardTitle>
        <CardDescription>Average time spent in each approval stage</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs"
                />
                <YAxis dataKey="days" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    labelFormatter={(value) => chartData.find(d => d.stage === value)?.stage}
                    formatter={(value) => `${value} days`} 
                    />}
                />
                <Bar dataKey="days" fill="var(--color-days)" radius={4} />
              </BarChart>
            </ChartContainer>
        ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Not enough approval data to analyze bottlenecks.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
