
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileClock,
  MessageSquare,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  Send,
  Copy,
  Link as LinkIcon,
  ArrowLeft,
  Loader2,
  Trash2,
  Wand2,
  PencilRuler,
  Save,
  Printer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoc, useFirebase, useMemoFirebase, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, writeBatch, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Contract, ContractComment, ApprovalStep, Status } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { generateContractTemplate, type GenerateContractTemplateOutput } from '@/ai/flows/generate-contract-template-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const collaborators = [
    { name: 'You', email: 'jane.doe@acme.com', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib,rb-4.1.0&q=80&w=1080', initials: 'JD' },
    { name: 'Alex Ray', email: 'alex.ray@acme.com', role: 'Can Edit', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib,rb-4.1.0&q=80&w=1080', initials: 'AR' }
];

function WorkflowStep({ stepName, approverName, status, approverAvatar, initials }: Omit<ApprovalStep, 'id' | 'order'>) {
  const getStatusIcon = () => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="text-green-500" />;
      case 'Pending':
        return <Clock className="text-yellow-500 animate-pulse" />;
      case 'Waiting':
        return <Circle className="text-muted-foreground/50" />;
      default:
        return <Circle className="text-muted" />;
    }
  };
  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">{getStatusIcon()}</div>
      <div className="flex-1">
        <p className="font-medium text-sm">{stepName}</p>
        <p className="text-xs text-muted-foreground">{approverName}</p>
      </div>
      <Avatar className="h-8 w-8">
        <AvatarImage src={approverAvatar} alt={approverName} data-ai-hint="person portrait" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}

