// Credits API Service
import api from '../api';
import { Resource } from '@/types';

export interface CreditBalance {
    dailyCredits: number;
    uploadCredits: number;
    totalCredits: number;
    isPro: boolean;
}

export interface DownloadResult {
    success: boolean;
    fileUrl: string;
    message?: string;
}

export interface DownloadHistoryItem {
    id: string;
    resource: Resource;
    createdAt: string;
}

export const creditsService = {
    // Get current user's credit balance
    getCredits: (): Promise<CreditBalance> =>
        api.get<CreditBalance>('/credits'),

    // Download a resource (deducts 1 credit)
    downloadResource: (resourceId: string): Promise<DownloadResult> =>
        api.post<DownloadResult>(`/credits/download/${resourceId}`),

    // Get download history
    getDownloadHistory: (): Promise<DownloadHistoryItem[]> =>
        api.get<DownloadHistoryItem[]>('/credits/downloads'),
};

export default creditsService;
