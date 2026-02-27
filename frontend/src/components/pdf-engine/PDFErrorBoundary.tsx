/**
 * PDFErrorBoundary Component
 * 
 * Graceful error handling for PDF viewer.
 * Provides fallback with:
 * - Error message
 * - Download button
 * - Open in new tab link
 * 
 * Never crash - always offer alternatives.
 */

'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fileUrl?: string;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class PDFErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[PDFErrorBoundary] Caught error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    handleDownload = () => {
        const { fileUrl } = this.props;
        if (fileUrl) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = 'document.pdf';
            link.click();
        }
    };

    handleOpenInNewTab = () => {
        const { fileUrl } = this.props;
        if (fileUrl) {
            window.open(fileUrl, '_blank', 'noopener,noreferrer');
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-10 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[400px]">
                    {/* Error Icon */}
                    <div className="w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>

                    {/* Error Message */}
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Unable to Load PDF
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                        {this.state.error?.message || 'An error occurred while loading the PDF. Please try one of the options below.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={this.handleRetry}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            Try Again
                        </button>

                        {this.props.fileUrl && (
                            <>
                                <button
                                    onClick={this.handleDownload}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download PDF
                                </button>

                                <button
                                    onClick={this.handleOpenInNewTab}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                    Open in New Tab
                                </button>
                            </>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
