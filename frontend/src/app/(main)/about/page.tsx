'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { categoriesService } from '@/lib';
import { PlatformStats } from '@/types';
import {
    UserIcon, DocumentIcon, DownloadIcon, TrendingIcon,
    StarIcon, BookIcon, SparkleIcon
} from '@/components/icons';

export default function AboutPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await categoriesService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const team = [
        { name: 'Vivek Singh', role: 'Founder & Developer', initial: 'V' },
        { name: 'Vivek Singh', role: 'Content Lead', initial: 'P' },
        { name: 'Piyush Singh', role: 'Community Manager', initial: 'R' },
    ];

    const values = [
        { icon: <BookIcon size={28} />, title: 'Quality First', desc: 'Every resource is reviewed for accuracy and clarity' },
        { icon: <UserIcon size={28} />, title: 'Student-Centric', desc: 'Built by students, for students' },
        { icon: <SparkleIcon size={28} />, title: 'Innovation', desc: 'AI-powered tools to enhance learning' },
        { icon: <TrendingIcon size={28} />, title: 'Accessibility', desc: 'Free credits daily for everyone' },
    ];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            {/* Hero Section */}
            <section className="relative bg-black text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                }} />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div>
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-white/10 rounded-full">
                            About Noteveda
                        </span>
                        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Empowering Students to
                            <br />
                            <span className="text-gray-400">Learn Smarter</span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Noteveda is a community-driven platform where students share, discover, and access premium study materials. Our mission is to make quality education accessible to everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* Live Stats Section */}
            <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Platform Statistics</h2>
                        <p className="text-gray-600 dark:text-gray-400">Real-time numbers from our growing community</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {[
                            { value: stats?.totalUsers || 0, label: 'Students', icon: <UserIcon size={24} /> },
                            { value: stats?.totalResources || 0, label: 'Resources', icon: <DocumentIcon size={24} /> },
                            { value: stats?.totalDownloads || 0, label: 'Downloads', icon: <DownloadIcon size={24} /> },
                            { value: stats?.categories || 0, label: 'Categories', icon: <StarIcon size={24} /> },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <div className="w-12 h-12 flex items-center justify-center mb-3 bg-black dark:bg-white text-white dark:text-black rounded-lg">
                                    {stat.icon}
                                </div>
                                {isLoading ? (
                                    <span className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                                ) : (
                                    <span className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                        {formatNumber(stat.value)}+
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                We believe that quality education should be accessible to everyone, regardless of their financial background. Noteveda bridges the gap between students who create excellent study materials and those who need them.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Our unique credit system ensures sustainability while keeping resources accessible. Upload your notes, earn credits, and help fellow students succeed.
                            </p>
                            <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                                Explore Resources
                            </Link>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                                <Image
                                    src="/noteveda.png"
                                    alt="Noteveda"
                                    width={200}
                                    height={60}
                                    className="w-[200px] h-auto opacity-80"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Our Values</h2>
                        <p className="text-gray-600 dark:text-gray-400">What guides us in building Noteveda</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {values.map((value, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
                                    {value.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{value.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Meet the Team</h2>
                        <p className="text-gray-600 dark:text-gray-400">The people behind Noteveda</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid sm:grid-cols-3 gap-6"
                    >
                        {team.map((member, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ y: -4 }}
                                className="flex flex-col items-center p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                            >
                                <div className="w-20 h-20 mb-4 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black text-2xl font-bold rounded-full">
                                    {member.initial}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-display text-3xl font-bold mb-4">Ready to Start Learning?</h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                            Join our growing community of students and get access to quality study materials today.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/register" className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                Get Started Free
                            </Link>
                            <Link href="/browse" className="px-8 py-3 border border-gray-700 text-white font-medium rounded-lg hover:border-gray-500 transition-colors">
                                Browse Resources
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
