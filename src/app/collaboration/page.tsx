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
  MoreVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

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

const comments = [
    { name: 'Jane Doe', text: 'Clause 3.2 needs clarification on liability limits.', time: '2 hours ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080', initials: 'JD' },
    { name: 'Alex Ray', text: 'Can we move the effective date to the 1st of next month?', time: '4 hours ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NTg3ODg5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080', initials: 'AR' },
];

const activityLog = [
    { user: 'Jane Doe', action: 'Approved Legal Review', time: '1 hour ago' },
    { user: 'Alex Ray', action: 'Edited Clause 5.1', time: '3 hours ago' },
    { user: 'System', action: 'Contract draft created from template "MSA-v2"', time: 'Yesterday' },
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

export default function CollaborationPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Synergy Collaboration Hub
        </h1>
        <p className="text-muted-foreground">
          Draft, review, and approve contracts seamlessly with your team.
        </p>
      </header>

      <main className="grid flex-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {/* Main Contract Editor */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>MSA with Innovate Corp</CardTitle>
                <CardDescription>
                  Currently in <span className="text-yellow-500 font-semibold">Finance Approval</span> stage. Version 2.1.
                </CardDescription>
              </div>
               <div className="flex items-center gap-2">
                <Button variant="outline">Share</Button>
                <Button>Submit for Next Stage</Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex">
              <Textarea
                className="flex-1 font-mono text-xs"
                defaultValue={`This Master Services Agreement ("Agreement") is made and entered into as of the Effective Date by and between Quantum Solutions, a Delaware corporation ("Provider"), and Innovate Corp, a California corporation ("Client").\n\n1. SERVICES. Provider agrees to perform the services ("Services") as described in one or more Statements of Work ("SOW") to be mutually agreed upon and signed by both parties.\n\n2. TERM. The term of this Agreement shall commence on the Effective Date and shall continue for a period of one (1) year, unless terminated earlier as provided herein.\n\n3. PAYMENT. Client agrees to pay Provider the fees set forth in each SOW. Invoices are payable within thirty (30) days of receipt.`}
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
                        {comments.map((comment, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.avatar} alt={comment.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{comment.initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-semibold">{comment.name}</p>
                                        <p className="text-xs text-muted-foreground">{comment.time}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md mt-1">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t">
                          <Input placeholder="Add a comment..." />
                          <Button size="icon"><Send/></Button>
                      </div>
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
      </main>
    </div>
  );
}
