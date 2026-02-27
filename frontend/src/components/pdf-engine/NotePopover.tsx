/**
 * NotePopover Component
 * 
 * Editable popover for viewing and editing notes attached to highlights.
 * Shows when clicking on highlighted text that has a note.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotePopoverProps {
    isOpen: boolean;
    position: { x: number; y: number };
    initialContent: string;
    highlightText: string;
    onSave: (content: string) => void;
    onDelete: () => void;
    onClose: () => void;
}

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export function NotePopover({
    isOpen,
    position,
    initialContent,
    highlightText,
    onSave,
    onDelete,
    onClose,
}: NotePopoverProps) {
    const [content, setContent] = useState(initialContent);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Reset content when opening
    useEffect(() => {
        if (isOpen) {
            setContent(initialContent);
            setShowDeleteConfirm(false);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen, initialContent]);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClick = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                handleSave();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleSave();
            }
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, content]);

    const handleSave = () => {
        onSave(content);
        onClose();
    };

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete();
            onClose();
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="fixed z-[100]"
                    style={{
                        left: position.x,
                        top: position.y,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 overflow-hidden">
                        {/* Header */}
                        <div className="px-3 py-2 bg-violet-50 dark:bg-violet-900/20 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                                Note
                            </span>
                            <button
                                onClick={onClose}
                                className="p-1 rounded hover:bg-violet-100 dark:hover:bg-violet-800/30 text-violet-500 transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Highlighted Text Preview */}
                        <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/10 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                                "{highlightText}"
                            </p>
                        </div>

                        {/* Note Content */}
                        <div className="p-3">
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Add your note here..."
                                className="w-full h-24 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>

                        {/* Actions */}
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <button
                                onClick={handleDelete}
                                className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${showDeleteConfirm
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                            >
                                <TrashIcon />
                                {showDeleteConfirm ? 'Confirm?' : 'Delete'}
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                <CheckIcon />
                                Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default NotePopover;
