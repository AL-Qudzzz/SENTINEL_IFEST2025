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

// This is a placeholder page. In a real application, you would fetch
// the contract details based on the ID from the URL.

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header className="flex items-center gap-4">
        <Link href="/contracts">
          <ArrowLeft className="h-6 w-6 text-muted-foreground hover:text-foreground" />
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
            Contract Details
          </h1>
          <p className="text-muted-foreground">
            Reviewing contract with ID: {id}
          </p>
        </div>
      </header>

      <main className="flex-1">
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
      </main>
    </div>
  );
}
