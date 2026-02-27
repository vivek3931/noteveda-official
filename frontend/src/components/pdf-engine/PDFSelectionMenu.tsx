/**
 * PDF Selection Menu Component
 * 
 * Floating context menu that appears BELOW selected text in the PDF.
 * Has an arrow/tip pointing up to the exact center of the selected content.
 * Stays positioned relative to the selected text even during scroll.
 * 
 * POSITIONING STRATEGY:
 * - The menu is positioned with `position: fixed`.
 * - `left` and `top` define the menu's TOP-LEFT corner.
 * - The arrow's `left` is the pixel offset from the menu's left edge
 *   to the center of the selection.
 * - On first render, we use a two-pass approach: render invisible,
 *   measure the menu, calculate position, then show.
 */

'use client';

import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const SummarizeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="21" y1="6" x2="3" y2="6" />
        <line x1="15" y1="12" x2="3" y2="12" />
        <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
);

const DefineIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ExplainIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const HighlightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

const NoteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const CopyIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export interface SelectionInfo {
    text: string;
    rect: DOMRect;
    pageNumber: number;
}

interface PDFSelectionMenuProps {
    selection: SelectionInfo | null;
    containerRef: React.RefObject<HTMLElement | null>;
    onSummarize: (text: string) => void;
    onDefine: (text: string) => void;
    onExplain: (text: string) => void;
    onHighlight: (selection: SelectionInfo) => void;
    onAddNote: (selection: SelectionInfo) => void;
    onCopy: (text: string) => void;
    onDownload: () => void;
    onDismiss: () => void;
}

