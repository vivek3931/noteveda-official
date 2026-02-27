'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Resource } from '@/types';
import { DocumentIcon, DownloadIcon, EyeIcon, BookmarkIcon, TrashIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useSaved } from '@/contexts/SavedContext';

interface ResourceCardProps {
    resource: Resource;
    index?: number;
    onDelete?: () => void;
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

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, index = 0, onDelete }) => {
    const { isAuthenticated } = useAuth();
    const { saveResource, unsaveResource, isResourceSaved } = useSaved();
    const isSaved = isResourceSaved(resource.id);

    // Use isAuthenticated from AuthContext instead of local state
    const isLoggedIn = isAuthenticated;

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

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            onDelete();
        }
    }

    return (
        <article
            className="group relative h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-200"
        >
            <Link href={`/resource/${resource.id}`} className="block">
                {/* Image/Thumbnail Area - Compact */}
                <div className={`relative h-40 flex items-center justify-center overflow-hidden ${resource.thumbnailUrl
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : getGradient(resource.id)
                    }`}>
                    {resource.thumbnailUrl ? (
                        <Image
                            src={resource.thumbnailUrl}
                            alt={resource.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-1 p-4 text-center">
                            <DocumentIcon size={32} className="text-white/80 drop-shadow-sm transition-transform duration-300" />
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest mt-1 drop-shadow-sm">
                                {resource.fileType}
                            </span>
                        </div>
                    )}

                    {/* Type Badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black bg-white/90 backdrop-blur-sm rounded shadow-sm">
                        {getResourceTypeLabel(resource.resourceType)}
                    </span>
                </div>
            </Link>

            {/* Info Section - Compact - Flex Grow to push footer down */}
            <div className="p-3 min-w-0 flex-1 flex flex-col">
                <Link href={`/resource/${resource.id}`} className="block flex-1">
                    {/* Subject */}
                    <span className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 truncate">
                        {resource.subject}
                    </span>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-3 line-clamp-2 text-ellipsis overflow-hidden transition-colors" title={resource.title}>
                        {resource.title}
                    </h3>
                </Link>

                {/* Footer Action Row */}
                <div className="flex items-center gap-2 mt-auto">
                    <Link
                        href={`/resource/${resource.id}`}
                        className="
                                    flex-1 flex items-center justify-center
                                    py-2 px-4
                                    bg-black text-white
                                    dark:bg-white dark:text-black
                                    hover:bg-gray-800 hover:text-white
                                    dark:hover:bg-gray-200 dark:hover:text-black
                                    text-xs font-semibold
                                    rounded-lg
                                    transition-colors
                                "
                    >
                        Preview
                    </Link>


                    {isLoggedIn && (
                        <button
                            onClick={handleSaveClick}
                            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                            title={isSaved ? 'Remove from saved' : 'Save resource'}
                        >
                            <BookmarkIcon size={18} filled={isSaved} />
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={handleDeleteClick}
                            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white"
                            title="Delete resource"
                        >
                            <TrashIcon size={18} />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ResourceCard;
