'use client';
import { useState } from 'react';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, UploadCloud, Loader2, AlertCircle, FileText, Calendar, Users, CircleDollarSign, Wand2, Clock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractContractData, type ExtractContractDataOutput } from '@/ai/flows/extract-contract-data-flow';
import { Separator } from '../ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase } from '@/firebase/provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Contract } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function UploadContractDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [contractText, setContractText] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractContractDataOutput | null>(null);

  const { firestore } = useFirebase();
  const { toast } = useToast();

  const resetState = () => {
    setContractText('');
    setFileName('');
    setIsLoading(false);
    setIsParsing(false);
    setError(null);
    setResult(null);
    setFileType('');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resetState();
    setFileName(file.name);
    setFileType(file.type);
    setIsParsing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    let apiEndpoint = '';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      apiEndpoint = '/api/parse-docx';
    } else if (file.type === 'application/pdf') {
      apiEndpoint = '/api/parse-pdf';
    } else if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContractText(e.target?.result as string);
          setIsParsing(false);
        };
        reader.readAsText(file);
        return;
    } else {
      setError('Unsupported file type. Please upload a DOCX, PDF, or TXT file.');
      setIsParsing(false);
      return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file on the server.');
      }

      const resultData = await response.json();
      setContractText(resultData.text);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };


  const handleAnalyze = async () => {
    if (!contractText) {
      setError('Document text could not be extracted. Please upload a valid DOCX, PDF or .txt file to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const output = await extractContractData({ contractText });
      setResult(output);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContract = async () => {
    if (!result || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No extracted data to save or database not available.',
      });
      return;
    }

    const effectiveDate = result.importantDates.dates.find(d => d.dateType.toLowerCase().includes('effective'))?.date;
    const expirationDateISO = result.importantDates.dates.find(d => d.dateType.toLowerCase().includes('expiration'))?.date;

    const getExpirationDate = () => {
        if (expirationDateISO) {
            const date = new Date(expirationDateISO);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        }
        // Default to one year from now if no valid date is found
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return oneYearFromNow.toISOString();
    };

    const newContract: Omit<Contract, 'id'> = {
      title: fileName || 'Untitled Contract',
      partner: result.metadata.partiesInvolved || 'N/A',
      status: 'Drafting',
      effectiveDate: effectiveDate ? new Date(effectiveDate).toISOString() : new Date().toISOString(),
      expirationDate: getExpirationDate(),
      contractValue: result.metadata.contractValue || 'N/A',
      textContent: contractText,
      fileType: fileType || 'application/octet-stream',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const contractsCol = collection(firestore, 'contracts');
    await addDoc(contractsCol, newContract);

    toast({
      title: 'Success',
      description: 'Contract has been saved successfully.',
    });
    handleOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle />
          New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Contract: Smart Data Extraction</DialogTitle>
          <DialogDescription>
            Upload a contract file. Our AI will automatically read, understand, and extract key information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-center w-full">
            <Label
              htmlFor="file-upload-dialog"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">TXT, PDF, or DOCX files</p>
                {fileName && (
                  <p className="mt-2 text-sm font-medium text-primary">{fileName}</p>
                )}
              </div>
              <Input id="file-upload-dialog" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.doc,.docx" />
            </Label>
          </div>
          
          {isParsing && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Parsing document...</span>
              </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <ScrollArea className="max-h-[40vh] pr-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="text-primary"/>
                  Extracted Information
                </h3>
                <div className="grid gap-4 rounded-lg border p-4">
                  <InfoItem icon={FileText} label="Contract Type" value={result.metadata.contractType || 'N/A'} />
                  <InfoItem icon={Users} label="Parties Involved" value={result.metadata.partiesInvolved || 'N/A'} />
                  <InfoItem icon={CircleDollarSign} label="Contract Value" value={result.metadata.contractValue || 'NA'} />
                  <Separator />
                  <h4 className="font-semibold text-md">Important Dates & Duration</h4>
                  {result.importantDates.dates?.map(d => <InfoItem key={d.dateType} icon={Calendar} label={d.dateType} value={d.date} />)}
                  {result.importantDates.contractDuration && <InfoItem icon={Clock} label="Contract Duration" value={result.importantDates.contractDuration} />}
                  {result.importantDates.expectedCompletionDate && <InfoItem icon={CheckCircle} label="Expected Completion" value={result.importantDates.expectedCompletionDate} />}

                  <Separator />
                  <h4 className="font-semibold text-md">Obligations</h4>
                  {result.obligations.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {result.obligations.map((o,i) => <li key={i}>{o}</li>)}
                    </ul>
                  ) : (
                    <p className='text-sm text-muted-foreground'>No obligations found.</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          {isLoading && (
              <div className="flex items-center justify-center p-8">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground">AI is analyzing the document...</p>
              </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          {result ? (
             <Button onClick={handleSaveContract}>Save Contract</Button>
          ) : (
            <Button onClick={handleAnalyze} disabled={isLoading || isParsing || !contractText}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2"/>
                  Extract Data
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-start">
      <Icon className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
      <div className='flex flex-col'>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}
