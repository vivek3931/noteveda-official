'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ResourceCard } from '@/components/features';
import { authService, resourcesService, creditsService } from '@/lib';
import { CreditIcon, UploadIcon, SettingsIcon, GridIcon, TrendingIcon, ChevronRightIcon } from '@/components/icons';
import { Modal } from '@/components/ui/Modal';
import { useQueryClient } from '@tanstack/react-query';
import { Resource } from '@/types';

export default function ProfilePage() {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const queryClient = useQueryClient();

    // Fetch user data with caching
    const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authService.getMe(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });

    // Fetch credits with caching
    const { data: credits } = useQuery({
        queryKey: ['userCredits'],
        queryFn: () => creditsService.getCredits(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!user,
    });

    // Fetch uploads with caching
    const { data: userUploads = [] } = useQuery({
        queryKey: ['userUploads'],
        queryFn: () => resourcesService.getUserUploads(),
        staleTime: 2 * 60 * 1000,
        enabled: !!user,
    });

    React.useEffect(() => {
        if (user) {
            setEditName(user.name);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.updateProfile({ name: editName });
            await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            setIsEditOpen(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    const isLoading = isLoadingUser;
    const error = userError ? 'Please login to view your profile' : null;



    if (!isLoading && (error || !user)) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 transition-colors">
                <div className="max-w-md mx-auto py-20 px-6 text-center">
                    <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {error || 'Login Required'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please login to access your profile
                    </p>
                    <Link href="/login" className="btn btn-primary">
                        Login
                    </Link>
                </div>
            </main>

        );
    }

    const totalCredits = credits ? credits.dailyCredits + credits.uploadCredits : 0;

    const stats = [
        { label: 'Credits', value: totalCredits, icon: <CreditIcon size={20} /> },
        { label: 'Uploads', value: userUploads.length, icon: <UploadIcon size={20} /> },
    ];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24 transition-colors">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN - Profile Identity (Sidebar) */}
                    {/* Spans 4 cols on medium, 3 on large */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-6 md:sticky md:top-24">
                        {/* Identity Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden relative group"
                        >
                            {/* Decorative Banner */}
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />

                            <div className="relative z-10 flex flex-col items-center text-center mt-8">
                                {/* Avatar Ring */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="p-1.5 bg-white dark:bg-black rounded-full mb-4 ring-1 ring-gray-100 dark:ring-gray-800"
                                >
                                    <div className="w-24 h-24 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-display text-4xl font-bold">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                </motion.div>

                                <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {user?.name || 'User'}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                                    {user?.email}
                                </p>

                                {/* Meta Badges */}
                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                    <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                        Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '-'}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-xs font-semibold text-green-700 dark:text-green-400">
                                        Active
                                    </span>
                                </div>

                                {/* Primary Actions */}
                                <div className="w-full space-y-3">
                                    <button
                                        onClick={() => setIsEditOpen(true)}
                                        className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                                    >
                                        Edit Profile
                                    </button>
                                    <Link
                                        href="/settings"
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <SettingsIcon size={16} />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN - Content & Stats */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-8">
                        {/* Header */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Overview</h2>
                            <p className="text-gray-500 dark:text-gray-400">Your learning activity and contributions.</p>
                        </div>

                        {/* LINEAR Stats Row - Elegant & Clean (No Bento) */}
                        <div className="grid grid-cols-2 gap-4">
                            {isLoading ? (
                                [1, 2].map((i) => (
                                    <div key={i} className="h-32 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse" />
                                ))
                            ) : (
                                stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                                                {stat.icon}
                                            </div>
                                            {i === 0 && (
                                                <Link href="/pricing" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                                    Top up
                                                </Link>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {stat.label}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-black/5 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/upload"
                                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                >
                                    <div className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-md">
                                        <UploadIcon size={14} />
                                    </div>
                                    Upload Resource
                                </Link>
                                <Link
                                    href="/my-uploads"
                                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                >
                                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                                        <GridIcon size={14} />
                                    </div>
                                    Manage Uploads
                                </Link>
                            </div>
                        </div>

                        {/* Future Tab Content Area (Placeholder) */}
                        {/* <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                            <div className="flex gap-6 mb-6 border-b border-gray-200 dark:border-gray-800">
                                <button className="pb-3 border-b-2 border-black dark:border-white font-semibold text-gray-900 dark:text-white">Activity</button>
                                <button className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">History</button>
                            </div>
                            <div className="text-center py-12 text-gray-400 text-sm">
                                No recent activity to show.
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit Profile"
                size="sm"
            >
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>
        </main>
    );
}


