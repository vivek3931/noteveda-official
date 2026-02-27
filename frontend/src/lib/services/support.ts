import api from '../api';
import { SupportTicket, TicketMessage, FAQ } from './admin';

export interface CreateTicketDTO {
    subject: string;
    message: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export const supportService = {
    createTicket: (data: CreateTicketDTO): Promise<SupportTicket> => {
        return api.post<SupportTicket>('/support/tickets', data);
    },

    getMyTickets: (): Promise<SupportTicket[]> => {
        return api.get<SupportTicket[]>('/support/tickets');
    },

    getTicket: (id: string): Promise<SupportTicket> => {
        return api.get<SupportTicket>(`/support/tickets/${id}`);
    },

    replyToTicket: (id: string, message: string): Promise<TicketMessage> => {
        return api.post<TicketMessage>(`/support/tickets/${id}/reply`, { message });
    },

    getFAQs: (category?: string): Promise<FAQ[]> => {
        return api.get<FAQ[]>(category ? `/support/faqs?category=${category}` : '/support/faqs');
    },
};
