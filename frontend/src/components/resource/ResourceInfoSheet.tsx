'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    CloseIcon,
    BookmarkIcon,
    ShareIcon,
    DownloadIcon,
    DocumentIcon,
    CalendarIcon,
    TagIcon,
    AlertTriangleIcon
} from '@/components/icons';
import { Resource } from '@/types';

interface ResourceInfoSheetProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Resource;
    pageCount: number;
    isSaved: boolean;
    isDownloading: boolean;
    onSave: () => void;
    onShare: () => void;
    onDownload: () => void;
    onReport?: () => void;
    relatedResources?: Resource[];
    activeTab?: 'info' | 'related' | 'saved';
    variant?: 'modal' | 'sidebar';
    isLoading?: boolean;
}

// ── Metadata chip ────────────────────────────────────────────────────────────

function MetaChip({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
        green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
        amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    };

    return (
        <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.blue}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
            </div>
        </div>
    );
}

// ── Resource card for related/saved ──────────────────────────────────────────

function ResourceCard({ resource, isActive, variant }: {
    resource: Resource;
    isActive?: boolean;
    variant: 'related' | 'saved';
}) {
    return (
        <Link
            href={`/resource/${resource.id}`}
            className={`
                flex items-center gap-3 p-2.5 rounded-xl transition-all group
                ${isActive
                    ? 'bg-violet-50 dark:bg-violet-900/15 border border-violet-200 dark:border-violet-800/50'
                    : 'bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }
            `}
        >
            {/* Thumbnail */}
            <div className={`w-10 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${isActive ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                {resource.thumbnailUrl ? (
                    <Image src={resource.thumbnailUrl} alt={resource.title} width={40} height={48} className="w-full h-full object-cover" />
                ) : (
                    <DocumentIcon size={14} className="text-gray-400" />
                )}
            </div>

            {/* Meta */}
            <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate transition-colors ${isActive
                    ? 'text-violet-700 dark:text-violet-300'
                    : 'text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400'
                    }`}>
                    {resource.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isActive ? 'Current' : resource.subject || resource.domain || 'Resource'}
                </p>
            </div>

            {/* Bookmark indicator for saved tab */}
            {variant === 'saved' && (
                <BookmarkIcon size={14} filled className={isActive ? 'text-violet-500' : 'text-gray-300 dark:text-gray-600'} />
            )}
        </Link>
    );
}


// ─── Main Component ──────────────────────────────────────────────────────────

export function ResourceInfoSheet({
    isOpen,
    onClose,
    resource,
    pageCount,
    isSaved,
    isDownloading,
    onSave,
    onShare,
    onDownload,
    onReport,
    relatedResources = [],
    activeTab = 'info',
    variant = 'modal',
    isLoading = false,
}: ResourceInfoSheetProps) {

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Lock body scroll when open (ONLY for modal on actual mobile screens)
    // Note: This component is always mounted on desktop too (CSS-hidden via lg:hidden),
    // so we must check viewport width to avoid triggering scroll lock on desktop.
    useEffect(() => {
        if (variant !== 'modal') return;
        const isMobileViewport = window.innerWidth < 1024;
        if (!isMobileViewport) return;

        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        return () => {
            if (document.body.style.position === 'fixed') {
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.overflow = '';
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        };
    }, [isOpen, variant]);


    // ── Content Renderer ──

    const renderContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">

            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 ${variant === 'modal' ? 'pt-0' : ''}`}>
                {variant === 'modal' && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                )}
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {activeTab === 'info' ? 'About' :
                        activeTab === 'related' ? 'Related' :
                            'Saved'}
                </h2>
                <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                    <CloseIcon size={16} />
                </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">

                {/* ── INFO TAB ── */}
                {activeTab === 'info' && (
                    <>
                        {isLoading ? (
                            <div className="space-y-5 animate-pulse">
                                <div className="space-y-2.5">
                                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                                    <div className="h-3.5 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                                    <div className="h-3.5 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Title & Description */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-1.5">
                                        {resource.title}
                                    </h3>
                                    {resource.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {resource.description}
                                        </p>
                                    )}
                                </div>

                                {/* Metadata Chips Grid */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <MetaChip
                                        icon={<DocumentIcon size={16} />}
                                        label="Pages"
                                        value={pageCount || '—'}
                                        color="blue"
                                    />
                                    <MetaChip
                                        icon={<TagIcon size={16} />}
                                        label="Type"
                                        value={resource.resourceType?.replace(/_/g, ' ').toLowerCase() || '—'}
                                        color="green"
                                    />
                                    <MetaChip
                                        icon={<BookmarkIcon size={16} />}
                                        label="Subject"
                                        value={resource.subject || '—'}
                                        color="purple"
                                    />
                                    <MetaChip
                                        icon={<CalendarIcon size={16} />}
                                        label="Uploaded"
                                        value={formatDate(resource.createdAt) || '—'}
                                        color="amber"
                                    />
                                </div>

                                {/* Domain */}
                                {resource.domain && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Domain</span>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{resource.domain}</span>
                                    </div>
                                )}

                                {/* Tags */}
                                {resource.tags && resource.tags.length > 0 && (
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tags</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {resource.tags.map((tag: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}


                {/* ── RELATED TAB ── */}
                {activeTab === 'related' && (
                    <div>
                        {isLoading ? (
                            <div className="space-y-2.5 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3 p-2.5">
                                        <div className="w-10 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : relatedResources.length > 0 ? (
                            <div className="space-y-2">
                                {relatedResources.map((r) => (
                                    <ResourceCard key={r.id} resource={r} variant="related" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                <DocumentIcon className="mx-auto mb-2 opacity-40" size={28} />
                                <p className="text-sm font-medium">No related resources</p>
                                <p className="text-xs text-gray-400 mt-1">We'll find matches as more content is added</p>
                            </div>
                        )}
                    </div>
                )}


                {/* ── SAVED TAB ── */}
                {activeTab === 'saved' && (
                    <div className="space-y-3">
                        {/* Status banner */}
                        <div className={`p-3 rounded-xl text-center text-sm ${isSaved
                            ? 'bg-violet-50 dark:bg-violet-900/15 text-violet-600 dark:text-violet-400'
                            : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400'
                            }`}>
                            {isSaved ? '✓ This resource is saved' : 'Save this resource to your library'}
                        </div>

                        {relatedResources && relatedResources.length > 0 ? (
                            <div className="space-y-2">
                                {relatedResources.map((r) => (
                                    <ResourceCard
                                        key={r.id}
                                        resource={r}
                                        isActive={r.id === resource.id}
                                        variant="saved"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
                                    <BookmarkIcon />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No saved resources</p>
                                <p className="text-xs text-gray-400 mt-1">Bookmark items to access them here</p>
                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* Footer Actions */}
            <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm pb-safe">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={onSave}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors ${isSaved
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <BookmarkIcon size={14} filled={isSaved} />
                        {isSaved ? 'Saved' : 'Save'}
                    </button>

                    <button
                        onClick={onShare}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
                    >
                        <ShareIcon size={14} />
                        Share
                    </button>

                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <DownloadIcon size={14} />
                        )}
                        Download
                    </button>
                </div>

                {/* Report Link */}
                <button
                    onClick={onReport}
                    className="w-full mt-2.5 text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1"
                >
                    <AlertTriangleIcon size={11} />
                    Report an issue
                </button>
            </div>
        </div>
    );

    // Render as Sidebar (No Overlay)
    if (variant === 'sidebar') {
        return renderContent();
    }

    // Render as Modal (Slide-up Sheet)
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[101] bg-white dark:bg-gray-900 rounded-t-2xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {renderContent()}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