function ShareDialog({contractTitle}: {contractTitle: string}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Share</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share '{contractTitle}'</DialogTitle>
                    <DialogDescription>
                        Anyone with the link can view this document.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="invite-email" className="text-sm font-medium">Invite People</Label>
                        <div className="flex space-x-2">
                            <Input id="invite-email" type="email" placeholder="person@example.com" />
                            <Select defaultValue="edit">
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="edit">Can Edit</SelectItem>
                                    <SelectItem value="comment">Can Comment</SelectItem>
                                    <SelectItem value="view">Can View</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">People with Access</h3>
                        <div className="space-y-3">
                            {collaborators.map(c => (
                                <div key={c.email} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={c.avatar} alt={c.name} data-ai-hint="person portrait" />
                                            <AvatarFallback>{c.initials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">{c.email}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{c.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                         <h3 className="text-sm font-medium">Copy Link</h3>
                        <div className="flex items-center space-x-2 rounded-md border bg-secondary pl-3 pr-1">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            <Input defaultValue="https://sentinel.acme/c/1a2b3c4d" readOnly className="flex-1 bg-transparent border-0 h-8 shadow-none focus-visible:ring-0" />
                            <Button type="submit" size="sm" className="px-3">
                                <span className="sr-only">Copy</span>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" className='w-full'>Send Invite</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Initial workflow data to seed if it doesn't exist
const seedWorkflowSteps: Omit<ApprovalStep, 'id'>[] = [
  {
    order: 1,
    stepName: 'Legal Review',
    status: 'Pending',
    approverName: 'Jane Doe',
    approverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib,rb-4.1.0&q=80&w=1080',
    initials: 'JD',
  },
  {
    order: 2,
    stepName: 'Finance Approval',
    status: 'Waiting',
    approverName: 'John Smith',
    approverAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib,rb-4.1.0&q=80&w=1080',
    initials: 'JS',
  },
  {
    order: 3,
    stepName: 'Executive Sign-off',
    status: 'Waiting',
    approverName: 'Sarah Lee',
    approverAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8cGVyc29uJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzU4Nzg4OTc0fDA&ixlib,rb-4.1.0&q=80&w=1080',
    initials: 'SL',
  },
];

function CollaborationView({ contract, contractId }: { contract: Contract, contractId: string }) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
    const [draftError, setDraftError] = useState<string | null>(null);
    
    const [contractContent, setContractContent] = useState(contract.textContent);
    const [isDraftModified, setIsDraftModified] = useState(false);

    useEffect(() => {
        setContractContent(contract.textContent);
    }, [contract.textContent]);

    // Fetch Comments
    const commentsQuery = useMemoFirebase(
        () => (firestore && contractId ? query(collection(firestore, 'contracts', contractId, 'comments'), orderBy('createdAt', 'asc')) : null),
        [firestore, contractId]
    );
    const { data: comments, isLoading: isLoadingComments } = useCollection<ContractComment>(commentsQuery);
    
    // Fetch Approval Workflow Steps
    const approvalsQuery = useMemoFirebase(
        () => (firestore && contractId ? query(collection(firestore, 'contracts', contractId, 'approvals'), orderBy('order', 'asc')) : null),
        [firestore, contractId]
    );
    const { data: approvalSteps, isLoading: isLoadingApprovals } = useCollection<ApprovalStep>(approvalsQuery);

    const activityLog = useMemo(() => {
        const combinedLog: {id: string, user: string, action: string, time: Date}[] = [];

        if (comments) {
            comments.forEach(comment => {
                if (comment.createdAt) {
                    combinedLog.push({
                        id: `comment-${comment.id}`,
                        user: comment.authorName,
                        action: `commented: "${comment.commentText}"`,
                        time: comment.createdAt.toDate(),
                    });
                }
            });
        }

        if (approvalSteps) {
            approvalSteps.forEach(step => {
                if (step.status === 'Approved' && step.approvedAt) {
                    combinedLog.push({
                        id: `approval-${step.id}`,
                        user: step.approverName,
                        action: `Approved ${step.stepName}`,
                        time: step.approvedAt.toDate(),
                    });
                }
            });
        }
        
        if (contract.createdAt) {
             const createdAtDate = (contract.createdAt as any).toDate ? (contract.createdAt as any).toDate() : new Date(contract.createdAt as any);
             if (createdAtDate instanceof Date && !isNaN(createdAtDate.getTime())) {
                 combinedLog.push({
                    id: `creation-${contract.id}`,
                    user: 'System',
                    action: 'Contract draft created',
                    time: createdAtDate,
                 });
             }
        }

        return combinedLog.sort((a, b) => b.time.getTime() - a.time.getTime());
    }, [comments, approvalSteps, contract]);


    // Seed workflow steps if they don't exist for this contract
    useEffect(() => {
        const seedData = async () => {
            if (firestore && contractId && !isLoadingApprovals && approvalSteps?.length === 0) {
                console.log(`Seeding workflow for contract ${contractId}`);
                const batch = writeBatch(firestore);
                const approvalsCollection = collection(firestore, 'contracts', contractId, 'approvals');
                seedWorkflowSteps.forEach(step => {
                    const newStepRef = doc(approvalsCollection);
                    batch.set(newStepRef, step);
                });
                await batch.commit();
                toast({ title: 'Workflow initialized', description: 'Approval steps have been created for this contract.' });
            }
        };
        seedData();
    }, [firestore, contractId, approvalSteps, isLoadingApprovals, toast]);


    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !firestore) return;

        const commentData = {
            authorId: user.uid,
            authorName: user.displayName || user.email || 'Anonymous',
            authorAvatar: user.photoURL || `https://avatar.vercel.sh/${user.uid}`,
            commentText: newComment,
            createdAt: serverTimestamp(),
        };

        addDocumentNonBlocking(collection(firestore, 'contracts', contractId, 'comments'), commentData);
        setNewComment('');
    };

    const openDeleteDialog = (commentId: string) => {
        setCommentToDelete(commentId);
        setIsDeleteAlertOpen(true);
    };

    const handleGenerateSmartDraft = async () => {
        setIsGeneratingDraft(true);
        setDraftError(null);
        try {
            const result = await generateContractTemplate({ originalContractText: contractContent });
            setContractContent(result.templateContractText);
            setIsDraftModified(true);
            toast({
                title: 'Smart Draft Generated',
                description: 'The contract text has been updated. Review and save the changes.',
            });
        } catch (err: any) {
            let errorMessage = err.message || 'Failed to generate smart draft.';
            if (typeof errorMessage === 'string' && errorMessage.includes('503')) {
                errorMessage = "The AI service is temporarily unavailable. Please try again in a few moments.";
            }
            setDraftError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'Drafting Failed',
                description: errorMessage,
            });
        } finally {
            setIsGeneratingDraft(false);
        }
    };
    
    const handleSaveChanges = async () => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            const contractRef = doc(firestore, 'contracts', contractId);
            await updateDoc(contractRef, {
                textContent: contractContent,
                updatedAt: serverTimestamp(),
            });
            setIsDraftModified(false);
            toast({
                title: 'Changes Saved',
                description: 'The contract has been updated successfully.',
            });
        } catch (error) {
             console.error('Error saving changes:', error);
             toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not save the contract changes.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    const handleDeleteComment = async () => {
        if (!commentToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, 'contracts', contractId, 'comments', commentToDelete));
            toast({
                title: 'Comment Deleted',
                description: 'The comment has been successfully removed.',
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete the comment.',
            });
        } finally {
            setIsDeleteAlertOpen(false);
            setCommentToDelete(null);
        }
    };


    const handleAdvanceStage = async () => {
        if (!firestore || !approvalSteps || isSubmitting) return;

        if (isDraftModified) {
            toast({
                variant: 'destructive',
                title: 'Unsaved Changes',
                description: 'Please save your changes before submitting to the next stage.',
            });
            return;
        }

        const currentStepIndex = approvalSteps.findIndex(step => step.status === 'Pending');
        if (currentStepIndex === -1) {
            toast({ variant: 'destructive', title: 'Error', description: 'No pending approval step found.' });
            return;
        }
        
        setIsSubmitting(true);
        try {
            const batch = writeBatch(firestore);
            const contractRef = doc(firestore, 'contracts', contractId);

            // 1. Approve the current step
            const currentStep = approvalSteps[currentStepIndex];
            const currentStepRef = doc(firestore, 'contracts', contractId, 'approvals', currentStep.id);
            batch.update(currentStepRef, { status: 'Approved', approvedAt: serverTimestamp() });

            // 2. Activate the next step (if it exists)
            const nextStep = approvalSteps[currentStepIndex + 1];
            if (nextStep) {
                const nextStepRef = doc(firestore, 'contracts', contractId, 'approvals', nextStep.id);
                batch.update(nextStepRef, { status: 'Pending' });

                // 3. Update the main contract status to 'Pending Approval'
                batch.update(contractRef, { status: 'Pending Approval' as Status, updatedAt: serverTimestamp() });

            } else {
                // This was the final step, mark contract as Active
                batch.update(contractRef, { status: 'Active' as Status, updatedAt: serverTimestamp() });
            }

            await batch.commit();

            toast({ title: 'Stage Advanced', description: 'The contract has moved to the next approval stage.' });

        } catch (error) {
            console.error('Failed to advance stage:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to advance to the next stage.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatTimestamp = (timestamp: any): string => {
        if (!timestamp) return 'just now';
        try {
          // Check if it's a Firestore Timestamp and has a toDate method
          if (timestamp && typeof timestamp.toDate === 'function') {
            return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
          }
          // Fallback for Date objects or ISO strings
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) {
            return formatDistanceToNow(date, { addSuffix: true });
          }
        } catch (e) {
          // If any error occurs during conversion, return a safe default
          console.error("Error formatting timestamp:", e);
        }
        return 'just now';
      };
    
    const isFinalStage = approvalSteps && approvalSteps.every(s => s.status === 'Approved');
    const canSubmit = approvalSteps?.some(s => s.status === 'Pending');

    return (
        <div className="grid flex-1 gap-6 lg:grid-cols-3 xl:grid-cols-4 print:block">
        {/* Main Contract Editor */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6 print:block">
          <Card className="flex-1 flex flex-col print:shadow-none print:border-none print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between print:hidden">
              <div>
                <CardTitle>{contract.title}</CardTitle>
                <CardDescription>
                  Status: <Badge variant={contract.status === 'Active' ? 'default' : 'secondary'} className="font-semibold">{contract.status}</Badge>
                </CardDescription>
              </div>
               <div className="flex items-center gap-2">
                {contract.status === 'Active' ? (
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2" />
                        Print to PDF
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={handleGenerateSmartDraft} disabled={isGeneratingDraft}>
                            {isGeneratingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2" />}
                            Smart Draft
                        </Button>
                        {isDraftModified && (
                            <Button variant="outline" onClick={handleSaveChanges} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" />}
                                Save Changes
                            </Button>
                        )}
                    </>
                )}

                <ShareDialog contractTitle={contract.title} />

                {contract.status !== 'Active' && (
                    <Button onClick={handleAdvanceStage} disabled={isSubmitting || !canSubmit || isFinalStage}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isFinalStage ? "Fully Approved" : "Submit for Next Stage"}
                    </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 print:p-0">
              <div className="print:hidden">
                {isDraftModified && (
                    <Alert>
                      <PencilRuler className="h-4 w-4" />
                      <AlertTitle>Draft Updated</AlertTitle>
                      <AlertDescription>
                        The contract text was updated by Smart Draft. Review the changes and click "Save Changes" to apply them.
                      </AlertDescription>
                    </Alert>
                )}
                {draftError && (
                   <Alert variant="destructive">
                      <AlertTitle>Drafting Failed</AlertTitle>
                      <AlertDescription>{draftError}</AlertDescription>
                   </Alert>
                )}
              </div>
              <Textarea
                className="flex-1 font-mono text-xs print:hidden"
                value={contractContent}
                onChange={(e) => {
                    setContractContent(e.target.value);
                    if (!isDraftModified) setIsDraftModified(true);
                }}
              />
              <pre className="hidden print:block whitespace-pre-wrap font-code text-sm">
                {contractContent}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users />
                Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingApprovals && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              {!isLoadingApprovals && approvalSteps?.map((step) => (
                <WorkflowStep key={step.id} {...step} />
              ))}
            </CardContent>
          </Card>

          <Card className="flex-1">
             <Tabs defaultValue="comments" className="h-full flex flex-col">
                <CardHeader className='pb-2'>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="comments"><MessageSquare className="mr-2" /> Comments</TabsTrigger>
                        <TabsTrigger value="activity"><FileClock className="mr-2"/> Activity</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <TabsContent value="comments" className="flex-1 flex flex-col gap-4">
                      <div className="flex-1 space-y-4 overflow-y-auto">
                        {isLoadingComments && Array.from({ length: 2 }).map((_, i) => (
                           <div key={i} className="flex items-start gap-3">
                               <Skeleton className="h-8 w-8 rounded-full" />
                               <div className="flex-1 space-y-2">
                                   <div className="flex justify-between items-center">
                                       <Skeleton className="h-4 w-20" />
                                       <Skeleton className="h-3 w-16" />
                                   </div>
                                   <Skeleton className="h-8 w-full" />
                               </div>
                           </div>
                        ))}
                        {!isLoadingComments && comments?.map((comment) => (
                            <div key={comment.id} className="group flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} data-ai-hint="person portrait" />
                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-semibold">{comment.authorName}</p>
                                        <p className="text-xs text-muted-foreground flex-shrink-0 pr-8">{formatTimestamp(comment.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="flex-1 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md mt-1">{comment.commentText}</p>
                                        {user && user.uid === comment.authorId && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-50 hover:opacity-100 shrink-0"
                                                onClick={() => openDeleteDialog(comment.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive/70" />
                                                <span className="sr-only">Delete comment</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!isLoadingComments && comments?.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first to add one!</p>
                        )}
                      </div>
                      <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-4 border-t">
                          <Input 
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!user}
                          />
                          <Button type="submit" size="icon" disabled={!newComment.trim() || !user}><Send/></Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="activity" className="space-y-4 overflow-y-auto">
                       {(isLoadingComments || isLoadingApprovals) && Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/4" />
                            </div>
                          </div>
                       ))}
                       {!(isLoadingComments || isLoadingApprovals) && activityLog.map((log) => (
                            <div key={log.id} className="flex items-center gap-3">
                                <FileClock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <p className="text-sm">
                                      <span className="font-medium">{log.user}</span>
                                      <span className="text-muted-foreground"> {log.action.length > 40 ? `${log.action.substring(0, 40)}...` : log.action}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{formatTimestamp(log.time)}</p>
                                </div>
                            </div>
                       ))}
                       {!(isLoadingComments || isLoadingApprovals) && activityLog.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">No activity to show.</p>
                       )}
                    </TabsContent>
                </CardContent>
             </Tabs>
          </Card>
        </div>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your comment.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteComment}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid flex-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <div className="lg:col-span-2 xl:col-span-3">
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-10 w-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function CollaborationClientPage({ id }: { id: string }) {
    const { firestore } = useFirebase();

    const contractRef = useMemoFirebase(
        () => (firestore && id ? doc(firestore, 'contracts', id) : null),
        [firestore, id]
    );

    const { data: contract, isLoading } = useDoc<Contract>(contractRef);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 print:p-0 print:gap-0">
        <header className="flex items-center gap-4 print:hidden">
            <Link href="/collaboration" className='hidden md:inline-block'>
                <ArrowLeft className="h-6 w-6 text-muted-foreground hover:text-foreground" />
            </Link>
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                    Synergy Collaboration Hub
                </h1>
                <div className="text-muted-foreground">
                    {isLoading ? <div className="animate-pulse rounded-md bg-muted h-4 w-64 mt-1" /> : `Collaborating on: ${contract?.title ?? 'contract'}`}
                </div>
            </div>
        </header>

        <main className="grid flex-1 gap-6 print:block">
            {isLoading && <LoadingSkeleton />}
            {!isLoading && contract && <CollaborationView contract={contract} contractId={id} />}
            {!isLoading && !contract && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
                        <p className="text-muted-foreground">Contract not found.</p>
                        <Button asChild>
                            <Link href="/contracts">Go back to Contracts</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </main>
        </div>
    );
}
