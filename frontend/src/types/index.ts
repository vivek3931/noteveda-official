// TypeScript types for Noteveda

// User types
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    credits: number;
    dailyCredits: number;
    uploadCredits: number;
    role: 'USER' | 'ADMIN';
    subscription?: Subscription;
    createdAt: string;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
    features: string[];
    badge?: string;
    highlighted: boolean;
    cta: string;
    ctaLink: string;
    isActive: boolean;
}

export interface Subscription {
    id: string;
    planId: string;
    plan?: Plan;
    startDate: string;
    endDate: string;
    active: boolean;
}

// Resource types
export type ResourceType = 'NOTES' | 'GUIDE' | 'PYQ' | 'SOLUTION';
export type FileType = 'PDF' | 'DOCX' | 'TXT';
export type ResourceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Resource {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: FileType;
    thumbnailUrl?: string;
    domain: string;
    subDomain: string;
    stream?: string;
    subject: string;
    resourceType: ResourceType;
    tags: string[];
    status: ResourceStatus;
    pages?: number;
    fileSize?: number;
    viewCount?: number;
    author: string | {
        id: string;
        name: string;
        avatar?: string;
    };
    downloadCount: number;
    createdAt: string;
    updatedAt: string;
}

// Category types for filters
export interface Domain {
    id: string;
    name: string;
    slug: string;
    subDomains: SubDomain[];
}

export interface SubDomain {
    id: string;
    name: string;
    slug: string;
    streams?: Stream[];
}

export interface Stream {
    id: string;
    name: string;
    slug: string;
    subjects: Subject[];
}

export interface Subject {
    id: string;
    name: string;
    slug: string;
}

// Search & Filter
export interface SearchFilters {
    query?: string;
    domain?: string;
    subDomain?: string;
    stream?: string;
    subject?: string;
    resourceType?: ResourceType;
    sortBy?: 'latest' | 'popular' | 'relevant';
}

// Stats
export interface PlatformStats {
    totalResources: number;
    totalUsers: number;
    totalDownloads: number;
    categories: number;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
