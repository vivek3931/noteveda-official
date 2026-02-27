'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Fade In animation variants
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { opacity: 0 }
};

// Fade In Up animation variants
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    },
    exit: { opacity: 0, y: -10 }
};

// Fade In Down animation variants
export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: { opacity: 0, y: 10 }
};

// Slide In Right animation variants
export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    exit: { opacity: 0, x: 100 }
};

// Slide In Left animation variants
export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    exit: { opacity: 0, x: -100 }
};

// Scale animation variants
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: { opacity: 0, scale: 0.95 }
};

// Stagger container variants
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// Stagger item variants (use with staggerContainer)
export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
};

// Hover scale effect
export const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2 }
};

// Tap effect
export const tapScale = {
    scale: 0.98
};

// Card hover animation
export const cardHover = {
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2, ease: 'easeOut' }
};

// Motion Components
interface MotionWrapperProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const FadeIn: React.FC<MotionWrapperProps> = ({ children, className = '', delay = 0 }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.3, delay } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const FadeInUp: React.FC<MotionWrapperProps> = ({ children, className = '', delay = 0 }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const SlideIn: React.FC<MotionWrapperProps & { direction?: 'left' | 'right' }> = ({
    children,
    className = '',
    delay = 0,
    direction = 'right'
}) => (
    <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
            hidden: { opacity: 0, x: direction === 'right' ? 100 : -100 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] } },
            exit: { opacity: 0, x: direction === 'right' ? 100 : -100 }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerContainer: React.FC<MotionWrapperProps & { staggerDelay?: number }> = ({
    children,
    className = '',
    staggerDelay = 0.1
}) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={{
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: { staggerChildren: staggerDelay, delayChildren: 0.1 }
            }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem: React.FC<MotionWrapperProps> = ({ children, className = '' }) => (
    <motion.div
        variants={staggerItem}
        className={className}
    >
        {children}
    </motion.div>
);

// Page transition wrapper
export const PageTransition: React.FC<{ children: ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
    >
        {children}
    </motion.div>
);

// Export AnimatePresence for use in layouts
export { motion, AnimatePresence };
