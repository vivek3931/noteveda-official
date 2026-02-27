'use client';

import React from 'react';
import { motion } from 'framer-motion';

import Image from 'next/image';

interface AskAIButtonProps {
    onClick: () => void;
    className?: string;
}

/**
 * Fancy Ask AI Button with Glassmorphic Effect and Animated Color Blobs
 * - Glassmorphic background with blur
 * - 4 colored blobs that animate on hover
 * - Sparkle icon with text
 */
export function AskAIButton({ onClick, className = '' }: AskAIButtonProps) {
    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`ask-ai-button group ${className}`}
            style={{
                fontFamily: 'inherit',
                fontSize: '16px',
                borderRadius: '40em',
                width: '8em',
                height: '3em',
                color: 'white',
                cursor: 'pointer',
                overflow: 'hidden',
                border: 'none',
                background: 'transparent',
            }}
        >
            {/* Colored Blobs (behind the text layer) */}
            <span
                className="blob blob-1 transition-all duration-300 ease-in-out group-hover:scale-[1.3] group-hover:bg-[#0061ff]"
                style={{
                    position: 'absolute',
                    zIndex: -1,
                    borderRadius: '5em',
                    width: '5em',
                    height: '3em',
                    left: '0em',
                    top: 0,
                    background: '#ff930f',
                }}
            />
            <span
                className="blob blob-2 transition-all duration-300 ease-in-out group-hover:scale-[1.3] group-hover:bg-[#ff1b6b]"
                style={{
                    position: 'absolute',
                    zIndex: -1,
                    borderRadius: '5em',
                    width: '5em',
                    height: '3em',
                    left: '1.8em',
                    top: 0,
                    background: '#bf0fff',
                }}
            />
            <span
                className="blob blob-3 transition-all duration-300 ease-in-out group-hover:scale-[1.3] group-hover:bg-[#bf0fff]"
                style={{
                    position: 'absolute',
                    zIndex: -1,
                    borderRadius: '5em',
                    width: '5em',
                    height: '3em',
                    left: '4em',
                    top: '-1em',
                    background: '#ff1b6b',
                }}
            />
            <span
                className="blob blob-4 transition-all duration-300 ease-in-out group-hover:scale-[1.3] group-hover:bg-[#ff930f]"
                style={{
                    position: 'absolute',
                    zIndex: -1,
                    borderRadius: '5em',
                    width: '5em',
                    height: '3em',
                    left: '4.3em',
                    top: '1.6em',
                    background: '#0061ff',
                }}
            />

            {/* Glassmorphic Text Layer */}
            <span
                className="text-layer"
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    lineHeight: '3em',
                    borderRadius: '40em',
                    border: 'none',
                    background: 'linear-gradient(rgba(255, 255, 255, 0.473), rgba(150, 150, 150, 0.25))',
                    zIndex: 1,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4em',
                }}
            >
                {/* Noteveda Logo */}
                <Image
                    src="/noteveda_supermini.svg"
                    alt="AI"
                    width={20}
                    height={20}
                    className="shrink-0 w-5 h-5 drop-shadow-md brightness-0 invert"
                />
                <span className="font-semibold text-sm">Ask AI</span>
            </span>
        </motion.button>
    );
}

export default AskAIButton;
