import type { Timestamp } from 'firebase/firestore';

export type Status = 'Active' | 'In Review' | 'Drafting' | 'Expired' | 'Pending Renewal' | 'Terminated';

export interface Contract {
    id: string;
    title: string;
    partner: string;
    status: Status;
    effectiveDate: string;
    expirationDate: string;
    contractValue: string;
    textContent: string;
    fileType: string;
    createdAt: Timestamp | Date;
    riskScore?: number;
}

export interface ContractComment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    commentText: string;
    createdAt: Timestamp;
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Waiting';

export interface ApprovalStep {
    id: string;
    order: number;
    stepName: string;
    status: ApprovalStatus;
    approverName: string;
    approverAvatar: string;
    initials: string;
    approvedAt?: Timestamp | null;
}
