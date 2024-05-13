import { roleT } from './userInterface';
export interface TokenPayloadI {
    userId: string;
    role: roleT | 'test';
    username?: string;
}

export interface EmailInfo {
    email: string[];
    firstname?: string;
    verificationCode?: string;
    URL?: string;
}
