
'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, where, Query } from 'firebase/firestore';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { Contract, Status } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const statusVariant: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Active': 'default',
  'In Review': 'secondary',
  'Drafting': 'outline',
  'Expired': 'destructive',
  'Pending Renewal': 'default',
  'Terminated': 'destructive',
};

const getRiskVariant = (score?: number): "destructive" | "secondary" | "default" => {
  if (typeof score !== 'number') return 'outline';
  if (score > 75) return 'destructive';
  if (score > 40) return 'secondary';
  return 'default';
};

const contractStatuses: Status[] = ['Active', 'In Review', 'Drafting', 'Expired', 'Pending Renewal', 'Terminated'];

export default function ContractsPage() {
  const { firestore } = useFirebase();
  const [filter, setFilter] = useState<Status | 'All'>('All');

  const contractsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const baseCollection = collection(firestore, 'contracts');
    if (filter === 'All') {
      return query(baseCollection, orderBy('createdAt', 'desc'));
    }
    return query(baseCollection, where('status', '==', filter), orderBy('createdAt', 'desc'));
  }, [firestore, filter]);

  const { data: contracts, isLoading } = useCollection<Contract>(contractsQuery);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      // Firebase Timestamps can be converted to JS Date objects
      const jsDate = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      return format(jsDate, 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Contract Management
        </h1>
        <p className="text-muted-foreground">
          Review, approve, and track all your contracts in one place.
        </p>
      </header>

      <main className="flex flex-1 flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Contracts List</CardTitle>
            <CardDescription>
              Browse and manage all contracts stored in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as Status | 'All')}>
              <TabsList className="mb-4">
                <TabsTrigger value="All">All</TabsTrigger>
                {contractStatuses.map(status => (
                  <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={filter}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract Title</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Expiration Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && contracts?.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.title}</TableCell>
                        <TableCell className="text-muted-foreground">{contract.partner}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[contract.status as Status] ?? 'default'}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskVariant(contract.riskScore)}>
                            {contract.riskScore ?? 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(contract.expirationDate)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/collaboration/${contract.id}`}>
                              <Users className="h-4 w-4" />
                              <span className="sr-only">Collaborate on contract</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && contracts?.length === 0 && (
                       <TableRow>
                         <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                           No contracts found for this filter.
                         </TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
