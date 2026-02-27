import React from 'react';

interface MobileBottomBarProps {
    onAskAI: () => void;
    onSave?: () => void;
    onDownload?: () => void;
    onInfo?: () => void;
    // Search Mode Props
    isSearchActive?: boolean;
    onCloseSearch?: () => void;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    onSearchKeyDown?: (e: React.KeyboardEvent) => void;
    onPrevMatch?: () => void;
    onNextMatch?: () => void;
    searchResultsCount?: number;
    currentMatchIndex?: number;
}

export default function MobileBottomBar({
    onAskAI, onSave, onDownload, onInfo,
    isSearchActive, onCloseSearch,
    searchQuery, onSearchChange, onSearchKeyDown,
    onPrevMatch, onNextMatch, searchResultsCount = 0, currentMatchIndex = 0
}: MobileBottomBarProps) {

    if (isSearchActive) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center gap-3 z-[60] animate-in slide-in-from-bottom duration-300">
                <button
                    onClick={onCloseSearch}
                    className="p-1.5 text-white/70 hover:text-white rounded-full bg-white/5"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-1 relative">
                    <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        onKeyDown={onSearchKeyDown}
                        placeholder="Search..."
                        className="w-full bg-white/10 border-none rounded-lg text-white placeholder-white/40 text-sm focus:ring-1 focus:ring-blue-500/50 py-1.5 pl-3 pr-16"
                    />
                    {searchResultsCount > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/40">
                            {currentMatchIndex + 1}/{searchResultsCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                    <button onClick={onPrevMatch} className="p-1 text-white/70 hover:text-white disabled:opacity-30" disabled={searchResultsCount === 0}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={onNextMatch} className="p-1 text-white/70 hover:text-white disabled:opacity-30" disabled={searchResultsCount === 0}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-2 pb-safe flex items-center justify-around z-[70]">
            {/* Ask AI */}
            <button
                onClick={onAskAI}
                className="flex flex-col items-center gap-1 text-white opacity-90 hover:opacity-100 transition-opacity"
            >
                <div className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg shadow-purple-500/20 flex items-center gap-1.5 focus:scale-95 active:scale-95 transition-transform">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Ask AI</span>
                </div>
            </button>

            <div className="h-5 w-px bg-white/10" />

            {/* Info */}
            <button
                onClick={onInfo}
                className="flex flex-col items-center gap-0.5 text-white/70 hover:text-white transition-opacity px-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[8px] font-bold uppercase tracking-tight opacity-60">Info</span>
            </button>

            {/* Save */}
            <button
                onClick={onSave}
                className="flex flex-col items-center gap-0.5 text-white/70 hover:text-white transition-opacity px-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2-0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="text-[8px] font-bold uppercase tracking-tight opacity-60">Save</span>
            </button>

            {/* Download */}
            <button
                onClick={onDownload}
                className="flex flex-col items-center gap-0.5 text-white/70 hover:text-white transition-opacity px-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-[8px] font-bold uppercase tracking-tight opacity-60">Raw</span>
            </button>
        </div>
    );
}
