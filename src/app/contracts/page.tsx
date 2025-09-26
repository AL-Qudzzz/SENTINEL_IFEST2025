
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Trash2, Search, Loader2 } from 'lucide-react';
import type { Contract, Status } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ContractProvider, useContract } from '@/hooks/use-contract';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

const statusVariant: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Active': 'default',
  'Drafting': 'outline',
  'Expired': 'destructive',
  'Pending Renewal': 'default',
  'Pending Approval': 'secondary',
  'Terminated': 'destructive',
};

const getRiskVariant = (score?: number): "destructive" | "secondary" | "default" | "outline" => {
  if (typeof score !== 'number') return 'outline';
  if (score > 75) return 'destructive';
  if (score > 40) return 'secondary';
  return 'default';
};

const contractStatuses: (Status | 'All')[] = ['All', 'Active', 'Drafting', 'Pending Approval', 'Pending Renewal', 'Expired'];


function ContractsPageContent() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { 
    contracts,
    filteredContracts, 
    isLoading, 
    isSearching,
    activeFilter, 
    handleFilterChange,
    searchTerm,
    setSearchTerm,
    handleSemanticSearch,
  } = useContract();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const jsDate = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      if (isNaN(jsDate.getTime())) {
        return 'Invalid Date';
      }
      return format(jsDate, 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  const openDeleteDialog = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setContractToDelete(null);
    setIsDeleteDialogOpen(false);
    setDeleteConfirmationText('');
  };

  const handleDeleteContract = async () => {
    if (!contractToDelete || !firestore) return;

    try {
      await deleteDoc(doc(firestore, 'contracts', contractToDelete.id));
      toast({
        title: 'Success',
        description: `Contract "${contractToDelete.title}" has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting contract: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the contract.',
      });
    } finally {
      closeDeleteDialog();
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSemanticSearch();
  };

  return (
    <>
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
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
               <div className="flex-1">
                <CardTitle>Contracts List</CardTitle>
                <CardDescription>
                  Browse and manage all contracts. Use natural language to search semantically.
                </CardDescription>
              </div>
              <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto sm:max-w-xs items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search semantically..."
                    className="pl-9"
                    aria-label="Search contracts"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFilter} onValueChange={(value) => handleFilterChange(value as Status | 'All')}>
                 <div className="mb-4">
                  <TabsList className="overflow-x-auto overflow-y-hidden">
                    {contractStatuses.map(status => (
                      <TabsTrigger key={status} value={status} className="whitespace-nowrap">{status}</TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Title</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Risk Score</TableHead>
                    <TableHead className="whitespace-nowrap">Expiration Date</TableHead>
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
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                         <Link href={`/contracts/${contract.id}`} className="hover:underline">
                          {contract.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{contract.partner}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={statusVariant[contract.status as Status] ?? 'default'}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getRiskVariant(contract.riskScore)}>
                          {contract.riskScore ?? 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(contract.expirationDate)}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" asChild>
                          <Link href={`/collaboration/${contract.id}`} title="Collaborate">
                            <Users className="h-4 w-4" />
                            <span className="sr-only">Collaborate on contract</span>
                          </Link>
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(contract)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                          <span className="sr-only">Delete contract</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredContracts.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                         {isSearching ? 'AI is searching...' : 'No contracts found matching your criteria.'}
                       </TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

      {contractToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the contract 
                <span className="font-semibold text-foreground"> "{contractToDelete.title}"</span>. 
                To confirm, please type <strong className="text-foreground">DELETE</strong> below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="bg-background"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteContract}
                disabled={deleteConfirmationText !== 'DELETE'}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}


export default function ContractsPage() {
    return (
        <ContractProvider>
            <ContractsPageContent />
        </ContractProvider>
    )
}

