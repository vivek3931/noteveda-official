'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatableSelect } from '@/components/ui/CreatableCombobox/CreatableCombobox';
import {
    resourceFormSchema,
    ResourceFormData,
    ResourceCategory,
    getDefaultFormValues,
} from '@/lib/validators/resource-validator';
import {
    CATEGORY_CONFIG,
    ACADEMIC_COURSES,
    SEMESTERS,
    ACADEMIC_DOC_TYPES,
    ENTRANCE_EXAMS,
    EXAM_PAPER_TYPES,
    SKILL_TOPICS,
    SKILL_LEVELS,
    SKILL_FORMATS,
} from '@/types/resource-types';

interface UploadFormProps {
    onSubmit: (data: ResourceFormData, file: File) => Promise<void>;
    isSubmitting?: boolean;
}

/**
 * UploadForm - Smart form with category-based conditional rendering
 * 
 * Features:
 * - Zod discriminated union validation
 * - Form reset on category switch (prevents stale data)
 * - CreatableSelect for dynamic field values
 * - Strict typed submission payload
 */
export function UploadForm({ onSubmit, isSubmitting = false }: UploadFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [createdOptions, setCreatedOptions] = useState<Record<string, string[]>>({
        courses: [],
        subjects: [],
        exams: [],
        topics: [],
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previousCategory = useRef<ResourceCategory | null>(null);

    const form = useForm<ResourceFormData>({
        resolver: zodResolver(resourceFormSchema) as any,
        mode: 'onChange',
        defaultValues: {
            title: '',
            description: '',
            tags: '',
            category: undefined,
            metadata: {},
        } as any,
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        resetField,
        reset,
        formState: { errors },
    } = form;

    // Watch the category to handle changes
    const selectedCategory = useWatch({ control, name: 'category' });

    /**
     * CRITICAL: Reset metadata fields when category changes
     * This prevents stale data from previous category bleeding into new submission
     */
    useEffect(() => {
        if (selectedCategory && previousCategory.current && selectedCategory !== previousCategory.current) {
            // Category has changed - reset all metadata fields
            const defaultValues = getDefaultFormValues(selectedCategory);

            // Reset metadata to new category defaults
            setValue('metadata', defaultValues.metadata as any, {
                shouldValidate: false,
                shouldDirty: false,
            });

            // Clear any validation errors from previous category
            resetField('metadata', { defaultValue: defaultValues.metadata as any });
        }

        previousCategory.current = selectedCategory || null;
    }, [selectedCategory, setValue, resetField]);

    // Handle category selection
    const handleCategorySelect = useCallback((category: ResourceCategory) => {
        const defaultValues = getDefaultFormValues(category);
        setValue('category', category);
        setValue('metadata', defaultValues.metadata as any);
    }, [setValue]);

    // File handling
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    }, []);

    const handleFile = useCallback((selectedFile: File) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(selectedFile.type)) {
            alert('Please upload a PDF, DOCX, or TXT file.');
            return;
        }

        if (selectedFile.size > maxSize) {
            alert('File size must be less than 50MB.');
            return;
        }

        setFile(selectedFile);
    }, []);

    const removeFile = useCallback(() => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    // Handle option creation
    const handleCreateOption = useCallback((field: string, value: string) => {
        setCreatedOptions(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), value],
        }));
    }, []);

    // Get merged options (predefined + created)
    const getMergedOptions = useCallback((field: string, baseOptions: string[]) => {
        const created = createdOptions[field] || [];
        return [...new Set([...baseOptions, ...created])];
    }, [createdOptions]);

    // Form submission
    const onFormSubmit = async (data: ResourceFormData) => {
        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        // Data is already validated and typed by Zod
        await onSubmit(data, file);
    };

    const formatFileSize = (bytes: number) =>
        bytes < 1024 ? bytes + ' B'
            : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB'
                : (bytes / (1024 * 1024)).toFixed(1) + ' MB';

    // Year options for entrance exams
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 15 }, (_, i) => String(currentYear - i));

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Category Selector - Master Switch */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    What type of resource are you uploading? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {(Object.keys(CATEGORY_CONFIG) as ResourceCategory[]).map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        const isSelected = selectedCategory === cat;
                        return (
                            <motion.button
                                key={cat}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleCategorySelect(cat)}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{config.icon}</div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {config.label}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                    {config.description}
                                </p>
                                {isSelected && (
                                    <motion.div
                                        layoutId="category-check"
                                        className="absolute top-2 right-2 w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center"
                                    >
                                        <svg className="w-3 h-3 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Conditional Form Fields */}
            <AnimatePresence mode="wait">
                {selectedCategory && (
                    <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left Column - File Upload */}
                            <div className="space-y-4">
                                {/* File Drop Zone */}
                                <motion.div
                                    whileHover={!file ? { scale: 1.01 } : {}}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative flex flex-col items-center justify-center min-h-[180px] p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-center ${dragActive
                                        ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-800'
                                        : file
                                            ? 'border-green-500 dark:border-green-400 border-solid bg-green-50 dark:bg-green-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.txt"
                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                        className="hidden"
                                        aria-label="Upload file"
                                    />

                                    {file ? (
                                        <div className="flex items-center gap-3 w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm break-all line-clamp-2">{file.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                aria-label="Remove file"
                                            >
                                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                <span className="font-semibold text-black dark:text-white">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, DOCX, or TXT (max 50MB)</p>
                                        </>
                                    )}
                                </motion.div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register('title')}
                                        type="text"
                                        placeholder="Give your resource a descriptive title"
                                        className={`input ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                                        aria-invalid={!!errors.title}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-500" role="alert">{errors.title.message}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        rows={4}
                                        placeholder="Describe what's included in this resource..."
                                        className={`input resize-y min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                                        aria-invalid={!!errors.description}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500" role="alert">{errors.description.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Category-Specific Fields */}
                            <div className="space-y-4">
                                {/* ACADEMIC FIELDS */}
                                {selectedCategory === 'ACADEMIC' && (
                                    <>
                                        <Controller
                                            name="metadata.course"
                                            control={control}
                                            render={({ field }) => (
                                                <CreatableSelect
                                                    label="Course"
                                                    required
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    options={getMergedOptions('courses', ACADEMIC_COURSES)}
                                                    placeholder="e.g., B.Tech CSE, BSc IT, MBA..."
                                                    error={(errors as any).metadata?.course?.message}
                                                    autoCapitalize
                                                    onCreateOption={(val) => handleCreateOption('courses', val)}
                                                />
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="metadata.semester"
                                                control={control}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Semester
                                                        </label>
                                                        <select
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            className="input"
                                                        >
                                                            <option value="">Select semester</option>
                                                            {SEMESTERS.map((sem) => (
                                                                <option key={sem} value={sem}>{sem}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            />

                                            <Controller
                                                name="metadata.docType"
                                                control={control}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Document Type <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            className={`input ${(errors as any).metadata?.docType ? 'border-red-500' : ''}`}
                                                        >
                                                            <option value="">Select type</option>
                                                            {ACADEMIC_DOC_TYPES.map((type) => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                        {(errors as any).metadata?.docType && (
                                                            <p className="mt-1 text-sm text-red-500">{(errors as any).metadata.docType.message}</p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        <Controller
                                            name="metadata.subject"
                                            control={control}
                                            render={({ field }) => (
                                                <CreatableSelect
                                                    label="Subject"
                                                    required
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    options={getMergedOptions('subjects', [
                                                        'Data Structures', 'Algorithms', 'Database Management', 'Operating Systems',
                                                        'Computer Networks', 'Software Engineering', 'Web Development', 'Machine Learning',
                                                        'Artificial Intelligence', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
                                                        'Economics', 'Accounting', 'Marketing', 'Human Resources',
                                                    ])}
                                                    placeholder="e.g., Data Structures, Physics..."
                                                    error={(errors as any).metadata?.subject?.message}
                                                    autoCapitalize
                                                    onCreateOption={(val) => handleCreateOption('subjects', val)}
                                                />
                                            )}
                                        />
                                    </>
                                )}

                                {/* ENTRANCE EXAM FIELDS */}
                                {selectedCategory === 'ENTRANCE' && (
                                    <>
                                        <Controller
                                            name="metadata.exam"
                                            control={control}
                                            render={({ field }) => (
                                                <CreatableSelect
                                                    label="Exam Name"
                                                    required
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    options={getMergedOptions('exams', ENTRANCE_EXAMS)}
                                                    placeholder="e.g., GATE, JEE Main, NEET..."
                                                    error={(errors as any).metadata?.exam?.message}
                                                    autoCapitalize
                                                    onCreateOption={(val) => handleCreateOption('exams', val)}
                                                />
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="metadata.year"
                                                control={control}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Year
                                                        </label>
                                                        <select
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            className="input"
                                                        >
                                                            <option value="">Select year</option>
                                                            {yearOptions.map((year) => (
                                                                <option key={year} value={year}>{year}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            />

                                            <Controller
                                                name="metadata.paperType"
                                                control={control}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Paper Type <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            className={`input ${(errors as any).metadata?.paperType ? 'border-red-500' : ''}`}
                                                        >
                                                            <option value="">Select type</option>
                                                            {EXAM_PAPER_TYPES.map((type) => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                        {(errors as any).metadata?.paperType && (
                                                            <p className="mt-1 text-sm text-red-500">{(errors as any).metadata.paperType.message}</p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        <Controller
                                            name="metadata.branch"
                                            control={control}
                                            render={({ field }) => (
                                                <CreatableSelect
                                                    label="Branch/Subject (Optional)"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    options={[
                                                        'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical',
                                                        'Physics', 'Chemistry', 'Mathematics', 'Biology',
                                                        'General Studies', 'Current Affairs', 'Reasoning', 'Quantitative Aptitude',
                                                    ]}
                                                    placeholder="e.g., Computer Science, Physics..."
                                                    autoCapitalize
                                                />
                                            )}
                                        />
                                    </>
                                )}

                                {/* SKILL FIELDS */}
                                {selectedCategory === 'SKILL' && (
                                    <>
                                        <Controller
                                            name="metadata.topic"
                                            control={control}
                                            render={({ field }) => (
                                                <CreatableSelect
                                                    label="Topic"
                                                    required
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    options={getMergedOptions('topics', SKILL_TOPICS)}
                                                    placeholder="e.g., React, Python, UI/UX Design..."
                                                    error={(errors as any).metadata?.topic?.message}
                                                    autoCapitalize
                                                    onCreateOption={(val) => handleCreateOption('topics', val)}
                                                />
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="metadata.level"
                                                control={control}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Level <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            className={`input ${(errors as any).metadata?.level ? 'border-red-500' : ''}`}
                                                        >
                                                            <option value="">Select level</option>
                                                            {SKILL_LEVELS.map((level) => (
                                                                <option key={level} value={level}>{level}</option>
                                                            ))}
                                                        </select>
                                                        {(errors as any).metadata?.level && (
                                                            <p className="mt-1 text-sm text-red-500">{(errors as any).metadata.level.message}</p>
                                                        )}
                                                    </div>
                                                )}
                                            />

                                            <Controller
                                                name="metadata.format"
                                                control={control}
                                                render={({ field }) => (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Format
                                                        </label>
                                                        <select
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            className="input"
                                                        >
                                                            <option value="">Select format</option>
                                                            {SKILL_FORMATS.map((format) => (
                                                                <option key={format} value={format}>{format}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* GENERAL FIELDS */}
                                {selectedCategory === 'GENERAL' && (
                                    <>
                                        <Controller
                                            name="metadata.topic"
                                            control={control}
                                            render={({ field }) => (
                                                <CreatableSelect
                                                    label="Topic (Optional)"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    options={[
                                                        'General Knowledge', 'Life Skills', 'Personal Development',
                                                        'Health & Wellness', 'Finance', 'Productivity',
                                                        'Communication', 'Language Learning',
                                                    ]}
                                                    placeholder="e.g., Personal Development..."
                                                    autoCapitalize
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="metadata.description"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        Additional Details
                                                    </label>
                                                    <textarea
                                                        value={field.value || ''}
                                                        onChange={field.onChange}
                                                        rows={3}
                                                        placeholder="Any additional details about this resource..."
                                                        className="input resize-y min-h-[80px]"
                                                    />
                                                </div>
                                            )}
                                        />
                                    </>
                                )}

                                {/* Tags - Common for all */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Tags
                                    </label>
                                    <input
                                        {...register('tags')}
                                        type="text"
                                        placeholder="handwritten, important, exam-prep (comma separated)"
                                        className="input"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Add tags to help others find your resource</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={!file || isSubmitting}
                            whileHover={file && !isSubmitting ? { scale: 1.01, y: -1 } : {}}
                            whileTap={file && !isSubmitting ? { scale: 0.99 } : {}}
                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Uploading...
                                </span>
                            ) : (
                                'Submit for Review'
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Placeholder when no category selected */}
            {!selectedCategory && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="font-medium">Select a category above to get started</p>
                    <p className="text-sm mt-1">Choose the type of resource you want to upload</p>
                </div>
            )}
        </form>
    );
}

export default UploadForm;
