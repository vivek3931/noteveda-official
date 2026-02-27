'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supportService } from '@/lib/services/support';
import { SupportTicket } from '@/lib/services/admin';
import { format } from 'date-fns';
import { SendIcon, ArrowLeftIcon, ClockIcon, CheckIcon, AlertIcon, UserIcon } from '@/components/icons';
import Link from 'next/link';

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTicket();
    }, []);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticket?.messages]);

    const loadTicket = async () => {
        try {
            const data = await supportService.getTicket(params.id as string);
            setTicket(data);
        } catch (error) {
            console.error('Failed to load ticket', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setSending(true);
        try {
            await supportService.replyToTicket(params.id as string, reply);
            setReply('');
            loadTicket();
        } catch (error) {
            console.error('Failed to send reply', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!ticket) return <div className="text-center py-20 text-gray-500">Ticket not found</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
            case 'IN_PROGRESS': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
            case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'CLOSED': return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-64px)] flex flex-col">
            <header className="mb-4 flex items-center gap-4 shrink-0">
                <Link href="/support" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeftIcon size={20} className="text-gray-600 dark:text-gray-400" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{ticket.subject}</h1>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">#{ticket.id.slice(-6)}</span>
                        <span>•</span>
                        <ClockIcon size={12} /> {format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black/20 rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-800 mb-4">
                {/* Initial Message */}
                <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-sm">
                        <p className="text-sm">{ticket.message}</p> {/* Fallback for older tickets, new ones use messages[0] */}
                        {ticket.messages?.length === 0 && <p className="text-sm">{ticket.message || 'No content'}</p>}
                        <div className="text-[10px] text-blue-100 mt-1 opacity-70 text-right">{format(new Date(ticket.createdAt), 'h:mm a')}</div>
                    </div>
                </div>

                {/* Conversation */}
                {ticket.messages?.map((msg) => (
                    <div key={msg.id} className={`flex ${!msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {msg.isAdmin && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-2 shrink-0 border border-indigo-200 dark:border-indigo-800">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">AI</span>
                            </div>
                        )}
                        <div className={`rounded-2xl p-4 max-w-[80%] shadow-sm ${!msg.isAdmin
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700'
                            }`}>
                            {msg.isAdmin && <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Support Team</div>}
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            <div className={`text-[10px] mt-1 opacity-70 text-right ${!msg.isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                                {format(new Date(msg.createdAt), 'h:mm a')}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Reply Input */}
            <form onSubmit={handleReply} className="shrink-0 relative">
                <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={ticket.status === 'CLOSED' ? 'Ticket is closed' : 'Type your reply...'}
                    disabled={sending || ticket.status === 'CLOSED'}
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:opacity-70"
                />
                <button
                    type="submit"
                    disabled={!reply.trim() || sending || ticket.status === 'CLOSED'}
                    className="absolute right-2 top-1.5 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-0 transition-all shadow-sm"
                >
                    <SendIcon size={18} />
                </button>
            </form>
        </div>
    );
}
