'use client';

import React, { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResourceCategory,
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
import { sanitizeFilterParams, isValidFilterForCategory } from '@/lib/validators/resource-validator';

/**
 * FilterSidebar - URL-Synced Dynamic Filter Component
 * 
 * KEY FEATURES:
 * - Uses useSearchParams as source of truth (NOT useState)
 * - Defensive rendering: ignores invalid params for selected category
 * - URL is shareable: mysite.com/resources?category=ACADEMIC&semester=Sem%205
 * - Category-specific filters appear/disappear based on selection
 */
export function FilterSidebar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    /**
     * Parse and sanitize URL params
     * DEFENSIVE: Invalid params for the selected category are ignored
     */
    const filters = useMemo(() => {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return sanitizeFilterParams(params);
    }, [searchParams]);

    /**
     * Update URL with new filter value
     * Removes category-incompatible params when category changes
     */
    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === 'category') {
            // Category change: clear all category-specific params
            const paramsToRemove = [
                'course', 'semester', 'subject', 'docType',
                'exam', 'year', 'paperType',
                'topic', 'level', 'format',
            ];
            paramsToRemove.forEach(p => params.delete(p));
        }

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Remove default sortBy from URL
        if (params.get('sortBy') === 'latest') {
            params.delete('sortBy');
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    /**
     * Clear all filters
     */
    const clearFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.category ||
            filters.course ||
            filters.semester ||
            filters.subject ||
            filters.docType ||
            filters.exam ||
            filters.year ||
            filters.paperType ||
            filters.topic ||
            filters.level ||
            filters.format
        );
    }, [filters]);

    // Year options
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 15 }, (_, i) => String(currentYear - i));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Category Filter - Always Visible */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Category
                </label>
                <div className="flex flex-col gap-2">
                    {(Object.keys(CATEGORY_CONFIG) as ResourceCategory[]).map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        const isSelected = filters.category === cat;
                        return (
                            <motion.button
                                key={cat}
                                type="button"
                                whileTap={{ scale: 0.98 }}
                                onClick={() => updateFilter('category', isSelected ? '' : cat)}
                                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg border transition-all ${isSelected
                                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                    }`}
                            >
                                <span className="text-lg">{config.icon}</span>
                                <span className="font-medium">{config.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ACADEMIC FILTERS - Only show when category is ACADEMIC */}
            <AnimatePresence mode="wait">
                {filters.category === 'ACADEMIC' && (
                    <motion.div
                        key="academic-filters"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 pb-6 border-b border-gray-200 dark:border-gray-800"
                    >
                        {/* Course */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Course
                            </label>
                            <select
                                value={filters.course || ''}
                                onChange={(e) => updateFilter('course', e.target.value)}
                                className="input text-sm py-2"
                            >
                                <option value="">All Courses</option>
                                {ACADEMIC_COURSES.map((course) => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>

                        {/* Semester - Chip style */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Semester
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SEMESTERS.slice(0, 8).map((sem) => {
                                    const isActive = filters.semester === sem;
                                    return (
                                        <button
                                            key={sem}
                                            type="button"
                                            onClick={() => updateFilter('semester', isActive ? '' : sem)}
                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${isActive
                                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {sem}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Document Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Document Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ACADEMIC_DOC_TYPES.map((type) => {
                                    const isActive = filters.docType === type;
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => updateFilter('docType', isActive ? '' : type)}
                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${isActive
                                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ENTRANCE FILTERS - Only show when category is ENTRANCE */}
            <AnimatePresence mode="wait">
                {filters.category === 'ENTRANCE' && (
                    <motion.div
                        key="entrance-filters"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 pb-6 border-b border-gray-200 dark:border-gray-800"
                    >
                        {/* Exam */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Exam
                            </label>
                            <select
                                value={filters.exam || ''}
                                onChange={(e) => updateFilter('exam', e.target.value)}
                                className="input text-sm py-2"
                            >
                                <option value="">All Exams</option>
                                {ENTRANCE_EXAMS.map((exam) => (
                                    <option key={exam} value={exam}>{exam}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Year
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {yearOptions.slice(0, 6).map((year) => {
                                    const isActive = filters.year === year;
                                    return (
                                        <button
                                            key={year}
                                            type="button"
                                            onClick={() => updateFilter('year', isActive ? '' : year)}
                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${isActive
                                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Paper Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Paper Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {EXAM_PAPER_TYPES.map((type) => {
                                    const isActive = filters.paperType === type;
                                    const displayText = type.replace(' (Previous Year Questions)', '');
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => updateFilter('paperType', isActive ? '' : type)}
                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${isActive
                                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {displayText}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SKILL FILTERS - Only show when category is SKILL */}
            <AnimatePresence mode="wait">
                {filters.category === 'SKILL' && (
                    <motion.div
                        key="skill-filters"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 pb-6 border-b border-gray-200 dark:border-gray-800"
                    >
                        {/* Topic */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Topic
                            </label>
                            <select
                                value={filters.topic || ''}
                                onChange={(e) => updateFilter('topic', e.target.value)}
                                className="input text-sm py-2"
                            >
                                <option value="">All Topics</option>
                                {SKILL_TOPICS.map((topic) => (
                                    <option key={topic} value={topic}>{topic}</option>
                                ))}
                            </select>
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Level
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SKILL_LEVELS.map((level) => {
                                    const isActive = filters.level === level;
                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => updateFilter('level', isActive ? '' : level)}
                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${isActive
                                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Format */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Format
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SKILL_FORMATS.map((format) => {
                                    const isActive = filters.format === format;
                                    return (
                                        <button
                                            key={format}
                                            type="button"
                                            onClick={() => updateFilter('format', isActive ? '' : format)}
                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${isActive
                                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {format}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info when GENERAL is selected */}
            {filters.category === 'GENERAL' && (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    General resources have no specific filters.
                </div>
            )}
        </div>
    );
}

// Re-export for backward compatibility
export type { FilterState } from './FilterSidebar.types';
export default FilterSidebar;
