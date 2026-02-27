import React, { useEffect, useState, memo, useMemo } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// URL detection regex
const URL_REGEX = /^(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|app)[^\s]*)$/i;

interface TextLayerData {
    width: number;   // PDF page width in points
    height: number;  // PDF page height in points
    words: Array<[number, number, number, number, string]>; // [x, y, w, h, text]
}

interface TextLayerProps {
    resourceId: string;
    pageNumber: number;
    scale: number;
    containerWidth: number;  // PDF points (unscaled)
    containerHeight: number; // PDF points (unscaled)
}

/**
 * Text Selection Layer with Link Detection
 * 
 * Features:
 * - Invisible text overlays for selection
 * - URL detection and clickable links
 * - Individual word selection (not whole page)
 */
const TextLayer = memo(({ resourceId, pageNumber, scale, containerWidth, containerHeight }: TextLayerProps) => {
    const [textData, setTextData] = useState<TextLayerData | null>(null);

    // Fetch text data from server
    useEffect(() => {
        let cancelled = false;

        const fetchText = async () => {
            try {
                const res = await fetch(`${API_BASE}/pdf/${resourceId}/page/${pageNumber}/text`);
                if (res.ok && !cancelled) {
                    const data = await res.json();
                    setTextData(data);
                }
            } catch (err) {
                console.error("Failed to load text layer", err);
            }
        };

        const timer = setTimeout(fetchText, 150);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [resourceId, pageNumber]);

    // Early return if no text data
    if (!textData || !textData.words || textData.words.length === 0) return null;

    const { width: pageWidth, height: pageHeight, words } = textData;

    // Check if text is a URL
    const isUrl = (text: string): boolean => {
        return URL_REGEX.test(text.trim());
    };

    // Format URL for opening
    const formatUrl = (text: string): string => {
        const trimmed = text.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }
        return `https://${trimmed}`;
    };

    return (
        <>
            {/* Global selection styles */}
            <style jsx global>{`
                .pdf-text-layer-container {
                    position: absolute;
                    inset: 0;
                    z-index: 10;
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-select: none;
                }
                .pdf-text-span {
                    position: absolute;
                    color: transparent;
                    cursor: text;
                    white-space: pre;
                    line-height: 1;
                    font-family: sans-serif;
                    pointer-events: auto;
                    user-select: text;
                    -webkit-user-select: text;
                }
                .pdf-text-span::selection {
                    background: rgba(59, 130, 246, 0.35);
                    color: transparent;
                }
                .pdf-text-span::-moz-selection {
                    background: rgba(59, 130, 246, 0.35);
                    color: transparent;
                }
                .pdf-link-span {
                    position: absolute;
                    color: transparent;
                    cursor: pointer;
                    white-space: pre;
                    line-height: 1;
                    font-family: sans-serif;
                    pointer-events: auto;
                    user-select: text;
                    -webkit-user-select: text;
                    text-decoration: underline;
                }
                .pdf-link-span:hover {
                    background: rgba(59, 130, 246, 0.15);
                }
                .pdf-link-span::selection {
                    background: rgba(59, 130, 246, 0.35);
                    color: transparent;
                }
            `}</style>

            <div className="pdf-text-layer-container">
                {words.map((word, i) => {
                    const [x, y, w, h, text] = word;

                    // Percentage-based positioning (works at any scale)
                    const leftPct = (x / pageWidth) * 100;
                    const topPct = (y / pageHeight) * 100;
                    const widthPct = (w / pageWidth) * 100;
                    const heightPct = (h / pageHeight) * 100;

                    // Font size based on height (scaled for display)
                    const fontSize = h * scale;

                    const isLink = isUrl(text);

                    const style: React.CSSProperties = {
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        fontSize: `${fontSize}px`,
                    };

                    if (isLink) {
                        return (
                            <a
                                key={`${pageNumber}-${i}`}
                                href={formatUrl(text)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link-span"
                                style={style}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {text}
                            </a>
                        );
                    }

                    return (
                        <span
                            key={`${pageNumber}-${i}`}
                            className="pdf-text-span"
                            style={style}
                        >
                            {text}
                        </span>
                    );
                })}
            </div>
        </>
    );
});

TextLayer.displayName = 'TextLayer';
export default TextLayer;
