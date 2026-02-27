'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import { HomeIcon, SearchIcon } from '@/components/icons';

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor - Subtle & Premium */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-gray-100 dark:bg-gray-900 rounded-full blur-[100px] opacity-60" />
                    <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-gray-200 dark:bg-gray-800 rounded-full blur-[100px] opacity-60" />
                </div>

                <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col items-center text-center">

                    {/* Brand Logo - Theme Aware */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-12"
                    >
                        <div className="relative w-48 h-16 md:w-56 md:h-20">
                            {/* Light Mode Logo */}
                            <Image
                                src="/noteveda.png"
                                alt="Noteveda"
                                fill
                                className="object-contain dark:hidden"
                                priority
                            />
                            {/* Dark Mode Logo */}
                            <Image
                                src="/noteveda_dark.png"
                                alt="Noteveda"
                                fill
                                className="object-contain hidden dark:block"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Rolling 404 Text Effect */}
                    <div className="relative mb-8 flex items-center justify-center gap-2 md:gap-4 perspective-[1000px]">

                        <RollingDigit digit={4} delay={0} />
                        <RollingDigit digit={0} delay={0.4} />
                        <RollingDigit digit={4} delay={0.8} />

                        {/* Decorative Background Blur */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 blur-[80px] rounded-full -z-10 pointer-events-none" />
                    </div>

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Page Not Found
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-10 leading-relaxed font-medium">
                            The page you're searching for seems to have wandered off.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/"
                                className="group relative w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                <span className="relative flex items-center justify-center gap-2">
                                    <HomeIcon size={20} />
                                    Back Home
                                </span>
                            </Link>
                            <Link
                                href="/browse"
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-1"
                            >
                                <SearchIcon size={20} />
                                Browse Resources
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );

    // Custom Component for Rolling Digit Effect
    function RollingDigit({ digit, delay }: { digit: number, delay: number }) {
        // Create a strip that rolls 0-9 and then lands on the target digit
        // For example, for digit 4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4]
        // This ensures the animation has some "spin" before landing.

        const baseStrip = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Add numbers up to the target digit after the base strip
        const extraNumbers: number[] = [];
        for (let i = 0; i <= digit; i++) {
            extraNumbers.push(i);
        }
        const strip = [...baseStrip, ...extraNumbers];

        // The target is always the last item in the strip
        const finalIndex = strip.length - 1;

        // Fixed height per digit item in pixels
        const itemHeight = 180;
        const finalY = -(finalIndex * itemHeight);

        return (
            <div className="h-[180px] w-28 md:w-40 lg:w-48 overflow-hidden relative leading-none select-none bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-sm">
                <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: finalY }}
                    transition={{
                        duration: 1.5 + delay * 0.5,
                        delay: delay,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex flex-col items-center"
                >
                    {strip.map((num, i) => (
                        <div
                            key={i}
                            className="w-full flex items-center justify-center"
                            style={{ height: itemHeight }}
                        >
                            <span className="text-[140px] md:text-[160px] font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-600 to-gray-800 dark:from-white dark:via-gray-300 dark:to-gray-500 leading-none">
                                {num}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* Top and Bottom Inner Shadows for depth */}
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white dark:from-gray-950 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white dark:from-gray-950 to-transparent z-20 pointer-events-none" />

                {/* Glossy Overlay/Highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-30" />
            </div>
        );
    }
}
