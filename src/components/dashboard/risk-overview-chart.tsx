'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart } from 'recharts';

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
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { risk: 'low', contracts: 980, fill: 'var(--color-low)' },
  { risk: 'medium', contracts: 281, fill: 'var(--color-medium)' },
  { risk: 'high', contracts: 23, fill: 'var(--color-high)' },
];

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

export function RiskOverviewChart() {
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
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="contracts"
              nameKey="risk"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up for high-risk contracts <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total contracts by risk category
        </div>
      </CardFooter>
    </Card>
  );
}
