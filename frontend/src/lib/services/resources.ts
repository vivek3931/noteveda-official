// Resources API Service
import api from '../api';
import { Resource, PaginatedResponse } from '@/types';

export interface ResourceQueryParams {
    page?: number;
    limit?: number;
    domain?: string;
    subDomain?: string;
    stream?: string;
    subject?: string;
    resourceType?: string;
    search?: string;
    sortBy?: 'latest' | 'popular' | 'relevant';
    category?: string;
}

export const resourcesService = {
    // Get paginated list of resources with filters
    getResources: (params: ResourceQueryParams = {}): Promise<PaginatedResponse<Resource>> => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        return api.get<PaginatedResponse<Resource>>(`/resources${queryString ? `?${queryString}` : ''}`);
    },

    // Get featured resources for homepage
    getFeatured: (limit: number = 6): Promise<Resource[]> =>
        api.get<Resource[]>(`/resources/featured?limit=${limit}`),

    // Get trending resources
    getTrending: (limit: number = 6): Promise<Resource[]> =>
        api.get<Resource[]>(`/resources/trending?limit=${limit}`),

    // Get single resource by ID
    getResource: (id: string): Promise<Resource> =>
        api.get<Resource>(`/resources/${id}`),

    // Get current user's uploads
    getUserUploads: (): Promise<Resource[]> =>
        api.get<Resource[]>('/resources/user/uploads'),

    // Upload file to get Cloudinary URL
    uploadFile: async (file: File): Promise<{ url: string; publicId: string; format: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/uploads', formData);
    },

    // Create a new resource
    createResource: (data: {
        title: string;
        description: string;
        fileUrl: string;
        fileHash: string;
        fileSize: number;
        fileType: string;
        thumbnailUrl?: string;
        domain: string;
        subDomain: string;
        stream?: string;
        subject: string;
        resourceType: string;
        tags?: string[];
        // New polymorphic fields
        category?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Resource> =>
        api.post<Resource>('/resources', data),

    // Delete a resource (user must be the author)
    deleteResource: (id: string): Promise<{ message: string }> =>
        api.delete<{ message: string }>(`/resources/${id}`),
};

export default resourcesService;

