
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Contract } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { detectContractRisk, type DetectContractRiskOutput } from '@/ai/flows/detect-contract-risk-flow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function RiskAnalysisResult({ result }: { result: DetectContractRiskOutput }) {
  const getRiskVariant = (score: number): "destructive" | "secondary" | "default" => {
    if (score > 75) return 'destructive';
    if (score > 40) return 'secondary';
    return 'default';
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Overall Risk Score</h3>
          <Badge variant={getRiskVariant(result.riskScore)} className="text-lg">{result.riskScore} / 100</Badge>
        </div>
        <Progress value={result.riskScore} />
        <p className="text-sm text-muted-foreground">
          {result.riskScore > 75 ? 'High Risk: Immediate review recommended.' : result.riskScore > 40 ? 'Medium Risk: Caution advised.' : 'Low Risk: Looks good.'}
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <h3 className="font-semibold">Identified Risk Factors</h3>
        {result.riskFactors.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {result.riskFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        ) : (
           <p className="text-sm text-muted-foreground">No specific risk factors identified.</p>
        )}
      </div>
      <Separator />
      <div className="space-y-2">
          <h3 className="font-semibold">AI Rationale</h3>
          <p className="text-sm text-muted-foreground">{result.rationale}</p>
      </div>
      <Separator />
      <div className="space-y-3">
        <h3 className="font-semibold">Suggested Safer Alternative</h3>
         <blockquote className="border-l-2 pl-6 italic text-sm bg-secondary/50 p-4 rounded-md">
          {result.suggestedAlternative}
        </blockquote>
      </div>
    </div>
  );
}

function ContractDetailView({ contract }: { contract: Contract }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DetectContractRiskOutput | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For simplicity, we analyze the entire contract text.
      // In a real app, you might let users select specific clauses.
      const result = await detectContractRisk({ clauseText: contract.textContent });
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze contract.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>AI Risk Analysis</CardTitle>
          <CardDescription>
            Let AI review the contract to identify potential risks and suggest improvements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>AI is analyzing the document...</p>
                <p className="text-xs">This may take a moment.</p>
              </div>
            </div>
          )}

          {!isLoading && analysisResult && (
            <RiskAnalysisResult result={analysisResult} />
          )}
          
          {!isLoading && !analysisResult && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center p-4">
                <p className="text-muted-foreground mb-4">
                  Click the button to start the AI-powered risk analysis for this contract.
                </p>
                <Button onClick={handleAnalyze} disabled={isLoading}>
                    <ShieldCheck className="mr-2" />
                    Analyze Full Contract
                </Button>
            </div>
          )}
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
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Loading analysis tools...</p>
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
