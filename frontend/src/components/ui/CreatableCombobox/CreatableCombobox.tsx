'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeOptionValue } from '@/lib/validators/resource-validator';

interface CreatableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    allowCreate?: boolean;
    createLabel?: string;
    /** Auto-capitalize created options (e.g., "react" -> "React") */
    autoCapitalize?: boolean;
    /** Called when a new option is created (for external state management) */
    onCreateOption?: (value: string) => void;
}

/**
 * CreatableSelect - A searchable dropdown with "Create new" capability
 * 
 * Features:
 * - Type-ahead search with filtered results
 * - "Create '[typed value]'" option when no match found
 * - Auto-capitalization of new options
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Dark mode compatible
 * - Accessible with ARIA attributes
 */
export function CreatableSelect({
    value,
    onChange,
    options,
    placeholder = 'Select or type...',
    label,
    required,
    disabled,
    error,
    className = '',
    allowCreate = true,
    createLabel = 'Create',
    autoCapitalize = true,
    onCreateOption,
}: CreatableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Memoized filtered options for performance
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const query = searchQuery.toLowerCase().trim();
        return options.filter((option) =>
            option.toLowerCase().includes(query)
        );
    }, [options, searchQuery]);

    // Check for exact match (case-insensitive) to prevent duplicate creation
    const hasExactMatch = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return options.some((opt) => opt.toLowerCase() === query);
    }, [options, searchQuery]);

    // Show create option only if allowed, has input, and no exact match
    const showCreateOption = allowCreate && searchQuery.trim() !== '' && !hasExactMatch;

    // Combined navigation list
    const navigationList = useMemo(() => {
        return showCreateOption
            ? [...filteredOptions, `__CREATE__${searchQuery.trim()}`]
            : filteredOptions;
    }, [filteredOptions, showCreateOption, searchQuery]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [navigationList.length]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current) {
            const highlightedElement = listRef.current.querySelector(
                `[data-index="${highlightedIndex}"]`
            );
            highlightedElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, isOpen]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (!isOpen) setIsOpen(true);
        setHighlightedIndex(0);
    }, [isOpen]);

    const handleSelect = useCallback(
        (selectedValue: string) => {
            let finalValue = selectedValue;

            if (selectedValue.startsWith('__CREATE__')) {
                const rawValue = selectedValue.replace('__CREATE__', '');
                // Auto-capitalize if enabled
                finalValue = autoCapitalize ? normalizeOptionValue(rawValue) : rawValue.trim();
                // Notify parent of new option creation
                onCreateOption?.(finalValue);
            }

            onChange(finalValue);
            setIsOpen(false);
            setSearchQuery('');
        },
        [onChange, autoCapitalize, onCreateOption]
    );

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setHighlightedIndex((prev) =>
                        Math.min(prev + 1, navigationList.length - 1)
                    );
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (isOpen && navigationList[highlightedIndex]) {
                    handleSelect(navigationList[highlightedIndex]);
                } else if (!isOpen) {
                    setIsOpen(true);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchQuery('');
                inputRef.current?.blur();
                break;
            case 'Tab':
                setIsOpen(false);
                setSearchQuery('');
                break;
        }
    }, [disabled, isOpen, navigationList, highlightedIndex, handleSelect]);

    const handleFocus = useCallback(() => {
        if (!disabled) {
            setIsOpen(true);
            // Pre-fill search with current value for editing
            if (value) {
                setSearchQuery(value);
                // Select all text for easy replacement
                setTimeout(() => inputRef.current?.select(), 0);
            }
        }
    }, [disabled, value]);

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchQuery('');
        inputRef.current?.focus();
    }, [onChange]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                    id={`${label}-label`}
                >
                    {label}
                    {required && <span className="text-gray-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchQuery : value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-labelledby={label ? `${label}-label` : undefined}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${label}-error` : undefined}
                    autoComplete="off"
                    className={`input pr-16 ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : ''
                        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
                />

                {/* Clear & Dropdown buttons */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                            aria-label="Clear selection"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        disabled={disabled}
                        aria-label={isOpen ? 'Close dropdown' : 'Open dropdown'}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {error && (
                <p id={`${label}-error`} className="mt-1 text-sm text-red-500" role="alert">
                    {error}
                </p>
            )}

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={listRef}
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-50 w-full mt-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                        role="listbox"
                        aria-label={`${label} options`}
                    >
                        {navigationList.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                {searchQuery ? 'No matching options' : 'No options available'}
                            </div>
                        ) : (
                            <>
                                {filteredOptions.map((option, index) => {
                                    const isHighlighted = highlightedIndex === index;
                                    const isSelected = option === value;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            data-index={index}
                                            onClick={() => handleSelect(option)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            role="option"
                                            aria-selected={isSelected}
                                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${isHighlighted
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                } ${isSelected ? 'font-medium' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="truncate">{option}</span>
                                                {isSelected && (
                                                    <svg
                                                        className="w-4 h-4 text-black dark:text-white flex-shrink-0 ml-2"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Create new option */}
                                {showCreateOption && (
                                    <>
                                        {filteredOptions.length > 0 && (
                                            <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                                        )}
                                        <button
                                            type="button"
                                            data-index={filteredOptions.length}
                                            onClick={() => handleSelect(`__CREATE__${searchQuery.trim()}`)}
                                            onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${highlightedIndex === filteredOptions.length
                                                    ? 'bg-gray-100 dark:bg-gray-800'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 text-black dark:text-white font-medium">
                                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span>
                                                    {createLabel}{' '}
                                                    <span className="text-gray-500 dark:text-gray-400">&ldquo;</span>
                                                    <span className="text-black dark:text-white">
                                                        {autoCapitalize ? normalizeOptionValue(searchQuery.trim()) : searchQuery.trim()}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400">&rdquo;</span>
                                                </span>
                                            </div>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CreatableSelect;
