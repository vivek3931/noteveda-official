'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CloseIcon } from '@/components/icons';

interface CreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCredits?: number;
    requiredCredits?: number;
}

// Coin Icon Component
const CoinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 6v12M9 9c0-1.5 1.5-2 3-2s3 .5 3 2-1.5 2-3 2-3 .5-3 2 1.5 2 3 2 3-.5 3-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const CreditsModal: React.FC<CreditsModalProps> = ({
    isOpen,
    onClose,
    currentCredits = 0,
    requiredCredits = 1,
}) => {
    const creditsNeeded = requiredCredits - currentCredits;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
                        >
                            <CloseIcon size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-6 sm:p-8">
                            <div className="text-center mb-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                    className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl"
                                >
                                    <CoinIcon size={32} />
                                </motion.div>
                                <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
                                    Not Enough Credits
                                </h2>
                                <p className="text-sm text-gray-500">
                                    You need <span className="font-semibold text-gray-700">{creditsNeeded} more credit{creditsNeeded > 1 ? 's' : ''}</span> to download this resource.
                                </p>
                            </div>

                            {/* Current Balance */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
                                <span className="text-sm text-gray-600">Your Balance</span>
                                <div className="flex items-center gap-2">
                                    <CoinIcon size={18} className="text-amber-500" />
                                    <span className="text-lg font-bold text-gray-900">{currentCredits}</span>
                                </div>
                            </div>

                            {/* Ways to Earn */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">How to earn credits:</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-xs font-semibold">1</span>
                                        <div>
                                            <span className="font-medium text-gray-900">Upload Study Materials</span>
                                            <p className="text-gray-500">Earn 1-5 credits for each approved upload</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">2</span>
                                        <div>
                                            <span className="font-medium text-gray-900">Wait for Daily Reset</span>
                                            <p className="text-gray-500">Free users receive 5 credits daily at midnight</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">3</span>
                                        <div>
                                            <span className="font-medium text-gray-900">Upgrade to Pro</span>
                                            <p className="text-gray-500">Get 50+ credits monthly with Pro subscription</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/upload"
                                    onClick={onClose}
                                    className="w-full py-3 bg-black text-white text-center font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Upload to Earn Credits
                                </Link>
                                <Link
                                    href="/pricing"
                                    onClick={onClose}
                                    className="w-full py-3 bg-white text-gray-900 text-center font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    View Pro Plans
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreditsModal;
