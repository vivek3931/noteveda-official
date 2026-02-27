'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Resource } from '@/types';
import { DocumentIcon, DownloadIcon, EyeIcon, BookmarkIcon, CalendarIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useSaved } from '@/contexts/SavedContext';

interface ResourceListItemProps {
    resource: Resource;
    index?: number;
}

const GRADIENTS = [
    'bg-gradient-to-br from-rose-400 to-orange-300',
    'bg-gradient-to-br from-violet-400 to-fuchsia-300',
    'bg-gradient-to-br from-cyan-400 to-blue-300',
    'bg-gradient-to-br from-emerald-400 to-teal-300',
    'bg-gradient-to-br from-amber-400 to-orange-300',
    'bg-gradient-to-br from-indigo-400 to-purple-300',
    'bg-gradient-to-br from-pink-400 to-rose-300',
    'bg-gradient-to-br from-blue-400 to-indigo-300',
];

const getGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
};

const ResourceListItem: React.FC<ResourceListItemProps> = ({ resource, index = 0 }) => {
    const { isAuthenticated } = useAuth();
    const { saveResource, unsaveResource, isResourceSaved } = useSaved();
    const isSaved = isResourceSaved(resource.id);
    const isLoggedIn = isAuthenticated;

    const formatNumber = (num: number): string => {
        if (num === undefined || num === null) return '0';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    // Format date roughly
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    const getResourceTypeLabel = (type: string): string => {
        const labels: Record<string, string> = { NOTES: 'Notes', GUIDE: 'Guide', PYQ: 'PYQ', SOLUTION: 'Solution' };
        return labels[type] || type;
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSaved) {
            unsaveResource(resource.id);
        } else {
            saveResource(resource);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex flex-row gap-3 md:gap-6 p-2.5 md:p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-black/20 transition-all duration-300"
        >
            {/* Save Button */}
            {isLoggedIn && (
                <button
                    onClick={handleSaveClick}
                    className={`absolute top-2 right-2 md:top-4 md:right-4 z-10 p-1.5 md:p-2 rounded-full transition-all duration-200 ${isSaved
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white backdrop-blur-sm'
                        }`}
                    title={isSaved ? 'Remove from saved' : 'Save resource'}
                >
                    <BookmarkIcon size={16} className="md:w-[18px] md:h-[18px]" filled={isSaved} />
                </button>
            )}

            <Link href={`/resource/${resource.id}`} className="block relative flex-shrink-0 w-20 sm:w-36 md:w-56 group-hover:opacity-95 transition-opacity">
                {/* Image/Thumbnail Area */}
                <div className={`relative w-full aspect-square sm:aspect-[4/3] md:aspect-[16/10] rounded-xl overflow-hidden shadow-sm ${resource.thumbnailUrl
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : getGradient(resource.id)
                    }`}>
                    {resource.thumbnailUrl ? (
                        <Image
                            src={resource.thumbnailUrl}
                            alt={resource.title}
                            fill
                            sizes="(max-width: 768px) 100px, 300px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full p-2 text-center">
                            <DocumentIcon size={18} className="md:w-10 md:h-10 text-white/80 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                            <span className="hidden sm:block text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-widest mt-2 drop-shadow-sm">
                                {resource.fileType}
                            </span>
                        </div>
                    )}

                    {/* Type Badge - Simplified on mobile */}
                    <div className="absolute top-1 left-1 md:top-3 md:left-3 px-1.5 py-0.5 md:px-2.5 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-wide text-black bg-white/95 backdrop-blur-sm rounded md:rounded-md shadow-sm">
                        {getResourceTypeLabel(resource.resourceType)}
                    </div>
                </div>
            </Link>

            {/* Info Section */}
            <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-1 md:mb-2 pr-6">
                        <span className="text-[9px] md:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 md:px-2 rounded-full uppercase tracking-wide truncate">
                            {resource.subject}
                        </span>
                        {resource.createdAt && (
                            <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 block" />
                                {formatDate(resource.createdAt)}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <Link href={`/resource/${resource.id}`} className="block group/title">
                        <h3 className="text-base md:text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1 group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400 transition-colors line-clamp-2">
                            {resource.title}
                        </h3>
                    </Link>

                    {/* Description - HIDDEN on Mobile */}
                    <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 line-clamp-2 md:line-clamp-2 mb-4 leading-relaxed">
                        {resource.description || "Explore this comprehensive resource to enhance your understanding. Contains detailed notes and examples."}
                    </p>
                </div>

                {/* Footer Stats Row */}
                <div className="flex items-center justify-between mt-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {resource.author?.avatar ? (
                                <Image
                                    src={resource.author.avatar}
                                    alt={resource.author.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                    {resource.author?.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {resource.author?.name || 'Anonymous'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5" title="Predicted Views">
                            <EyeIcon size={14} className="text-gray-400" />
                            {formatNumber(resource.downloadCount * 3)}
                        </span>
                        <span className="flex items-center gap-1.5" title="Downloads">
                            <DownloadIcon size={14} className="text-gray-400" />
                            {formatNumber(resource.downloadCount)}
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

export default ResourceListItem;
