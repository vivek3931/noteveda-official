'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@/components/icons';
import {
    MailIcon, PhoneIcon, MapPinIcon, SendIcon,
    ClockIcon, MessageIcon
} from '@/components/icons';

// FAQ Accordion Item Component
const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({
    question, answer, isOpen, onToggle
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
    >
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
            <h3 className="font-medium text-gray-900 dark:text-white pr-4">{question}</h3>
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 text-gray-400 dark:text-gray-500"
            >
                <ChevronDownIcon size={20} />
            </motion.div>
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
    </motion.div>
);

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSubmitted(true);
        setIsSubmitting(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const contactInfo = [
        { icon: <MailIcon size={24} />, label: 'Email', value: 'support@noteveda.com', href: 'mailto:support@noteveda.com' },
        { icon: <PhoneIcon size={24} />, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
        { icon: <MapPinIcon size={24} />, label: 'Location', value: 'Navi Mumbai, India', href: null },
        { icon: <ClockIcon size={24} />, label: 'Response Time', value: 'Within 24 hours', href: null },
    ];

    const faqs = [
        {
            q: 'How do credits work?',
            a: 'You get 5 free credits daily that reset every 24 hours. Each download costs 1 credit. You can earn additional credits by uploading quality study materials - once approved, you\'ll receive bonus credits that don\'t expire.'
        },
        {
            q: 'How can I become a contributor?',
            a: 'Simply sign up for a free account, navigate to the Upload page, and submit your study materials. Our team reviews all submissions for quality and accuracy. Once approved, you\'ll earn credits and your resources will be available to the community.'
        },
        {
            q: 'Is there a premium plan?',
            a: 'Yes! Our Pro plan offers unlimited downloads, no daily credit limits, priority support, and early access to new features. Check out our Pricing page for detailed information and current offers.'
        },
        {
            q: 'How do I report an issue with a resource?',
            a: 'You can report issues directly from any resource page using the "Report" button. Alternatively, contact us through this form by selecting "Technical Support" as the subject. We take all reports seriously and review them within 24 hours.'
        },
        {
            q: 'Can I request specific study materials?',
            a: 'Absolutely! You can submit requests through our contact form. While we can\'t guarantee availability, we actively encourage our contributor community to help fulfill requests.'
        },
    ];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Hero Section */}
            <section className="relative bg-black text-white py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                }} />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div>
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-white/10 rounded-full">
                            Contact Us
                        </span>
                        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-gray-300 max-w-xl mx-auto">
                            Have a question or feedback? We'd love to hear from you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {contactInfo.map((info, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center"
                            >
                                <div className="w-12 h-12 flex items-center justify-center mb-3 bg-black dark:bg-white text-white dark:text-black rounded-lg">
                                    {info.icon}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{info.label}</span>
                                {info.href ? (
                                    <a href={info.href} className="text-sm font-medium text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-300 hover:underline">
                                        {info.value}
                                    </a>
                                ) : (
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{info.value}</span>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Contact Form & FAQ */}
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Send us a Message</h2>
                            <p className="text-gray-600 dark:text-gray-400">We&apos;ll get back to you within 24 hours</p>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                                        <MessageIcon size={32} />
                                    </div>
                                    <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">Message Sent!</h3>
                                    <p className="text-sm text-green-600 dark:text-green-500">Thank you for contacting us. We&apos;ll respond within 24 hours.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-4 text-sm text-green-700 underline"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Your name"
                                                className="input"
                                                required
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                className="input"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="subject" className="text-sm font-medium text-gray-900 dark:text-white">Subject</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23737373%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"
                                            required
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="support">Technical Support</option>
                                            <option value="billing">Billing / Credits</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="feedback">Feedback</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="message" className="text-sm font-medium text-gray-900 dark:text-white">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="How can we help you?"
                                            rows={5}
                                            className="input resize-y min-h-[120px]"
                                            required
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                                        whileTap={!isSubmitting ? { scale: 0.99 } : {}}
                                        className="w-full py-4 px-6 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        <SendIcon size={18} />
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>

                        {/* FAQ with Accordion */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Quick answers to common questions</p>

                            <div className="flex flex-col gap-3">
                                {faqs.map((faq, i) => (
                                    <FAQItem
                                        key={i}
                                        question={faq.q}
                                        answer={faq.a}
                                        isOpen={openFAQ === i}
                                        onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>

    );
}
