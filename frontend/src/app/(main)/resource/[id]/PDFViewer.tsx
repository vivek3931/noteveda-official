/**
 * PDFViewer Component
 * 
 * Wrapper component that uses the pdf.js based PDF Engine for Google-style zoom.
 * MEMOIZED to prevent re-renders when parent state changes (sidebar toggle, etc.)
 */

'use client';

import React, { memo, useCallback } from 'react';
import NoteVedaPDFViewer from '@/components/pdf-engine/NoteVedaPDFViewer';
import { useParams } from 'next/navigation';

interface PDFViewerProps {
    fileUrl?: string;
    resourceTitle?: string;
    onLoadSuccess?: (numPages: number) => void;
    onAskAI?: (action: 'summarize' | 'define' | 'explain', text: string) => void;
    onDownload?: () => void;
    onExpandToggle?: () => void;
    isExpanded?: boolean;
    showToolbar?: boolean;
}

const PDFViewer = memo(function PDFViewer({
    fileUrl,
    onLoadSuccess,
    onExpandToggle,
    onAskAI,
    isExpanded,
    showToolbar = true,
}: PDFViewerProps) {
    // Fallback: construct file URL from resource ID if not provided
    const params = useParams();
    const resourceId = params?.id as string;

    // Memoize callbacks for stability
    const handleLoadSuccess = useCallback((numPages: number) => {
        onLoadSuccess?.(numPages);
    }, [onLoadSuccess]);

    const handleExpandToggle = useCallback(() => {
        onExpandToggle?.();
    }, [onExpandToggle]);

    const handleAskAI = useCallback((action: 'summarize' | 'define' | 'explain', text: string) => {
        onAskAI?.(action, text);
    }, [onAskAI]);

    // Use fileUrl if provided, otherwise this won't work without it
    if (!fileUrl) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                PDF URL not provided
            </div>
        );
    }

    return (
        <NoteVedaPDFViewer
            fileUrl={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            onExpandToggle={handleExpandToggle}
            onAskAI={handleAskAI}
            isExpanded={isExpanded}
            showToolbar={showToolbar}
        />
    );
});

export default PDFViewer;
