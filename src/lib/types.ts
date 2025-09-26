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
    createdAt: Timestamp | Date;
}
