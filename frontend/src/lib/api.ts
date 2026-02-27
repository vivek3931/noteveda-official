// API Client for Noteveda Frontend
// Centralized API configuration and helper functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface CustomRequestInit extends RequestInit {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, success: boolean = false) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(success);
        }
    });

    failedQueue = [];
};

// Helper: Get CSRF Token from Cookie
const getCsrfToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};

// Generic fetch wrapper with error handling and token refresh
async function fetchAPI<T>(
    endpoint: string,
    options: CustomRequestInit = {}
): Promise<T> {

    // Auto-inject CSRF Token
    const csrfToken = getCsrfToken();
    const headers: HeadersInit = {
        ...options.headers,
    };

    // Only set JSON content type if not FormData
    if (!(options.body instanceof FormData)) {
        (headers as any)['Content-Type'] = 'application/json';
    }

    if (csrfToken) {
        (headers as Record<string, string>)['X-CSRF-TOKEN'] = csrfToken;
    }

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include', // Essential for Cookies
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle 401 Unauthorized (Token Expired)
        if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return fetchAPI<T>(endpoint, { ...options, _retry: true });
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            options._retry = true;
            isRefreshing = true;

            try {
                // Call refresh endpoint (Cookies handled automatically)
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }, // No CSRF needed/exempted
                    credentials: 'include',
                });

                if (!refreshResponse.ok) {
                    throw new Error('Refresh failed');
                }

                // If successful, cookies are updated automatically by browser
                processQueue(null, true);
                isRefreshing = false;

                // Retry original request
                return fetchAPI<T>(endpoint, options);
            } catch (error) {
                processQueue(error, false);
                isRefreshing = false;

                // Clear middleware hint cookie to prevent redirect loop
                document.cookie = 'is_authenticated=; Max-Age=0; path=/;';

                // Session completely dead -> Logout/Redirect
                // BUT: If checking auth status (/auth/me), don't redirect, just let it fail -> Guest mode
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !endpoint.includes('/auth/me')) {
                    // Force hard redirect to clear state
                    window.location.href = '/login';
                }

                throw new Error('Session expired. Please login again.');
            }
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        // Check for 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        const text = await response.text();
        try {
            return text ? JSON.parse(text) : {} as T;
        } catch {
            return {} as T;
        }
    } catch (error) {
        throw error;
    }
}

// API Methods
export const api = {
    get: <T>(endpoint: string) => fetchAPI<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, data?: unknown) =>
        fetchAPI<T>(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
        }),

    patch: <T>(endpoint: string, data: unknown) =>
        fetchAPI<T>(endpoint, {
            method: 'PATCH',
            body: data instanceof FormData ? data : JSON.stringify(data)
        }),

    delete: <T>(endpoint: string) =>
        fetchAPI<T>(endpoint, { method: 'DELETE' }),
};

export default api;
