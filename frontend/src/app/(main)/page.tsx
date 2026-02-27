'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    SearchIcon,
    DownloadIcon,
    UploadIcon,
    StarIcon,
    ArrowRightIcon,
    SparkleIcon,
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@/components/icons';
import ResourceCard from '@/components/features/ResourceCard/ResourceCard';


import Silk from '@/components/ui/Silk';
import { useTheme } from '@/contexts/ThemeContext';
import { resourcesService } from '@/lib/services/resources';
import { Resource } from '@/types';
import { CATEGORY_CONFIG, ResourceCategory } from '@/types/resource-types';
import { categoriesService } from '@/lib';

// ============================================
// Animation Variants
// ============================================
const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger: any = {
    visible: { transition: { staggerChildren: 0.1 } }
};

const float: any = {
    initial: { y: 0 },
    animate: {
        y: [-5, 5, -5],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    }
};

// ============================================
// Main Page
// ============================================
export default function HomePage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black overflow-x-hidden transition-colors duration-300">
            <HeroSection />
            <CategoryDiscoverySection />
            <FeaturedResourcesSection />
            <AIFeatureHighlightsSection />
            <UploadShareSection />
            <HowItWorksSection />
            <TrustedByLearnersSection />
            <TestimonialsSection />
            <FinalCTASection />
        </main>
    );
}

