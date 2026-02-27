/**
 * ZoomOverlay Component
 * 
 * Provides smooth visual zoom transitions by:
 * 1. Displaying a CSS-scaled snapshot of the previous render
 * 2. Covering the re-rendering canvas during transition
 * 3. Fading out once the new sharp render is ready
 * 
 * CRITICAL: This is an immutable snapshot, NOT a reference to live canvas.
 * The snapshot is created via drawImage() before being passed here.
 */

'use client';

import React, { memo, useRef, useEffect } from 'react';

interface ZoomOverlayProps {
    snapshot: HTMLCanvasElement;     // Immutable bitmap snapshot
    displayWidth: number;            // Target display width
    displayHeight: number;           // Target display height
    scaleRatio: number;              // newZoom / oldZoom (for CSS scale)
}

const ZoomOverlay = memo(function ZoomOverlay({
    snapshot,
    displayWidth,
    displayHeight,
    scaleRatio,
}: ZoomOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Draw the snapshot onto our canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !snapshot) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match snapshot dimensions
        canvas.width = snapshot.width;
        canvas.height = snapshot.height;

        // Draw the immutable snapshot
        ctx.drawImage(snapshot, 0, 0);
    }, [snapshot]);

    // Calculate CSS size from snapshot (original size before new zoom)
    const originalWidth = displayWidth / scaleRatio;
    const originalHeight = displayHeight / scaleRatio;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                // CSS size = original snapshot size
                width: originalWidth,
                height: originalHeight,
                // CSS transform to scale to new size (instant visual feedback)
                transform: `scale(${scaleRatio})`,
                transformOrigin: 'top left',
                // Pointer events pass through
                pointerEvents: 'none',
                // Smooth fade when removed
                transition: 'opacity 0.15s ease-out',
            }}
            aria-hidden="true"
        />
    );
});

export default ZoomOverlay;
