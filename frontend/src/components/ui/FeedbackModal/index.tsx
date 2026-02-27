'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon, StarIcon } from '@/components/icons';

// Feedback Modal Types
interface FeedbackData {
    rating: number;
    feedback: string;
    name: string;
    role: string;
}

interface FeedbackContextType {
    showFeedbackModal: () => void;
    hideFeedbackModal: () => void;
    hasSubmittedFeedback: boolean;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// Storage keys
const FEEDBACK_SUBMITTED_KEY = 'noteveda_feedback_submitted';
const FEEDBACK_CLOSED_KEY = 'noteveda_feedback_closed';

// Check if feedback was submitted
const checkFeedbackSubmitted = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(FEEDBACK_SUBMITTED_KEY) === 'true';
};

// Check if feedback was closed (to show again later)
const checkFeedbackClosed = (): number => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(FEEDBACK_CLOSED_KEY) || '0', 10);
};

// Feedback Modal Component
const FeedbackModalContent: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FeedbackData) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        onSubmit({ rating, feedback, name, role });
        setIsSubmitting(false);
    };

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
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl">
                                    <StarIcon size={28} />
                                </div>
                                <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
                                    How's your experience?
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Your feedback helps us improve Noteveda
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {/* Star Rating */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.15 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className={`p-1 transition-colors ${star <= (hoveredRating || rating)
                                                        ? 'text-yellow-500'
                                                        : 'text-gray-300'
                                                    }`}
                                            >
                                                <svg
                                                    width="32"
                                                    height="32"
                                                    viewBox="0 0 24 24"
                                                    fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                >
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                                </svg>
                                            </motion.button>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {rating === 0 ? 'Tap to rate' :
                                            rating === 1 ? 'Poor' :
                                                rating === 2 ? 'Fair' :
                                                    rating === 3 ? 'Good' :
                                                        rating === 4 ? 'Very Good' : 'Excellent!'}
                                    </span>
                                </div>

                                {/* Feedback Text */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Share your feedback (optional)
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="What do you like or what can we improve?"
                                        className="input min-h-[80px] resize-none text-sm"
                                        rows={3}
                                    />
                                </div>

                                {/* Name & Role */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500">Your Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="input text-sm py-2"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500">Your Role</label>
                                        <input
                                            type="text"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            placeholder="JEE Aspirant"
                                            className="input text-sm py-2"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={rating === 0 || isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Feedback Provider
export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(true); // Default true to prevent flash

    useEffect(() => {
        // Check if feedback was already submitted
        setHasSubmitted(checkFeedbackSubmitted());
    }, []);

    const showFeedbackModal = () => {
        if (!checkFeedbackSubmitted()) {
            setIsOpen(true);
        }
    };

    const hideFeedbackModal = () => {
        setIsOpen(false);
        // Store that user closed it (can show again on next visit)
        localStorage.setItem(FEEDBACK_CLOSED_KEY, Date.now().toString());
    };

    const handleSubmit = (data: FeedbackData) => {
        console.log('Feedback submitted:', data);
        // Mark as submitted permanently
        localStorage.setItem(FEEDBACK_SUBMITTED_KEY, 'true');
        setHasSubmitted(true);
        setIsOpen(false);

        // TODO: Send to API
        // await feedbackService.submit(data);
    };

    return (
        <FeedbackContext.Provider value={{
            showFeedbackModal,
            hideFeedbackModal,
            hasSubmittedFeedback: hasSubmitted
        }}>
            {children}
            <FeedbackModalContent
                isOpen={isOpen}
                onClose={hideFeedbackModal}
                onSubmit={handleSubmit}
            />
        </FeedbackContext.Provider>
    );
};

// Hook to use feedback modal
export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};

export default FeedbackProvider;
