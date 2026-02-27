import React, { useState } from 'react';

interface InnerPdfToolbarProps {
    isMobile: boolean;
    // Search
    searchQuery: string;
    onSearchChange: (val: string) => void;
    onSearchKeyDown: (e: React.KeyboardEvent) => void;
    searchResults: any[];
    currentMatchIndex: number;
    onPrevMatch: () => void;
    onNextMatch: () => void;
    isSearching: boolean;
    // Page Nav
    currentPage: number;
    totalPages: number;
    onPageInput: (e: React.FormEvent<HTMLFormElement>) => void;
    // Zoom
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    isZooming: boolean;
    // Actions
    onInfo: () => void;
    onAI: () => void;
    onFullscreen: () => void;
    // State
    isVisible?: boolean;
    // Mobile Search Toggle
    onToggleMobileSearch?: () => void;
    isMobileSearchActive?: boolean;
}

export default function InnerPdfToolbar({
    isMobile,
    searchQuery,
    onSearchChange,
    onSearchKeyDown,
    searchResults,
    currentMatchIndex,
    onPrevMatch,
    onNextMatch,
    isSearching,
    currentPage,
    totalPages,
    onPageInput,
    scale,
    onZoomIn,
    onZoomOut,
    isZooming,
    onInfo,
    onAI,
    onFullscreen,
    isVisible = true,
    onToggleMobileSearch,
    isMobileSearchActive = false,
}: InnerPdfToolbarProps) {

    // Common classes for buttons
    const btnClass = "p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50";

    // Simplified Mobile Render
    if (isMobile) {
        if (isMobileSearchActive) return null;

        return (
            <div
                className={`absolute bottom-[170px] left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className={`flex items-center bg-black/80 backdrop-blur-md shadow-2xl border border-white/10 rounded-full px-5 py-2 min-w-max gap-4`}>

                        {/* Search Btn */}
                        <button
                            onClick={onToggleMobileSearch}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <div className="w-px h-5 bg-white/20" />

                        {/* Page Nav */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white tabular-nums">{currentPage}</span>
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">/ {totalPages}</span>
                        </div>

                        <div className="w-px h-5 bg-white/20" />

                        {/* Zoom Group - Grouped with Gap 3 */}
                        <div className="flex items-center gap-3">
                            {/* Zoom Out Button */}
                            <button
                                onClick={onZoomOut}
                                disabled={isZooming}
                                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                                title="Zoom Out"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                </svg>
                            </button>

                            {/* Zoom In Button */}
                            <button
                                onClick={onZoomIn}
                                disabled={isZooming}
                                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                                title="Zoom In"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                </svg>
                            </button>
                        </div>

                        <div className="w-px h-5 bg-white/20" />

                        {/* Maximize / Fullscreen Button */}
                        <button
                            onClick={onFullscreen}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            title="Fullscreen"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop Toolbar
    return (
        <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between shadow-sm z-10">
            {/* Left: Search */}
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1.5 gap-2 border border-transparent focus-within:border-blue-500/50 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={onSearchKeyDown}
                        placeholder="Search document..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-48 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                    {isSearching && <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />}
                </div>

                {searchResults.length > 0 && (
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-medium text-gray-500">{currentMatchIndex + 1} of {searchResults.length}</span>
                        <div className="flex items-center gap-0.5 ml-1">
                            <button onClick={onPrevMatch} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button onClick={onNextMatch} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Center: Page Nav */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                <form onSubmit={onPageInput} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <input
                        name="page"
                        type="number"
                        min={1}
                        max={totalPages}
                        placeholder={currentPage.toString()}
                        className="w-12 text-center bg-white dark:bg-gray-900 rounded-md text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 py-0.5"
                    />
                    <span className="text-sm text-gray-500 pr-2">/ {totalPages}</span>
                </form>
            </div>

            {/* Right: Zoom & Actions */}
            <div className="flex items-center gap-3">
                {/* Zoom */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button onClick={onZoomOut} disabled={isZooming} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <span className="text-xs font-mono font-semibold w-10 text-center text-gray-700 dark:text-gray-200">
                        {Math.round(scale * 100)}%
                    </span>
                    <button onClick={onZoomIn} disabled={isZooming} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button onClick={onInfo} className={btnClass} title="Info">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    <button onClick={onAI} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all hover:-translate-y-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>Ask AI</span>
                    </button>

                    <button onClick={onFullscreen} className={btnClass} title="Fullscreen">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
