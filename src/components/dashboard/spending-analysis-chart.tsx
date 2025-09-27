
'use client';
import { useMemo } from 'react';
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
import type { Contract, WithId } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  spending: {
    label: 'Spending (Rp)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

// Helper to parse currency string like "Rp 150.000.000" or "150000000" to number
const parseCurrency = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  // Remove "Rp", currency symbols, and dots, then parse.
  const numericString = value.replace(/[^0-9]/g, '');
  return parseInt(numericString, 10) || 0;
};

export function SpendingAnalysisChart({ contracts, isLoading }: { contracts: WithId<Contract>[] | null, isLoading: boolean }) {
  const chartData = useMemo(() => {
    if (!contracts) return [];

    const spendingByPartner = contracts.reduce((acc, contract) => {
      const partner = contract.partner || 'Unknown Partner';
      const value = parseCurrency(contract.contractValue);

      if (!acc[partner]) {
        acc[partner] = 0;
      }
      acc[partner] += value;

      return acc;
    }, {} as Record<string, number>);

    return Object.entries(spendingByPartner)
      .map(([partner, total]) => ({
        partner,
        spending: total,
      }))
      .sort((a, b) => b.spending - a.spending) // Sort by highest spending
      .slice(0, 5); // Take top 5
  }, [contracts]);

  if (isLoading) {
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

  const truncateText = (text: string, length: number = 10) => {
    if (text.length <= length) return text;
    return `${text.substring(0, length)}...`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analysis</CardTitle>
        <CardDescription>Total contract value by top 5 partners</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 10,
              right: 10
            }}
          >
            <YAxis
              dataKey="partner"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs"
              width={80} // Adjust width to prevent label cropping
              tickFormatter={(value) => truncateText(value)}
            />
            <XAxis dataKey="spending" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name, props) => [`Rp ${new Intl.NumberFormat('id-ID').format(Number(value))}`, props.payload.partner]} 
                />}
            />
            <Bar
              dataKey="spending"
              layout="vertical"
              fill="var(--color-spending)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
