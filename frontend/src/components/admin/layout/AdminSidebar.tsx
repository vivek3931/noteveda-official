'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsIcon, LogOutIcon } from '@/components/icons';
import Link from 'next/link';

interface NavItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

interface AdminSidebarProps {
    sidebarCollapsed: boolean;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    activeNav: string;
    setActiveNav: (key: any) => void;
    navItems: NavItem[];
}

export default function AdminSidebar({
    sidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    activeNav,
    setActiveNav,
    navItems
}: AdminSidebarProps) {

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 z-[65] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside className={`
                fixed lg:sticky top-[64px] left-0 h-[calc(100vh-64px)] z-[65] lg:z-30 
                bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 
                transition-all duration-300 flex flex-col
                ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
                ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
            `}>
                <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = activeNav === item.key;
                        return (
                            <button
                                key={item.key}
                                onClick={() => { setActiveNav(item.key); setMobileMenuOpen(false); }}
                                className={`
                                    relative flex items-center w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-gray-100 dark:bg-gray-800/60 text-black dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-black dark:hover:text-white'
                                    }
                                `}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                    {item.icon}
                                </span>

                                <span className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'} ml-2`}>
                                    {item.label}
                                </span>

                                {!sidebarCollapsed && item.badge && item.badge > 0 && (
                                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                        {item.badge}
                                    </span>
                                )}

                                {/* Active indicator line for collapsed state */}
                                {isActive && sidebarCollapsed && (
                                    <motion.div layoutId="activeInd" className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full hidden lg:block" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                    <Link
                        href="/settings"
                        className="flex items-center w-full p-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-black dark:hover:text-gray-200 transition-all"
                    >
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                            <SettingsIcon size={20} />
                        </span>
                        <span className={`flex-1 text-left ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
                            Settings
                        </span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
