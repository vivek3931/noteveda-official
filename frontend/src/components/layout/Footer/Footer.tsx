'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
    const pathname = usePathname();
    const isResourcePage = pathname?.includes('/resource/');
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        resources: [
            { label: 'Browse All', href: '/browse' },
            { label: 'School Notes', href: '/browse?domain=school' },
            { label: 'University', href: '/browse?domain=university' },
            { label: 'Competitive Exams', href: '/browse?domain=competitive' },
        ],
        company: [
            { label: 'About Us', href: '/about' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Contact', href: '/contact' },
            { label: 'Careers', href: '/careers' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Copyright', href: '/copyright' },
        ],
    };

    if (isResourcePage) return null;

    return (
        <footer className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pt-16 pb-8 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                {/* Main Footer Content */}
                <div
                    className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-200 dark:border-gray-800"
                >
                    {/* Brand Column */}
                    <div className="max-w-[280px]">
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src="/noteveda.png"
                                alt="Noteveda"
                                width={150}
                                height={40}
                                className="w-[130px] h-auto dark:hidden"
                            />
                            <Image
                                src="/noteveda_dark.png"
                                alt="Noteveda"
                                width={150}
                                height={40}
                                className="w-[130px] h-auto hidden dark:block"
                            />
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Your gateway to premium academic resources. Study smarter, not harder.
                        </p>
                        <div className="flex gap-4">
                            {['twitter', 'github', 'linkedin'].map((social) => (
                                <motion.a
                                    key={social}
                                    href="#"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    aria-label={social}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        {social === 'twitter' && (
                                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                        )}
                                        {social === 'github' && (
                                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                                        )}
                                        {social === 'linkedin' && (
                                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2V9zM4 6a2 2 0 100-4 2 2 0 000 4z" />
                                        )}
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Resources</h4>
                        <ul className="flex flex-col gap-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h4>
                        <ul className="flex flex-col gap-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal</h4>
                        <ul className="flex flex-col gap-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-8 text-center md:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        © {currentYear} Noteveda. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-600">
                        Made with precision for students worldwide
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
