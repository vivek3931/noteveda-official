/**
 * HighlightLayer Component
 * 
 * Renders saved highlights and note indicators on PDF pages.
 * Uses percentage-based coordinates for zoom independence.
 */

'use client';

import React, { memo } from 'react';
import type { Highlight, HighlightRect } from '../PDFEngineStore';

// Re-export for convenience
export type { Highlight, HighlightRect };


interface HighlightLayerProps {
    pageNumber: number;
    displayWidth: number;
    displayHeight: number;
    highlights: Highlight[];
    onHighlightClick?: (highlight: Highlight) => void;
    isVisible: boolean;
}

const NoteIndicator = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
);

const HighlightLayer = memo(function HighlightLayer({
    pageNumber,
    displayWidth,
    displayHeight,
    highlights,
    onHighlightClick,
    isVisible,
}: HighlightLayerProps) {
    if (!isVisible || highlights.length === 0) return null;

    // Filter highlights for this page
    const pageHighlights = highlights.filter(h => h.pageNumber === pageNumber);

    if (pageHighlights.length === 0) return null;

    return (
        <div
            className="pdf-highlight-layer"
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
        >
            {pageHighlights.map((highlight) => (
                <div key={highlight.id} className="highlight-group">
                    {highlight.rects.map((rect, idx) => (
                        <div
                            key={`${highlight.id}-${idx}`}
                            className="highlight-rect"
                            style={{
                                position: 'absolute',
                                // Percentage-based positioning for zoom independence
                                left: `${rect.xPercent}%`,
                                top: `${rect.yPercent}%`,
                                width: `${rect.widthPercent}%`,
                                height: `${rect.heightPercent}%`,
                                backgroundColor: highlight.color || 'rgba(255, 255, 0, 0.4)',
                                pointerEvents: 'auto',
                                cursor: highlight.hasNote ? 'pointer' : 'default',
                                borderRadius: 2,
                                transition: 'background-color 0.2s',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onHighlightClick?.(highlight);
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLDivElement).style.backgroundColor =
                                    highlight.color?.replace('0.4', '0.6') || 'rgba(255, 255, 0, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLDivElement).style.backgroundColor =
                                    highlight.color || 'rgba(255, 255, 0, 0.4)';
                            }}
                        />
                    ))}

                    {/* Note indicator - show on first rect, positioned with percentages */}
                    {highlight.hasNote && highlight.rects.length > 0 && (
                        <div
                            className="note-indicator"
                            style={{
                                position: 'absolute',
                                // Position at top-right corner of first rect
                                left: `calc(${highlight.rects[0].xPercent + highlight.rects[0].widthPercent}% - 4px)`,
                                top: `calc(${highlight.rects[0].yPercent}% - 6px)`,
                                color: '#8B5CF6',
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onHighlightClick?.(highlight);
                            }}
                        >
                            <NoteIndicator />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});

export default HighlightLayer;