// ============================================
// 1. HERO SECTION
// ============================================
function HeroSection() {
    const [stats, setStats] = useState({ resources: 0, students: 0 });
    const { isDark } = useTheme();

    useEffect(() => {
        // Fetch real aggregated stats
        const fetchStats = async () => {
            try {
                // Get platform stats
                const data = await categoriesService.getStats();
                setStats({
                    resources: data.totalResources || 0,
                    students: data.totalUsers || 0
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
                // Fallback attempt for resources if stats endpoint fails
                try {
                    const resRoutes = await resourcesService.getResources({ limit: 1 });
                    setStats(prev => ({ ...prev, resources: resRoutes.total }));
                } catch (e) {
                    console.error('Fallback fetch failed', e);
                }
            }
        };
        fetchStats();
    }, []);

    const formatCount = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
        return num.toString();
    };

    return (
        <section className="relative min-h-[60vh] md:min-h-[85vh] overflow-hidden flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
            {/* Silk Background - Dynamic Theme */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full opacity-90 dark:opacity-70 filter blur-[0px]">
                    <Silk
                        color={isDark ? '#7B7481' : '#D1D1D1'}
                        speed={2}
                        scale={1}
                        noiseIntensity={1.4}
                        rotation={0}
                    />
                </div>
            </div>

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/0 via-white/50 to-white/90 dark:from-black/0 dark:via-black/50 dark:to-black/90 pointer-events-none" />

            {/* Main Content */}
            <div className="container mx-auto px-6 relative z-10 pt-20 pb-16">
                <div className="max-w-4xl mx-auto text-center">

                    {/* Heading - Minimal & Premium (No Gradient) */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight"
                    >
                        Master Any Subject with{' '}
                        <span className="italic font-serif">
                            Precision.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed"
                    >
                        Access premier study resources, AI-powered summaries, and intelligent Q&A to accelerate your learning journey.
                    </motion.p>

                    {/* Search Bar - Central & Heroic */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative max-w-2xl mx-auto group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
                        <div className="relative flex items-center p-1.5 md:p-2 bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-full shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-300">
                            <div className="pl-4 md:pl-6 text-gray-400 dark:text-gray-500">
                                <SearchIcon size={24} className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <input
                                suppressHydrationWarning
                                type="text"
                                placeholder="What do you want to learn today?"
                                className="w-full px-4 md:px-6 py-2.5 md:py-4 bg-transparent text-base md:text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                            />
                            <button suppressHydrationWarning className="hidden md:flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-full hover:opacity-90 transition-all transform hover:scale-105 active:scale-95">
                                Search
                                <ArrowRightIcon size={18} />
                            </button>
                            <button suppressHydrationWarning className="md:hidden p-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full">
                                <ArrowRightIcon size={20} />
                            </button>
                        </div>
                    </motion.div>

                    {/* Quick Stats - Real Data */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-center"
                    >
                        {[
                            { label: 'Resources', value: stats.resources > 0 ? formatCount(stats.resources) : '50K+' },
                            { label: 'Students', value: stats.students > 0 ? formatCount(stats.students) : '10K+' },
                            { label: 'Technology', value: 'AI-Powered' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    {stat.value}
                                </span>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            {/* Scroll Indicator - Hidden on Mobile */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-20"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-gray-300 dark:from-gray-700 to-transparent" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest">Scroll</span>
            </motion.div>
        </section>
    );
}

// ============================================
// 2. CATEGORY DISCOVERY - Mobile Carousel
// ============================================
function CategoryDiscoverySection() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const categories: ResourceCategory[] = ['ACADEMIC', 'ENTRANCE', 'SKILL', 'GENERAL'];

    // SVG Background Images
    const categoryImages: Record<ResourceCategory, string> = {
        ACADEMIC: '/assets/home/academic-background.svg',
        ENTRANCE: '/assets/home/entrance_exam-background.svg',
        SKILL: '/assets/home/skills_and_career-background.svg',
        GENERAL: '/assets/home/general-background.svg',
    };

    useEffect(() => {
        const fetchStats = async () => {
            const newCounts: Record<string, number> = {};
            await Promise.all(categories.map(async (cat) => {
                try {
                    const res = await resourcesService.getResources({ category: cat, limit: 1 });
                    newCounts[cat] = res.total;
                } catch (error) {
                    console.error(`Failed to fetch stats for ${cat}`, error);
                    newCounts[cat] = 0;
                }
            }));
            setCounts(newCounts);
        };

        fetchStats();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 340;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-16 bg-white dark:bg-black transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Explore Categories
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Curated knowledge across fields</p>
                    </div>
                    {/* Navigation Icons */}
                    <div className="flex gap-2">
                        <button
                            suppressHydrationWarning
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            <ChevronLeftIcon size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            suppressHydrationWarning
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            <ChevronRightIcon size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll / Carousel */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible"
                >
                    {categories.map((catKey) => {
                        const config = CATEGORY_CONFIG[catKey];
                        const count = counts[catKey] || 0;
                        const imagePath = categoryImages[catKey];

                        return (
                            <Link
                                href={`/browse?category=${catKey}`}
                                key={catKey}
                                className="flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-auto snap-center relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-400 block shadow-sm hover:shadow-xl transition-shadow"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
                                    <Image
                                        src={imagePath}
                                        alt={config.label}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>

                                {/* Gradient Overlay - White in Light, Dark in Dark */}
                                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 text-left">
                                    <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                                        <span className="inline-block px-2 py-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded border border-black/5 dark:border-white/5 text-gray-900 dark:text-white/90 text-[10px] font-semibold tracking-wider uppercase mb-2">
                                            {count > 0 ? `${count.toLocaleString()} Resources` : 'Explore'}
                                        </span>
                                        <h3 className="text-gray-900 dark:text-white text-2xl font-bold mb-1 tracking-tight leading-none">
                                            {config.label}
                                        </h3>
                                        <p className="text-gray-600 dark:text-white/70 text-xs font-medium leading-relaxed max-w-[95%] mt-1">
                                            {config.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ============================================
// 3. FEATURED RESOURCES - Real Data with ResourceCard
// ============================================
function FeaturedResourcesSection() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'trending' | 'newest' | 'ai'>('trending');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true);
                const data = await resourcesService.getTrending(8);
                setResources(data);
            } catch (error) {
                console.error('Failed to fetch resources:', error);
                setResources([]);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [activeFilter]);

    const filters = [
        { key: 'trending' as const, label: 'Trending' },
        { key: 'newest' as const, label: 'Newest' },
        { key: 'ai' as const, label: 'Most AI-Rich' },
    ];

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                >
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Curated Premium Resources
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Peer-reviewed materials enhanced with AI metadata
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2">
                        {filters.map((filter) => (
                            <button
                                suppressHydrationWarning
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${activeFilter === filter.key
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Resource Cards Grid - Compact */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
                                <div className="h-32 bg-gray-100 dark:bg-gray-800" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : resources.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {resources.slice(0, 5).map((resource, i) => (
                            <ResourceCard key={resource.id} resource={resource} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No resources available yet.</p>
                        <Link href="/browse" className="text-blue-500 hover:underline mt-2 inline-block">
                            Browse all resources
                        </Link>
                    </div>
                )}

                {resources.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <Link
                            href="/browse"
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            View All Resources
                            <ArrowRightIcon size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

// ============================================
// 4. AI FEATURE HIGHLIGHTS - Card Swap
// ============================================
function AIFeatureHighlightsSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [phase, setPhase] = useState<'typing' | 'sending' | 'response'>('typing');
    const [typedText, setTypedText] = useState('');
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

    const features = [
        {
            id: 'summary',
            title: 'Generate Summary',
            badge: '📄 Summarize',
            description: 'Get instant AI-powered summaries of any document in seconds.',
            prompt: 'Summarize this document for me.',
            response: [
                'Key Points:',
                '• Introduction to Machine Learning – covers fundamental ML concepts.',
                '• Neural Networks – architecture, activation functions, backpropagation.',
                '• Practical Applications – healthcare, finance, autonomous systems.',
                '• Best Practices – evaluation metrics, cross-validation, tuning.',
            ],
        },
        {
            id: 'question',
            title: 'Ask Questions',
            badge: '❓ Q&A',
            description: 'Get accurate answers from your documents instantly with AI.',
            prompt: 'What is backpropagation?',
            response: [
                'Backpropagation',
                'An algorithm to train neural networks by calculating gradients.',
                '1. Forward Pass – Input flows through the network',
                '2. Loss Calculation – Compare output vs expected',
                '3. Backward Pass – Propagate error, update weights',
            ],
        },
        {
            id: 'explanation',
            title: 'Get Explanation',
            badge: '💡 Explain',
            description: 'Deep dive into complex topics with detailed AI explanations.',
            prompt: 'Explain gradient descent simply.',
            response: [
                'Gradient Descent',
                'Imagine hiking down a foggy mountain:',
                '🏔️ Goal: Reach the lowest point (minimum error)',
                '👟 Method: Feel slope, step downhill, repeat',
                '📉 Learning Rate: How big your steps are',
            ],
        },
    ];

    // Animation cycle: typing -> sending -> response -> next card
    useEffect(() => {
        if (!isInView) return;

        const currentFeature = features[activeIndex];
        const prompt = currentFeature.prompt;

        // Reset
        setTypedText('');
        setPhase('typing');

        // Type the prompt character by character
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < prompt.length) {
                setTypedText(prompt.slice(0, charIndex + 1));
                charIndex++;
            } else {
                clearInterval(typeInterval);
                // Brief pause then "send"
                setTimeout(() => {
                    setPhase('sending');
                    // Show response after "sending"
                    setTimeout(() => {
                        setPhase('response');
                        // Auto-advance after showing response
                        setTimeout(() => {
                            setActiveIndex((prev) => (prev + 1) % features.length);
                        }, 3500);
                    }, 400);
                }, 500);
            }
        }, 40);

        return () => clearInterval(typeInterval);
    }, [activeIndex, isInView]);

    // Response line animation
    const lineVariants = {
        hidden: { opacity: 0, y: 6 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.2, ease: 'easeOut' }
        })
    };

    return (
        <section ref={sectionRef} className="py-24 bg-[#0A0A0F] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Side - Feature Info */}
                    <div className="order-2 lg:order-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                    {features[activeIndex].title}
                                </h2>
                                <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-8 max-w-md">
                                    {features[activeIndex].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Feature Indicators */}
                        <div className="flex gap-2">
                            {features.map((feature, i) => (
                                <button
                                    suppressHydrationWarning
                                    key={feature.id}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex
                                        ? 'bg-white w-16'
                                        : 'bg-gray-700 hover:bg-gray-600 w-8'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Card Stack (Matching Reference Image) */}
                    <div className="order-1 lg:order-2 relative h-[450px] md:h-[500px]">
                        {features.map((feature, i) => {
                            // Calculate offset: 0 = front, 1 = middle, 2 = back
                            const offset = (i - activeIndex + features.length) % features.length;
                            const isActive = offset === 0;

                            return (
                                <motion.div
                                    key={feature.id}
                                    className="absolute inset-0"
                                    initial={false}
                                    animate={{
                                        // Stack goes UP and RIGHT (like reference image)
                                        x: offset * 25,
                                        y: offset * -20,
                                        scale: 1 - offset * 0.03,
                                        zIndex: features.length - offset,
                                        opacity: offset > 2 ? 0 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                >
                                    {/* Card - Chatbot Styled Design */}
                                    <div className="w-full h-full bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col relative shadow-2xl">
                                        {/* Header / Badge */}
                                        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-white dark:from-gray-950 to-transparent pointer-events-none">
                                            <div className="flex items-center gap-2 pointer-events-auto opacity-80">
                                                <Image src="/noteveda.png" alt="Noteveda" width={80} height={24} className="h-5 w-auto dark:hidden" />
                                                <Image src="/noteveda_dark.png" alt="Noteveda" width={80} height={24} className="h-5 w-auto hidden dark:block" />
                                            </div>
                                            <div className="pointer-events-auto">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-semibold tracking-wide uppercase">
                                                    {feature.badge}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Chat Content Area */}
                                        <div className="flex-1 p-6 pt-20 pb-28 overflow-hidden">
                                            {/* Show user message after typing completes */}
                                            {isActive && (phase === 'sending' || phase === 'response') && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className="flex justify-end mb-6"
                                                >
                                                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-[2rem] rounded-tr-sm max-w-[85%] text-[15px] leading-relaxed shadow-sm">
                                                        {feature.prompt}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* AI Response */}
                                            {isActive && phase === 'response' && (
                                                <div className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-purple-500/20">
                                                        <SparkleIcon size={16} className="text-white" />
                                                    </div>
                                                    <div className="flex-1 space-y-2 pt-1">
                                                        {feature.response.map((line, lineIdx) => (
                                                            <motion.div
                                                                key={lineIdx}
                                                                custom={lineIdx}
                                                                variants={lineVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                className={`text-sm leading-relaxed ${lineIdx === 0
                                                                    ? 'text-gray-900 dark:text-white font-semibold mb-2 block'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                                    }`}
                                                            >
                                                                {line}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Input Bar - Floating Glassmorphic */}
                                        <div className="absolute bottom-6 left-4 right-4 z-20">
                                            <div className="relative group">
                                                {/* Glass container */}
                                                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-xl shadow-blue-500/5 transition-all duration-300 group-hover:shadow-2xl group-hover:border-gray-300 dark:group-hover:border-gray-700" />

                                                <div className="relative flex items-center gap-3 p-2 pl-5">
                                                    <div className="flex-1 text-sm">
                                                        {isActive ? (
                                                            <span className="text-gray-900 dark:text-white font-medium">
                                                                {typedText}
                                                                {phase === 'typing' && (
                                                                    <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse align-middle" />
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500">Ask a question...</span>
                                                        )}
                                                    </div>

                                                    <motion.div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive && (phase === 'sending' || typedText.length > 0)
                                                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                            }`}
                                                        animate={phase === 'sending' ? { scale: [1, 0.9, 1] } : {}}
                                                    >
                                                        {isActive && phase === 'sending' ? (
                                                            <SparkleIcon size={18} className="animate-spin" />
                                                        ) : (
                                                            <ArrowRightIcon size={18} />
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div >
            </div >
        </section >
    );
}


// ============================================
// 5. UPLOAD & SHARE - Drag & Drop Premium
// ============================================
function UploadShareSection() {
    return (
        <section className="py-24 bg-white dark:bg-black border-y border-gray-100 dark:border-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-8 md:p-16 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors group relative overflow-hidden">

                        {/* 1. Base Dots (Faint/Gray) - Always visible */}
                        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                        />

                        {/* 2. Highlight Dots - Radial Center Reveal Animation */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none z-[1] opacity-30 dark:opacity-50"
                            style={{
                                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                                backgroundSize: '24px 24px',
                                // Radial mask that reveals from center
                                maskImage: 'radial-gradient(circle, black, transparent)',
                                WebkitMaskImage: 'radial-gradient(circle, black, transparent)',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                            }}
                            // Animate the mask size to create continuous expanding ripple from center
                            animate={{
                                maskSize: ['0% 0%', '200% 200%'],
                                WebkitMaskSize: ['0% 0%', '200% 200%'],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black dark:bg-white text-white dark:text-black mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                <UploadIcon size={32} />
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                                Share your knowledge.
                            </h2>

                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                Join our community. Upload notes and papers to help others learn while earning credits.
                            </p>

                            <div className="flex flex-col items-center gap-4 w-full md:w-auto mx-auto">
                                <Link
                                    href="/upload"
                                    className="
                                                inline-flex items-center justify-center gap-2
                                                w-full md:w-auto
                                                px-10 py-4
                                                bg-black text-white
                                                dark:bg-white dark:text-black
                                                font-semibold rounded-xl
                                                hover:bg-gray-800 hover:text-white
                                                dark:hover:bg-gray-200 dark:hover:text-black
                                                transition-all duration-200
                                                shadow-lg hover:shadow-xl
                                            "
                                >
                                    <span className="text-lg">Select Files to Upload</span>
                                </Link>

                                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-2">
                                    or drag and drop files here
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// 6. HOW IT WORKS - Clean Design
// ============================================
// ============================================
// 6. HOW IT WORKS - Premium Bento Grid
// ============================================
function HowItWorksSection() {
    const steps = [
        {
            id: '01',
            title: 'Search & Discover',
            description: 'Find high-quality notes and papers instantly using our AI-enhanced semantic search.',
            Icon: SearchIcon,
        },
        {
            id: '02',
            title: 'Preview Content',
            description: 'Evaluate materials with our crystal-clear previewer before you commit to downloading.',
            Icon: EyeIcon,
        },
        {
            id: '03',
            title: 'Instant Access',
            description: 'Download resources immediately in high-fidelity PDF format for offline study.',
            Icon: DownloadIcon,
        },
        {
            id: '04',
            title: 'Master & Grow',
            description: 'Learn efficiently and share your own knowledge to earn reputation and rewards.',
            Icon: SparkleIcon,
        },
    ];

    return (
        <section className="py-24 md:py-32 bg-gray-50 dark:bg-black transition-colors duration-300 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl">

                        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                            Engineered for <span className="italic font-serif">precision.</span>
                        </h2>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step, i) => {
                        const isLarge = i === 0 || i === 3;
                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`group relative p-8 md:p-10 rounded-3xl bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 overflow-hidden ${isLarge ? 'md:col-span-2' : 'md:col-span-1'}`}
                            >
                                {/* Massive Background Icon Watermark */}
                                <div className="absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.1] transition-opacity duration-500 pointer-events-none">
                                    <step.Icon strokeWidth={0.5} className="w-64 h-64 md:w-80 md:h-80 -rotate-12" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300 shadow-sm">
                                            <step.Icon className="w-6 h-6" />
                                        </div>
                                        <span className="font-serif text-4xl font-light text-gray-200 dark:text-gray-800 group-hover:text-gray-300 dark:group-hover:text-gray-700 transition-colors">
                                            {step.id}
                                        </span>
                                    </div>

                                    <div className={isLarge ? 'max-w-md' : ''}>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ============================================
// 7. TRUSTED BY LEARNERS - Premium Marquee
// ============================================
// ============================================
// 7. TRUSTED BY LEARNERS
// ============================================
function TrustedByLearnersSection() {
    const universities = [
        { name: 'Harvard University', style: 'font-serif font-bold tracking-tight' },
        { name: 'MIT', style: 'font-sans font-extrabold tracking-widest' },
        { name: 'Stanford', style: 'font-serif font-bold' },
        { name: 'Oxford', style: 'font-serif font-bold italic' },
        { name: 'Cambridge', style: 'font-serif font-medium tracking-wide' },
        { name: 'Berkeley', style: 'font-serif font-bold tracking-tighter' },
        { name: 'Princeton', style: 'font-serif font-bold' },
        { name: 'Yale', style: 'font-serif font-bold tracking-tight' },
        { name: 'Columbia', style: 'font-serif font-bold' },
        { name: 'Caltech', style: 'font-sans font-bold tracking-tight' },
    ];

    return (
        <section className="py-20 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900 transition-colors duration-300 overflow-hidden">
            <div className="container mx-auto px-6 mb-12 text-center">
                <motion.h4
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-lg font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"
                >
                    Trusted by Learners from Leading Universities
                </motion.h4>
            </div>

            <div className="relative w-full max-w-[98vw] mx-auto overflow-hidden">
                {/* Gradient Masks for Soft Edges */}
                <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none" />

                <div className="flex">
                    <motion.div
                        className="flex gap-16 md:gap-24 flex-nowrap items-center px-8"
                        animate={{ x: "-50%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 60,
                            ease: "linear",
                        }}
                    >
                        {[...universities, ...universities, ...universities].map((uni, i) => (
                            <div
                                key={i}
                                className="group flex items-center justify-center opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500 cursor-default"
                            >
                                <span className={`text-2xl md:text-3xl text-gray-900 dark:text-white whitespace-nowrap ${uni.style}`}>
                                    {uni.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// 8. TESTIMONIALS
// ============================================
// ============================================
// 8. TESTIMONIALS
// ============================================
function TestimonialsSection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const testimonials = [
        {
            quote: "This platform is consistently amazing with the resources provided across courses with AI!",
            name: 'Genesis Botero',
            role: 'Computer Science Student',
            avatar: 'G'
        },
        {
            quote: "Simply beautiful as a knowledge-driven and AI narrative tool - the ultimate education platform.",
            name: 'Jean D Elam',
            role: 'Medical Researcher',
            avatar: 'J'
        },
        {
            quote: "I love how the possibilities are endless. Your team has done incredible work!",
            name: 'Jason Green',
            role: 'Data Scientist',
            avatar: 'J'
        },
        {
            quote: "The best way to share notes and get paid for it. Truly revolutionary.",
            name: 'Sarah Chen',
            role: 'Engineering Student',
            avatar: 'S'
        },
        {
            quote: "AI summaries save me hours of reading. Noteveda is a game changer.",
            name: 'Michael Ross',
            role: 'Law Student',
            avatar: 'M'
        },
    ];

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-20 bg-white dark:bg-black transition-colors duration-300 overflow-hidden border-t border-gray-100 dark:border-gray-900">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Loved by Students
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                            Join thousands of learners who use Noteveda to master their subjects.
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2">
                        <button
                            suppressHydrationWarning
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            <ChevronLeftIcon size={24} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            suppressHydrationWarning
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            <ChevronRightIcon size={24} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Simple Horizontal Scroll */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
                >
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[85vw] sm:w-[400px] snap-center bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, j) => (
                                    <StarIcon key={j} size={18} className="text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-gray-900 dark:text-gray-100 text-lg md:text-xl font-medium mb-8 leading-relaxed">
                                "{t.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-700 dark:text-white font-bold text-lg">
                                    {t.avatar}
                                </div>
                                <div>
                                    <h4 className="text-gray-900 dark:text-white font-bold text-base">{t.name}</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================
// 9. FINAL CTA - Clean Dark
// ============================================
function FinalCTASection() {
    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="relative w-full rounded-3xl bg-[#0A0A0A] dark:bg-black overflow-hidden p-8 md:p-20 border border-gray-800 shadow-2xl">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

                    {/* 1. Base Dots (Faint/Gray) - Always visible */}
                    <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />

                    {/* 2. Highlight Dots (Bright/White) - Masked Wave Animation */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-[1]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                            // Define the mask: transparent -> black (visible) -> transparent
                            maskImage: 'linear-gradient(90deg, transparent, black, transparent)',
                            WebkitMaskImage: 'linear-gradient(90deg, transparent, black, transparent)',
                            maskSize: '50% 100%',
                            WebkitMaskSize: '50% 100%',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                        }}
                        // Animate the mask position from completely outside left (-50%) to completely outside right (150%)
                        animate={{
                            maskPosition: ['-50% 0', '150% 0'],
                            WebkitMaskPosition: ['-50% 0', '150% 0']
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="relative z-10 max-w-4xl">
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                            Start learning smarter<br className="hidden md:block" />
                            today.
                        </h2>

                        <p className="text-gray-400 mb-10 max-w-xl text-lg md:text-xl leading-relaxed">
                            Access premium resources, AI tools, and a community of learners.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/register"
                                className="
                                            w-full sm:w-auto
                                            px-8 py-4
                                            bg-white text-black
                                            font-semibold rounded-xl
                                            hover:bg-gray-100 hover:text-black
                                            transition-colors duration-200
                                            shadow-lg hover:shadow-xl
                                            text-center
                                            box-border
                                            leading-none
                                        "
                            >
                                Get Started Free
                            </Link>


                            <Link
                                href="/explore"
                                className="
                                            w-full sm:w-auto
                                            px-8 py-4
                                            bg-transparent
                                            hover:bg-white/5
                                            text-white font-semibold
                                            rounded-xl
                                            border border-gray-700
                                            transition-colors duration-200
                                            backdrop-blur-sm
                                            text-center
                                            box-border
                                            leading-none
                                        "
                            >
                                Browse Library
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
