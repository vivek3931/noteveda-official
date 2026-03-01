'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIChatbot } from '@/components/features';

interface AIChatSheetProps {
    isOpen: boolean;
    onClose: () => void;
    resourceId: string;
    resourceTitle: string;
    resourceSubject: string;
    resourceDomain?: string;
    resourceType?: string;
    variant?: 'sheet' | 'side-panel';
    initialPrompt?: string;
    promptId?: number;
}

export function AIChatSheet({
    isOpen,
    onClose,
    resourceId,
    resourceTitle,
    resourceSubject,
    resourceDomain,
    resourceType,
    variant = 'sheet',
    initialPrompt,
    promptId,
}: AIChatSheetProps) {

    // Lock body scroll when mobile sheet is open — preserves scroll position
    // Guard: only run on actual mobile viewports (component is CSS-hidden on desktop but still mounted)
    useEffect(() => {
        if (variant !== 'sheet') return;
        const isMobileViewport = window.innerWidth < 1024;
        if (!isMobileViewport) return;

        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
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
                document.documentElement.style.overflow = '';
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        };
    }, [isOpen, variant]);

    const chatbot = (
        <AIChatbot
            resourceId={resourceId}
            resourceTitle={resourceTitle}
            resourceSubject={resourceSubject}
            resourceDomain={resourceDomain || ''}
            resourceType={resourceType || ''}
            onClose={onClose}
            mode={variant === 'side-panel' ? 'sidebar' : 'modal'}
            initialPrompt={initialPrompt}
            promptId={promptId}
        />
    );

    // ── Side Panel (Desktop) ──
    // Parent (ResourceWorkspace) already handles AnimatePresence + motion wrapper,
    // so we just render the content directly.
    if (variant === 'side-panel') {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0">{chatbot}</div>
            </div>
        );
    }

    // ── Sheet (Mobile) ──
    // Full-screen overlay with spring animation
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed inset-0 z-[10000] bg-white dark:bg-gray-900 flex flex-col overscroll-none touch-pan-y"
                >
                    <div className="flex-1 overflow-hidden">{chatbot}</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
