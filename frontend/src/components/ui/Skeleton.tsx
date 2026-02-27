'use client';

import React from 'react';

/**
 * Base skeleton primitives for building section-specific loaders
 * All components use consistent pulse animation and match final layout dimensions
 */

// Base skeleton with pulse animation
interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
    <div
        className={`bg-gray-200 animate-pulse rounded ${className}`}
        style={style}
        aria-hidden="true"
    />
);

// Text line skeleton
interface SkeletonTextProps {
    width?: string | number;
    height?: number;
    className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
    width = '100%',
    height = 16,
    className = ''
}) => (
    <Skeleton
        className={`rounded ${className}`}
        style={{ width, height }}
    />
);

// Circle skeleton (for avatars)
interface SkeletonCircleProps {
    size?: number;
    className?: string;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
    size = 40,
    className = ''
}) => (
    <Skeleton
        className={`rounded-full flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
    />
);

// Button skeleton
interface SkeletonButtonProps {
    width?: string | number;
    height?: number;
    className?: string;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
    width = 100,
    height = 40,
    className = ''
}) => (
    <Skeleton
        className={`rounded-lg ${className}`}
        style={{ width, height }}
    />
);

// Image/Card thumbnail skeleton
interface SkeletonImageProps {
    width?: string | number;
    height?: string | number;
    className?: string;
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
    width = '100%',
    height = 160,
    className = ''
}) => (
    <Skeleton
        className={`rounded-lg ${className}`}
        style={{ width, height }}
    />
);

// Badge/Tag skeleton
export const SkeletonBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Skeleton
        className={`rounded-full ${className}`}
        style={{ width: 60, height: 24 }}
    />
);

// ============================================
// SECTION-SPECIFIC SKELETON COMPONENTS
// These match the exact layout of their real counterparts
// ============================================

// Resource Card Skeleton - matches ResourceCard component
export const ResourceCardSkeleton: React.FC = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Thumbnail area */}
        <div className="h-32 bg-gray-100 animate-pulse" />
        {/* Info section */}
        <div className="p-3">
            <SkeletonText width={60} height={10} className="mb-2" />
            <SkeletonText width="90%" height={14} className="mb-1" />
            <SkeletonText width="70%" height={14} className="mb-3" />
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex gap-3">
                    <SkeletonText width={40} height={12} />
                    <SkeletonText width={40} height={12} />
                </div>
                <SkeletonCircle size={20} />
            </div>
        </div>
    </div>
);

// Resource Grid Skeleton - for browse/featured sections
interface ResourceGridSkeletonProps {
    count?: number;
    columns?: string;
}

export const ResourceGridSkeleton: React.FC<ResourceGridSkeletonProps> = ({
    count = 6,
    columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'
}) => (
    <div className={`grid ${columns} gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
            <ResourceCardSkeleton key={i} />
        ))}
    </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
    <div className="flex flex-col items-center py-8 px-6">
        <SkeletonCircle size={48} className="mb-3" />
        <SkeletonText width={80} height={32} className="mb-2" />
        <SkeletonText width={60} height={14} />
    </div>
);

// Stats Section Skeleton
export const StatsSectionSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
        ))}
    </div>
);

// Category Card Skeleton
export const CategoryCardSkeleton: React.FC = () => (
    <div className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl">
        <div className="w-14 h-14 rounded-xl bg-gray-100 animate-pulse mb-3" />
        <SkeletonText width={80} height={16} className="mb-1" />
        <SkeletonText width={50} height={12} />
    </div>
);

// Categories Section Skeleton
export const CategoriesSectionSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
        ))}
    </div>
);

// Pricing Card Skeleton
export const PricingCardSkeleton: React.FC = () => (
    <div className="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl">
        <SkeletonText width={100} height={24} className="mb-2" />
        <SkeletonText width={80} height={14} className="mb-6" />
        <SkeletonText width={120} height={40} className="mb-6" />
        <div className="flex flex-col gap-3 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <SkeletonCircle size={16} />
                    <SkeletonText width="80%" height={14} />
                </div>
            ))}
        </div>
        <SkeletonButton width="100%" height={48} />
    </div>
);

