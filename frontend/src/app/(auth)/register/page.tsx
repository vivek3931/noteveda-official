'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { PlatformStats } from '@/types';
import { categoriesService } from '@/lib';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<PlatformStats | null>(null);

    // Fetch real stats for the right side
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await categoriesService.getStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await register({ name, email, password });

            // Show success toast
            toast.success(`Welcome to Noteveda, ${name}!`);

            // Redirect to home
            router.push('/');
            router.refresh();
        } catch (err) {
            console.error('Registration failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
        return num.toString() + '+';
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
                            Create your account
                        </h1>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                            Start your learning journey with 5 free daily credits
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

                    {/* Register Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex flex-col gap-5"
                    >
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="input"
                                required
                                disabled={isLoading}
                            />
                        </div>

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
                            <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="input"
                                required
                                disabled={isLoading}
                                minLength={8}
                            />
                            <span className="text-xs text-gray-500">Must be at least 8 characters</span>
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-0.5 w-4 h-4 accent-black"
                                disabled={isLoading}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                I agree to the{' '}
                                <Link href="/terms" className="text-black dark:text-white font-medium underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-black dark:text-white font-medium underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
                            whileTap={!isLoading ? { scale: 0.99 } : {}}
                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </motion.button>
                    </motion.form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                        <span className="px-4 text-sm text-gray-500">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                    </div>

                    {/* Social Login */}
                    <div className="flex gap-3">
                        {['Google', 'GitHub'].map((provider) => (
                            <motion.button
                                key={provider}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgb(249, 250, 251)' }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                            >
                                {provider}
                            </motion.button>
                        ))}
                    </div>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-black dark:text-white hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Visual Stats with Real Data */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex flex-1 relative bg-black p-12 overflow-hidden items-center justify-center"
            >
                <div className="relative z-10 max-w-[400px]">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-display text-3xl font-bold text-white mb-10"
                    >
                        Join thousands of students
                    </motion.h2>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.4 } }
                        }}
                        className="flex flex-col gap-8"
                    >
                        {[
                            { value: stats ? formatNumber(stats.totalUsers) : '...', label: 'Active Students', desc: 'Learning together' },
                            { value: stats ? formatNumber(stats.totalResources) : '...', label: 'Resources', desc: 'Notes, guides & more' },
                            { value: stats ? formatNumber(stats.totalDownloads) : '...', label: 'Downloads', desc: 'And counting' },
                            { value: stats ? stats.categories.toString() : '...', label: 'Categories', desc: 'All domains covered' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, x: -30 },
                                    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                                }}
                                className="flex items-center gap-4"
                            >
                                <span className="font-display text-4xl font-bold text-white tracking-tight min-w-[80px]">
                                    {stat.value}
                                </span>
                                <div>
                                    <span className="block text-sm font-medium text-white">{stat.label}</span>
                                    <span className="text-xs text-gray-500">{stat.desc}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="mt-10 pt-8 border-t border-white/10"
                    >
                        <p className="text-sm text-gray-400 mb-3">What you get:</p>
                        <ul className="space-y-2">
                            {['5 free daily credits', 'Access to all resources', 'Upload & earn credits', 'AI-powered study tools'].map((benefit, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-green-400">✓</span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.03) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)`
                }} />
            </motion.div>
        </div>
    );
}
