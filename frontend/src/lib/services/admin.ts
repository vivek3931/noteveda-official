// Admin API Service
import api from '../api';

// ============ DASHBOARD TYPES ============

export interface DashboardStats {
    users: { total: number; active: number; premium: number };
    resources: { total: number; hidden: number; deleted: number };
    today: { uploads: number; downloads: number; aiRequests: number };
    moderation: { pendingReports: number };
    revenue: number;
    storageUsedMB: number;
}

export interface TopReportedResource {
    id: string;
    title: string;
    reportCount: number;
    isHidden: boolean;
    author: { id: string; name: string; email: string };
    _count: { reports: number };
}

// ============ RESOURCE TYPES ============

export interface AdminResource {
    id: string;
    title: string;
    description: string;
    fileType: string;
    resourceType: string;
    domain: string;
    subDomain: string;
    subject: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    viewCount: number;
    downloadCount: number;
    reportCount: number;
    isHidden: boolean;
    isAutoDeleted: boolean;
    createdAt: string;
    author: { id: string; name: string; email: string };
}

export interface ResourceWithReports extends AdminResource {
    reports: {
        id: string;
        reason: string;
        description?: string;
        createdAt: string;
        reporter: { name: string; email: string };
    }[];
    _count: { downloads: number; reports: number };
}

// ============ USER TYPES ============

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
    dailyCredits: number;
    uploadCredits: number;
    isActive: boolean;
    subscription: { plan: { id: string; name: string } | null; active: boolean; endDate: string } | null;
    createdAt: string;
    _count: { uploads: number; downloads: number; reportsMade: number };
}

export interface UserDetails extends AdminUser {
    uploads: any[];
    downloads: { resource: { title: string } }[];
    aiUsage: number;
}

// ============ MODERATION TYPES ============

export interface ModerationStats {
    pendingReports: number;
    autoHidden: number;
    autoDeleted: number;
    reviewedToday: number;
}

// ============ SETTINGS TYPES ============

export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    type: string;
    category: string;
    label?: string;
}

// ============ COMMON TYPES ============

export interface AuditLog {
    id: string;
    adminId: string;
    admin: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    action: string;
    targetType: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    createdAt: string;
}

export interface AuditLogResponse {
    logs: AuditLog[];
    total: number;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: string;
    target: string;
    isActive: boolean;
    expiresAt?: string;
    createdAt: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    subject: string;
    message: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    createdAt: string;
    updatedAt: string;
    messages?: TicketMessage[];
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    sender?: {
        id: string;
        name: string;
        role: string;
    };
    message: string;
    isAdmin?: boolean;
    createdAt: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
    features: string[];
    isActive: boolean;
    highlighted: boolean;
}

export interface PremiumUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    subscription?: {
        plan: {
            name: string;
        };
        active: boolean;
        endDate: string;
    };
    role: string;
    isActive: boolean;
    dailyCredits: number;
    uploadCredits: number;
    uploads?: any[];
    createdAt?: string;
}

// ============ CATEGORIES TYPES ============

export interface Subject {
    id: string;
    name: string;
    slug: string;
}

export interface Stream {
    id: string;
    name: string;
    slug: string;
    subjects: Subject[];
}

export interface SubDomain {
    id: string;
    name: string;
    slug: string;
    streams: Stream[];
}

export interface Domain {
    id: string;
    name: string;
    slug: string;
    subDomains: SubDomain[];
}

// ============ AI TYPES ============

export interface AIConfig {
    id: string;
    featureKey: string; // 'summary', 'qa', 'explanation', 'chat'
    name: string;
    enabled: boolean;
    dailyLimit: number;
    premiumOnly: boolean;
    settings?: any;
    updatedAt: string;
}

export interface AIStats {
    totalRequests: number;
    errorRate: number;
    byFeature: { feature: string; count: number }[];
}

export interface AILog {
    id: string;
    featureKey: string;
    inputSize: number;
    outputSize: number;
    success: boolean;
    errorMsg?: string;
    createdAt: string;
    user: { name: string; email: string };
}

