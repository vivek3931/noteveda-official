'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkIcon, ShareIcon, DownloadIcon, CloseIcon } from '@/components/icons';
import { Resource } from '@/types';

interface ResourceDetailsProps {
    resource: Resource;
    numPages: number;
    isSaved: boolean;
    onSave: () => void;
    onShare: () => void;
    onDownload: () => void;
    isDownloading: boolean;
    downloadSuccess: boolean;
    userCredits: number;
    showMobileDetails: boolean;
    setShowMobileDetails: (show: boolean) => void;
    onClose?: () => void;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
});

const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ResourceDetails: React.FC<ResourceDetailsProps> = ({
    resource,
    numPages,
    isSaved,
    onSave,
    onShare,
    onDownload,
    isDownloading,
    downloadSuccess,
    userCredits,
    onClose
}) => {
    return (
        <div className="h-full bg-white dark:bg-gray-900 overflow-y-auto custom-scrollbar flex flex-col">
            {/* Mobile Header (Only shown if onClose is provided, implying Drawer/Mobile context) */}
            {onClose && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 lg:hidden">
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>
            )}

            {/* Main Content (Unified for Mobile & Desktop) */}
            <div className="p-6 space-y-6 flex-1">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">{resource.subject} • {resource.domain}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{resource.description}</p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">
                        {resource.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <span className="block font-medium text-gray-900 dark:text-white text-sm">{resource.author?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">Contributor</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    {[
                        { label: 'Size', value: formatFileSize(resource.fileSize || 0) },
                        { label: 'Pages', value: numPages || '—' },
                        { label: 'Views', value: (resource.viewCount || 0).toLocaleString() },
                        { label: 'Downloads', value: (resource.downloadCount || 0).toLocaleString() },
                        { label: 'Date', value: formatDate(resource.createdAt) }, // Added Date here since removed from legacy mobile view
                    ].map((meta, i) => (
                        <div key={i}>
                            <span className="block text-[10px] text-gray-400 uppercase">{meta.label}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{meta.value}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button onClick={onSave} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-medium text-sm transition-colors ${isSaved ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}>
                        <BookmarkIcon size={16} filled={isSaved} />
                        {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <button onClick={onShare} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <ShareIcon size={16} />
                        Share
                    </button>
                </div>

                {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {resource.tags.slice(0, 8).map((tag, i) => (
                            <Link key={i} href={`/search?q=${tag}`} className="px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Download Actions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Your Credits</span>
                        <span className="font-bold text-gray-900 dark:text-white">{userCredits}</span>
                    </div>
                    <motion.button
                        onClick={onDownload}
                        disabled={isDownloading || downloadSuccess}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg disabled:opacity-50 shadow-sm"
                    >
                        <DownloadIcon size={18} />
                        {isDownloading ? 'Downloading...' : downloadSuccess ? 'Downloaded!' : 'Download (1 Credit)'}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};
