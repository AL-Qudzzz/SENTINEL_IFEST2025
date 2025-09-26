'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Contract } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ContractDetailView({ contract }: { contract: Contract }) {
  return (
    <>
    <Card>
        <CardHeader>
          <CardTitle>Review & Approve</CardTitle>
          <CardDescription>
            This section will contain the contract details, AI analysis,
            and approval workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                  Contract review features coming soon.
              </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Original Document</CardTitle>
          <CardDescription>
            The full text of the uploaded contract document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm text-muted-foreground overflow-auto max-h-96 font-code">
            {contract.textContent}
          </pre>
        </CardContent>
      </Card>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { firestore } = useFirebase();

  const contractRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'contracts', id) : null),
    [firestore, id]
  );
  
  const { data: contract, isLoading } = useDoc<Contract>(contractRef);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header className="flex items-center gap-4">
        <Link href="/contracts">
          <ArrowLeft className="h-6 w-6 text-muted-foreground hover:text-foreground" />
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            {isLoading ? <Skeleton className="h-9 w-72" /> : contract?.title ?? 'Contract Details'}
          </h1>
          <p className="text-muted-foreground">
            Reviewing contract with ID: {id}
          </p>
        </div>
      </header>

      <main className="flex-1 space-y-6">
        {isLoading && <LoadingSkeleton />}
        {!isLoading && contract && <ContractDetailView contract={contract} />}
        {!isLoading && !contract && (
           <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Contract not found.</p>
              </CardContent>
           </Card>
        )}
      </main>
    </div>
  );
}
