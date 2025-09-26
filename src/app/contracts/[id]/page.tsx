
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Loader2, ShieldCheck, AlertCircle, PencilRuler, Info } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Contract } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { detectContractRisk, type DetectContractRiskOutput } from '@/ai/flows/detect-contract-risk-flow';
import { draftContract, type DraftContractOutput } from '@/ai/flows/draft-contract-flow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

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

function RedraftingResult({ result }: { result: DraftContractOutput }) {
  return (
    <Card>
      <CardHeader>
          <CardTitle className="flex items-center gap-2"><PencilRuler className="text-primary"/> Redrafted Contract</CardTitle>
          <CardDescription>
            This is the AI-generated revision of the contract, incorporating the suggested improvements to mitigate risks.
          </CardDescription>
      </CardHeader>
      <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm text-muted-foreground overflow-auto max-h-[600px] font-code">
            {result.redraftedContractText}
          </pre>
      </CardContent>
    </Card>
  )
}


function ContractDetailView({ contract, contractId }: { contract: Contract, contractId: string }) {
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingRedraft, setIsLoadingRedraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DetectContractRiskOutput | null>(null);
  const [redraftResult, setRedraftResult] = useState<DraftContractOutput | null>(null);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoadingAnalysis(true);
    setRedraftResult(null); // Clear previous redraft if re-analyzing
    setError(null);
    try {
      const result = await detectContractRisk({ clauseText: contract.textContent });
      setAnalysisResult(result);
      
      if (firestore) {
        const contractRef = doc(firestore, 'contracts', contractId);
        await updateDoc(contractRef, { 
          riskScore: result.riskScore,
          updatedAt: serverTimestamp() 
        });
        toast({
          title: 'Analysis Complete',
          description: 'Risk score has been saved to the contract.',
        });
      }

    } catch (err: any) {
      setError(err.message || 'Failed to analyze contract.');
       toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleRedraft = async () => {
    if (!analysisResult) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please analyze the contract for risks first.' });
      return;
    }
    setIsLoadingRedraft(true);
    setError(null);
    try {
      const result = await draftContract({
        originalContractText: contract.textContent,
        riskAnalysis: analysisResult,
      });
      setRedraftResult(result);
      toast({ title: 'Success', description: 'Contract has been redrafted.' });
    } catch (err: any) {
      setError(err.message || 'Failed to redraft contract.');
      toast({
        variant: 'destructive',
        title: 'Redraft Failed',
        description: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoadingRedraft(false);
    }
  };


  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Risk Analysis</CardTitle>
            <CardDescription>
              Identify potential risks and get suggestions for improvement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Operation Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoadingAnalysis && (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>AI is analyzing the document...</p>
                  <p className="text-xs">This may take a moment.</p>
                </div>
              </div>
            )}

            {!isLoadingAnalysis && analysisResult && (
              <RiskAnalysisResult result={analysisResult} />
            )}
            
            {!isLoadingAnalysis && !analysisResult && (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-center p-4">
                  <p className="text-muted-foreground mb-4">
                    Click the button to start the AI-powered risk analysis for this contract. The result will be saved automatically.
                  </p>
                  <Button onClick={handleAnalyze} disabled={isLoadingAnalysis}>
                      <ShieldCheck className="mr-2" />
                      Analyze Full Contract
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Drafting</CardTitle>
                <CardDescription>
                  Automatically redraft the contract to incorporate AI suggestions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult && analysisResult.riskScore > 75 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>High Risk Detected!</AlertTitle>
                      <AlertDescription>
                        A risk score of {analysisResult.riskScore} has been identified. It is highly recommended to redraft this contract.
                      </AlertDescription>
                    </Alert>
                )}

                {isLoadingRedraft && (
                  <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p>AI is redrafting the document...</p>
                    </div>
                  </div>
                )}
                
                {!isLoadingRedraft && redraftResult && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Drafting Complete</AlertTitle>
                        <AlertDescription>
                          A revised version of the contract has been generated below. Review the changes before finalizing.
                        </AlertDescription>
                    </Alert>
                )}
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center min-h-[12rem]">
                    {!analysisResult ? (
                       <p className="text-muted-foreground">
                          Please run a risk analysis first to enable the drafting feature.
                        </p>
                    ) : (
                      <>
                        <p className="text-muted-foreground mb-4">
                          Ready to apply AI suggestions? The redrafted contract will appear below.
                        </p>
                        <Button onClick={handleRedraft} disabled={isLoadingRedraft || isLoadingAnalysis}>
                          <PencilRuler className="mr-2" />
                          Redraft Contract
                        </Button>
                      </>
                    )}
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
        </div>
      </div>
      
      {redraftResult && (
        <div className="mt-6">
          <RedraftingResult result={redraftResult} />
        </div>
      )}
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Loading drafting tools...</p>
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
      </div>
    </div>
  )
}

export default function ContractDetailPage({ params: { id } }: { params: { id: string } }) {
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
        {!isLoading && contract && <ContractDetailView contract={contract} contractId={id} />}
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
