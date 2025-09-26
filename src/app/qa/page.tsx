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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, MessageSquare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { answerContractQuestions, type AnswerContractQuestionsOutput } from '@/ai/flows/answer-contract-questions-flow';

export default function QAPage() {
  const [contractText, setContractText] = useState('');
  const [question, setQuestion] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerContractQuestionsOutput | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContractText(text);
      };
      reader.onerror = (e) => {
        setError('Failed to read file.');
        console.error('FileReader error:', e);
      };
      // For now, we only support text files for demo purposes
      if (file.type.startsWith('text/')) {
        reader.readAsText(file);
      } else {
        setError('Unsupported file type. Please upload a text (.txt) file.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractText || !question) {
      setError('Please upload a contract and enter a question.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await answerContractQuestions({ contractText, question });
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
          Contract Q&A
        </h1>
        <p className="text-muted-foreground">
          Ask questions about your contract and get answers from an AI assistant.
        </p>
      </header>

      <main className="grid flex-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Upload Contract</CardTitle>
              <CardDescription>
                Upload your contract document. For this demo, please use a .txt file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">TXT files only</p>
                    {fileName && (
                      <p className="mt-2 text-sm font-medium text-primary">{fileName}</p>
                    )}
                  </div>
                  <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt" />
                </Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>2. Ask a Question</CardTitle>
              <CardDescription>
                Enter your question about the contract below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Textarea
                  placeholder="e.g., 'What is the termination clause?'"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button type="submit" disabled={isLoading || !contractText || !question}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2" />
                      Get Answer
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>AI-Generated Answer</CardTitle>
              <CardDescription>
                The answer based on the provided contract will appear below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                 <div className="space-y-4">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                 </div>
              )}
              
              {result && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Answer:</h3>
                  <p className="text-foreground leading-relaxed">{result.answer}</p>
                  
                  {contractText && (
                    <div className="space-y-2 pt-4">
                      <h4 className="font-semibold">Original Contract Text:</h4>
                      <pre className="bg-muted p-4 rounded-md text-sm text-muted-foreground overflow-auto max-h-80 font-code">
                        {contractText}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !result && !error && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Your answer will be displayed here once you submit a question.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
