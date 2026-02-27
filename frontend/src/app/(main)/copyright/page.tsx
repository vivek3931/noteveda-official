'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';


export default function CopyrightPage() {
    const sections = [
        {
            title: '1. Copyright Ownership',
            content: [
                { type: 'text', value: 'All original content on Noteveda is protected by copyright law:' },
                { type: 'heading', value: 'Noteveda Platform:' },
                {
                    type: 'list', items: [
                        'The Noteveda website, design, logo, and branding are © 2024 Noteveda Technologies',
                        'Our proprietary code, features, and user interface are protected intellectual property',
                        'Unauthorized reproduction or distribution is prohibited'
                    ]
                },
                { type: 'heading', value: 'User-Uploaded Content:' },
                {
                    type: 'list', items: [
                        'Users retain copyright ownership of materials they upload',
                        'By uploading, users grant Noteveda a non-exclusive license to display and distribute their content',
                        'This license is revocable upon content removal request'
                    ]
                },
                { type: 'heading', value: 'Third-Party Content:' },
                {
                    type: 'list', items: [
                        'Some resources may contain third-party copyrighted materials',
                        'Such materials are used under fair use, creative commons, or with permission',
                        'Attribution is provided where required'
                    ]
                }
            ]
        },
        {
            title: '2. Permitted Use',
            content: [
                { type: 'text', value: 'Content downloaded from Noteveda is for personal educational use only:' },
                { type: 'heading', value: 'You MAY:' },
                {
                    type: 'list', items: [
                        'View and read downloaded materials for personal study',
                        'Print copies for your own educational use',
                        'Share brief excerpts with proper attribution',
                        'Use materials as reference for your own original work'
                    ]
                },
                { type: 'heading', value: 'You MAY NOT:' },
                {
                    type: 'list', items: [
                        'Redistribute or resell downloaded content',
                        'Upload content to other platforms or file-sharing sites',
                        'Remove or alter copyright notices or watermarks',
                        'Use content for commercial purposes',
                        'Claim authorship of materials you did not create'
                    ]
                },
                { type: 'heading', value: 'Fair Use:' },
                {
                    type: 'list', items: [
                        'Brief quotations for criticism, commentary, or education may be permitted',
                        'Fair use is determined on a case-by-case basis',
                        'When in doubt, seek permission from the content creator'
                    ]
                }
            ]
        },
        {
            title: '3. Content Contributor Rights',
            content: [
                { type: 'text', value: 'When you upload content to Noteveda:' },
                { type: 'heading', value: 'Your Rights:' },
                {
                    type: 'list', items: [
                        'You retain full copyright ownership of your original work',
                        'You can request removal of your content at any time',
                        'You receive attribution as the creator',
                        'You earn credits when users download your materials'
                    ]
                },
                { type: 'heading', value: 'License Granted:' },
                { type: 'text', value: 'You grant Noteveda a worldwide, non-exclusive, royalty-free license to:' },
                {
                    type: 'list', items: [
                        'Host and store your content on our servers',
                        'Display your content to registered users',
                        'Enable downloads by authorized users',
                        'Create preview thumbnails and excerpts',
                        'Promote your content within our platform'
                    ]
                },
                { type: 'heading', value: 'Warranties:' },
                {
                    type: 'list', items: [
                        'By uploading, you confirm you have rights to share the content',
                        'You warrant that content does not infringe third-party copyrights',
                        'False claims may result in account termination'
                    ]
                }
            ]
        },
        {
            title: '4. DMCA Policy',
            content: [
                { type: 'text', value: 'Noteveda respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA) and equivalent Indian IT Act provisions.' },
                { type: 'heading', value: 'Filing a Takedown Notice:' },
                { type: 'text', value: 'If you believe your copyrighted work has been infringed, send a notice to our designated agent with:' },
                {
                    type: 'list', items: [
                        'Your physical or electronic signature',
                        'Identification of the copyrighted work claimed to be infringed',
                        'Location of the infringing material on our platform (URL)',
                        'Your contact information (address, phone, email)',
                        'A statement of good faith belief that the use is not authorized',
                        'A statement, under penalty of perjury, that the information is accurate'
                    ]
                },
                { type: 'heading', value: 'Send DMCA notices to:' },
                { type: 'text', value: 'Email: dmca@noteveda.com' },
                { type: 'heading', value: 'Counter-Notification:' },
                { type: 'text', value: 'If you believe content was wrongly removed, you may file a counter-notification with:' },
                {
                    type: 'list', items: [
                        'Your physical or electronic signature',
                        'Identification of removed material and its previous location',
                        'Statement under penalty of perjury that removal was due to mistake',
                        'Consent to jurisdiction of appropriate courts',
                        'Your contact information'
                    ]
                },
                { type: 'heading', value: 'Process Timeline:' },
                {
                    type: 'list', items: [
                        'We respond to valid DMCA notices within 48 hours',
                        'Infringing content is removed promptly',
                        'Counter-notifications are processed within 10-14 business days'
                    ]
                }
            ]
        },
        {
            title: '5. Repeat Infringer Policy',
            content: [
                { type: 'text', value: 'Noteveda maintains a strict repeat infringer policy:' },
                { type: 'heading', value: 'Strike System:' },
                {
                    type: 'list', items: [
                        'First offense: Content removal + warning',
                        'Second offense: Content removal + 30-day upload suspension',
                        'Third offense: Permanent account termination'
                    ]
                },
                { type: 'heading', value: 'Consequences:' },
                {
                    type: 'list', items: [
                        'Terminated accounts lose all credits and access',
                        'Repeat infringers may be reported to authorities',
                        'Legal action may be pursued for willful infringement'
                    ]
                },
                { type: 'heading', value: 'Appeals:' },
                {
                    type: 'list', items: [
                        'Users may appeal strikes within 14 days',
                        'Valid counter-notifications may restore content and remove strikes',
                        'Appeals are reviewed by our legal team within 5 business days'
                    ]
                }
            ]
        },
        {
            title: '6. Educational Use & Fair Use',
            content: [
                { type: 'text', value: 'Noteveda supports educational fair use within legal boundaries:' },
                { type: 'heading', value: 'Supported Uses:' },
                {
                    type: 'list', items: [
                        'Personal study and research',
                        'Classroom instruction (with proper licensing)',
                        'Academic criticism and commentary',
                        'Transformative educational works'
                    ]
                },
                { type: 'heading', value: 'Not Considered Fair Use:' },
                {
                    type: 'list', items: [
                        'Copying entire textbooks or publications',
                        'Commercial tutoring or coaching materials',
                        'Mass distribution even if free',
                        'Direct competition with original works'
                    ]
                },
                { type: 'heading', value: 'Guidelines for Uploaders:' },
                {
                    type: 'list', items: [
                        'Only upload original work or properly licensed content',
                        'Provide attribution for any quoted or referenced materials',
                        'When adapting others\' work, ensure transformative value',
                        'Seek permission when in doubt'
                    ]
                }
            ]
        },
        {
            title: '7. Reporting Copyright Issues',
            content: [
                { type: 'text', value: 'If you encounter potential copyright infringement on Noteveda:' },
                { type: 'heading', value: 'For Quick Reports:' },
                {
                    type: 'list', items: [
                        'Use the "Report" button on any resource page',
                        'Select "Copyright Infringement" as the reason',
                        'Provide details about the alleged infringement'
                    ]
                },
                { type: 'heading', value: 'For Formal DMCA Notices:' },
                {
                    type: 'list', items: [
                        'Email: dmca@noteveda.com',
                        'Include all required information (see Section 4)'
                    ]
                },
                { type: 'heading', value: 'Our Response:' },
                {
                    type: 'list', items: [
                        'We investigate all reports promptly',
                        'Infringing content is removed within 48 hours',
                        'Both parties are notified of actions taken'
                    ]
                },
                { type: 'heading', value: 'False Reports:' },
                {
                    type: 'list', items: [
                        'Knowingly filing false DMCA notices is perjury',
                        'False reporters may face legal consequences',
                        'Abuse of the reporting system may result in account action'
                    ]
                }
            ]
        },
        {
            title: '8. Third-Party Trademarks',
            content: [
                { type: 'text', value: 'Noteveda may reference third-party trademarks:' },
                { type: 'heading', value: 'Educational References:' },
                {
                    type: 'list', items: [
                        'Exam board names (JEE, NEET, CAT, etc.) are trademarks of their respective organizations',
                        'University and institution names belong to their respective owners',
                        'Publisher names and book titles are used for identification purposes only'
                    ]
                },
                { type: 'heading', value: 'Disclaimer:' },
                {
                    type: 'list', items: [
                        'Noteveda is not affiliated with or endorsed by these organizations',
                        'Use of these names is for descriptive and educational purposes',
                        'All trademarks remain the property of their respective owners'
                    ]
                },
                { type: 'heading', value: 'Our Trademarks:' },
                {
                    type: 'list', items: [
                        '"Noteveda" and our logo are registered trademarks',
                        'Unauthorized use of our marks is prohibited',
                        'Contact us for brand partnership or licensing inquiries'
                    ]
                }
            ]
        },
        {
            title: '9. Contact for Copyright Matters',
            content: [
                { type: 'text', value: 'For all copyright-related inquiries:' },
                { type: 'heading', value: 'DMCA Agent:' },
                { type: 'text', value: 'Email: dmca@noteveda.com | Response Time: Within 48 hours' },
                { type: 'heading', value: 'Legal Department:' },
                { type: 'text', value: 'Email: legal@noteveda.com | Address: Noteveda Technologies, Navi Mumbai, India' },
                { type: 'heading', value: 'General Copyright Questions:' },
                { type: 'text', value: 'Email: support@noteveda.com | Subject: Copyright Inquiry' },
                { type: 'text', value: 'We are committed to respecting intellectual property rights and working with content owners to address any concerns.' }
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
                            Copyright Policy
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
                            Noteveda respects the intellectual property rights of creators and content owners. This Copyright Policy outlines our approach to copyright protection, user rights, and our DMCA compliance procedures.
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
                        <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                            Terms of Service
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
