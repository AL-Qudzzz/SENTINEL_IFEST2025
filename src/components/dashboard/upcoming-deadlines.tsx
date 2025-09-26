import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const deadlines = [
  {
    partner: 'Innovate Corp',
    contractType: 'Renewal',
    daysLeft: 12,
    initials: 'IC',
  },
  {
    partner: 'Quantum Solutions',
    contractType: 'Termination Option',
    daysLeft: 25,
    initials: 'QS',
  },
  {
    partner: 'Global Logistics',
    contractType: 'Renewal',
    daysLeft: 42,
    initials: 'GL',
  },
];

export function UpcomingDeadlines() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Key dates requiring your attention.</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6">
        {deadlines.map((deadline, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback>{deadline.initials}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {deadline.partner}
                </p>
                <p className="text-sm text-muted-foreground">
                  {deadline.contractType}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{deadline.daysLeft} days</p>
              <p className="text-xs text-muted-foreground">remaining</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
