/**
 * PDFToolbar — Floating Pill Controller
 * 
 * Features:
 * - Floating, centered pill aesthetic
 * - Click-to-expand search bar
 * - Editable page indicator (click to jump)
 * - Click-based zoom dropdown (not hover)
 * - Fit-width reset button
 * - Fully accessible keyboard navigation
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePDFEngineStore } from '../../lib/pdf-engine/PDFEngineStore';

interface PDFToolbarProps {
    onExpandToggle?: () => void;
    isExpanded?: boolean;
    className?: string;
    isVisible?: boolean;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
    isMobile?: boolean;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const MinusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const MaximizeIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

const MinimizeIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 14 10 14 10 20" />
        <polyline points="20 10 14 10 14 4" />
        <line x1="14" y1="10" x2="21" y2="3" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

const CloseIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ChevronUpIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const RotateIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

const FitWidthIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10H3" />
        <path d="M21 14H3" />
        <path d="M17 6l4 4-4 4" />
        <path d="M7 6L3 10l4 4" />
    </svg>
);


// ─── Constants ───────────────────────────────────────────────────────────────

const ZOOM_PRESETS = [
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1, label: '100%' },
    { value: 1.25, label: '125%' },
    { value: 1.5, label: '150%' },
    { value: 2, label: '200%' },
];


// ─── Component ───────────────────────────────────────────────────────────────

export default function PDFToolbar({
    className = '',
    isVisible = true,
    isFullscreen = false,
    onToggleFullscreen,
    isMobile = false,
}: PDFToolbarProps) {
    const {
        currentPage,
        totalPages,
        userScale,
        zoomIn,
        zoomOut,
        rotate,
        setUserScale,
        resetUserScale,
        searchQuery,
        setSearchQuery,
        searchResults,
        currentSearchIndex,
        nextSearchResult,
        prevSearchResult,
    } = usePDFEngineStore();

    const [showSearch, setShowSearch] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [showZoomMenu, setShowZoomMenu] = useState(false);
    const [isEditingPage, setIsEditingPage] = useState(false);
    const [pageInput, setPageInput] = useState('');

    const searchInputRef = useRef<HTMLInputElement>(null);
    const pageInputRef = useRef<HTMLInputElement>(null);
    const zoomMenuRef = useRef<HTMLDivElement>(null);

    // ── Sync search state ──
    useEffect(() => {
        setLocalSearchQuery(searchQuery || '');
        if (searchQuery && !showSearch) setShowSearch(true);
    }, [searchQuery]);

    // ── Listen for external search focus event ──
    useEffect(() => {
        const handleFocus = () => {
            setShowSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        };
        window.addEventListener('pdf-focus-search', handleFocus);
        return () => window.removeEventListener('pdf-focus-search', handleFocus);
    }, []);

    // ── Debounced search ──
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearchQuery !== searchQuery) setSearchQuery(localSearchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearchQuery, setSearchQuery, searchQuery]);

    // ── Focus search input on open ──
    useEffect(() => {
        if (showSearch && searchInputRef.current) searchInputRef.current.focus();
    }, [showSearch]);

    // ── Close zoom menu on outside click ──
    useEffect(() => {
        if (!showZoomMenu) return;
        const handleClick = (e: MouseEvent) => {
            if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
                setShowZoomMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showZoomMenu]);

    // ── Search handlers ──
    const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        setSearchQuery(localSearchQuery);
    }, [localSearchQuery, setSearchQuery]);

    const handleSearchClear = useCallback(() => {
        setLocalSearchQuery('');
        setSearchQuery('');
        setShowSearch(false);
    }, [setSearchQuery]);

    // ── Page jump handler ──
    const handlePageSubmit = useCallback(() => {
        const page = parseInt(pageInput);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            usePDFEngineStore.getState().setCurrentPage(page);
            // Scroll to the page
            const scrollEvent = new CustomEvent('pdf-scroll-to-page', { detail: { page } });
            window.dispatchEvent(scrollEvent);
        }
        setIsEditingPage(false);
    }, [pageInput, totalPages]);

    const startPageEdit = useCallback(() => {
        setPageInput(String(currentPage));
        setIsEditingPage(true);
        setTimeout(() => pageInputRef.current?.select(), 50);
    }, [currentPage]);

    if (!isVisible) return null;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: isMobile ? 16 : -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: isMobile ? 16 : -16, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`
                    w-auto inline-flex items-center gap-1 px-1.5 py-1
                    bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                    border border-gray-200/60 dark:border-gray-700/50
                    shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
                    rounded-2xl
                    ${className}
                `}
            >
                {/* ── PAGE INDICATOR (click to jump) ── */}
                {(!isMobile || !showSearch) && (
                    <div className="flex items-center gap-0.5 px-2 border-r border-gray-200/60 dark:border-gray-700/40 mr-0.5">
                        {isEditingPage ? (
                            <form
                                onSubmit={(e) => { e.preventDefault(); handlePageSubmit(); }}
                                className="flex items-center gap-1"
                            >
                                <input
                                    ref={pageInputRef}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                                    onBlur={handlePageSubmit}
                                    onKeyDown={(e) => { if (e.key === 'Escape') setIsEditingPage(false); }}
                                    className="w-8 text-center text-xs font-semibold bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 rounded-md py-0.5 outline-none focus:ring-1 focus:ring-violet-400"
                                />
                                <span className="text-[10px] text-gray-400 tabular-nums">/ {totalPages}</span>
                            </form>
                        ) : (
                            <button
                                onClick={startPageEdit}
                                className="flex items-center gap-1 py-0.5 px-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                title="Click to jump to page"
                            >
                                <span className="text-xs font-semibold text-gray-900 dark:text-white tabular-nums min-w-[2ch] text-center group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {currentPage}
                                </span>
                                <span className="text-[10px] text-gray-400 tabular-nums font-medium">/ {totalPages}</span>
                            </button>
                        )}
                    </div>
                )}

                {/* ── SEARCH ── */}
                <div className="relative flex items-center">
                    <AnimatePresence mode="wait">
                        {showSearch ? (
                            <motion.form
                                key="search-open"
                                initial={{ width: 36, opacity: 0 }}
                                animate={{ width: isMobile ? 170 : 220, opacity: 1 }}
                                exit={{ width: 36, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                onSubmit={handleSearchSubmit}
                                className="relative flex items-center"
                            >
                                <div className="relative w-full">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={localSearchQuery}
                                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                                        placeholder="Find in document..."
                                        className="w-full pl-7 pr-14 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border-transparent focus:border-violet-500 ring-0 focus:ring-0 rounded-xl transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                                    />
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                                        <SearchIcon />
                                    </div>

                                    {/* Results + Nav + Close */}
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                        {localSearchQuery && (
                                            <>
                                                <span className="text-[9px] tabular-nums text-gray-400 font-medium px-0.5">
                                                    {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0'}
                                                </span>
                                                <button type="button" onClick={prevSearchResult} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"><ChevronUpIcon /></button>
                                                <button type="button" onClick={nextSearchResult} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"><ChevronDownIcon /></button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleSearchClear}
                                            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.button
                                key="search-closed"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => setShowSearch(true)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                title="Search (Ctrl+F)"
                            >
                                <SearchIcon />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── TOOLS (hidden when search is expanded on mobile) ── */}
                {(!isMobile || !showSearch) && (
                    <div className="flex items-center gap-0.5 pl-0.5">
                        {/* Rotate */}
                        <ToolButton onClick={rotate} title="Rotate">
                            <RotateIcon />
                        </ToolButton>

                        <Divider />

                        {/* Zoom Out */}
                        <ToolButton onClick={zoomOut} disabled={userScale <= 0.5} title="Zoom Out (-)">
                            <MinusIcon />
                        </ToolButton>

                        {/* Zoom % — click to toggle dropdown */}
                        <div className="relative" ref={zoomMenuRef}>
                            <button
                                onClick={() => setShowZoomMenu(v => !v)}
                                className={`
                                    min-w-[3rem] px-1.5 py-1 text-[11px] font-semibold rounded-lg transition-all tabular-nums
                                    ${showZoomMenu
                                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }
                                `}
                            >
                                {Math.round(userScale * 100)}%
                            </button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {showZoomMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 overflow-hidden"
                                    >
                                        {/* Fit Width */}
                                        <button
                                            onClick={() => { resetUserScale(); setShowZoomMenu(false); }}
                                            className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors flex items-center gap-1.5"
                                        >
                                            <FitWidthIcon />
                                            Fit width
                                        </button>
                                        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 my-0.5" />
                                        {ZOOM_PRESETS.map(({ value, label }) => (
                                            <button
                                                key={value}
                                                onClick={() => { setUserScale(value); setShowZoomMenu(false); }}
                                                className={`w-full px-3 py-1.5 text-center text-[11px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${Math.abs(userScale - value) < 0.01
                                                        ? 'text-violet-600 dark:text-violet-400 font-bold bg-violet-50/50 dark:bg-violet-900/10'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Zoom In */}
                        <ToolButton onClick={zoomIn} disabled={userScale >= 3} title="Zoom In (+)">
                            <PlusIcon />
                        </ToolButton>

                        {/* Fit Width shortcut (desktop only) */}
                        {!isMobile && userScale !== 1 && (
                            <>
                                <Divider />
                                <ToolButton onClick={resetUserScale} title="Fit to Width">
                                    <FitWidthIcon />
                                </ToolButton>
                            </>
                        )}

                        {/* Fullscreen */}
                        {onToggleFullscreen && (
                            <>
                                <Divider />
                                <ToolButton onClick={onToggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                                    {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
                                </ToolButton>
                            </>
                        )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}


// ─── Sub-components ──────────────────────────────────────────────────────────

function ToolButton({
    onClick,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl disabled:opacity-30 transition-colors active:scale-95"
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-4 bg-gray-200/60 dark:bg-gray-700/40 mx-0.5" />;
}
