// Categories API Service
import api from '../api';
import { Domain, PlatformStats } from '@/types';

export const categoriesService = {
    // Get all domains with subdomains, streams, and subjects
    getDomains: (): Promise<Domain[]> =>
        api.get<Domain[]>('/categories/domains'),

    // Get subdomains for a specific domain
    getSubDomains: (domainId: string) =>
        api.get(`/categories/domains/${domainId}/subdomains`),

    // Get platform statistics (total resources, users, downloads, categories)
    getStats: (): Promise<PlatformStats> =>
        api.get<PlatformStats>('/categories/stats'),
};

export default categoriesService;
