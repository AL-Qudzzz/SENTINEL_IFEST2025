
'use client';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import type { Contract } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  contracts: {
    label: 'Contracts',
  },
  low: {
    label: 'Low Risk',
    color: 'hsl(var(--chart-1))',
  },
  medium: {
    label: 'Medium Risk',
    color: 'hsl(var(--chart-4))',
  },
  high: {
    label: 'High Risk',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export function RiskOverviewChart({ contracts, isLoading }: { contracts: Contract[] | null, isLoading: boolean }) {

  const chartData = useMemo(() => {
    if (!contracts) {
      return [
        { risk: 'low', value: 0, fill: 'var(--color-low)' },
        { risk: 'medium', value: 0, fill: 'var(--color-medium)' },
        { risk: 'high', value: 0, fill: 'var(--color-high)' },
      ];
    }
    
    const riskCounts = {
      low: 0,
      medium: 0,
      high: 0,
    };

    contracts.forEach(contract => {
      const score = contract.riskScore ?? 0;
      if (score > 75) {
        riskCounts.high += 1;
      } else if (score > 40) {
        riskCounts.medium += 1;
      } else {
        riskCounts.low += 1;
      }
    });

    return [
      { risk: 'low', value: riskCounts.low, fill: 'var(--color-low)' },
      { risk: 'medium', value: riskCounts.medium, fill: 'var(--color-medium)' },
      { risk: 'high', value: riskCounts.high, fill: 'var(--color-high)' },
    ];
  }, [contracts]);

  const totalContracts = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData]);
  
  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Risk Overview</CardTitle>
          <CardDescription>Distribution of contracts by risk level</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center pb-0">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-48" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Risk Overview</CardTitle>
        <CardDescription>Distribution of contracts by risk level</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey='risk'/>}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="risk"
              innerRadius={60}
              strokeWidth={5}
              labelLine={false}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                percent,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                if (percent === 0) return null;
                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className='text-xs font-bold'
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
               {chartData.map((entry) => (
                <Cell key={`cell-${entry.risk}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="risk" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          A total of {totalContracts} contracts analyzed
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total contracts by risk category
        </div>
      </CardFooter>
    </Card>
  );
}
