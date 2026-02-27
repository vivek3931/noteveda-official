'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resource } from '@/types';
import { ResourceCard } from '@/components/features';
import { ChevronRightIcon } from '@/components/icons';

interface SavedResourceCarouselProps {
    resources: Resource[];
}

export default function SavedResourceCarousel({ resources }: SavedResourceCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            checkScrollPosition();
            window.addEventListener('resize', checkScrollPosition);
            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
                window.removeEventListener('resize', checkScrollPosition);
            };
        }
    }, [resources]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350; // Slightly more than card width
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group">
            {/* Left Navigation Arrow */}
            <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg items-center justify-center border border-gray-100 dark:border-gray-700 transition-all ${canScrollLeft
                    ? 'opacity-100 hover:scale-110 text-gray-700 dark:text-gray-300'
                    : 'opacity-0 pointer-events-none'
                    }`}
                aria-label="Scroll left"
            >
                <ChevronRightIcon size={24} className="rotate-180" />
            </button>

            {/* Right Navigation Arrow */}
            <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg items-center justify-center border border-gray-100 dark:border-gray-700 transition-all ${canScrollRight
                    ? 'opacity-100 hover:scale-110 text-gray-700 dark:text-gray-300'
                    : 'opacity-0 pointer-events-none'
                    }`}
                aria-label="Scroll right"
            >
                <ChevronRightIcon size={24} />
            </button>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-1"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {resources.map((resource, index) => (
                    <motion.div
                        key={resource.id}
                        className="flex-shrink-0 w-[320px]"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                        <ResourceCard resource={resource} index={index} />
                    </motion.div>
                ))}
            </div>

            {/* Gradient Fade Edges */}
            {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-gray-950 to-transparent pointer-events-none z-10" />
            )}
            {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-950 to-transparent pointer-events-none z-10" />
            )}
        </div>
    );
}
