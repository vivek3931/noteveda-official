'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { authService, creditsService } from '@/lib';
import { User } from '@/types';
import { CreditBalance } from '@/lib/services/credits';
import { useToast } from '@/components/ui/Toast';
import {
    UserIcon, CreditIcon, SettingsIcon, LogOutIcon, ChevronRightIcon,
    LockIcon, BellIcon, MoonIcon, TrashIcon, DownloadIcon, ShieldIcon
} from '@/components/icons';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonButton } from '@/components/ui/Skeleton';

// Toggle Switch Component
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
    <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
        <motion.div
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow ${enabled ? 'bg-white dark:bg-black' : 'bg-white'}`}
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
    </button>
);

// Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">{title}</h3>
);

// Setting Item
const SettingItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    danger?: boolean;
    showArrow?: boolean;
}> = ({ icon, title, subtitle, value, onClick, href, danger, showArrow = true }) => {
    const content = (
        <div className={`flex items-center justify-between p-4 ${danger ? 'text-red-600 dark:text-red-400' : 'dark:text-white'}`}>
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${danger ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                    {icon}
                </div>
                <div>
                    <div className="font-medium text-sm">{title}</div>
                    {subtitle && <div className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</div>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {value}
                {showArrow && (href || onClick) && <ChevronRightIcon size={16} className="text-gray-400 dark:text-gray-500" />}
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">{content}</Link>;
    }

    if (onClick) {
        return <button onClick={onClick} className="w-full text-left border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">{content}</button>;
    }

    return <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">{content}</div>;
};

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsPageContent />
        </ProtectedRoute>
    );
}

function SettingsPageContent() {
    const router = useRouter();
    const toast = useToast();
    const { theme, toggleTheme, isDark } = useTheme();

    // Preferences state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

    // Fetch user data with caching
    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authService.getMe(),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    // Fetch credits with caching
    const { data: credits } = useQuery({
        queryKey: ['userCredits'],
        queryFn: () => creditsService.getCredits(),
        staleTime: 2 * 60 * 1000,
        enabled: !!user,
    });

    const isLoading = isLoadingUser;

    // Load preferences from localStorage on mount
    useEffect(() => {
        setEmailNotifications(localStorage.getItem('emailNotifications') !== 'false');
        setPushNotifications(localStorage.getItem('pushNotifications') === 'true');
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        router.push('/');
    };

    const handleToggleDarkMode = () => {
        toggleTheme();
        toast.success(`${!isDark ? 'Dark' : 'Light'} mode enabled`);
    };

    const handleToggleEmailNotifications = () => {
        const newValue = !emailNotifications;
        setEmailNotifications(newValue);
        localStorage.setItem('emailNotifications', newValue.toString());
    };

    const handleTogglePushNotifications = () => {
        const newValue = !pushNotifications;
        setPushNotifications(newValue);
        localStorage.setItem('pushNotifications', newValue.toString());
    };

    const handleChangePassword = () => {
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordForm.new.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        // API call would go here
        toast.success('Password changed successfully');
        setShowPasswordModal(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
    };

    const handleDeleteAccount = () => {
        // API call would go here
        toast.success('Account deletion requested');
        setShowDeleteModal(false);
        handleLogout();
    };

    const handleDownloadData = () => {
        toast.success('Your data export has been initiated. You will receive an email shortly.');
    };

    const totalCredits = credits ? credits.dailyCredits + credits.uploadCredits : 0;

    return (
        <>
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-0 transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between mb-6"
                    >
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <SettingsIcon size={32} />
                            Settings
                        </h1>
                        <Link href="/profile" className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                            View Profile
                        </Link>
                    </div>

                    {/* Account Overview */}
                    <div
                        className="mb-6"
                    >
                        <SectionHeader title="Account" />
                        {isLoading ? (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
                                    <SkeletonCircle size={56} className="bg-gray-200 dark:bg-gray-800" />
                                    <div className="flex-1 space-y-2">
                                        <SkeletonText width={120} height={20} className="bg-gray-200 dark:bg-gray-800" />
                                        <SkeletonText width={180} height={16} className="bg-gray-200 dark:bg-gray-800" />
                                    </div>
                                    <SkeletonButton width={60} height={32} className="bg-gray-200 dark:bg-gray-800" />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <CreditIcon size={18} className="text-gray-300 dark:text-gray-600" />
                                            </div>
                                            <div>
                                                <SkeletonText width={100} height={14} className="mb-1 bg-gray-200 dark:bg-gray-800" />
                                                <SkeletonText width={140} height={12} className="bg-gray-200 dark:bg-gray-800" />
                                            </div>
                                        </div>
                                        <SkeletonText width={40} height={20} className="bg-gray-200 dark:bg-gray-800" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-bold">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
                                    </div>
                                    <Link href="/profile" className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors">
                                        Edit
                                    </Link>
                                </div>
                                <SettingItem
                                    icon={<CreditIcon size={18} />}
                                    title="Credits Balance"
                                    subtitle="Daily + Upload credits"
                                    value={<span className="font-bold text-black dark:text-white">{totalCredits}</span>}
                                    href="/pricing"
                                />
                            </div>
                        )}
                    </div>

                    {/* Security */}
                    <div
                        className="mb-6"
                    >
                        <SectionHeader title="Security" />
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                            <SettingItem
                                icon={<LockIcon size={18} />}
                                title="Change Password"
                                subtitle="Update your password"
                                onClick={() => setShowPasswordModal(true)}
                            />
                            <SettingItem
                                icon={<ShieldIcon size={18} />}
                                title="Two-Factor Authentication"
                                subtitle="Add extra security to your account"
                                value={<span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Coming Soon</span>}
                                showArrow={false}
                            />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div
                        className="mb-6"
                    >
                        <SectionHeader title="Preferences" />
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                            <SettingItem
                                icon={<MoonIcon size={18} />}
                                title="Dark Mode"
                                subtitle="Switch between light and dark theme"
                                value={<ToggleSwitch enabled={isDark} onChange={handleToggleDarkMode} />}
                                showArrow={false}
                            />
                            <SettingItem
                                icon={<BellIcon size={18} />}
                                title="Email Notifications"
                                subtitle="Receive updates via email"
                                value={<ToggleSwitch enabled={emailNotifications} onChange={handleToggleEmailNotifications} />}
                                showArrow={false}
                            />
                            <SettingItem
                                icon={<BellIcon size={18} />}
                                title="Push Notifications"
                                subtitle="Receive browser notifications"
                                value={<ToggleSwitch enabled={pushNotifications} onChange={handleTogglePushNotifications} />}
                                showArrow={false}
                            />
                        </div>
                    </div>

                    {/* Data & Privacy */}
                    <div
                        className="mb-6"
                    >
                        <SectionHeader title="Data & Privacy" />
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                            <SettingItem
                                icon={<DownloadIcon size={18} />}
                                title="Download My Data"
                                subtitle="Get a copy of your data"
                                onClick={handleDownloadData}
                            />
                            <SettingItem
                                icon={<TrashIcon size={18} />}
                                title="Delete Account"
                                subtitle="Permanently delete your account and data"
                                onClick={() => setShowDeleteModal(true)}
                                danger
                            />
                        </div>
                    </div>

                    {/* Logout */}
                    <div
                        className="mb-6"
                    >
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                            <SettingItem
                                icon={<LogOutIcon size={18} />}
                                title="Log Out"
                                onClick={handleLogout}
                                danger
                                showArrow={false}
                            />
                        </div>
                    </div>

                    {/* App Version */}
                    <div
                        className="text-center text-xs text-gray-400 mt-8"
                    >
                        <p>Noteveda v1.0.0</p>
                    </div>
                </div>
            </main>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md"
                        >
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Change Password</h2>
                            <div className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={passwordForm.current}
                                    onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={passwordForm.new}
                                    onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={passwordForm.confirm}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    Cancel
                                </button>
                                <button onClick={handleChangePassword} className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200">
                                    Update Password
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto">
                                <TrashIcon size={24} className="text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Delete Account?</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
                                This action is permanent. All your data, uploads, and credits will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                                    Cancel
                                </button>
                                <button onClick={handleDeleteAccount} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                                    Delete Account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </>
    );
}
