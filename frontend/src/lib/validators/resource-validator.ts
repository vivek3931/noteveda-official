// Resource Form Validators using Zod Discriminated Unions
// Production-ready with strict typing and edge case handling

import { z } from 'zod';

// ============ CATEGORY ENUM ============
export const ResourceCategoryEnum = z.enum(['ACADEMIC', 'ENTRANCE', 'SKILL', 'GENERAL']);
export type ResourceCategory = z.infer<typeof ResourceCategoryEnum>;

// ============ METADATA SCHEMAS ============

/**
 * Academic Resources Metadata
 * For University/College materials: Notes, Assignments, Lab Manuals
 */
export const academicMetadataSchema = z.object({
    course: z.string()
        .min(1, 'Course is required')
        .max(100, 'Course name too long')
        .transform((val) => val.trim()),
    semester: z.string().optional().transform((val) => val?.trim() || undefined),
    subject: z.string()
        .min(1, 'Subject is required')
        .max(100, 'Subject name too long')
        .transform((val) => val.trim()),
    docType: z.string()
        .min(1, 'Document type is required')
        .transform((val) => val.trim()),
    university: z.string().optional().transform((val) => val?.trim() || undefined),
});

/**
 * Entrance Exam Resources Metadata
 * For Competitive exams: GATE, JEE, NEET, CAT, UPSC
 */
export const entranceMetadataSchema = z.object({
    exam: z.string()
        .min(1, 'Exam name is required')
        .max(100, 'Exam name too long')
        .transform((val) => val.trim()),
    year: z.string()
        .optional()
        .refine((val) => !val || /^\d{4}$/.test(val), 'Year must be a 4-digit number'),
    paperType: z.string()
        .min(1, 'Paper type is required')
        .transform((val) => val.trim()),
    branch: z.string().optional().transform((val) => val?.trim() || undefined),
});

/**
 * Skill Resources Metadata
 * For Career/Learning: Programming, Design, Marketing
 */
export const skillMetadataSchema = z.object({
    topic: z.string()
        .min(1, 'Topic is required')
        .max(100, 'Topic name too long')
        .transform((val) => val.trim()),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    format: z.string().optional().transform((val) => val?.trim() || undefined),
    skillCategory: z.string().optional().transform((val) => val?.trim() || undefined),
});

/**
 * General Resources Metadata
 * For miscellaneous resources
 */
export const generalMetadataSchema = z.object({
    topic: z.string().optional().transform((val) => val?.trim() || undefined),
    description: z.string().optional().transform((val) => val?.trim() || undefined),
});

// ============ BASE SCHEMA ============
const baseFields = {
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must be less than 200 characters')
        .transform((val) => val.trim()),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be less than 2000 characters')
        .transform((val) => val.trim()),
    tags: z.string()
        .optional()
        .transform((val) => val?.trim() || undefined),
};

// ============ DISCRIMINATED UNION SCHEMAS ============

/**
 * Academic Resource Schema
 */
export const academicResourceSchema = z.object({
    ...baseFields,
    category: z.literal('ACADEMIC'),
    metadata: academicMetadataSchema,
});

/**
 * Entrance Resource Schema
 */
export const entranceResourceSchema = z.object({
    ...baseFields,
    category: z.literal('ENTRANCE'),
    metadata: entranceMetadataSchema,
});

/**
 * Skill Resource Schema
 */
export const skillResourceSchema = z.object({
    ...baseFields,
    category: z.literal('SKILL'),
    metadata: skillMetadataSchema,
});

/**
 * General Resource Schema
 */
export const generalResourceSchema = z.object({
    ...baseFields,
    category: z.literal('GENERAL'),
    metadata: generalMetadataSchema,
});

// ============ MAIN DISCRIMINATED UNION ============
/**
 * The main form schema using Zod's discriminatedUnion
 * This ensures type-safe validation based on the 'category' discriminator
 */
export const resourceFormSchema = z.discriminatedUnion('category', [
    academicResourceSchema,
    entranceResourceSchema,
    skillResourceSchema,
    generalResourceSchema,
]);

// ============ TYPE EXPORTS ============
export type ResourceFormData = z.infer<typeof resourceFormSchema>;
export type AcademicFormData = z.infer<typeof academicResourceSchema>;
export type EntranceFormData = z.infer<typeof entranceResourceSchema>;
export type SkillFormData = z.infer<typeof skillResourceSchema>;
export type GeneralFormData = z.infer<typeof generalResourceSchema>;

