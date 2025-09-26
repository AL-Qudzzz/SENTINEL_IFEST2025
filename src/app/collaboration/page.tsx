
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { Contract, Status } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const statusBadgeVariant: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Active': 'default',
  'In Review': 'secondary',
  'Drafting': 'outline',
  'Expired': 'destructive',
  'Pending Renewal': 'default',
  'Terminated': 'destructive',
  'Legal Review': 'secondary',
  'Finance Approval': 'secondary',
  'Executive Sign-off': 'default',
};

export default function CollaborationHubPage() {
  const { firestore } = useFirebase();

  const contractsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contracts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: contracts, isLoading } = useCollection<Contract>(contractsQuery);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Synergy Collaboration Hub
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage all contract collaboration and approval workflows.
        </p>
      </header>

      <main className="flex flex-1 flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Contract Workflows</CardTitle>
            <CardDescription>
              Overview of all contracts currently in the collaboration and approval pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Title</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
                {!isLoading && contracts?.map((contract) => {
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.title}</TableCell>
                        <TableCell className="text-muted-foreground">{contract.partner}</TableCell>
                        <TableCell>
                           <Badge variant={statusBadgeVariant[contract.status as Status] ?? 'default'}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild>
                            <Link href={`/collaboration/${contract.id}`}>
                              <Users className="mr-2 h-4 w-4" />
                              Collaborate
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                })}
                {!isLoading && contracts?.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                       No contracts available for collaboration.
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
