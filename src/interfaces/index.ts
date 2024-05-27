import { roleT } from './userInterface';
export interface TokenPayloadI {
    userId: string;
    role: roleT | 'test';
    username?: string;
}

export interface EmailInfo {
    email: string;
    fullName?: string;
    password?: string;
    lawyerName?: string;
}

export const caseRequestStatus = ['requested', 'approved', 'declined', 'down payment', 'requested full payment', 'fully paid'] as const;
export type caseRequestStatusT = typeof caseRequestStatus[number];

export const paymentStatus = ['pending', 'successful'] as const;
export type paymentStatusT = typeof paymentStatus[number];
