'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { MenuIcon, SearchIcon, MessageSquareIcon, BellIcon, UserIcon, LogOutIcon, ChevronRightIcon, CompassIcon } from '@/components/icons'; // Ensure strictly existing icons
import { motion, AnimatePresence } from 'framer-motion';

interface AdminHeaderProps {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
}

export default function AdminHeader({ sidebarCollapsed, setSidebarCollapsed, setMobileMenuOpen }: AdminHeaderProps) {
    const { isDark } = useTheme();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-[60] bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 h-16 transition-colors">
            <div className="h-full px-4 flex items-center justify-between gap-4">
                {/* Left: Logo & Toggle */}
                <div className="flex items-center gap-4">
                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
                    >
                        <MenuIcon size={20} />
                    </button>

                    {/* Desktop Toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
                    >
                        <MenuIcon size={20} />
                    </button>

                    {/* Logo (Only visible if no sidebar or on mobile, but typically sidebar handles logo on desktop. 
                        Design choice: Keep sidebar full height, or header full width? 
                        User said "header same like user nav". User nav has logo. 
                        Let's put logo in Header and make sidebar sit *below* header on desktop? 
                        OR keep sidebar full height and just align styles? 
                        Most modern admins (Vercel/Stripe) have Sidebar below Header or Header on top.
                        Let's try: Header Full Width. Sidebar Left.
                    */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src={isDark ? '/noteveda_dark.png' : '/noteveda.png'}
                            alt="Noteveda Admin"
                            width={110}
                            height={32}
                            className="h-6 w-auto"
                        />
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded border border-gray-200 dark:border-gray-700">Admin</span>
                    </Link>
                </div>

                {/* Center: Search (Optional, mimicking user nav) */}
                <div className="hidden md:flex flex-1 max-w-md px-4">
                    {/* Placeholder for global admin search if needed */}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link href="/" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <CompassIcon size={16} />
                        <span>Live Site</span>
                    </Link>

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-semibold shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <UserIcon size={16} /> Profile
                                            </Link>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                                            <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">
                                                <LogOutIcon size={16} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
