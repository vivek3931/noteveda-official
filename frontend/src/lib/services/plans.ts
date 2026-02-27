import { api } from '@/lib/api';
import { Plan } from '@/types';

export const plansService = {
    async getPlans(): Promise<Plan[]> {
        return api.get<Plan[]>('/plans');
    },
};
