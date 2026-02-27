import api from '../api';

interface ChatResponse {
    role: 'ai' | 'user';
    content: string;
}

interface ChatRequest {
    message: string;
    resourceId: string;
    resourceContext?: {
        title: string;
        subject: string;
        domain: string;
        resourceType: string;
    };
}

export const aiService = {
    chat: (data: ChatRequest) =>
        api.post<ChatResponse>('/ai/chat', data),

    chatStream: async (data: ChatRequest) => {
        // Get CSRF Token from Cookie (same as api.ts)
        const getCsrfToken = (): string | null => {
            if (typeof document === 'undefined') return null;
            const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        };

        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/ai/stream`;
        console.log('[AI Stream] Connecting to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            credentials: 'include', // Essential for Cookies
        });

        if (!response.ok) {
            console.error('[AI Stream] Failed with status:', response.status, response.statusText);
            throw new Error(`Stream failed: ${response.status} ${response.statusText}`);
        }
        if (!response.body) throw new Error('No response body');

        return response.body.getReader();
    },

    // High-level helper to handle streaming chunks
    streamChat: async (
        resourceId: string,
        message: string,
        onChunk: (chunk: string) => void,
        resourceContext?: any
    ) => {
        const reader = await aiService.chatStream({
            resourceId,
            message,
            resourceContext
        });

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value, { stream: !done });
            if (chunkValue) {
                onChunk(chunkValue);
            }
        }
    }
};
