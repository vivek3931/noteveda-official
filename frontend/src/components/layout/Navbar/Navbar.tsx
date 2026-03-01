'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, UserIcon, CreditIcon, UploadIcon, CloseIcon, BookmarkIcon, LogOutIcon, ChevronRightIcon, CompassIcon, FilePdfIcon, DocumentIcon } from '@/components/icons';
import Image from 'next/image';
import MobileBottomNav from '../MobileBottomNav/MobileBottomNav';
import { useSaved } from '@/contexts/SavedContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { resourcesService } from '@/lib/services/resources';


const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { isDark } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { savedCount } = useSaved();
    const router = useRouter();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Fetch suggestions
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ['navbarSearch', debouncedSearch],
        queryFn: () => resourcesService.getResources({ search: debouncedSearch, limit: 5 }),
        enabled: debouncedSearch.length >= 2,
        staleTime: 60 * 1000,
    });
    const suggestions = searchResults?.items || [];

    // Derived user state
    const isLoggedIn = isAuthenticated;
    const userName = user?.name || '';
    const userCredits = user?.dailyCredits || 0;

    const navLinks = [
        { href: '/browse', label: 'Browse Resources' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/upload', label: 'Upload' },
    ];

    // Additional link for authenticated users in mobile
    const mobileAuthLink = { href: '/my-uploads', label: 'My Uploads' };
    const supportLink = { href: '/support', label: 'Help & Support' };

    const handleLogout = async () => {
        setIsProfileOpen(false);
        await logout();
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Other Effects
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-[70] bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src={isDark ? '/noteveda_dark.png' : '/noteveda.png'}
                                alt="Noteveda"
                                width={150}
                                height={40}
                                className="w-[120px] sm:w-[150px] h-auto"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Search Bar - VISIBLE ON MD+ */}
                    <div
                        ref={searchContainerRef}
                        className={`hidden md:flex flex-1 max-w-md items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 relative ${isSearchFocused || showSuggestions
                            ? 'bg-white dark:bg-gray-900 border border-black dark:border-white ring-2 ring-black/5 dark:ring-white/5'
                            : 'bg-gray-50 dark:bg-gray-900 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <SearchIcon size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.length >= 2) setShowSuggestions(true);
                            }}
                            placeholder="Search notes, guides, PYQs..."
                            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            onFocus={() => {
                                setIsSearchFocused(true);
                                if (searchQuery.length >= 2) setShowSuggestions(true);
                            }}
                            onBlur={() => {
                                setIsSearchFocused(false);
                                // Don't hide immediately to allow clicking suggestions
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setShowSuggestions(false);
                                    if (searchQuery.trim()) {
                                        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                    }
                                }
                            }}
                            suppressHydrationWarning
                        />
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white rounded-full animate-spin" />
                        ) : (
                            <kbd className="hidden lg:block px-2 py-0.5 text-[10px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">⌘K</kbd>
                        )}

                        {/* Search Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && debouncedSearch.length >= 2 && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-[80]"
                                >
                                    <div className="p-2">
                                        {suggestions.map((resource) => (
                                            <Link
                                                key={resource.id}
                                                href={`/resource/${resource.id}`}
                                                onClick={() => {
                                                    setShowSuggestions(false);
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                            >
                                                <div className="mt-1 p-1.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors relative w-10 h-10 flex items-center justify-center overflow-hidden">
                                                    {resource.thumbnailUrl ? (
                                                        <Image
                                                            src={resource.thumbnailUrl}
                                                            alt=""
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    ) : (
                                                        (resource.fileType as string) === 'pdf' ? <FilePdfIcon size={20} /> : <DocumentIcon size={20} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {resource.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {resource.subject} • {resource.domain}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                        <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                                            <Link
                                                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                                className="flex items-center justify-center w-full p-2 text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                                onClick={() => setShowSuggestions(false)}
                                            >
                                                View all results for "{searchQuery}"
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Nav Links & Auth - VISIBLE ON MD+ */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Nav items with icons */}
                        <Link href="/browse" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            <CompassIcon size={16} />
                            Browse
                        </Link>

                        {isLoggedIn ? (
                            <>
                                <Link href="/saved" className="relative flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    <BookmarkIcon size={16} />
                                    Saved
                                    {savedCount > 0 && (
                                        <span className="absolute -top-2 -right-3 min-w-[16px] h-4 px-1 text-[9px] font-bold text-white dark:text-black bg-black dark:bg-white rounded-full flex items-center justify-center tabular-nums">
                                            {savedCount}
                                        </span>
                                    )}
                                </Link>
                                <Link href="/upload" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 dark:hover:text-black transition-colors">
                                    <UploadIcon size={16} />
                                    Upload
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-semibold">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <ChevronRightIcon size={14} className={`text-gray-400 dark:text-gray-500 transition-transform ${isProfileOpen ? '-rotate-90' : 'rotate-90'}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsProfileOpen(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                                                >
                                                    {/* Credits display */}
                                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <CreditIcon size={16} />
                                                            <span>Credits: <strong className="text-black dark:text-white tabular-nums">{userCredits}</strong></span>
                                                        </div>
                                                    </div>

                                                    {/* Menu items */}
                                                    <div className="py-1">
                                                        <Link
                                                            href="/profile"
                                                            onClick={() => setIsProfileOpen(false)}
                                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                        >
                                                            <UserIcon size={16} />
                                                            Profile
                                                        </Link>
                                                        <Link
                                                            href="/my-uploads"
                                                            onClick={() => setIsProfileOpen(false)}
                                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                        >
                                                            <UploadIcon size={16} />
                                                            My Uploads
                                                        </Link>
                                                        <Link
                                                            href="/pricing"
                                                            onClick={() => setIsProfileOpen(false)}
                                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                        >
                                                            <CreditIcon size={16} />
                                                            Get More Credits
                                                        </Link>
                                                        <Link
                                                            href="/support"
                                                            onClick={() => setIsProfileOpen(false)}
                                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                        >
                                                            <CompassIcon size={16} /> {/* Using compass as placeholder, maybe change to Help/CircleHelp if available */}
                                                            Help & Support
                                                        </Link>
                                                    </div>

                                                    {/* Logout */}
                                                    <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                        >
                                                            <LogOutIcon size={16} />
                                                            Logout
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/pricing" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    <CreditIcon size={16} />
                                    Pricing
                                </Link>
                                <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    Login
                                </Link>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link
                                        href="/register"
                                        className="
                                                    px-4 py-2 text-sm font-semibold
                                                    text-white dark:text-black
                                                    bg-black dark:bg-white
                                                    rounded-lg
                                                    hover:bg-gray-800 hover:text-white
                                                    dark:hover:bg-gray-200 dark:hover:text-black
                                                    transition-colors
                                                "
                                    >
                                        Get Started
                                    </Link>

                                </motion.div>
                            </>
                        )}
                    </div>

                    {/* Mobile Right Side - VISIBLE ON MOBILE ONLY */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Mobile Search Icon */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSearchOpen(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            aria-label="Search"
                            suppressHydrationWarning
                        >
                            <SearchIcon size={22} />
                        </motion.button>

                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="relative w-10 h-10 flex items-center justify-center"
                            aria-label="Toggle menu"
                            suppressHydrationWarning
                        >
                            <div className="space-y-1.5 w-8">
                                <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMenuOpen ? 'w-8 rotate-45 translate-y-2' : 'w-8'}`}></span>
                                <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ml-auto ${isMenuOpen ? 'w-0 opacity-0' : 'w-6'}`}></span>
                                <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMenuOpen ? 'w-8 -rotate-45 -translate-y-2' : 'w-8'}`}></span>
                            </div>
                        </button>
                    </div>
                </nav >

                {/* Mobile Search Overlay - MOBILE ONLY */}
                <AnimatePresence>
                    {
                        isSearchOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="md:hidden absolute inset-0 h-16 bg-white dark:bg-gray-950 z-50 flex items-center px-4"
                            >
                                <SearchIcon size={22} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search resources..."
                                    className="flex-1 ml-3 text-base text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const value = (e.target as HTMLInputElement).value;
                                            if (value.trim()) {
                                                setIsSearchOpen(false);
                                                router.push(`/search?q=${encodeURIComponent(value)}`);
                                            }
                                        }
                                    }}
                                />
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                >
                                    <CloseIcon size={22} />
                                </motion.button>
                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </header >

            {/* Full-Screen Mobile Nav Overlay - MOBILE ONLY */}
            <AnimatePresence>
                {
                    isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[60] bg-white dark:bg-black md:hidden"
                        >
                            <motion.nav
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.25, delay: 0.05 }}
                                className="flex flex-col h-full pt-24 px-8"
                            >
                                {/* Mobile Nav Search */}
                                <div className="flex items-center gap-3 px-4 py-3 mb-8 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                    <SearchIcon size={20} className="text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search resources..."
                                        className="flex-1 bg-transparent text-base text-gray-900 dark:text-white outline-none placeholder:text-gray-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const value = (e.target as HTMLInputElement).value;
                                                if (value.trim()) {
                                                    setIsMenuOpen(false);
                                                    router.push(`/search?q=${encodeURIComponent(value)}`);
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                {/* Links */}
                                <div className="flex flex-col gap-1">
                                    {[...navLinks, ...(isLoggedIn ? [mobileAuthLink, supportLink] : [{ href: '/about', label: 'About Us' }, supportLink])].map((link, i) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.06 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block py-4 text-2xl font-semibold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors border-b border-gray-200 dark:border-gray-800"
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Auth Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="mt-auto pb-12 flex flex-col gap-3"
                                >
                                    {isLoggedIn ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block py-4 text-center text-lg font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                            >
                                                My Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="block w-full py-4 text-center text-lg font-semibold text-white dark:text-black bg-black dark:bg-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                            >
                                                Log Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block py-4 text-center text-lg font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block py-4 text-center text-lg font-semibold text-white dark:text-black bg-black dark:bg-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                            >
                                                Get Started Free
                                            </Link>
                                        </>
                                    )}
                                </motion.div>
                            </motion.nav>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Mobile Bottom Navigation */}
            < MobileBottomNav />
        </>
    );
};

export default Navbar;