// Profile Header Skeleton
export const ProfileHeaderSkeleton: React.FC = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center gap-5">
            <SkeletonCircle size={64} />
            <div>
                <SkeletonText width={160} height={24} className="mb-2" />
                <SkeletonText width={200} height={14} className="mb-1" />
                <SkeletonText width={120} height={12} />
            </div>
        </div>
        <SkeletonButton width={100} height={40} />
    </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
    <tr className="border-t border-gray-100">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="py-4 px-4">
                <SkeletonText width={i === 0 ? '80%' : '60%'} height={14} />
            </td>
        ))}
    </tr>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 5
}) => (
    <table className="w-full">
        <thead>
            <tr>
                {Array.from({ length: columns }).map((_, i) => (
                    <th key={i} className="pb-4 px-4 text-left">
                        <SkeletonText width={60} height={12} />
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns} />
            ))}
        </tbody>
    </table>
);

// Sidebar Filter Skeleton
export const FilterSkeleton: React.FC = () => (
    <div className="mb-6 pb-6 border-b border-gray-200">
        <SkeletonText width={80} height={14} className="mb-3" />
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonButton key={i} width={70} height={36} />
            ))}
        </div>
    </div>
);

// PDF Page Skeleton - Single page placeholder
export const PDFPageSkeleton: React.FC = () => (
    <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '8.5/11' }}>
            <div className="p-8 space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-100 dark:bg-gray-850 rounded w-1/2 mx-auto" />
                <div className="h-8" />
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                </div>
            </div>
        </div>
    </div>
);

// Resource Viewer Skeleton - Exact match for ResourceWorkspace layout
export const ResourceViewerSkeleton: React.FC = () => (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-950 flex font-sans relative">
        {/* Left Stick Sidebar Skeleton */}
        <div className="hidden lg:flex shrink-0 z-40 sticky top-16 h-[calc(100vh-64px)]">
            <div className="flex h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                <div className="w-[72px] flex flex-col items-center py-4 h-full">
                    {/* Sidebar Icon */}
                    <div className="mb-8">
                        <SkeletonButton width={40} height={40} className="rounded-xl" />
                    </div>
                    {/* Icons */}
                    <div className="flex-1 flex flex-col gap-4 w-full px-2">
                        <SkeletonButton width="100%" height={56} className="rounded-xl" />
                        <SkeletonButton width="100%" height={56} className="rounded-xl" />
                        <SkeletonButton width="100%" height={56} className="rounded-xl" />
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative bg-gray-50 dark:bg-gray-950">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 flex-none h-16">
                <div className="h-full px-4 md:px-6 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4 flex-1">
                        <SkeletonCircle size={36} /> {/* Back button */}
                        <SkeletonText width={200} height={20} /> {/* Title */}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                            <SkeletonButton width={40} height={40} className="rounded-full" />
                            <div className="w-px h-4 bg-gray-300 mx-0.5" />
                            <SkeletonButton width={40} height={40} className="rounded-full" />
                            <div className="w-px h-4 bg-gray-300 mx-0.5" />
                            <SkeletonButton width={100} height={40} className="rounded-full" />
                        </div>
                        <SkeletonButton width={40} height={40} className="rounded-full ml-2" />
                    </div>
                </div>
            </div>

            {/* PDF Viewer Skeleton */}
            <div className="flex-1 relative pb-10 pt-4 md:pt-8 px-1 md:px-4">
                <PDFPageSkeleton />
            </div>
        </main>
    </div>
);

export default {
    Skeleton,
    SkeletonText,
    SkeletonCircle,
    SkeletonButton,
    SkeletonImage,
    SkeletonBadge,
    ResourceCardSkeleton,
    ResourceGridSkeleton,
    StatsCardSkeleton,
    StatsSectionSkeleton,
    CategoryCardSkeleton,
    CategoriesSectionSkeleton,
    PricingCardSkeleton,
    ProfileHeaderSkeleton,
    TableRowSkeleton,
    TableSkeleton,
    FilterSkeleton,
    ResourceViewerSkeleton,
    PDFPageSkeleton,
};