export function PDFSelectionMenu({
    selection,
    containerRef,
    onSummarize,
    onDefine,
    onExplain,
    onHighlight,
    onAddNote,
    onCopy,
    onDownload,
    onDismiss,
}: PDFSelectionMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    // Position: left/top = menu's top-left corner, arrowLeft = arrow offset from menu left edge
    const [position, setPosition] = useState<{ left: number; top: number; arrowLeft: number } | null>(null);
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    /**
     * Core positioning logic.
     * 
     * Strategy:
     * 1. Get the bounding rect of the browser selection (live, accounts for scroll).
     * 2. Calculate selectionCenterX = horizontal center of the selection.
     * 3. Position the menu so its horizontal center aligns with selectionCenterX.
     * 4. If the menu overflows the viewport, shift it horizontally.
     * 5. The arrow stays pointing at selectionCenterX regardless of menu shift.
     */
    const updatePosition = useCallback(() => {
        if (!selection) return;

        const menu = menuRef.current;

        // Get current selection from browser to track live position
        const browserSelection = window.getSelection();
        if (!browserSelection || browserSelection.rangeCount === 0) {
            onDismiss();
            return;
        }

        const range = browserSelection.getRangeAt(0);
        const selRect = range.getBoundingClientRect();

        // If selection has zero dimensions, use stored rect as fallback
        const rect = (selRect.width === 0 && selRect.height === 0) ? selection.rect : selRect;

        // Check if selection is still visible in viewport
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        if (rect.bottom < 0 || rect.top > viewportHeight ||
            rect.right < 0 || rect.left > viewportWidth) {
            setIsVisible(false);
            return;
        }
        setIsVisible(true);

        // The exact horizontal center of the selected content
        const selectionCenterX = rect.left + rect.width / 2;

        // Menu dimensions
        const ARROW_HEIGHT = 8;
        const GAP = 6;
        const MARGIN = 10; // Min distance from viewport edge
        const menuWidth = menu ? menu.offsetWidth : 220;
        const menuHalf = menuWidth / 2;

        // Vertical: place below selection
        const top = rect.bottom + GAP + ARROW_HEIGHT;

        // Horizontal: try to center menu on selection center
        let menuLeft = selectionCenterX - menuHalf;

        // Clamp to viewport
        if (menuLeft < MARGIN) {
            menuLeft = MARGIN;
        } else if (menuLeft + menuWidth > viewportWidth - MARGIN) {
            menuLeft = viewportWidth - MARGIN - menuWidth;
        }

        // Arrow: points at selectionCenterX, relative to menu's left edge
        let arrowLeft = selectionCenterX - menuLeft;
        // Clamp arrow so it doesn't go outside the menu's rounded corners
        arrowLeft = Math.max(20, Math.min(menuWidth - 20, arrowLeft));

        setPosition({ left: menuLeft, top, arrowLeft });
    }, [selection, onDismiss]);

    // Two-pass positioning: first render invisible, measure, then show
    useLayoutEffect(() => {
        if (!selection) {
            setPosition(null);
            return;
        }

        // Schedule position update for after the menu DOM element is rendered
        // requestAnimationFrame ensures the ref is attached
        const rafId = requestAnimationFrame(() => {
            updatePosition();
        });

        return () => cancelAnimationFrame(rafId);
    }, [selection]); // Only on selection change

    // Scroll/resize tracking
    useEffect(() => {
        if (!selection) return;

        const handleScroll = () => {
            requestAnimationFrame(updatePosition);
        };

        window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
            window.removeEventListener('resize', handleScroll);
        };
    }, [selection, updatePosition]);

    // Re-measure when menu element resizes (e.g. content changes)
    useEffect(() => {
        if (!menuRef.current || !selection) return;

        const resizeObserver = new ResizeObserver(() => {
            updatePosition();
        });
        resizeObserver.observe(menuRef.current);

        return () => resizeObserver.disconnect();
    }, [selection, updatePosition]);

    // Dismiss on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onDismiss();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        };

        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClick);
            document.addEventListener('keydown', handleKeyDown);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onDismiss]);

    const handleCopy = () => {
        if (!selection) return;
        navigator.clipboard.writeText(selection.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        onCopy(selection.text);
    };

    if (!selection) return null;

    const MenuItem = ({
        icon,
        label,
        onClick,
        variant = 'default'
    }: {
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
        variant?: 'default' | 'ai';
    }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors rounded-lg
                ${variant === 'ai'
                    ? 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
        >
            <span className="shrink-0">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );

    // Hide until position is calculated (prevents flash at 0,0)
    const hasPosition = position !== null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{
                        opacity: hasPosition ? 1 : 0,
                        scale: hasPosition ? 1 : 0.92,
                        y: hasPosition ? 0 : -4,
                    }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                    className="fixed z-[9999] pointer-events-auto"
                    style={{
                        left: position?.left ?? -9999,
                        top: position?.top ?? -9999,
                        // No transform! left/top directly position the top-left corner.
                        visibility: hasPosition ? 'visible' : 'hidden',
                    }}
                >
                    {/* Arrow pointing up to selection */}
                    <div
                        className="absolute -top-2 w-0 h-0"
                        style={{
                            left: position?.arrowLeft ?? 0,
                            transform: 'translateX(-50%)',
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '8px solid white',
                            filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))',
                        }}
                    />
                    {/* Dark mode arrow */}
                    <div
                        className="absolute -top-2 w-0 h-0 dark:block hidden"
                        style={{
                            left: position?.arrowLeft ?? 0,
                            transform: 'translateX(-50%)',
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '8px solid rgb(31, 41, 55)',
                        }}
                    />

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[200px]">
                        {/* AI Actions Section */}
                        <div className="p-1.5 border-b border-gray-100 dark:border-gray-700">
                            <MenuItem
                                icon={<SummarizeIcon />}
                                label="Summarize"
                                onClick={() => onSummarize(selection.text)}
                                variant="ai"
                            />
                            <MenuItem
                                icon={<DefineIcon />}
                                label="Define"
                                onClick={() => onDefine(selection.text)}
                                variant="ai"
                            />
                            <MenuItem
                                icon={<ExplainIcon />}
                                label="Explain"
                                onClick={() => onExplain(selection.text)}
                                variant="ai"
                            />
                        </div>

                        {/* Annotation Section */}
                        <div className="p-1.5 border-b border-gray-100 dark:border-gray-700">
                            <MenuItem
                                icon={<HighlightIcon />}
                                label="Highlight"
                                onClick={() => onHighlight(selection)}
                            />
                            <MenuItem
                                icon={<NoteIcon />}
                                label="Add note"
                                onClick={() => onAddNote(selection)}
                            />
                        </div>

                        {/* Utility Section */}
                        <div className="p-1.5">
                            <MenuItem
                                icon={<DownloadIcon />}
                                label="Download document"
                                onClick={onDownload}
                            />
                            <MenuItem
                                icon={<CopyIcon />}
                                label={copied ? "Copied!" : "Copy text"}
                                onClick={handleCopy}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default PDFSelectionMenu;
