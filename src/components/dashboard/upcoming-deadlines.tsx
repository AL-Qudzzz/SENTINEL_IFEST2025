
'use client';

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
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { Contract } from '@/lib/types';
import Link from 'next/link';

export function UpcomingDeadlines() {
  const { firestore } = useFirebase();

  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const deadlinesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'contracts'),
      where('status', '==', 'Active'),
      where('expirationDate', '<=', sixtyDaysFromNow.toISOString()),
      orderBy('expirationDate', 'asc'),
      limit(5)
    );
  }, [firestore]);

  const { data: deadlines, isLoading } = useCollection<Contract>(deadlinesQuery);

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Key dates requiring your attention in the next 60 days.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/contracts">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-12 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))}

        {!isLoading &&
          deadlines?.map((deadline) => {
            const daysLeft = differenceInDays(new Date(deadline.expirationDate), new Date());
            return (
              <div key={deadline.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarFallback>{getInitials(deadline.partner)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {deadline.partner}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${daysLeft < 10 ? 'text-destructive' : ''}`}>
                    {daysLeft > 0 ? `${daysLeft} days` : 'Today'}
                  </p>
                  <p className="text-xs text-muted-foreground">remaining</p>
                </div>
              </div>
            );
          })}
        
        {!isLoading && deadlines?.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
                No contracts expiring in the next 60 days.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