export type AcademicMetadata = z.infer<typeof academicMetadataSchema>;
export type EntranceMetadata = z.infer<typeof entranceMetadataSchema>;
export type SkillMetadata = z.infer<typeof skillMetadataSchema>;
export type GeneralMetadata = z.infer<typeof generalMetadataSchema>;

// ============ DEFAULT VALUES ============

/**
 * Get default metadata based on category
 * Used when switching categories to reset form state
 */
export function getDefaultMetadata(category: ResourceCategory): Record<string, unknown> {
    switch (category) {
        case 'ACADEMIC':
            return { course: '', semester: '', subject: '', docType: '', university: '' };
        case 'ENTRANCE':
            return { exam: '', year: '', paperType: '', branch: '' };
        case 'SKILL':
            return { topic: '', level: '', format: '', skillCategory: '' };
        case 'GENERAL':
        default:
            return { topic: '', description: '' };
    }
}

/**
 * Get default form values for a given category
 */
export function getDefaultFormValues(category: ResourceCategory): Partial<ResourceFormData> {
    return {
        title: '',
        description: '',
        tags: '',
        category,
        metadata: getDefaultMetadata(category) as any,
    };
}

// ============ URL FILTER SCHEMA ============
/**
 * Schema for validating URL search params
 * Used for defensive rendering of filters
 */
export const filterParamsSchema = z.object({
    category: ResourceCategoryEnum.optional(),
    search: z.string().optional(),
    sortBy: z.enum(['latest', 'popular', 'relevant']).optional().default('latest'),
    // Academic filters - only valid when category is ACADEMIC
    course: z.string().optional(),
    semester: z.string().optional(),
    subject: z.string().optional(),
    docType: z.string().optional(),
    // Entrance filters - only valid when category is ENTRANCE
    exam: z.string().optional(),
    year: z.string().optional().refine((val) => !val || /^\d{4}$/.test(val), 'Invalid year'),
    paperType: z.string().optional(),
    // Skill filters - only valid when category is SKILL
    topic: z.string().optional(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    format: z.string().optional(),
});

export type FilterParams = z.infer<typeof filterParamsSchema>;

/**
 * Validates and sanitizes URL params
 * DEFENSIVE: Ignores category-incompatible params (e.g., semester for ENTRANCE)
 */
export function sanitizeFilterParams(params: Record<string, string>): FilterParams {
    const parsed = filterParamsSchema.safeParse(params);

    if (!parsed.success) {
        // Return safe defaults on parse failure
        return { sortBy: 'latest' };
    }

    const data = parsed.data;
    const category = data.category;

    // Defensive: Remove params that don't belong to the selected category
    const sanitized: FilterParams = {
        category: data.category,
        search: data.search,
        sortBy: data.sortBy,
    };

    if (category === 'ACADEMIC') {
        sanitized.course = data.course;
        sanitized.semester = data.semester;
        sanitized.subject = data.subject;
        sanitized.docType = data.docType;
    } else if (category === 'ENTRANCE') {
        sanitized.exam = data.exam;
        sanitized.year = data.year;
        sanitized.paperType = data.paperType;
    } else if (category === 'SKILL') {
        sanitized.topic = data.topic;
        sanitized.level = data.level;
        sanitized.format = data.format;
    }
    // GENERAL has no specific filters

    return sanitized;
}

// ============ HELPER FUNCTIONS ============

/**
 * Validates partial form data based on category
 */
export function validateResourceForm(data: unknown): {
    success: boolean;
    errors?: z.ZodError;
    data?: ResourceFormData;
} {
    const result = resourceFormSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}

/**
 * Utility to capitalize first letter of each word
 * Used for normalizing user-created options
 */
export function normalizeOptionValue(value: string): string {
    return value
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Check if a filter param belongs to a category
 */
export function isValidFilterForCategory(
    param: string,
    category: ResourceCategory | undefined
): boolean {
    const academicParams = ['course', 'semester', 'subject', 'docType'];
    const entranceParams = ['exam', 'year', 'paperType'];
    const skillParams = ['topic', 'level', 'format'];

    if (!category) return false;

    switch (category) {
        case 'ACADEMIC':
            return academicParams.includes(param);
        case 'ENTRANCE':
            return entranceParams.includes(param);
        case 'SKILL':
            return skillParams.includes(param);
        case 'GENERAL':
            return false; // General has no specific filters
        default:
            return false;
    }
}
