
'use client';
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
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { Contract, Status } from '@/lib/types';


const statusVariant: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Active': 'default',
  'In Review': 'secondary',
  'Drafting': 'outline',
  'Expired': 'destructive',
  'Pending Renewal': 'default',
  'Terminated': 'destructive',
};

export function RecentActivityTable() {
  const { firestore } = useFirebase();
  const contractsQuery = useMemoFirebase(() => 
    firestore 
      ? query(collection(firestore, 'contracts'), orderBy('updatedAt', 'desc'), limit(5)) 
      : null
  , [firestore]);
  const { data: recentContracts, isLoading } = useCollection<Contract>(contractsQuery);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'just now'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Overview of the latest contract updates and statuses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-3/4" />
                </TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
            {!isLoading && recentContracts?.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>
                  <div className="font-medium">{contract.title}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[contract.status as Status] ?? 'default'}>
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatTimestamp(contract.updatedAt || contract.createdAt)}</TableCell>
              </TableRow>
            ))}
            {!isLoading && recentContracts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No recent activity. Upload a contract to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