// ============ MONETIZATION TYPES ============

export interface AdConfig {
    id: string;
    placement: string;
    name: string;
    enabled: boolean;
    adUnitId?: string;
    settings?: any;
    updatedAt: string;
}

export interface AdStats {
    totalImpressions: number;
    totalRevenue: number;
    byPlacement: { placement: string; impressions: number; revenue: number }[];
}

// ============ ANALYTICS TYPES ============

export interface GrowthMetric {
    date: string;
    count: number;
}

export interface ContentMetrics {
    topDownloads: {
        id: string;
        title: string;
        downloadCount: number;
        domain: string;
    }[];
    trendingSubjects: {
        subject: string;
        _count: { subject: number };
    }[];
}

export interface ActivityMetric {
    day: string;
    active: number;
}

// ============ API SERVICE ============

export const adminService = {
    // Dashboard
    getDashboard: (): Promise<DashboardStats> =>
        api.get<DashboardStats>('/admin/dashboard'),

    getTopReported: (limit?: number): Promise<TopReportedResource[]> =>
        api.get<TopReportedResource[]>(`/admin/dashboard/top-reported${limit ? `?limit=${limit}` : ''}`),

    // Legacy stats endpoint
    getStats: (): Promise<DashboardStats> =>
        api.get<DashboardStats>('/admin/stats'),

    // Resources
    getResources: (params: {
        page?: number;
        limit?: number;
        status?: 'all' | 'active' | 'hidden' | 'deleted';
        sortBy?: 'newest' | 'oldest' | 'downloads' | 'views' | 'reports';
        search?: string;
        category?: string;
        subject?: string;
    }): Promise<PaginatedResponse<AdminResource>> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);
        if (params.sortBy) query.append('sortBy', params.sortBy);
        if (params.search) query.append('search', params.search);
        if (params.category) query.append('category', params.category);
        if (params.subject) query.append('subject', params.subject);
        return api.get<PaginatedResponse<AdminResource>>(`/admin/resources?${query.toString()}`);
    },

    getResourceById: (id: string): Promise<ResourceWithReports> =>
        api.get<ResourceWithReports>(`/admin/resources/${id}`),

    hideResource: (id: string): Promise<{ id: string; isHidden: boolean }> =>
        api.patch<{ id: string; isHidden: boolean }>(`/admin/resources/${id}/hide`, {}),

    restoreResource: (id: string): Promise<{ id: string; isHidden: boolean; isAutoDeleted: boolean; reportCount: number }> =>
        api.patch(`/admin/resources/${id}/restore`, {}),

    archiveResource: (id: string): Promise<{ id: string; isAutoDeleted: boolean }> =>
        api.patch(`/admin/resources/${id}/archive`, {}),

    toggleResourcePrivate: (id: string): Promise<{ id: string; isHidden: boolean; status: string }> =>
        api.patch(`/admin/resources/${id}/private`, {}),

    deleteResource: (id: string): Promise<{ message: string }> =>
        api.delete<{ message: string }>(`/admin/resources/${id}`),

    // Moderation
    getModerationStats: (): Promise<ModerationStats> =>
        api.get<ModerationStats>('/admin/moderation/stats'),

    getReportedResources: (params: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<ResourceWithReports>> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        return api.get<PaginatedResponse<ResourceWithReports>>(`/admin/moderation/reported?${query.toString()}`);
    },

    // Users
    getUsers: (params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: 'all' | 'user' | 'admin' | 'premium';
        status?: 'all' | 'active' | 'suspended';
    }): Promise<PaginatedResponse<AdminUser>> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.search) query.append('search', params.search);
        if (params.role) query.append('role', params.role);
        if (params.status) query.append('status', params.status);
        return api.get<PaginatedResponse<AdminUser>>(`/admin/users?${query.toString()}`);
    },

    getUserDetails: (id: string): Promise<UserDetails> =>
        api.get<UserDetails>(`/admin/users/${id}`),

    toggleUserStatus: (id: string): Promise<{ id: string; isActive: boolean }> =>
        api.patch<{ id: string; isActive: boolean }>(`/admin/users/${id}/toggle-status`, {}),

    adjustCredits: (id: string, amount: number, type: 'daily' | 'upload'): Promise<any> =>
        api.patch(`/admin/users/${id}/credits`, { amount, type }),

    upgradeSubscription: (id: string, planId: string, durationMonths?: number): Promise<any> =>
        api.post(`/admin/users/${id}/subscription`, { planId, durationMonths }),

    // Analytics
    getGrowthMetrics: (): Promise<GrowthMetric[]> => api.get<GrowthMetric[]>('/admin/analytics/growth'),
    getContentMetrics: (): Promise<ContentMetrics> => api.get<ContentMetrics>('/admin/analytics/content'),
    getActivityMetrics: (): Promise<ActivityMetric[]> => api.get<ActivityMetric[]>('/admin/analytics/activity'),

    // Audit Logs
    getAuditLogs: (params: {
        page?: number;
        limit?: number;
        adminId?: string;
        action?: string;
        targetType?: string;
        search?: string;
    }): Promise<AuditLogResponse> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.adminId) query.append('adminId', params.adminId);
        if (params.action) query.append('action', params.action);
        if (params.targetType) query.append('targetType', params.targetType);
        if (params.search) query.append('search', params.search);
        return api.get<AuditLogResponse>(`/admin/audit?${query.toString()}`);
    },

    // Notifications
    createAnnouncement: (data: { title: string; message: string; type: string; target: string; expiresAt?: string }): Promise<Announcement> => {
        return api.post<Announcement>('/admin/notifications', data);
    },
    getAnnouncements: (activeOnly?: boolean): Promise<Announcement[]> => {
        return api.get<Announcement[]>(activeOnly ? '/admin/notifications?activeOnly=true' : '/admin/notifications');
    },
    deleteAnnouncement: (id: string): Promise<void> => {
        return api.delete(`/admin/notifications/${id}`);
    },
    toggleAnnouncementStatus: (id: string, isActive: boolean): Promise<Announcement> => {
        return api.patch<Announcement>(`/admin/notifications/${id}/status`, { isActive });
    },

    // Support
    getTickets: (filters: { status?: string; priority?: string }): Promise<SupportTicket[]> => {
        const query = new URLSearchParams(filters as any);
        return api.get<SupportTicket[]>(`/admin/support/tickets?${query.toString()}`);
    },
    getTicket: (id: string): Promise<SupportTicket> => {
        return api.get<SupportTicket>(`/admin/support/tickets/${id}`);
    },
    updateTicketStatus: (id: string, status: string): Promise<SupportTicket> => {
        return api.patch<SupportTicket>(`/admin/support/tickets/${id}/status`, { status });
    },
    replyToTicket: (id: string, message: string): Promise<TicketMessage> => {
        return api.post<TicketMessage>(`/admin/support/tickets/${id}/reply`, { message });
    },
    getFAQs: (category?: string): Promise<FAQ[]> => {
        return api.get<FAQ[]>(category ? `/admin/support/faqs?category=${category}` : '/admin/support/faqs');
    },
    createFAQ: (data: { question: string; answer: string; category: string; order?: number }): Promise<FAQ> => {
        return api.post<FAQ>('/admin/support/faqs', data);
    },
    updateFAQ: (id: string, data: Partial<FAQ>): Promise<FAQ> => {
        return api.patch<FAQ>(`/admin/support/faqs/${id}`, data);
    },
    deleteFAQ: (id: string): Promise<void> => {
        return api.delete(`/admin/support/faqs/${id}`);
    },

    // Settings
    getSettings: (category?: string): Promise<SystemSetting[]> => {
        return api.get<SystemSetting[]>(category ? `/admin/settings?category=${category}` : '/admin/settings');
    },
    updateSetting: (key: string, data: Partial<SystemSetting>): Promise<SystemSetting> => {
        return api.patch<SystemSetting>(`/admin/settings/${key}`, data);
    },
    initializeSettings: (): Promise<{ message: string }> => {
        return api.post<{ message: string }>('/admin/settings/initialize', {});
    },

    // Categories
    getCategories: (): Promise<Domain[]> =>
        api.get<Domain[]>('/admin/categories'),

    // Domain CRUD
    createDomain: (data: { name: string; slug: string }): Promise<Domain> =>
        api.post<Domain>('/admin/categories/domains', data),
    updateDomain: (id: string, data: { name?: string; slug?: string }): Promise<Domain> =>
        api.patch<Domain>(`/admin/categories/domains/${id}`, data),
    deleteDomain: (id: string): Promise<void> =>
        api.delete(`/admin/categories/domains/${id}`),

    // SubDomain CRUD
    createSubDomain: (data: { domainId: string; name: string; slug: string }): Promise<SubDomain> =>
        api.post<SubDomain>('/admin/categories/subdomains', data),
    updateSubDomain: (id: string, data: { name?: string; slug?: string }): Promise<SubDomain> =>
        api.patch<SubDomain>(`/admin/categories/subdomains/${id}`, data),
    deleteSubDomain: (id: string): Promise<void> =>
        api.delete(`/admin/categories/subdomains/${id}`),

    // Stream CRUD
    createStream: (data: { subDomainId: string; name: string; slug: string }): Promise<Stream> =>
        api.post<Stream>('/admin/categories/streams', data),
    updateStream: (id: string, data: { name?: string; slug?: string }): Promise<Stream> =>
        api.patch<Stream>(`/admin/categories/streams/${id}`, data),
    deleteStream: (id: string): Promise<void> =>
        api.delete(`/admin/categories/streams/${id}`),

    // Subject CRUD
    createSubject: (data: { streamId: string; name: string; slug: string }): Promise<Subject> =>
        api.post<Subject>('/admin/categories/subjects', data),
    updateSubject: (id: string, data: { name?: string; slug?: string }): Promise<Subject> =>
        api.patch<Subject>(`/admin/categories/subjects/${id}`, data),
    deleteSubject: (id: string): Promise<void> =>
        api.delete(`/admin/categories/subjects/${id}`),

    // AI Control
    getAIConfigs: (): Promise<AIConfig[]> =>
        api.get<AIConfig[]>('/admin/ai/configs'),
    updateAIConfig: (key: string, data: Partial<AIConfig>): Promise<AIConfig> =>
        api.patch<AIConfig>(`/admin/ai/configs/${key}`, data),
    getAIStats: (days: number = 7): Promise<AIStats> =>
        api.get<AIStats>(`/admin/ai/stats?days=${days}`),
    getAILogs: (limit: number = 20): Promise<AILog[]> =>
        api.get<AILog[]>(`/admin/ai/logs?limit=${limit}`),

    // Monetization
    getAdConfigs: (): Promise<AdConfig[]> =>
        api.get<AdConfig[]>('/admin/monetization/configs'),
    updateAdConfig: (id: string, data: Partial<AdConfig>): Promise<AdConfig> =>
        api.patch<AdConfig>(`/admin/monetization/configs/${id}`, data),
    getAdStats: (days: number = 7): Promise<AdStats> =>
        api.get<AdStats>(`/admin/monetization/stats?days=${days}`),

    // Premium
    getPlans: (): Promise<Plan[]> =>
        api.get<Plan[]>('/admin/premium/plans'),
    createPlan: (data: any): Promise<Plan> =>
        api.post<Plan>('/admin/premium/plans', data),
    updatePlan: (id: string, data: any): Promise<Plan> =>
        api.patch<Plan>(`/admin/premium/plans/${id}`, data),
    getPremiumUsers: (params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginatedResponse<PremiumUser>> => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.search) query.append('search', params.search);
        return api.get<PaginatedResponse<PremiumUser>>(`/admin/premium/users?${query.toString()}`);
    },
};

export default adminService;

