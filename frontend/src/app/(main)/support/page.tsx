'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supportService, CreateTicketDTO } from '@/lib/services/support';
import { SupportTicket, FAQ } from '@/lib/services/admin';
import { format } from 'date-fns';
import { AlertIcon, CheckIcon, ClockIcon, MessageIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon, CloseIcon } from '@/components/icons';
import Link from 'next/link';

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState<'tickets' | 'faq'>('tickets');
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form State
    const [newTicket, setNewTicket] = useState<CreateTicketDTO>({ subject: '', message: '', priority: 'NORMAL' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tickets') {
                const data = await supportService.getMyTickets();
                setTickets(data);
            } else {
                const data = await supportService.getFAQs();
                setFaqs(data);
            }
        } catch (error) {
            console.error('Failed to load support data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await supportService.createTicket(newTicket);
            setShowCreateModal(false);
            setNewTicket({ subject: '', message: '', priority: 'NORMAL' });
            loadData(); // Refresh list
        } catch (error) {
            console.error('Failed to create ticket', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'CLOSED': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your support tickets or browse FAQs.</p>
                </div>
                {activeTab === 'tickets' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                        <PlusIcon size={18} /> New Ticket
                    </button>
                )}
            </header>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-8">
                {(['tickets', 'faq'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab === 'tickets' ? 'My Tickets' : 'FAQs'}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                ) : activeTab === 'tickets' ? (
                    <div className="space-y-4">
                        {tickets.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <MessageIcon size={48} className="text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tickets yet</h3>
                                <p className="text-gray-500 mb-6">Need help? Create a new support ticket.</p>
                                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Create Ticket</button>
                            </div>
                        ) : (
                            tickets.map(ticket => (
                                <Link href={`/support/${ticket.id}`} key={ticket.id} className="block group">
                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${ticket.priority === 'URGENT' ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-500'}`}>
                                                    {ticket.priority}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1"><ClockIcon size={12} /> {format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{ticket.subject}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ticket.message}</p>
                                        </div>
                                        <div className="text-gray-400 group-hover:translate-x-1 transition-transform">
                                            <ChevronDownIcon className="-rotate-90" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {faqs.map((faq) => (
                            <FAQItem key={faq.id} faq={faq} />
                        ))}
                        {faqs.length === 0 && <p className="text-center text-gray-500 py-10">No FAQs available yet.</p>}
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold dark:text-white">Create Support Ticket</h2>
                                <button onClick={() => setShowCreateModal(false)}><CloseIcon size={20} className="text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTicket.subject}
                                        onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Brief summary of the issue"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                        <select
                                            value={newTicket.priority}
                                            onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newTicket.message}
                                        onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Describe your issue in detail..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {isSubmitting ? 'Creating...' : 'Submit Ticket'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FAQItem({ faq }: { faq: FAQ }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                {isOpen ? <ChevronUpIcon size={18} className="text-gray-500" /> : <ChevronDownIcon size={18} className="text-gray-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-4 text-sm leading-relaxed">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
