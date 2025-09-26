
'use client';

import { Bell, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import type { Contract } from '@/lib/types';
import { differenceInDays, addYears } from 'date-fns';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function NotificationBell() {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringContractsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'contracts'),
            where('status', '==', 'Active'),
            where('expirationDate', '<=', thirtyDaysFromNow.toISOString())
        );
    }, [firestore]);

    const { data: expiringContracts, isLoading } = useCollection<Contract>(expiringContractsQuery);

    const handleRenew = async (contractId: string, currentExpiration: string) => {
        if (!firestore) return;
        
        const contractRef = doc(firestore, 'contracts', contractId);
        const newExpirationDate = addYears(new Date(currentExpiration), 1);

        try {
            await updateDoc(contractRef, {
                status: 'Pending Renewal',
                expirationDate: newExpirationDate.toISOString(),
                updatedAt: serverTimestamp(),
            });
            toast({
                title: 'Contract Renewed',
                description: `The contract has been extended by one year and is now pending renewal approval.`,
            });
        } catch (error) {
            console.error('Error renewing contract:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to renew the contract.',
            });
        }
    };


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 shrink-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10"
                >
                    <Bell className="h-5 w-5" />
                     {expiringContracts && expiringContracts.length > 0 && (
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                     )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-80">
                <DropdownMenuLabel>Expiring Contracts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {isLoading && (
                        <div className="p-2 space-y-2">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    )}
                    {!isLoading && expiringContracts?.map(contract => {
                        const daysLeft = differenceInDays(new Date(contract.expirationDate), new Date());
                        return (
                            <DropdownMenuItem key={contract.id} className="flex flex-col items-start gap-1 p-2">
                                <div className="w-full flex justify-between items-center">
                                    <p className="font-semibold text-sm truncate">{contract.title}</p>
                                    <Badge variant={daysLeft < 15 ? 'destructive' : 'secondary'}>{daysLeft} days left</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground w-full">Partner: {contract.partner}</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-1"
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent menu from closing
                                        handleRenew(contract.id, contract.expirationDate);
                                    }}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Renew Contract
                                </Button>
                            </DropdownMenuItem>
                        )
                    })}
                     {!isLoading && expiringContracts?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center p-4">No contracts expiring soon.</p>
                     )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

