'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';


export default function TermsPage() {
    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: [
                { type: 'text', value: 'By accessing or using Noteveda ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.' },
                { type: 'text', value: 'These Terms apply to all users, including:' },
                {
                    type: 'list', items: [
                        'Visitors who browse resources',
                        'Registered users who download content',
                        'Contributors who upload study materials',
                        'Subscribers with paid Pro plans'
                    ]
                },
                { type: 'text', value: 'We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.' }
            ]
        },
        {
            title: '2. Account Registration',
            content: [
                { type: 'text', value: 'To access certain features, you must create an account. When registering, you agree to:' },
                { type: 'heading', value: 'Account Requirements:' },
                {
                    type: 'list', items: [
                        'Provide accurate, current, and complete information',
                        'Maintain and promptly update your account information',
                        'Keep your password secure and confidential',
                        'Be at least 13 years of age (or have parental consent)',
                        'Not share your account credentials with others'
                    ]
                },
                { type: 'heading', value: 'Account Responsibilities:' },
                {
                    type: 'list', items: [
                        'You are responsible for all activities under your account',
                        'Notify us immediately of any unauthorized access',
                        'We may suspend or terminate accounts that violate these Terms'
                    ]
                }
            ]
        },
        {
            title: '3. Credit System',
            content: [
                { type: 'text', value: 'Noteveda operates on a credit-based system for resource downloads:' },
                { type: 'heading', value: 'Free Credits:' },
                {
                    type: 'list', items: [
                        'New users receive 5 daily credits',
                        'Daily credits reset every 24 hours at midnight IST',
                        'Unused daily credits do not carry over'
                    ]
                },
                { type: 'heading', value: 'Earned Credits:' },
                {
                    type: 'list', items: [
                        'Upload approved content to earn bonus credits',
                        'Earned credits do not expire',
                        'Credit amounts for uploads are determined by content quality and type'
                    ]
                },
                { type: 'heading', value: 'Pro Subscriptions:' },
                {
                    type: 'list', items: [
                        'Monthly subscribers receive 50 credits per month',
                        'Yearly subscribers receive unlimited credits',
                        'Subscription credits are non-transferable'
                    ]
                },
                { type: 'heading', value: 'Important Notes:' },
                {
                    type: 'list', items: [
                        'Credits cannot be exchanged for cash',
                        'Credit abuse or manipulation will result in account termination',
                        'We reserve the right to modify the credit system with notice'
                    ]
                }
            ]
        },
        {
            title: '4. Content Guidelines',
            content: [
                { type: 'text', value: 'By uploading content to Noteveda, you agree to the following:' },
                { type: 'heading', value: 'Ownership and Rights:' },
                {
                    type: 'list', items: [
                        'You must own or have rights to share the content',
                        'Your content must not infringe on third-party copyrights',
                        'You grant Noteveda a non-exclusive license to display and distribute the content'
                    ]
                },
                { type: 'heading', value: 'Quality Standards:' },
                {
                    type: 'list', items: [
                        'Content must be educational and relevant',
                        'Materials should be accurate and well-organized',
                        'Low-quality, duplicate, or spam content will be rejected'
                    ]
                },
                { type: 'heading', value: 'Prohibited Content:' },
                {
                    type: 'list', items: [
                        'Copyrighted materials without permission',
                        'Offensive, discriminatory, or harmful content',
                        'Malware, viruses, or malicious files',
                        'Promotional or commercial materials',
                        'Content that violates any applicable laws'
                    ]
                },
                { type: 'heading', value: 'Review Process:' },
                {
                    type: 'list', items: [
                        'All uploads are reviewed before publication',
                        'We may reject or remove content at our discretion',
                        'Repeated violations may result in account suspension'
                    ]
                }
            ]
        },
        {
            title: '5. Intellectual Property',
            content: [
                { type: 'heading', value: 'Noteveda\'s Rights:' },
                {
                    type: 'list', items: [
                        'The Noteveda name, logo, and branding are our trademarks',
                        'The platform\'s design, code, and features are our property',
                        'You may not copy, modify, or redistribute our intellectual property'
                    ]
                },
                { type: 'heading', value: 'User Content:' },
                {
                    type: 'list', items: [
                        'You retain ownership of content you upload',
                        'By uploading, you grant us a license to display and distribute your content',
                        'You can request removal of your content at any time'
                    ]
                },
                { type: 'heading', value: 'Third-Party Content:' },
                {
                    type: 'list', items: [
                        'Content uploaded by users remains their responsibility',
                        'We do not claim ownership of user-uploaded materials',
                        'DMCA takedown requests will be processed promptly'
                    ]
                }
            ]
        },
        {
            title: '6. Payments and Subscriptions',
            content: [
                { type: 'heading', value: 'Subscription Terms:' },
                {
                    type: 'list', items: [
                        'Pro subscriptions are billed monthly or annually',
                        'Payments are processed securely through Razorpay',
                        'Prices are in Indian Rupees (INR) unless otherwise stated'
                    ]
                },
                { type: 'heading', value: 'Billing:' },
                {
                    type: 'list', items: [
                        'Subscriptions auto-renew unless cancelled',
                        'Cancel at least 24 hours before renewal to avoid charges',
                        'Refunds are available within 7 days of purchase'
                    ]
                },
                { type: 'heading', value: 'Price Changes:' },
                {
                    type: 'list', items: [
                        'We may change prices with 30 days notice',
                        'Existing subscriptions continue at the current rate until renewal',
                        'You can cancel if you disagree with price changes'
                    ]
                }
            ]
        },
        {
            title: '7. Prohibited Activities',
            content: [
                { type: 'text', value: 'You agree not to:' },
                {
                    type: 'list', items: [
                        'Use the Service for any illegal purpose',
                        'Attempt to hack, exploit, or compromise our systems',
                        'Create multiple accounts to abuse the credit system',
                        'Scrape, crawl, or automatically download content',
                        'Resell or redistribute downloaded materials commercially',
                        'Harass, threaten, or harm other users',
                        'Impersonate others or provide false information',
                        'Circumvent any access controls or restrictions',
                        'Use bots or automated tools without permission',
                        'Interfere with the proper functioning of the Service'
                    ]
                },
                { type: 'text', value: 'Violations may result in immediate account termination without refund.' }
            ]
        },
        {
            title: '8. Disclaimers',
            content: [
                { type: 'heading', value: 'Service Availability:' },
                {
                    type: 'list', items: [
                        'The Service is provided "as is" without warranties',
                        'We do not guarantee uninterrupted or error-free access',
                        'We may modify or discontinue features at any time'
                    ]
                },
                { type: 'heading', value: 'Content Accuracy:' },
                {
                    type: 'list', items: [
                        'We do not guarantee the accuracy of user-uploaded content',
                        'Users should verify information independently',
                        'Educational content is not a substitute for professional advice'
                    ]
                },
                { type: 'heading', value: 'Limitation of Liability:' },
                {
                    type: 'list', items: [
                        'We are not liable for indirect, incidental, or consequential damages',
                        'Our total liability is limited to the amount you paid us in the past 12 months',
                        'Some jurisdictions do not allow liability limitations, so these may not apply to you'
                    ]
                }
            ]
        },
        {
            title: '9. Termination',
            content: [
                { type: 'heading', value: 'By You:' },
                {
                    type: 'list', items: [
                        'You may delete your account at any time from settings',
                        'Deletion removes access but may retain some data per our Privacy Policy'
                    ]
                },
                { type: 'heading', value: 'By Us:' },
                {
                    type: 'list', items: [
                        'We may suspend or terminate accounts for Terms violations',
                        'We may terminate inactive accounts after 12 months of inactivity',
                        'We may discontinue the Service with 30 days notice'
                    ]
                },
                { type: 'heading', value: 'Effect of Termination:' },
                {
                    type: 'list', items: [
                        'Access to downloaded materials may be revoked',
                        'Earned credits are forfeited upon termination',
                        'Uploaded content may remain available unless you request removal'
                    ]
                }
            ]
        },
        {
            title: '10. Governing Law',
            content: [
                { type: 'text', value: 'These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Navi Mumbai, India.' },
                { type: 'text', value: 'If any provision of these Terms is found unenforceable, the remaining provisions remain in effect.' },
                { type: 'text', value: 'These Terms constitute the entire agreement between you and Noteveda regarding use of the Service.' }
            ]
        },
        {
            title: '11. Contact Information',
            content: [
                { type: 'text', value: 'If you have questions about these Terms of Service, please contact us:' },
                { type: 'heading', value: 'Email:' },
                { type: 'text', value: 'legal@noteveda.com' },
                { type: 'heading', value: 'Address:' },
                { type: 'text', value: 'Noteveda Technologies, Navi Mumbai, India' },
                { type: 'text', value: 'For general inquiries, use our Contact page or email support@noteveda.com.' }
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
            return <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 last:mb-0">{block.value}</p>;
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Hero */}
            <section className="bg-black text-white py-16 sm:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div>
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-base sm:text-lg text-gray-300">
                            Last updated: December 31, 2024
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 leading-relaxed">
                            Welcome to Noteveda. These Terms of Service govern your use of our platform. Please read them carefully before using our services.
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
                                <div className="text-sm sm:text-base leading-relaxed">
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
                        <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                            Privacy Policy
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
