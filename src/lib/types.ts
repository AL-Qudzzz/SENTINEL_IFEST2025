
import type { Timestamp } from 'firebase/firestore';

export type Status = 
  | 'Active' 
  | 'Drafting' 
  | 'Expired' 
  | 'Pending Renewal' 
  | 'Terminated'
  | 'Pending Approval';


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
    updatedAt?: Timestamp | Date;
    riskScore?: number;
}

export type WithId<T> = T & { id: string };

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

export interface User {
    id: string; // Corresponds to Firebase Auth UID
    uid: string;
    displayName: string;
    username: string;
    email: string;
    telephone: string;
    photoURL?: string;
    role: 'Hukum' | 'Internal' | 'Manajemen';
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
    departmentId?: string; // Optional department reference
}
