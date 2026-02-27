// Types for FilterSidebar - backward compatibility export
import { ResourceCategory } from '@/types/resource-types';

export interface FilterState {
    category: ResourceCategory | '';
    search: string;
    // Academic
    course: string;
    semester: string;
    subject: string;
    docType: string;
    // Entrance
    exam: string;
    year: string;
    paperType: string;
    // Skill
    topic: string;
    level: string;
    format: string;
    // Sort
    sortBy: 'latest' | 'popular' | 'relevant';
}
