'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GalleryItem {
    id: string;
    content: React.ReactNode;
}

interface CurvedGalleryProps {
    items: GalleryItem[];
    bend?: number;
    autoScroll?: boolean;
    autoScrollSpeed?: number;
}

// Utility: Linear interpolation
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CurvedGallery: React.FC<CurvedGalleryProps> = ({
    items,
    bend = 3,
    autoScroll = true,
    autoScrollSpeed = 0.5,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const scrollStartX = useRef(0);
    const velocityRef = useRef(0);
    const lastXRef = useRef(0);
    const animationRef = useRef<number>();

    // Scroll position with spring physics
    const scrollX = useMotionValue(0);
    const smoothScrollX = useSpring(scrollX, { stiffness: 100, damping: 30, mass: 1 });

    // Card dimensions
    const cardWidth = 350;
    const cardGap = 24;
    const totalCardWidth = cardWidth + cardGap;

    // Total width of all items (doubled for infinite loop)
    const duplicatedItems = [...items, ...items];
    const totalWidth = items.length * totalCardWidth;

    // Update container width on resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Auto-scroll animation
    useEffect(() => {
        if (!autoScroll || isDragging) return;

        let lastTime = performance.now();
        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            const current = scrollX.get();
            const next = current + autoScrollSpeed * (deltaTime / 16);

            // Loop logic
            if (next >= totalWidth) {
                scrollX.set(next - totalWidth);
            } else if (next < 0) {
                scrollX.set(next + totalWidth);
            } else {
                scrollX.set(next);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [autoScroll, isDragging, autoScrollSpeed, scrollX, totalWidth]);

    // Mouse/Touch handlers
    const handleDragStart = useCallback((clientX: number) => {
        setIsDragging(true);
        dragStartX.current = clientX;
        scrollStartX.current = scrollX.get();
        velocityRef.current = 0;
        lastXRef.current = clientX;
    }, [scrollX]);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging) return;

        const deltaX = dragStartX.current - clientX;
        let newScroll = scrollStartX.current + deltaX * 1.5;

        // Calculate velocity for momentum
        velocityRef.current = lastXRef.current - clientX;
        lastXRef.current = clientX;

        // Infinite loop wrapping
        if (newScroll >= totalWidth) newScroll -= totalWidth;
        if (newScroll < 0) newScroll += totalWidth;

        scrollX.set(newScroll);
    }, [isDragging, scrollX, totalWidth]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);

        // Apply momentum
        const velocity = velocityRef.current * 8;
        const current = scrollX.get();
        let target = current + velocity;

        // Wrap target
        if (target >= totalWidth) target -= totalWidth;
        if (target < 0) target += totalWidth;

        scrollX.set(target);
    }, [scrollX, totalWidth]);

    // Mouse events
    const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
    const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
    const onMouseUp = () => handleDragEnd();
    const onMouseLeave = () => { if (isDragging) handleDragEnd(); };

    // Touch events
    const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
    const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
    const onTouchEnd = () => handleDragEnd();

    // Calculate card position and rotation based on scroll
    const getCardStyle = (index: number, scrollValue: number) => {
        const centerX = containerWidth / 2;
        const itemX = index * totalCardWidth - scrollValue;

        // Wrap for infinite scroll
        let wrappedX = itemX;
        if (wrappedX < -totalCardWidth) wrappedX += totalWidth * 2;
        if (wrappedX > totalWidth + totalCardWidth) wrappedX -= totalWidth * 2;

        const offsetFromCenter = wrappedX - centerX + cardWidth / 2;

        // Curved path calculation
        const normalizedOffset = offsetFromCenter / (containerWidth / 2);
        const clampedOffset = Math.max(-1, Math.min(1, normalizedOffset));

        // Y position follows a parabolic curve (bend effect)
        const yOffset = Math.abs(clampedOffset) * Math.abs(clampedOffset) * bend * 50;

        // Rotation follows the tangent of the curve
        const rotation = clampedOffset * bend * 8;

        // Scale based on distance from center
        const scale = 1 - Math.abs(clampedOffset) * 0.15;

        // Opacity fade at edges
        const opacity = 1 - Math.abs(clampedOffset) * 0.4;

        // Z-index based on distance from center
        const zIndex = Math.round((1 - Math.abs(clampedOffset)) * 100);

        return {
            transform: `translateX(${wrappedX}px) translateY(${yOffset}px) rotateZ(${rotation}deg) scale(${scale})`,
            opacity: Math.max(0, opacity),
            zIndex,
        };
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[550px] overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ perspective: '1200px' }}
        >
            {/* Gradient fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-20 pointer-events-none" />

            {/* Cards container */}
            <motion.div
                className="absolute inset-0 flex items-center"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {duplicatedItems.map((item, index) => (
                    <motion.div
                        key={`${item.id}-${index}`}
                        className="absolute left-0 top-1/2 -translate-y-1/2 will-change-transform"
                        style={{
                            width: cardWidth,
                            ...getCardStyle(index, smoothScrollX.get()),
                        }}
                    >
                        <motion.div
                            className="w-full"
                            style={{
                                x: useTransform(smoothScrollX, (val) => {
                                    const style = getCardStyle(index, val);
                                    return 0; // Position handled by parent
                                }),
                            }}
                        >
                            {/* Re-render on scroll change */}
                            <ScrollBasedCard
                                index={index}
                                scrollX={smoothScrollX}
                                containerWidth={containerWidth}
                                cardWidth={cardWidth}
                                totalCardWidth={totalCardWidth}
                                totalWidth={totalWidth}
                                bend={bend}
                            >
                                {item.content}
                            </ScrollBasedCard>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

// Separate component to handle scroll-based updates efficiently
const ScrollBasedCard: React.FC<{
    index: number;
    scrollX: any;
    containerWidth: number;
    cardWidth: number;
    totalCardWidth: number;
    totalWidth: number;
    bend: number;
    children: React.ReactNode;
}> = ({ index, scrollX, containerWidth, cardWidth, totalCardWidth, totalWidth, bend, children }) => {
    const x = useTransform(scrollX, (val: number) => {
        const centerX = containerWidth / 2;
        let itemX = index * totalCardWidth - val;
        if (itemX < -totalCardWidth) itemX += totalWidth * 2;
        if (itemX > totalWidth + totalCardWidth) itemX -= totalWidth * 2;
        return itemX;
    });

    const y = useTransform(scrollX, (val: number) => {
        const centerX = containerWidth / 2;
        let itemX = index * totalCardWidth - val;
        if (itemX < -totalCardWidth) itemX += totalWidth * 2;
        if (itemX > totalWidth + totalCardWidth) itemX -= totalWidth * 2;
        const offsetFromCenter = itemX - centerX + cardWidth / 2;
        const normalizedOffset = offsetFromCenter / (containerWidth / 2);
        const clampedOffset = Math.max(-1, Math.min(1, normalizedOffset));
        return Math.abs(clampedOffset) * Math.abs(clampedOffset) * bend * 50;
    });

    const rotate = useTransform(scrollX, (val: number) => {
        const centerX = containerWidth / 2;
        let itemX = index * totalCardWidth - val;
        if (itemX < -totalCardWidth) itemX += totalWidth * 2;
        if (itemX > totalWidth + totalCardWidth) itemX -= totalWidth * 2;
        const offsetFromCenter = itemX - centerX + cardWidth / 2;
        const normalizedOffset = offsetFromCenter / (containerWidth / 2);
        const clampedOffset = Math.max(-1, Math.min(1, normalizedOffset));
        return clampedOffset * bend * 8;
    });

    const scale = useTransform(scrollX, (val: number) => {
        const centerX = containerWidth / 2;
        let itemX = index * totalCardWidth - val;
        if (itemX < -totalCardWidth) itemX += totalWidth * 2;
        if (itemX > totalWidth + totalCardWidth) itemX -= totalWidth * 2;
        const offsetFromCenter = itemX - centerX + cardWidth / 2;
        const normalizedOffset = offsetFromCenter / (containerWidth / 2);
        const clampedOffset = Math.max(-1, Math.min(1, normalizedOffset));
        return 1 - Math.abs(clampedOffset) * 0.15;
    });

    const opacity = useTransform(scrollX, (val: number) => {
        const centerX = containerWidth / 2;
        let itemX = index * totalCardWidth - val;
        if (itemX < -totalCardWidth) itemX += totalWidth * 2;
        if (itemX > totalWidth + totalCardWidth) itemX -= totalWidth * 2;
        const offsetFromCenter = itemX - centerX + cardWidth / 2;
        const normalizedOffset = offsetFromCenter / (containerWidth / 2);
        const clampedOffset = Math.max(-1, Math.min(1, normalizedOffset));
        return Math.max(0, 1 - Math.abs(clampedOffset) * 0.4);
    });

    const zIndex = useTransform(scrollX, (val: number) => {
        const centerX = containerWidth / 2;
        let itemX = index * totalCardWidth - val;
        if (itemX < -totalCardWidth) itemX += totalWidth * 2;
        if (itemX > totalWidth + totalCardWidth) itemX -= totalWidth * 2;
        const offsetFromCenter = itemX - centerX + cardWidth / 2;
        const normalizedOffset = offsetFromCenter / (containerWidth / 2);
        const clampedOffset = Math.max(-1, Math.min(1, normalizedOffset));
        return Math.round((1 - Math.abs(clampedOffset)) * 100);
    });

    return (
        <motion.div
            className="w-full"
            style={{
                x,
                y,
                rotate,
                scale,
                opacity,
                zIndex,
                position: 'absolute',
                left: 0,
                top: '50%',
                translateY: '-50%',
            }}
        >
            {children}
        </motion.div>
    );
};

export default CurvedGallery;
