'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';


// Helper function to parse simple markdown (bold text)
const parseMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export default function PrivacyPage() {
    const sections = [
        {
            title: '1. Information We Collect',
            content: [
                { type: 'text', value: 'When you use Noteveda, we collect certain information to provide and improve our services:' },
                { type: 'heading', value: 'Personal Information:' },
                {
                    type: 'list', items: [
                        'Name, email address, and profile picture when you create an account',
                        'Payment information when you subscribe to our Pro plans (processed securely through Razorpay)',
                        'Educational details you choose to share (institution, field of study, etc.)'
                    ]
                },
                { type: 'heading', value: 'Usage Information:' },
                {
                    type: 'list', items: [
                        'Resources you upload, download, and view',
                        'Search queries and browsing history within our platform',
                        'Device information, IP address, and browser type',
                        'Session duration and interaction patterns'
                    ]
                },
                { type: 'heading', value: 'Cookies and Tracking:' },
                {
                    type: 'list', items: [
                        'We use essential cookies for authentication and session management',
                        'Analytics cookies help us understand how users interact with our platform',
                        'You can manage cookie preferences in your browser settings'
                    ]
                }
            ]
        },
        {
            title: '2. How We Use Your Information',
            content: [
                { type: 'text', value: 'We use the information we collect for the following purposes:' },
                { type: 'heading', value: 'Service Delivery:' },
                {
                    type: 'list', items: [
                        'To create and manage your account',
                        'To process downloads and credit transactions',
                        'To enable uploading and sharing of study materials',
                        'To provide customer support'
                    ]
                },
                { type: 'heading', value: 'Personalization:' },
                {
                    type: 'list', items: [
                        'To recommend relevant study materials based on your interests',
                        'To customize your homepage and search results',
                        'To remember your preferences and settings'
                    ]
                },
                { type: 'heading', value: 'Communication:' },
                {
                    type: 'list', items: [
                        'To send important account notifications',
                        'To inform you about new features and updates',
                        'To respond to your inquiries and support requests'
                    ]
                },
                { type: 'heading', value: 'Safety and Security:' },
                {
                    type: 'list', items: [
                        'To detect and prevent fraud, abuse, and security threats',
                        'To enforce our Terms of Service',
                        'To comply with legal obligations'
                    ]
                }
            ]
        },
        {
            title: '3. Information Sharing',
            content: [
                { type: 'text', value: 'We do not sell your personal information. We may share your information in the following limited circumstances:' },
                { type: 'heading', value: 'With Your Consent:' },
                { type: 'list', items: ['When you explicitly authorize us to share specific information'] },
                { type: 'heading', value: 'Service Providers:' },
                {
                    type: 'list', items: [
                        'With trusted third-party services that help us operate our platform (hosting, payment processing, email delivery)',
                        'These providers are contractually obligated to protect your data'
                    ]
                },
                { type: 'heading', value: 'Public Information:' },
                {
                    type: 'list', items: [
                        'Your username and uploaded resources are visible to other users',
                        'You can control visibility settings for your profile'
                    ]
                },
                { type: 'heading', value: 'Legal Requirements:' },
                {
                    type: 'list', items: [
                        'When required by law or legal process',
                        'To protect the rights, property, or safety of Noteveda, our users, or the public'
                    ]
                }
            ]
        },
        {
            title: '4. Data Security',
            content: [
                { type: 'text', value: 'We implement robust security measures to protect your information:' },
                {
                    type: 'list', items: [
                        'Encryption: All data is encrypted in transit (HTTPS) and at rest',
                        'Access Controls: Strict access controls limit employee access to personal data',
                        'Regular Audits: We conduct regular security audits and vulnerability assessments',
                        'Secure Payments: Payment processing is handled by PCI-compliant providers'
                    ]
                },
                { type: 'text', value: 'While we strive to protect your information, no system is 100% secure. We encourage you to use strong passwords and enable two-factor authentication when available.' }
            ]
        },
        {
            title: '5. Your Rights and Choices',
            content: [
                { type: 'text', value: 'You have control over your personal information:' },
                { type: 'heading', value: 'Access and Portability:' },
                {
                    type: 'list', items: [
                        'Request a copy of your personal data',
                        'Export your uploaded resources and activity history'
                    ]
                },
                { type: 'heading', value: 'Correction and Deletion:' },
                {
                    type: 'list', items: [
                        'Update your profile information at any time',
                        'Request deletion of your account and associated data',
                        'Note: Some information may be retained for legal or security purposes'
                    ]
                },
                { type: 'heading', value: 'Communication Preferences:' },
                {
                    type: 'list', items: [
                        'Opt out of marketing emails through account settings',
                        'Essential service notifications cannot be disabled'
                    ]
                },
                { type: 'heading', value: 'Cookie Preferences:' },
                {
                    type: 'list', items: [
                        'Manage cookie settings in your browser',
                        'Note: Disabling essential cookies may affect functionality'
                    ]
                }
            ]
        },
        {
            title: '6. Children\'s Privacy',
            content: [
                { type: 'text', value: 'Noteveda is designed for students aged 13 and older. We do not knowingly collect personal information from children under 13.' },
                { type: 'text', value: 'If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@noteveda.com. We will promptly delete such information from our systems.' },
                { type: 'text', value: 'For users between 13 and 18, we encourage parental guidance when using our platform.' }
            ]
        },
        {
            title: '7. International Data Transfers',
            content: [
                { type: 'text', value: 'Noteveda is based in India. If you access our services from outside India, your information may be transferred to and processed in India.' },
                { type: 'text', value: 'We ensure that any international data transfers comply with applicable laws and provide adequate protection for your personal information.' }
            ]
        },
        {
            title: '8. Changes to This Policy',
            content: [
                { type: 'text', value: 'We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.' },
                { type: 'text', value: 'We will notify you of significant changes through:' },
                {
                    type: 'list', items: [
                        'Email notification to your registered email address',
                        'A prominent notice on our website',
                        'In-app notifications'
                    ]
                },
                { type: 'text', value: 'We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.' }
            ]
        },
        {
            title: '9. Contact Us',
            content: [
                { type: 'text', value: 'If you have questions about this Privacy Policy or our data practices, please contact us:' },
                { type: 'heading', value: 'Email:' },
                { type: 'text', value: 'privacy@noteveda.com' },
                { type: 'heading', value: 'Address:' },
                { type: 'text', value: 'Noteveda Technologies, Navi Mumbai, India' },
                { type: 'text', value: 'For data protection inquiries, our Data Protection Officer can be reached at dpo@noteveda.com.' },
                { type: 'text', value: 'We aim to respond to all inquiries within 30 days.' }
            ]
        }
    ];

    const renderContent = (content: Array<{ type: string; value?: string; items?: string[] }>) => {
        return content.map((block, i) => {
            if (block.type === 'heading') {
                return <h3 key={i} className="font-semibold text-gray-900 mt-4 mb-2">{block.value}</h3>;
            }
            if (block.type === 'list' && block.items) {
                return (
                    <ul key={i} className="list-disc list-inside space-y-1.5 ml-1 text-gray-600 dark:text-gray-400">
                        {block.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                );
            }
            return <p key={i} className="text-gray-600 dark:text-gray-400 mb-3">{block.value}</p>;
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Hero */}
            <section className="bg-black text-white py-16 sm:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div>
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-base sm:text-lg text-gray-300">
                            Last updated: December 31, 2024
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 leading-relaxed">
                            At Noteveda, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your data when you use our platform.
                        </p>

                        {sections.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="mb-8 sm:mb-10 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                            >
                                <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {section.title}
                                </h2>
                                <div className="text-sm sm:text-base leading-relaxed dark:text-gray-400">
                                    {renderContent(section.content)}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 sm:gap-4 justify-center text-center"
                    >
                        <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                            Terms of Service
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <Link href="/copyright" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                            Copyright Policy
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                            Contact Us
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
