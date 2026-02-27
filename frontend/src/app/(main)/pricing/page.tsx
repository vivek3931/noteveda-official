'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, SparkleIcon, ChevronDownIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

import { paymentsService, plansService } from '@/lib';
import { useQuery } from '@tanstack/react-query';
import { Plan } from '@/types';

// FAQ Accordion Item Component
const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({
    question, answer, isOpen, onToggle
}) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
            <h3 className="font-medium text-gray-900 dark:text-white pr-4">{question}</h3>
            <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-400 dark:text-gray-500`}>
                <ChevronDownIcon size={20} />
            </div>
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <div className="px-5 pb-5 pt-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800">
                        <p className="pt-4">{answer}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default function PricingPage() {
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);
    const { isAuthenticated, user } = useAuth();
    const toast = useToast();

    // Fetch Plans from Backend
    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: plansService.getPlans,
        staleTime: 60 * 60 * 1000, // 1 hour
    });

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscription = async (plan: Plan) => {
        // Map backend plan interval to enum expected by backend createOrder
        // NOTE: Backend expects "MONTHLY" or "YEARLY" which matches our Plan model
        if (!plan.interval) return;

        try {
            const res = await loadRazorpay();
            if (!res) {
                toast.error('Razorpay SDK failed to load. Please check your connection.');
                return;
            }

            // Pass plan.id instead of interval
            const order = await paymentsService.createOrder(plan.id);

            if (!order || !order.key) {
                toast.error('Payment configuration missing. Please contact support.');
                console.error('Missing key or order details:', order);
                return;
            }

            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: 'Noteveda',
                description: `${plan.name} Subscription`,
                order_id: order.orderId,
                handler: async (response: any) => {
                    try {
                        await paymentsService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: plan.id
                        });
                        toast.success('Welcome to Pro! Your subscription is active.');
                        setTimeout(() => window.location.href = '/settings', 2000);
                    } catch (err) {
                        toast.error('Payment verification failed.');
                        console.error(err);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#000000',
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error('Payment failed:', response.error);
                toast.error(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (err) {
            console.error('Payment initialization failed:', err);
            toast.error('Failed to start payment. Please try again.');
        }
    };

    const faqs = [
        {
            question: 'How do credits work?',
            answer: 'Each download costs 1 credit. Free users get 5 credits daily that reset every 24 hours. You can earn additional credits by uploading quality study materials - once approved, you receive bonus credits. Pro subscribers get credits included in their plan, with yearly subscribers enjoying unlimited credits.'
        },
        {
            question: 'Can I cancel my subscription anytime?',
            answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access to Pro features until the end of your current billing period. No questions asked, no cancellation fees."
        },
        {
            question: 'What happens to my uploaded resources?',
            answer: "Your uploaded resources remain on the platform even if you cancel your subscription. You'll continue to earn credits whenever other users download your materials, regardless of your subscription status."
        },
        {
            question: 'Is there a refund policy?',
            answer: "We offer a 7-day money-back guarantee if you're not satisfied with our Pro plans. Simply contact our support team within 7 days of your purchase for a full refund, no questions asked."
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI, net banking, and popular wallets like Paytm and PhonePe. All payments are processed securely through Razorpay.'
        },
        {
            question: 'Can I switch between plans?',
            answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the new rate applies from your next billing cycle.'
        },
    ];

    const formatPrice = (price: number, currency: string) => {
        if (price === 0) return 'Free';
        const symbol = currency === 'INR' ? '₹' : '$';
        return `${symbol}${price.toLocaleString()}`;
    };

    const getPeriod = (interval: string) => {
        if (interval === 'MONTHLY') return '/month';
        if (interval === 'YEARLY') return '/year';
        return 'forever';
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
            {/* Hero */}
            <section className="pt-20 pb-12 text-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <span className="block text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Pricing</span>
                    <h1 className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
                        Choose the Perfect Plan<br />for Your Learning Journey
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">Start free and upgrade when you need more. No hidden fees, cancel anytime.</p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 -mt-12">


                <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
                    {isLoading ? (
                        // Skeleton Loaders
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="relative flex flex-col p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-[500px]">
                                <div className="space-y-4 mb-8">
                                    <div className="w-24 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </div>
                                <div className="space-y-3 flex-1">
                                    {Array(5).fill(0).map((_, j) => (
                                        <div key={j} className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                    ))}
                                </div>
                                <div className="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mt-8" />
                            </div>
                        ))
                    ) : (
                        plans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                className={`relative flex flex-col p-8 rounded-2xl border transition-colors ${plan.highlighted ? 'bg-black text-white border-black dark:border-gray-700' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                    }`}
                            >
                                {plan.badge && (
                                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold uppercase tracking-wide rounded-full ${plan.highlighted ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700'
                                        }`}>
                                        {plan.badge}
                                    </span>
                                )}
                                <div className="mb-6">
                                    <h3 className="font-display text-xl font-bold mb-1">{plan.name}</h3>
                                    <p className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>{plan.description}</p>
                                </div>
                                <div className="flex items-baseline gap-1 mb-6">
                                    {plan.price === 0 ? (
                                        <span className="font-display text-4xl font-extrabold tracking-tight">Free</span>
                                    ) : (
                                        <div className="flex items-baseline font-display text-4xl font-extrabold tracking-tight">
                                            {formatPrice(plan.price, plan.currency)}
                                        </div>
                                    )}
                                    <span className={`text-sm ${plan.highlighted ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {plan.interval === 'MONTHLY' ? '/month' : (plan.interval === 'YEARLY' ? '/year' : 'forever')}
                                    </span>
                                </div>
                                <ul className="flex flex-col gap-3 mb-8 flex-1">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm">
                                            <CheckIcon size={16} className={plan.highlighted ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {isAuthenticated ? (
                                        plan.price === 0 ? (
                                            <Link
                                                href="/browse"
                                                className={`block w-full py-4 text-center font-semibold rounded-lg transition-colors ${plan.highlighted
                                                    ? 'bg-white text-black hover:bg-gray-200'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                Get Started
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleSubscription(plan)}
                                                className={`block w-full py-4 text-center font-semibold rounded-lg transition-colors ${plan.highlighted
                                                    ? 'bg-white text-black hover:bg-gray-200'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {plan.cta}
                                            </button>
                                        )
                                    ) : (
                                        <Link
                                            href={plan.ctaLink || '/register'}
                                            className={`block w-full py-4 text-center font-semibold rounded-lg transition-colors ${plan.highlighted
                                                ? 'bg-white text-black hover:bg-gray-200'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {plan.cta}
                                        </Link>
                                    )}
                                </motion.div>
                            </motion.div>
                        ))
                    )}
                    {!isLoading && plans.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No pricing plans available at the moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        What&apos;s Included
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: 'AI-Powered Summaries', desc: 'Get instant summaries of any document to quickly understand key concepts.' },
                            { title: 'Smart Q&A Chatbot', desc: 'Ask questions about documents and get context-aware answers instantly.' },
                            { title: 'Premium Content Library', desc: 'Access 12,500+ curated study materials across all subjects and exams.' },
                            { title: 'Earn While You Learn', desc: 'Upload quality content and earn credits when others download your materials.' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <SparkleIcon size={24} className="text-black dark:text-white flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ with Accordion */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-10">Click on a question to reveal the answer.</p>

                    <div className="flex flex-col gap-3">
                        {faqs.map((faq, i) => (
                            <FAQItem
                                key={i}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFAQ === i}
                                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            {!isAuthenticated && (
                <section className="py-16 bg-black text-center">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="font-display text-3xl font-bold text-white mb-3">Ready to Accelerate Your Learning?</h2>
                        <p className="text-base text-gray-400 mb-8">Join thousands of students already using Noteveda</p>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link href="/register" className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                Get Started Free
                            </Link>
                        </motion.div>
                    </div>
                </section>
            )}
        </main>
    );
}
