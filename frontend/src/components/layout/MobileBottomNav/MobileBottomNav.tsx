'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, SearchIcon, PlusIcon, BookmarkIcon, CompassIcon, UserIcon, CreditIcon } from '@/components/icons';
import { useSaved } from '@/contexts/SavedContext';
import { useAuth } from '@/contexts/AuthContext';


const MobileBottomNav: React.FC = () => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { isAuthenticated } = useAuth(); // Use context instead of local state
    const isLoggedIn = isAuthenticated;
    const { savedCount } = useSaved();

    // Removed manual auth check useEffect since we use useAuth now

    // Navigation items - different when logged in vs logged out
    const getNavItems = () => {
        if (isLoggedIn) {
            return [
                { href: '/', icon: HomeIcon, label: 'Home' },
                { href: '/browse', icon: CompassIcon, label: 'Browse' },
                // Center button is handled separately
                { href: '/saved', icon: BookmarkIcon, label: 'Saved', badge: savedCount > 0 ? savedCount : undefined },
                { href: '/profile', icon: UserIcon, label: 'Profile' },
            ];
        } else {
            return [
                { href: '/', icon: HomeIcon, label: 'Home' },
                { href: '/browse', icon: CompassIcon, label: 'Browse' },
                // Center button is handled separately
                { href: '/pricing', icon: CreditIcon, label: 'Pricing' },
                { href: '/login', icon: UserIcon, label: 'Login' },
            ];
        }
    };

    const navItems = getNavItems();

    // Scroll detection for hide/show animation
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        const scrollDiff = currentScrollY - lastScrollY;

        // Only hide if scrolling down significantly (more than 10px)
        if (scrollDiff > 10 && currentScrollY > 50) {
            setIsVisible(false);
        } else if (scrollDiff < -5 || currentScrollY < 50) {
            // Show on scroll up or near top
            setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
    }, [lastScrollY]);

    useEffect(() => {
        // Throttle scroll events
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [handleScroll]);

    // Check if current path is active
    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    // Don't show on auth pages or resource page
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/resource')) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : 100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe"
            >
                <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
                    {/* Left nav items */}
                    {navItems.slice(0, 2).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive(item.href) ? 'text-black dark:text-white' : 'text-gray-500'}`}
                        >
                            <item.icon size={24} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}

                    {/* Center Upload Button */}
                    <div className="relative -top-5">
                        <Link
                            href={isLoggedIn ? '/upload' : '/login'}
                            className="flex items-center justify-center w-14 h-14 bg-black dark:bg-white rounded-full text-white dark:text-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <PlusIcon size={24} strokeWidth={2.5} />
                        </Link>
                    </div>

                    {/* Right nav items */}
                    {navItems.slice(2).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 relative ${isActive(item.href) ? 'text-black dark:text-white' : 'text-gray-500'}`}
                        >
                            <div className="relative">
                                <item.icon size={24} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center border border-white dark:border-black">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </motion.nav>
        </AnimatePresence>
    );
};

export default MobileBottomNav;
