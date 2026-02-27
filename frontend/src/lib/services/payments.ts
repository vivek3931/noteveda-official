import api from '../api';

export interface CreateOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
}

export const paymentsService = {
    // Now accepts planId as string
    createOrder: (planId: string) =>
        api.post<CreateOrderResponse>('/payments/create-order', { plan: planId }),

    verifyPayment: (data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        plan: string; // this is planId
    }) => api.post<{ success: boolean }>('/payments/verify', data),
};
