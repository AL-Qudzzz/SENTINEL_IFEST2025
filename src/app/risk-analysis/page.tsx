
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { detectContractRisk, type DetectContractRiskOutput } from '@/ai/flows/detect-contract-risk-flow';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

function RiskAnalysisResult({ result }: { result: DetectContractRiskOutput }) {
  const getRiskColor = (score: number) => {
    if (score > 75) return 'bg-red-500';
    if (score > 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskVariant = (score: number): "destructive" | "secondary" | "default" => {
    if (score > 75) return 'destructive';
    if (score > 40) return 'secondary';
    return 'default';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-primary" />
          Risk Analysis Report
        </CardTitle>
        <CardDescription>
          AI-powered assessment of the provided contract clause.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Overall Risk Score</h3>
            <Badge variant={getRiskVariant(result.riskScore)}>{result.riskScore} / 100</Badge>
          </div>
          <Progress value={result.riskScore} className="w-full [&>div]:bg-red-500" />
           <p className="text-sm text-muted-foreground">
            {result.riskScore > 75 ? 'High Risk' : result.riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
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
            <h3 className="font-semibold">Rationale</h3>
            <p className="text-sm text-muted-foreground">{result.rationale}</p>
        </div>
        <Separator />
        <div className="space-y-3">
          <h3 className="font-semibold">Suggested Alternative Clause</h3>
           <blockquote className="border-l-2 pl-6 italic text-sm">
            {result.suggestedAlternative}
          </blockquote>
        </div>
      </CardContent>
    </Card>
  );
}


export default function RiskAnalysisPage() {
  const [clauseText, setClauseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectContractRiskOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clauseText) {
      setError('Please enter a contract clause to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await detectContractRisk({ clauseText });
      setResult(output);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Contract Clause Risk Analysis
        </h1>
        <p className="text-muted-foreground">
          Analyze any contract clause to identify potential risks and get safer alternatives.
        </p>
      </header>

      <main className="grid flex-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Analyze Clause</CardTitle>
              <CardDescription>
                Paste a clause from your contract below to begin the analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
                <Textarea
                  placeholder="e.g., 'The Service Provider shall not be liable for any consequential, indirect, or special damages...'"
                  value={clauseText}
                  onChange={(e) => setClauseText(e.target.value)}
                  className="min-h-[200px] flex-1"
                />
                <Button type="submit" disabled={isLoading || !clauseText}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2" />
                      Analyze Risk
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
             <div className="space-y-4 rounded-lg border border-dashed p-8 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">AI is analyzing the clause...</p>
             </div>
          )}
          
          {result && <RiskAnalysisResult result={result} />}

          {!isLoading && !result && !error && (
            <div className="flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed text-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Your risk analysis report will be displayed here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
