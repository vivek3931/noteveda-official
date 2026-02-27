'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparkleIcon, CloseIcon, SendIcon, StopIcon, DocumentIcon, HelpIcon, BulbIcon } from '@/components/icons';
import { aiService } from '@/lib';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkUnwrapImages from 'remark-unwrap-images';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface AIChatbotProps {
    resourceId: string;
    resourceTitle: string;
    resourceSubject: string;
    resourceDomain: string;
    resourceType: string;
    onClose: () => void;
    mode?: 'sidebar' | 'modal';
    hideHeader?: boolean;
    initialPrompt?: string; // Auto-send this message when component mounts
    promptId?: number; // Unique ID to force re-send even if prompt text is same
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

// --- SUB-COMPONENTS ---

const EmptyState = ({ userName, onChipClick }: { userName: string, onChipClick: (text: string) => void }) => {
    const chips = [
        { icon: DocumentIcon, label: 'Summarize', prompt: 'Summarize this resource for me.' },
        { icon: BulbIcon, label: 'Key Concepts', prompt: 'What are the key concepts in this resource?' },
        { icon: HelpIcon, label: 'Quiz Me', prompt: 'Quiz me on this content.' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="flex-1 flex flex-col items-center justify-center p-8 pb-32 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-6 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <Image src="/noteveda.png" alt="Noteveda" width={60} height={60} className="relative w-16 h-auto dark:hidden" />
                <Image src="/noteveda_dark.png" alt="Noteveda" width={60} height={60} className="relative w-16 h-auto hidden dark:block" />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-2">
                <span className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Hi {userName || 'there'},
                </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-medium text-gray-400 dark:text-gray-500 mb-12">
                Where should we start?
            </motion.h2>

            <motion.div variants={containerVariants} className="flex flex-wrap justify-center gap-3 w-full max-w-lg">
                {chips.map((chip, idx) => (
                    <motion.button
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChipClick(chip.prompt)}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900/50 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-600 dark:text-gray-300 group"
                    >
                        <chip.icon size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        {chip.label}
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    );
};

const MarkdownImage = ({ src, alt }: { src?: string; alt?: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!src) return null;
    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="my-3 relative group cursor-zoom-in rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md block"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt || "AI Generated"} className="w-full h-auto max-h-[300px] object-cover bg-gray-100 dark:bg-gray-900" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </motion.div>
            <AnimatePresence>
                {isExpanded && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsExpanded(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative max-w-full max-h-[90vh]">
                            <img src={src} alt={alt} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
                            <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors" onClick={() => setIsExpanded(false)}><CloseIcon size={24} /></button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

// --- ANIMATION CONFIGURATION (Gemini Style) ---
// Use subtle Y-axis shift and fast alpha for "instant" feel
const blockVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.18
        }
    }
};

const blockTransition = { duration: 0.18, ease: "easeOut" };

const MessageContent = memo(({ content, isStreaming, components }: { content: string, isStreaming: boolean, components: any }) => {
    return (
        <div className={`prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-pre:my-2 prose-pre:bg-gray-900 dark:prose-pre:bg-gray-100 dark:prose-pre:text-gray-900 prose-code:text-xs prose-code:font-mono prose-ul:my-1 prose-img:my-2 ${isStreaming ? 'streaming-content' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkUnwrapImages]} components={components}>{content}</ReactMarkdown>
        </div>
    );
});
MessageContent.displayName = 'MessageContent';


export const AIChatbot: React.FC<AIChatbotProps> = ({
    resourceId,
    resourceTitle,
    resourceSubject,
    resourceDomain,
    resourceType,
    onClose,
    mode = 'modal',
    hideHeader = false,
    initialPrompt,
    promptId,
}) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll logic: Only scroll if already near bottom or it's a new message
    const scrollToBottom = useCallback(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    // Initial scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages.length, scrollToBottom]);

    // Stream scroll: Throttled/conditional could be better, but smooth behavior is native.
    useEffect(() => {
        if (isStreaming) {
            scrollToBottom();
        }
    }, [messages, isStreaming, scrollToBottom]);

    // Auto-send initial prompt logic (handles updates too)
    const lastSentPromptRef = useRef<string | undefined>(undefined);
    const lastPromptIdRef = useRef<number | undefined>(undefined);
    const hasMountedRef = useRef(false);

    // Reset tracking when resource ID changes
    useEffect(() => {
        lastSentPromptRef.current = undefined;
    }, [resourceId]);

    useEffect(() => {
        // Mark as mounted
        hasMountedRef.current = true;
        return () => { hasMountedRef.current = false; };
    }, []);

    useEffect(() => {
        // If we have a prompt, and it's different from the last one we sent
        // OR if we have a prompt and a new ID (forcing a re-send)
        if (initialPrompt && (initialPrompt !== lastSentPromptRef.current || (promptId !== undefined && promptId !== lastPromptIdRef.current))) {
            // Prevent double sending
            lastSentPromptRef.current = initialPrompt;
            lastPromptIdRef.current = promptId;

            // Small delay to ensure component is fully mounted and animation is ready
            const timer = setTimeout(() => {
                if (hasMountedRef.current) {
                    handleSendMessage(initialPrompt);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [initialPrompt, promptId, resourceId]); // Removed isLoading dependency to avoid skipping if busy (though unlikely on mount)

    // Auto-resize textarea
    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    const handleSendMessage = useCallback(async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsStreaming(true);

        // Placeholder for AI response
        setMessages(prev => [...prev, { role: 'ai', content: '' }]);

        try {
            // BUFFERING LOGIC for Gemini-style chunking
            let buffer = '';

            await aiService.streamChat(
                resourceId,
                textToSend,
                (chunk) => {
                    buffer += chunk;

                    // Intelligent Flush: Flush if we hit a sentence boundary or buffer gets too long
                    // This creates the "Chunk-based" appearance
                    const shouldFlush =
                        buffer.length > 50 || // Flush on reasonable length
                        /[.!?:;\n]/.test(chunk) || // Flush on sentence/phrase boundary
                        chunk.includes('  ');     // Flush on doublespace (markdown)

                    if (shouldFlush) {
                        const textToFlush = buffer; // Capture value to avoid closure bugs
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastIdx = newMessages.length - 1;
                            const lastMsg = { ...newMessages[lastIdx] }; // Shallow copy

                            if (lastMsg.role === 'ai') {
                                lastMsg.content += textToFlush;
                                newMessages[lastIdx] = lastMsg;
                            }
                            return newMessages;
                        });
                        buffer = ''; // Clear buffer after flush
                    }
                },
                // Pass resource context to the AI
                {
                    title: resourceTitle,
                    subject: resourceSubject,
                    domain: resourceDomain,
                    resourceType: resourceType,
                }
            );

            // Final Flush of any remaining buffer
            if (buffer.length > 0) {
                const finalFlush = buffer;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIdx = newMessages.length - 1;
                    const lastMsg = { ...newMessages[lastIdx] }; // Shallow copy

                    if (lastMsg.role === 'ai') {
                        lastMsg.content += finalFlush;
                        newMessages[lastIdx] = lastMsg;
                    }
                    return newMessages;
                });
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    }, [input, isLoading, resourceId, resourceTitle, resourceSubject, resourceDomain, resourceType]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Memoize markdown components to ensure animations run only on MOUNT of new blocks
    const markdownComponents = React.useMemo(() => ({
        img: (props: any) => <MarkdownImage {...props} />,
        a: ({ node, ...props }: any) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all" />,
        p: ({ node, children, ...props }: any) => (
            <motion.div
                variants={blockVariants}
                initial="hidden"
                animate="visible"
                {...props}
                className="mb-2 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-200"
            >
                {children}
            </motion.div>
        ),
        ul: ({ node, children, ...props }: any) => (
            <motion.ul
                variants={blockVariants}
                initial="hidden"
                animate="visible"
                {...props}
                className="list-disc pl-4 space-y-1 mb-2 text-gray-800 dark:text-gray-200 block"
            >
                {children}
            </motion.ul>
        ),
        ol: ({ node, children, ...props }: any) => (
            <motion.ol
                variants={blockVariants}
                initial="hidden"
                animate="visible"
                {...props}
                className="list-decimal pl-4 space-y-1 mb-2 text-gray-800 dark:text-gray-200 block"
            >
                {children}
            </motion.ol>
        ),
        li: ({ node, children, ...props }: any) => (
            <motion.li
                variants={blockVariants}
                initial="hidden"
                animate="visible"
                {...props}
                className="pl-1 block"
            >
                {children}
            </motion.li>
        ),
        pre: ({ node, children, ...props }: any) => (
            <motion.div
                variants={blockVariants}
                initial="hidden"
                animate="visible"
                className="my-3 overflow-x-auto"
            >
                <pre {...props} className="p-3 rounded-xl bg-gray-900 dark:bg-gray-800/80 text-gray-100 overflow-x-auto scrollbar-thin">
                    {children}
                </pre>
            </motion.div>
        ),
        code: ({ node, className, children, ...props }: any) => {
            const isInline = !/language-(\w+)/.exec(className || '');
            if (isInline) return <code {...props} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-pink-500 dark:text-pink-400">{children}</code>;
            return <code {...props} className={className} style={{ display: 'block', backgroundColor: 'transparent', padding: 0 }}>{children}</code>;
        }
    }), []);

    return (
        <div className="relative h-full flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
            {/* --- HEADER: Minimal --- */}
            {!hideHeader && (
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-white dark:from-gray-950 to-transparent pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        {/* Centered Logo Aesthetic */}
                        <Image src="/noteveda.png" alt="Noteveda" width={140} height={42} className="h-8 w-auto dark:hidden opacity-80" />
                        <Image src="/noteveda_dark.png" alt="Noteveda" width={140} height={42} className="h-8 w-auto hidden dark:block opacity-80" />
                    </div>
                    {/* Close Button */}
                    <button onClick={onClose} className="pointer-events-auto p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon size={20} />
                    </button>
                </div>
            )}

            {/* --- MESSAGES AREA --- */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-20 pb-0 scrollbar-hide">
                <div className="max-w-2xl mx-auto min-h-full flex flex-col">
                    {messages.length === 0 ? (
                        <EmptyState userName={user?.name?.split(' ')[0] || ''} onChipClick={handleSendMessage} />
                    ) : (
                        <div className="flex flex-col gap-6 pb-40">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'user' ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-[2rem] rounded-tr-sm max-w-[85%] text-[15px] leading-relaxed"
                                        >
                                            {msg.content}
                                        </motion.div>
                                    ) : (
                                        <div className="flex gap-4 max-w-[95%]">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-white flex items-center justify-center shrink-0 mt-1 shadow-md overflow-hidden">
                                                <Image src="/noteveda_supermini.svg" alt="AI" width={20} height={20} className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <MessageContent
                                                    content={msg.content}
                                                    isStreaming={isStreaming && i === messages.length - 1}
                                                    components={markdownComponents}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* --- FLOATING INPUT BAR --- */}
            <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
                <div
                    className="h-32 w-full bg-gradient-to-t from-white dark:from-gray-950 via-white/80 dark:via-gray-950/80 to-transparent backdrop-blur-[2px]"
                    style={{
                        maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)'
                    }}
                />
            </div>

            <div className="absolute bottom-6 left-4 right-4 md:left-12 md:right-12 z-20">
                <div className="max-w-2xl mx-auto">
                    <div className="relative group">
                        {/* Glassmorphic Container */}
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-2xl shadow-blue-500/5 transition-all duration-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:border-gray-300 dark:group-hover:border-gray-700" />

                        <div className="relative flex items-end gap-2 p-2 pl-4">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a question..."
                                className="flex-1 max-h-[200px] py-3 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 scrollbar-hide text-[15px]"
                                rows={1}
                                disabled={isLoading}
                            />

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || isLoading}
                                className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center shrink-0 mb-0.5
                                    ${input.trim() && !isLoading
                                        ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isLoading ? (
                                    <StopIcon size={18} />
                                ) : (
                                    <SendIcon size={18} className={input.trim() ? 'ml-0.5' : ''} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
