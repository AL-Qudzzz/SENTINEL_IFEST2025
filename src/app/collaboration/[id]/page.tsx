
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
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
import { useDoc, useFirebase, useMemoFirebase, useCollection, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Contract, ContractComment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';


const approvalWorkflow = [
  {
    step: 'Legal Review',
    approver: 'Jane Doe',
    status: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    initials: 'JD',
  },
  {
    step: 'Finance Approval',
    approver: 'John Smith',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    initials: 'JS',
  },
  {
    step: 'Executive Sign-off',
    approver: 'Sarah Lee',
    status: 'Waiting',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8cGVyc29uJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzU4Nzg4OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    initials: 'SL',
  },
];

const activityLog = [
    { user: 'Jane Doe', action: 'Approved Legal Review', time: '1 hour ago' },
    { user: 'Alex Ray', action: 'Edited Clause 5.1', time: '3 hours ago' },
    { user: 'System', action: 'Contract draft created from template "MSA-v2"', time: 'Yesterday' },
];

const collaborators = [
    { name: 'You', email: 'jane.doe@acme.com', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib,rb-4.1.0&q=80&w=1080', initials: 'JD' },
    { name: 'Alex Ray', email: 'alex.ray@acme.com', role: 'Can Edit', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib,rb-4.1.0&q=80&w=1080', initials: 'AR' }
];

function WorkflowStep({ step, approver, status, avatar, initials }: (typeof approvalWorkflow)[0]) {
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
        <p className="font-medium text-sm">{step}</p>
        <p className="text-xs text-muted-foreground">{approver}</p>
      </div>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={approver} data-ai-hint="person portrait" />
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

function CollaborationView({ contract, contractId }: { contract: Contract, contractId: string }) {
    const { firestore, user } = useFirebase();
    const [newComment, setNewComment] = useState('');

    const commentsQuery = useMemoFirebase(
        () => (firestore && contractId ? query(collection(firestore, 'contracts', contractId, 'comments'), orderBy('createdAt', 'asc')) : null),
        [firestore, contractId]
    );
    const { data: comments, isLoading: isLoadingComments } = useCollection<ContractComment>(commentsQuery);

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

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'just now';
        try {
            const date = timestamp.toDate();
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            return 'just now';
        }
    };
    
    return (
        <div className="grid flex-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {/* Main Contract Editor */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{contract.title}</CardTitle>
                <CardDescription>
                  Currently in <span className="text-yellow-500 font-semibold">Finance Approval</span> stage. Version 2.1.
                </CardDescription>
              </div>
               <div className="flex items-center gap-2">
                <ShareDialog contractTitle={contract.title} />
                <Button>Submit for Next Stage</Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex">
              <Textarea
                className="flex-1 font-mono text-xs"
                defaultValue={contract.textContent}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users />
                Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvalWorkflow.map((item, index) => (
                <WorkflowStep key={index} {...item} />
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
                            <div key={comment.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} data-ai-hint="person portrait" />
                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-semibold">{comment.authorName}</p>
                                        <p className="text-xs text-muted-foreground">{formatTimestamp(comment.createdAt)}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md mt-1">{comment.commentText}</p>
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
                    <TabsContent value="activity" className="space-y-4">
                       {activityLog.map((log, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <FileClock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm"><span className="font-medium">{log.user}</span> {log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.time}</p>
                                </div>
                            </div>
                       ))}
                    </TabsContent>
                </CardContent>
             </Tabs>
          </Card>
        </div>
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

function CollaborationClientPage({ id }: { id: string }) {
    const { firestore } = useFirebase();

    const contractRef = useMemoFirebase(
        () => (firestore && id ? doc(firestore, 'contracts', id) : null),
        [firestore, id]
    );

    const { data: contract, isLoading } = useDoc<Contract>(contractRef);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <header className="flex items-center gap-4">
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

        <main className="grid flex-1 gap-6">
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

export default function CollaborationPage({ params }: { params: { id: string } }) {
  return <CollaborationClientPage id={params.id} />;
}
