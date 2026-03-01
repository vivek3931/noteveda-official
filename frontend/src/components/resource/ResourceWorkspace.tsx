'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePDFEngineStore } from '@/lib/pdf-engine/PDFEngineStore';
import { Resource } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

import { ResourceInfoSheet } from './ResourceInfoSheet';
import { AIChatSheet } from './AIChatSheet';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useSaved } from '@/contexts/SavedContext';
import { PDFPageSkeleton } from '@/components/ui/Skeleton';

// ─── Icons (inline SVGs for zero-dependency) ─────────────────────────────────

const ArrowLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const ShareIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const RelatedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const SidebarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
);

const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);


// ─── Animation Config ────────────────────────────────────────────────────────

const SIDEBAR_RAIL_WIDTH = 56;

const slideIn = {
    initial: { x: -SIDEBAR_RAIL_WIDTH, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -SIDEBAR_RAIL_WIDTH, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' as const },
};

const panelSlide = {
    initial: { x: -340, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -340, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeOut' as const },
};

const chatSlide = {
    initial: { x: 380, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 380, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeOut' as const },
};


// ─── Types ───────────────────────────────────────────────────────────────────

interface ResourceWorkspaceProps {
    resource: Resource | undefined;
    children: React.ReactNode;
    numPages: number;
    isSaved: boolean;
    onSave: () => void;
    onShare: () => void;
    onDownload: () => void;
    isDownloading: boolean;
    downloadSuccess?: boolean;
    userCredits: number;
    relatedResources?: Resource[];
    isLoading?: boolean;
}


// ─── Component ───────────────────────────────────────────────────────────────

export function ResourceWorkspace({
    resource,
    children,
    numPages,
    isSaved,
    onSave,
    onShare,
    onDownload,
    isDownloading,
    userCredits,
    relatedResources = [],
    isLoading = false,
}: ResourceWorkspaceProps) {
    // ── State ──
    const [activeTab, setActiveTab] = useState<'info' | 'related' | 'saved' | null>(null);
    const [showAIChat, setShowAIChat] = useState(false);
    const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);
    const [promptId, setPromptId] = useState(0);
    const [isRailVisible, setIsRailVisible] = useState(true);

    const { savedResources } = useSaved();

    // ── Fullscreen ──
    const mainContentRef = useRef<HTMLElement>(null);
    const { isFullscreen: nativeFullscreen } = useFullscreen(mainContentRef as React.RefObject<HTMLElement>);

    // ── Bridge: expose actions to PDF engine toolbar ──
    useEffect(() => {
        const store = usePDFEngineStore.getState();
        store.setResourceActions?.({
            onInfo: () => setActiveTab('info'),
            onAI: () => setShowAIChat(true),
            onAskAI: (prompt: string) => {
                setAiPrompt(prompt);
                setPromptId(prev => prev + 1);
                setShowAIChat(true);
            }
        });
        return () => { store.setResourceActions?.(null); };
    }, []);

    // ── Helpers ──
    const toggleTab = useCallback((tab: 'info' | 'related' | 'saved') => {
        setActiveTab(current => current === tab ? null : tab);
    }, []);

    const closeAIChat = useCallback(() => {
        setShowAIChat(false);
        setAiPrompt(undefined);
    }, []);

    // ── Keyboard Shortcuts ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showAIChat) {
                    closeAIChat();
                } else if (activeTab) {
                    setActiveTab(null);
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showAIChat, activeTab, closeAIChat]);

    // ── Derived ──
    const subjectLabel = resource?.subject || resource?.domain || '';
    const typeLabel = resource?.resourceType?.replace(/_/g, ' ') || '';
    const metaBadge = [subjectLabel, typeLabel].filter(Boolean).join(' · ');


    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 font-sans relative">

            {/* ═══════════════════════════════════════════════════════════════
                DESKTOP SIDEBAR RAIL (fixed, never affects PDF layout)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block">
                <AnimatePresence mode="wait">
                    {isRailVisible && (
                        <motion.nav
                            {...slideIn}
                            className="fixed left-0 top-16 z-40 h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800"
                            style={{ width: SIDEBAR_RAIL_WIDTH }}
                        >
                            <div className="flex flex-col items-center h-full py-3 gap-1">
                                <RailButton
                                    icon={<InfoIcon />}
                                    label="Info"
                                    active={activeTab === 'info'}
                                    onClick={() => toggleTab('info')}
                                />
                                <RailButton
                                    icon={<RelatedIcon />}
                                    label="Related"
                                    active={activeTab === 'related'}
                                    onClick={() => toggleTab('related')}
                                />
                                <RailButton
                                    icon={<BookmarkIcon filled={activeTab === 'saved'} />}
                                    label="Saved"
                                    active={activeTab === 'saved'}
                                    onClick={() => toggleTab('saved')}
                                />

                                {/* Spacer */}
                                <div className="flex-1" />

                                {/* AI button at bottom */}
                                <button
                                    onClick={() => setShowAIChat(true)}
                                    className="group flex flex-col items-center gap-1 py-1"
                                    title="Ask AI"
                                >
                                    <div className={`w-8 h-8 rounded-full bg-white dark:bg-white flex items-center justify-center shadow-sm overflow-hidden border transition-all ${showAIChat
                                        ? 'border-violet-400 shadow-violet-200 dark:shadow-violet-900/40'
                                        : 'border-gray-200 dark:border-gray-700 group-hover:border-violet-400 group-hover:shadow-md'
                                        }`}>
                                        <Image src="/noteveda_supermini.svg" alt="AI" width={18} height={18} className="w-[18px] h-[18px]" />
                                    </div>
                                    <span className="text-[9px] font-medium text-gray-400 group-hover:text-violet-500 transition-colors">AI</span>
                                </button>
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>

                {/* ── Info/Related/Saved Panel (overlays, fixed) ── */}
                <AnimatePresence initial={false}>
                    {activeTab && (
                        <>
                            {/* Scrim behind panel for click-to-dismiss */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => setActiveTab(null)}
                                className="fixed inset-0 z-30 bg-black/10 dark:bg-black/30 hidden lg:block"
                                style={{ left: SIDEBAR_RAIL_WIDTH }}
                            />
                            <motion.div
                                {...panelSlide}
                                className="fixed top-16 z-40 w-[340px] h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 shadow-2xl overflow-hidden"
                                style={{ left: SIDEBAR_RAIL_WIDTH }}
                            >
                                <div className="w-full h-full overflow-y-auto overscroll-contain">
                                    <ResourceInfoSheet
                                        isOpen={true}
                                        onClose={() => setActiveTab(null)}
                                        resource={resource || ({} as any)}
                                        pageCount={numPages}
                                        isSaved={isSaved}
                                        isDownloading={isDownloading}
                                        onSave={onSave}
                                        onShare={onShare}
                                        onDownload={onDownload}
                                        relatedResources={activeTab === 'saved' ? savedResources : relatedResources}
                                        activeTab={activeTab}
                                        variant="sidebar"
                                        isLoading={isLoading}
                                    />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>


            {/* ═══════════════════════════════════════════════════════════════
                MAIN CONTENT AREA
            ═══════════════════════════════════════════════════════════════ */}
            <main
                ref={mainContentRef}
                className={`
                    min-h-[calc(100vh-64px)] flex flex-col min-w-0 relative
                    bg-gray-50 dark:bg-gray-950
                    transition-[padding] duration-150 ease-out
                    ${nativeFullscreen ? 'fixed inset-0 z-[9999] overflow-auto !pl-0' : ''}
                    ${!nativeFullscreen && isRailVisible ? 'lg:pl-[56px]' : ''}
                `}
            >
                {/* ── Header ── */}
                {!nativeFullscreen && (
                    <header className="sticky top-0 z-30 flex-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
                        <div className="h-12 md:h-14 px-3 md:px-5 flex items-center gap-2">
                            {/* Left cluster */}
                            <div className="flex items-center gap-1 shrink-0">
                                {/* Sidebar toggle — desktop only */}
                                <button
                                    onClick={() => setIsRailVisible(!isRailVisible)}
                                    className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    title={isRailVisible ? 'Hide sidebar' : 'Show sidebar'}
                                >
                                    <SidebarIcon />
                                </button>
                                <Link
                                    href="/browse"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    title="Back to browse"
                                >
                                    <ArrowLeftIcon />
                                </Link>
                            </div>

                            {/* Title + metadata badge */}
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                {isLoading ? (
                                    <div className="h-4 w-48 max-w-full bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                                ) : (
                                    <>
                                        <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {resource?.title}
                                        </h1>
                                        {metaBadge && (
                                            <span className="hidden md:inline-flex shrink-0 px-2 py-0.5 text-[10px] font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full border border-violet-200/60 dark:border-violet-800/40">
                                                {metaBadge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Actions cluster */}
                            <div className="flex items-center gap-1 shrink-0">
                                {/* Save — icon only on mobile */}
                                <button
                                    onClick={onSave}
                                    disabled={isLoading}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isSaved
                                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    title={isSaved ? 'Unsave' : 'Save'}
                                >
                                    <BookmarkIcon filled={isSaved} />
                                </button>

                                {/* Share — hidden on mobile */}
                                <button
                                    onClick={onShare}
                                    disabled={isLoading}
                                    className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    title="Share"
                                >
                                    <ShareIcon />
                                </button>

                                {/* Download — primary CTA */}
                                <button
                                    onClick={onDownload}
                                    disabled={isLoading || isDownloading}
                                    className="flex items-center gap-1.5 h-8 px-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 text-xs font-semibold"
                                >
                                    {isDownloading ? (
                                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <DownloadIcon />
                                    )}
                                    <span className="hidden sm:inline">Download</span>
                                </button>

                                {/* AI toggle */}
                                <button
                                    onClick={() => showAIChat ? closeAIChat() : setShowAIChat(true)}
                                    disabled={isLoading}
                                    title="Ask AI"
                                    className={`ml-0.5 w-8 h-8 flex items-center justify-center rounded-full shadow-sm border transition-all ${showAIChat
                                        ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-600'
                                        : 'bg-white dark:bg-white border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:shadow-md'
                                        }`}
                                >
                                    {showAIChat ? (
                                        <CloseIcon />
                                    ) : (
                                        <Image src="/noteveda_supermini.svg" alt="AI" width={18} height={18} className="w-[18px] h-[18px]" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                {/* ── Content Area ──
                     VirtualScroller handles its own px-2 md:px-4 and pageGap padding.
                     No extra wrapper padding needed here.
                */}
                <div className={`flex-1 relative ${nativeFullscreen ? '' : 'pb-14 lg:pb-0'}`}>
                    {isLoading ? (
                        <div className="pt-4 md:pt-8 px-2 md:px-4">
                            <PDFPageSkeleton />
                        </div>
                    ) : children}
                </div>
            </main>


            {/* ═══════════════════════════════════════════════════════════════
                DESKTOP AI CHAT PANEL (fixed right, overlay)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block">
                <AnimatePresence initial={false}>
                    {showAIChat && (
                        <motion.aside
                            {...chatSlide}
                            className="fixed right-0 top-16 w-[380px] h-[calc(100vh-64px)] z-40 bg-white dark:bg-gray-900 border-l border-gray-200/80 dark:border-gray-800 shadow-2xl overflow-hidden"
                        >
                            <AIChatSheet
                                isOpen={true}
                                onClose={closeAIChat}
                                resourceId={resource?.id || ''}
                                resourceTitle={resource?.title || ''}
                                resourceSubject={resource?.subject || ''}
                                resourceDomain={resource?.domain || ''}
                                resourceType={resource?.resourceType || 'NOTES'}
                                variant="side-panel"
                                initialPrompt={aiPrompt}
                                promptId={promptId}
                            />
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>


            {/* ═══════════════════════════════════════════════════════════════
                MOBILE EXPERIENCE
                Compact bottom nav + sheet overlays.
            ═══════════════════════════════════════════════════════════════ */}
            <div className="lg:hidden">
                {/* Info / Related / Saved sheet */}
                <ResourceInfoSheet
                    isOpen={!!activeTab}
                    onClose={() => setActiveTab(null)}
                    resource={resource || ({} as any)}
                    pageCount={numPages}
                    isSaved={isSaved}
                    isDownloading={isDownloading}
                    onSave={onSave}
                    onShare={onShare}
                    onDownload={onDownload}
                    relatedResources={activeTab === 'saved' ? savedResources : relatedResources}
                    activeTab={activeTab || 'info'}
                    variant="modal"
                    isLoading={isLoading}
                />

                {/* Bottom Navigation — compact, 2 main items + AI */}
                {!nativeFullscreen && (
                    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-around py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                            <MobileNavButton
                                icon={<InfoIcon />}
                                label="Info"
                                active={activeTab === 'info'}
                                onClick={() => toggleTab('info')}
                            />
                            <MobileNavButton
                                icon={<RelatedIcon />}
                                label="Related"
                                active={activeTab === 'related'}
                                onClick={() => toggleTab('related')}
                            />
                            <MobileNavButton
                                icon={<BookmarkIcon filled={activeTab === 'saved'} />}
                                label="Saved"
                                active={activeTab === 'saved'}
                                onClick={() => toggleTab('saved')}
                            />
                            <button
                                onClick={() => setShowAIChat(true)}
                                className="flex flex-col items-center gap-0.5 py-1 px-3 group"
                            >
                                <div className="w-6 h-6 rounded-full bg-white dark:bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:border-violet-400 transition-all">
                                    <Image src="/noteveda_supermini.svg" alt="AI" width={14} height={14} className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] font-medium text-gray-400 group-hover:text-violet-500 transition-colors">AI</span>
                            </button>
                        </div>
                    </nav>
                )}

                {/* AI Chat Sheet (full-screen on mobile) */}
                <AIChatSheet
                    isOpen={showAIChat}
                    onClose={closeAIChat}
                    resourceId={resource?.id || ''}
                    resourceTitle={resource?.title || ''}
                    resourceSubject={resource?.subject || ''}
                    resourceDomain={resource?.domain || ''}
                    resourceType={resource?.resourceType || 'NOTES'}
                    variant="sheet"
                    initialPrompt={aiPrompt}
                    promptId={promptId}
                />
            </div>
        </div>
    );
}


// ─── Sub-components ──────────────────────────────────────────────────────────

function RailButton({
    icon,
    label,
    active,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`
                group flex flex-col items-center gap-1 w-full py-2 px-1 transition-all
                ${active
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }
            `}
        >
            <div className={`
                w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${active
                    ? 'bg-violet-100 dark:bg-violet-900/30 shadow-sm'
                    : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                }
            `}>
                {icon}
            </div>
            <span className="text-[9px] font-medium">{label}</span>
        </button>
    );
}

function MobileNavButton({
    icon,
    label,
    active,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center gap-0.5 py-1 px-3 transition-colors
                ${active
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }
            `}
        >
            <div className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${active ? 'bg-violet-100 dark:bg-violet-900/30' : ''
                }`}>
                {icon}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
