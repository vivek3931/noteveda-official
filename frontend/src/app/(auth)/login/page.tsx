'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

// Static testimonials - these could be fetched from an API in the future
const testimonials = [
    {
        quote: "Noteveda changed how I prepare for exams. The quality of resources here is unmatched.",
        name: "Arjun S.",
        role: "JEE Aspirant, AIR 342",
        initial: "A"
    },
    {
        quote: "I found all my NEET biology notes here. The community is incredibly helpful and supportive.",
        name: "Priya M.",
        role: "NEET 2024, 650+ Score",
        initial: "P"
    },
    {
        quote: "Best platform for competitive exam preparation. The credit system keeps me motivated to share my notes.",
        name: "Rahul K.",
        role: "CAT 99.5 Percentile",
        initial: "R"
    }
];

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    // Rotate testimonials every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login({ email, password });

            // Show success toast
            toast.success('Welcome back!');

            // Redirect to home
            router.push('/');
            router.refresh(); // Ensure auth state propagates
        } catch (err) {
            console.error('Login failed:', err);
            setError(err instanceof Error ? err.message : 'Invalid email or password');
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950 transition-colors">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px]"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Link href="/" className="inline-block mb-10">
                            <Image
                                src="/noteveda.png"
                                alt="Noteveda"
                                width={150}
                                height={40}
                                className="w-[130px] h-auto dark:hidden"
                                priority
                            />
                            <Image
                                src="/noteveda_dark.png"
                                alt="Noteveda"
                                width={150}
                                height={40}
                                className="w-[130px] h-auto hidden dark:block"
                                priority
                            />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="mb-8"
                    >
                        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                            Welcome back
                        </h1>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                            Sign in to continue your learning journey
                        </p>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex flex-col gap-5"
                    >
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="input"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <Link href="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="input"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
                            whileTap={!isLoading ? { scale: 0.99 } : {}}
                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </motion.button>
                    </motion.form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Social Login */}
                    <div className="flex gap-3">
                        {['Google', 'GitHub'].map((provider) => (
                            <motion.button
                                key={provider}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgb(249, 250, 251)' }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            >
                                {provider}
                            </motion.button>
                        ))}
                    </div>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium text-black dark:text-white hover:underline">
                            Sign up for free
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Testimonials Only */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-1 relative bg-black p-12 overflow-hidden items-center justify-center"
            >
                <div className="relative z-10 max-w-[420px]">
                    {/* Quote Mark */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-6xl text-white/20 font-serif mb-4"
                    >
                        &ldquo;
                    </motion.div>

                    {/* Testimonial Carousel */}
                    <div className="relative min-h-[200px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="text-2xl text-white leading-relaxed mb-8 font-light">
                                    {testimonials[currentTestimonial].quote}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-lg font-semibold">
                                        {testimonials[currentTestimonial].initial}
                                    </div>
                                    <div>
                                        <span className="block text-base font-medium text-white">
                                            {testimonials[currentTestimonial].name}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {testimonials[currentTestimonial].role}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Testimonial Indicators */}
                    <div className="flex gap-2 mt-8">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentTestimonial(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentTestimonial
                                    ? 'bg-white w-6'
                                    : 'bg-white/30 hover:bg-white/50'
                                    }`}
                                aria-label={`View testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)`
                }} />
            </motion.div>
        </div>
    );
}
