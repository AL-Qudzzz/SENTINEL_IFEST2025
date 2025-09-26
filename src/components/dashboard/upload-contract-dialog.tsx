'use client';
import { useState } from 'react';
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


/**
 * Attempts to parse a date string from various common formats.
 * @param dateString The date string to parse.
 * @returns A Date object if successful, otherwise null.
 */
function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;

  // 1. Try direct parsing (handles ISO 8601 and many common formats like YYYY-MM-DD)
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // 2. Try formats like "DD-MM-YYYY" or "DD/MM/YYYY"
  const parts = dateString.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (parts) {
    // Assuming DD-MM-YYYY
    date = new Date(parseInt(parts[3], 10), parseInt(parts[2], 10) - 1, parseInt(parts[1], 10));
    if (!isNaN(date.getTime())) {
      return date;
    }
    // Assuming MM-DD-YYYY
    date = new Date(parseInt(parts[3], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Add more parsing logic for other formats if needed
  
  // Return null if all attempts fail
  return null;
}


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
  
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to parse PDF.');
        }
        const data = await response.json();
        text = data.text;

      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/parse-docx', {
          method: 'POST',
          body: formData,
        });
         if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to parse DOCX.');
        }
        const data = await response.json();
        text = data.text;

      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF, DOCX, or TXT file.`);
      }
  
      if (!text) {
        throw new Error("Could not extract text from the document. It might be empty, corrupted, or an image-only file.");
      }
  
      setContractText(text);
  
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(err.message || "An unexpected error occurred during file processing.");
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

    const effectiveDateStr = result.importantDates.dates.find(d => d.dateType.toLowerCase().includes('effective'))?.date;
    const expirationDateStr = result.importantDates.dates.find(d => d.dateType.toLowerCase().includes('expiration'))?.date;
    const contractDurationStr = result.importantDates.contractDuration;

    const finalEffectiveDate = parseDate(effectiveDateStr) ?? new Date();

    const getExpirationDate = (): string => {
      // Priority 1: Use explicit expiration date if valid
      const parsedExpirationDate = parseDate(expirationDateStr);
      if (parsedExpirationDate) {
        return parsedExpirationDate.toISOString();
      }

      // Priority 2: Calculate from effective date and duration
      if (contractDurationStr) {
        const durationParts = contractDurationStr.toLowerCase().split(' ');
        const amount = parseInt(durationParts[0], 10);
        const unit = durationParts[1];

        if (!isNaN(amount) && unit) {
          const newDate = new Date(finalEffectiveDate);
          if (unit.startsWith('year')) {
            newDate.setFullYear(newDate.getFullYear() + amount);
            return newDate.toISOString();
          }
          if (unit.startsWith('month')) {
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate.toISOString();
          }
          if (unit.startsWith('day')) {
            newDate.setDate(newDate.getDate() + amount);
            return newDate.toISOString();
          }
        }
      }

      // Priority 3: Default to one year from the effective date
      const oneYearFromEffectiveDate = new Date(finalEffectiveDate);
      oneYearFromEffectiveDate.setFullYear(oneYearFromEffectiveDate.getFullYear() + 1);
      return oneYearFromEffectiveDate.toISOString();
    };


    const newContract: Omit<Contract, 'id'> = {
      title: fileName || 'Untitled Contract',
      partner: result.metadata.partiesInvolved || 'N/A',
      status: 'Drafting',
      effectiveDate: finalEffectiveDate.toISOString(),
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
              <Input id="file-upload-dialog" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
            </Label>
          </div>
          
          {isParsing && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>AI is parsing document...</span>
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
