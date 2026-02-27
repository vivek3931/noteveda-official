'use client';

import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService, DashboardStats, AdminResource, AdminUser, Plan, TopReportedResource, ModerationStats, Domain, AIConfig, AIStats, AILog, AdConfig, AdStats, PremiumUser, GrowthMetric, ContentMetrics, ActivityMetric, AuditLog, AuditLogResponse, Announcement, SupportTicket, TicketMessage, FAQ } from '@/lib/services/admin';
import { UserIcon, DocumentIcon, TrendingIcon, SettingsIcon, CheckIcon, CloseIcon, EyeIcon, EyeOffIcon, CreditIcon, MenuIcon, ChevronDownIcon, SearchIcon, TrashIcon, LockIcon, AlertIcon, SparkleIcon, ArchiveIcon, RestoreIcon } from '@/components/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ui/Toast';

export default function AdminDashboard() {
    return (
        <ProtectedRoute>
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}


function AdminDashboardContent() {
    const toast = useToast();
    type NavKey = 'dashboard' | 'resources' | 'moderation' | 'users' | 'settings' | 'categories' | 'ai' | 'monetization' | 'premium' | 'analytics' | 'audit' | 'notifications' | 'support';
    const [activeNav, setActiveNav] = useState<NavKey>('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Dashboard State
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [topReported, setTopReported] = useState<TopReportedResource[]>([]);

    // Resources State
    const [resources, setResources] = useState<AdminResource[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [resourcesPage, setResourcesPage] = useState(1);
    const [resourcesTotalPages, setResourcesTotalPages] = useState(1);
    const [resourcesTotal, setResourcesTotal] = useState(0);
    const [resourceFilter, setResourceFilter] = useState('all');
    const [resourceSort, setResourceSort] = useState('newest');
    const [resourceSearch, setResourceSearch] = useState('');
    const [expandedResource, setExpandedResource] = useState<string | null>(null);

    // Users State
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersPage, setUsersPage] = useState(1);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [usersTotal, setUsersTotal] = useState(0);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [userDetailsLoading, setUserDetailsLoading] = useState(false);

    // Moderation State
    const [reportedResources, setReportedResources] = useState<any[]>([]);
    const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
    const [moderationLoading, setModerationLoading] = useState(false);

    // Settings State
    const [settings, setSettings] = useState<{ key: string, value: string, type: string, category: string }[]>([]);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [editingSetting, setEditingSetting] = useState<string | null>(null);
    const [settingValue, setSettingValue] = useState('');

    // Categories State
    const [categories, setCategories] = useState<Domain[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    // AI State
    const [aiConfigs, setAIConfigs] = useState<AIConfig[]>([]);
    const [aiStats, setAIStats] = useState<AIStats | null>(null);
    const [aiLogs, setAILogs] = useState<AILog[]>([]);
    const [aiLoading, setAILoading] = useState(false);

    // Monetization State
    const [adConfigs, setAdConfigs] = useState<AdConfig[]>([]);
    const [adStats, setAdStats] = useState<AdStats | null>(null);
    const [adLoading, setAdLoading] = useState(false);

    // Premium State
    const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
    const [premiumTotal, setPremiumTotal] = useState(0);
    const [premiumLoading, setPremiumLoading] = useState(false);

    // Analytics State
    const [analyticsGrowth, setAnalyticsGrowth] = useState<GrowthMetric[]>([]);
    const [analyticsContent, setAnalyticsContent] = useState<ContentMetrics | null>(null);
    const [analyticsActivity, setAnalyticsActivity] = useState<ActivityMetric[]>([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Audit Logs State
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [auditTotal, setAuditTotal] = useState(0);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditPage, setAuditPage] = useState(1);
    const [auditActionFilter, setAuditActionFilter] = useState('');
    const [auditSearch, setAuditSearch] = useState('');

    // Notifications State
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info', target: 'all', expiresAt: '' });
    const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

    // Support State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [ticketReply, setTicketReply] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [faqsLoading, setFaqsLoading] = useState(false);
    const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'general', order: 0 });
    const [isCreatingFAQ, setIsCreatingFAQ] = useState(false);
    const [supportTab, setSupportTab] = useState<'tickets' | 'faqs'>('tickets');
    const [ticketFilter, setTicketFilter] = useState({ status: '', priority: '' });


    // Fetch Stats and Top Reported
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashData, reportedData] = await Promise.all([
                    adminService.getDashboard(),
                    adminService.getTopReported(5),
                ]);
                setStats(dashData);
                setTopReported(reportedData);
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Fetch Resources
    const fetchResources = useCallback(async () => {
        setResourcesLoading(true);
        try {
            const data = await adminService.getResources({
                page: resourcesPage,
                limit: 10,
                status: resourceFilter as 'all' | 'active' | 'hidden' | 'deleted',
                sortBy: resourceSort as 'newest' | 'oldest' | 'downloads' | 'views' | 'reports',
                search: resourceSearch || undefined,
            });
            setResources(data.items);
            setResourcesTotalPages(data.totalPages);
            setResourcesTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setResourcesLoading(false);
        }
    }, [resourcesPage, resourceFilter, resourceSort, resourceSearch]);

    useEffect(() => {
        if (activeNav === 'resources') {
            fetchResources();
        }
    }, [activeNav, fetchResources]);

    // Fetch Users
    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const data = await adminService.getUsers({
                page: usersPage,
                limit: 15,
                search: userSearch || undefined,
                role: userRoleFilter as 'all' | 'user' | 'admin' | 'premium',
                status: userStatusFilter as 'all' | 'active' | 'suspended',
            });
            setUsers(data.items);
            setUsersTotalPages(data.totalPages);
            setUsersTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setUsersLoading(false);
        }
    }, [usersPage, userSearch, userRoleFilter, userStatusFilter]);

    // Fetch Plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await adminService.getPlans();
                setPlans(data);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            }
        };
        fetchPlans();
    }, []);

    useEffect(() => {
        if (activeNav === 'users') {
            fetchUsers();
        }
    }, [activeNav, fetchUsers]);

    // Fetch Moderation Data
    const fetchModeration = useCallback(async () => {
        setModerationLoading(true);
        try {
            const [statsData, resourcesData] = await Promise.all([
                adminService.getModerationStats(),
                adminService.getReportedResources({}),
            ]);
            setModerationStats(statsData);
            setReportedResources(resourcesData.items);
        } catch (error) {
            console.error('Failed to fetch moderation data:', error);
        } finally {
            setModerationLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeNav === 'moderation') {
            fetchModeration();
        }
    }, [activeNav, fetchModeration]);

    // Fetch Settings
    const fetchSettings = useCallback(async () => {
        setSettingsLoading(true);
        try {
            const data = await adminService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeNav === 'settings') {
            fetchSettings();
        }
    }, [activeNav, fetchSettings]);

    // Fetch Categories
    const fetchCategories = useCallback(async () => {
        setCategoriesLoading(true);
        try {
            const data = await adminService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeNav === 'categories') {
            fetchCategories();
        }
    }, [activeNav, fetchCategories]);

    // Fetch AI Data
    const fetchAI = useCallback(async () => {
        setAILoading(true);
        try {
            const [configs, stats, logs] = await Promise.all([
                adminService.getAIConfigs(),
                adminService.getAIStats(),
                adminService.getAILogs(20)
            ]);
            setAIConfigs(configs);
            setAIStats(stats);
            setAILogs(logs);
        } catch (error) {
            console.error('Failed to fetch AI data:', error);
        } finally {
            setAILoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeNav === 'ai') {
            fetchAI();
        }
    }, [activeNav, fetchAI]);

    // Fetch Ads Data
    const fetchAds = useCallback(async () => {
        setAdLoading(true);
        try {
            const [configs, stats] = await Promise.all([
                adminService.getAdConfigs(),
                adminService.getAdStats()
            ]);
            setAdConfigs(configs);
            setAdStats(stats);
        } catch (error) {
            console.error('Failed to fetch Ad data:', error);
        } finally {
            setAdLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeNav === 'monetization') {
            fetchAds();
        }
    }, [activeNav, fetchAds]);

    // Fetch Premium Data
    const fetchPremium = useCallback(async () => {
        setPremiumLoading(true);
        try {
            const [plansRes, usersRes] = await Promise.all([
                adminService.getPlans(),
                adminService.getPremiumUsers({ limit: 5 })
            ]);
            setPlans(plansRes);
            setPremiumUsers(usersRes.items || []);
            setPremiumTotal(usersRes.total);
        } catch (error) { console.error('Failed to fetch premium data', error); }
        finally { setPremiumLoading(false); }
    }, []);

    useEffect(() => {
        if (activeNav === 'premium') fetchPremium();
    }, [activeNav, fetchPremium]);

    const fetchAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const [growth, content, activity] = await Promise.all([
                adminService.getGrowthMetrics(),
                adminService.getContentMetrics(),
                adminService.getActivityMetrics(),
            ]);
            setAnalyticsGrowth(growth);
            setAnalyticsContent(content);
            setAnalyticsActivity(activity);
        } catch (error) { toast.error('Failed to fetch analytics'); }
        finally { setAnalyticsLoading(false); }
    }, []);

    useEffect(() => {
        if (activeNav === 'analytics') fetchAnalytics();
    }, [activeNav, fetchAnalytics]);

    const fetchAuditLogs = useCallback(async () => {
        setAuditLoading(true);
        try {
            const data = await adminService.getAuditLogs({
                page: auditPage,
                limit: 20,
                action: auditActionFilter !== 'all' ? auditActionFilter : undefined,
                search: auditSearch,
            });
            setAuditLogs(data.logs);
            setAuditTotal(data.total);
        } catch (error) { toast.error('Failed to fetch audit logs'); }
        finally { setAuditLoading(false); }
    }, [auditPage, auditActionFilter, auditSearch]);

    useEffect(() => {
        if (activeNav === 'audit') fetchAuditLogs();
    }, [activeNav, fetchAuditLogs]);

    const fetchAnnouncements = useCallback(async () => {
        setAnnouncementsLoading(true);
        try {
            const data = await adminService.getAnnouncements();
            setAnnouncements(data);
        } catch (error) { toast.error('Failed to fetch announcements'); }
        finally { setAnnouncementsLoading(false); }
    }, []);

    useEffect(() => {
        if (activeNav === 'notifications') fetchAnnouncements();
    }, [activeNav, fetchAnnouncements]);

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPostingAnnouncement(true);
        try {
            await adminService.createAnnouncement(newAnnouncement);
            toast.success('Announcement posted successfully');
            setNewAnnouncement({ title: '', message: '', type: 'info', target: 'all', expiresAt: '' });
            fetchAnnouncements();
        } catch (error) { toast.error('Failed to post announcement'); }
        finally { setIsPostingAnnouncement(false); }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await adminService.deleteAnnouncement(id);
            toast.success('Announcement deleted');
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error) { toast.error('Failed to delete announcement'); }
    };

    const handleToggleAnnouncement = async (id: string, currentStatus: boolean) => {
        try {
            await adminService.toggleAnnouncementStatus(id, !currentStatus);
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
            toast.success('Status updated');
        } catch (error) { toast.error('Failed to update status'); }
    };

    // Support Logic
    const fetchTickets = useCallback(async () => {
        setTicketsLoading(true);
        try {
            const data = await adminService.getTickets(ticketFilter);
            setTickets(data);
        } catch (error) { toast.error('Failed to fetch tickets'); }
        finally { setTicketsLoading(false); }
    }, [ticketFilter]);

    const fetchFAQs = useCallback(async () => {
        setFaqsLoading(true);
        try {
            const data = await adminService.getFAQs();
            setFaqs(data);
        } catch (error) { toast.error('Failed to fetch FAQs'); }
        finally { setFaqsLoading(false); }
    }, []);

    useEffect(() => {
        if (activeNav === 'support') {
            if (supportTab === 'tickets') fetchTickets();
            else fetchFAQs();
        }
    }, [activeNav, supportTab, fetchTickets, fetchFAQs]);

    const handleTicketReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !ticketReply.trim()) return;
        setIsSendingReply(true);
        try {
            const msg = await adminService.replyToTicket(selectedTicket.id, ticketReply);
            setSelectedTicket(prev => prev ? {
                ...prev,
                messages: [...(prev.messages || []), msg],
                status: 'IN_PROGRESS'
            } : null);
            setTicketReply('');
            toast.success('Reply sent');
        } catch (error) { toast.error('Failed to send reply'); }
        finally { setIsSendingReply(false); }
    };

    const handleUpdateTicketStatus = async (status: string) => {
        if (!selectedTicket) return;
        try {
            await adminService.updateTicketStatus(selectedTicket.id, status);
            setSelectedTicket(prev => prev ? { ...prev, status: status as any } : null);
            setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: status as any } : t));
            toast.success('Status updated');
        } catch (error) { toast.error('Failed to update status'); }
    };

    const handleCreateFAQ = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingFAQ(true);
        try {
            const faq = await adminService.createFAQ(newFAQ);
            setFaqs([...faqs, faq]);
            setNewFAQ({ question: '', answer: '', category: 'general', order: 0 });
            toast.success('FAQ created');
        } catch (error) { toast.error('Failed to create FAQ'); }
        finally { setIsCreatingFAQ(false); }
    };

    const handleDeleteFAQ = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return;
        try {
            await adminService.deleteFAQ(id);
            setFaqs(prev => prev.filter(f => f.id !== id));
            toast.success('FAQ deleted');
        } catch (error) { toast.error('Failed to delete FAQ'); }
    };


    // Handlers
    const handleHideResource = async (id: string) => {
        try {
            await adminService.hideResource(id);
            toast.success('Resource hidden');
            fetchResources();
        } catch (error) {
            toast.error('Failed to hide resource');
        }
    };

    const handleRestoreResource = async (id: string) => {
        try {
            await adminService.restoreResource(id);
            toast.success('Resource restored');
            fetchResources();
        } catch (error) {
            toast.error('Failed to restore resource');
        }
    };

    const handleArchiveResource = async (id: string) => {
        if (!confirm('Are you sure you want to archive this resource?')) return;
        try {
            await adminService.archiveResource(id);
            toast.success('Resource archived');
            fetchResources();
        } catch (error) {
            toast.error('Failed to archive resource');
        }
    };

    const handleToggleResourcePrivate = async (id: string) => {
        try {
            await adminService.toggleResourcePrivate(id);
            toast.success('Resource visibility updated');
            fetchResources();
        } catch (error) {
            toast.error('Failed to update resource');
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource permanently? This cannot be undone.')) return;
        try {
            await adminService.deleteResource(id);
            toast.success('Resource deleted');
            fetchResources();
        } catch (error) {
            toast.error('Failed to delete resource');
        }
    };


    const handleToggleUserStatus = async (id: string) => {
        try {
            await adminService.toggleUserStatus(id);
            toast.success('User status updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const handleUpgradeSubscription = async (userId: string, planId: string) => {
        try {
            await adminService.upgradeSubscription(userId, planId);
            toast.success('Subscription upgraded');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to upgrade subscription');
        }
    };

    const handleViewUser = async (userId: string) => {
        setUserDetailsLoading(true);
        setSelectedUser({ id: userId }); // Open modal immediately with partial data if needed
        try {
            const details = await adminService.getUserDetails(userId);
            setSelectedUser(details);
        } catch (error) {
            toast.error('Failed to fetch user details');
            setSelectedUser(null);
        } finally {
            setUserDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    // Settings handlers
    const handleSaveSetting = async (key: string, value: string) => {
        try {
            await adminService.updateSetting(key, { value });
            toast.success('Setting updated');
            setEditingSetting(null);
            fetchSettings();
        } catch (error) {
            toast.error('Failed to update setting');
        }
    };

    // Moderation handlers
    const handleRestoreReported = async (id: string) => {
        try {
            await adminService.restoreResource(id);
            toast.success('Resource restored and reports dismissed');
            fetchModeration();
        } catch (error) {
            toast.error('Failed to restore resource');
        }
    };

    const handleArchiveReported = async (id: string) => {
        if (!confirm('Archive this resource? It will be hidden from all users.')) return;
        try {
            await adminService.archiveResource(id);
            toast.success('Resource archived');
            fetchModeration();
        } catch (error) {
            toast.error('Failed to archive resource');
        }
    };

    const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const navItems: { key: NavKey; label: string; icon: React.ReactNode; badge?: number }[] = [
        { key: 'dashboard', label: 'Dashboard', icon: <TrendingIcon size={20} /> },
        { key: 'resources', label: 'Resources', icon: <DocumentIcon size={20} />, badge: stats?.resources.hidden },
        { key: 'moderation', label: 'Moderation', icon: <AlertIcon size={20} />, badge: stats?.moderation.pendingReports },
        { key: 'users', label: 'Users', icon: <UserIcon size={20} /> },
        { key: 'categories', label: 'Categories', icon: <ArchiveIcon size={20} /> },
        { key: 'ai', label: 'AI Controls', icon: <SparkleIcon size={20} /> },
        { key: 'monetization', label: 'Monetization', icon: <CreditIcon size={20} /> },
        { key: 'premium', label: 'Premium', icon: <LockIcon size={20} /> },
        { key: 'analytics', label: 'Analytics', icon: <TrendingIcon size={20} /> },
        { key: 'audit', label: 'Audit Logs', icon: <DocumentIcon size={20} /> },
        { key: 'notifications', label: 'Notifications', icon: <AlertIcon size={20} /> },
        { key: 'support', label: 'Support', icon: <UserIcon size={20} /> },
        { key: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
    ];

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Category CRUD Handlers
    const handleCreateDomain = async () => {
        const name = prompt('Enter Domain Name:');
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            await adminService.createDomain({ name, slug });
            toast.success('Domain created');
            fetchCategories();
        } catch (error) { toast.error('Failed to create domain'); }
    };

    const handleCreateSubDomain = async (domainId: string) => {
        const name = prompt('Enter SubDomain Name:');
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            await adminService.createSubDomain({ domainId, name, slug });
            toast.success('SubDomain created');
            fetchCategories();
            setExpandedNodes(prev => ({ ...prev, [domainId]: true }));
        } catch (error) { toast.error('Failed to create subdomain'); }
    };

    const handleCreateStream = async (subDomainId: string) => {
        const name = prompt('Enter Stream Name:');
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            await adminService.createStream({ subDomainId, name, slug });
            toast.success('Stream created');
            fetchCategories();
            setExpandedNodes(prev => ({ ...prev, [subDomainId]: true }));
        } catch (error) { toast.error('Failed to create stream'); }
    };

    const handleCreateSubject = async (streamId: string) => {
        const name = prompt('Enter Subject Name:');
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            await adminService.createSubject({ streamId, name, slug });
            toast.success('Subject created');
            fetchCategories();
            setExpandedNodes(prev => ({ ...prev, [streamId]: true }));
        } catch (error) { toast.error('Failed to create subject'); }
    };

    const handleDeleteCategory = async (type: 'domain' | 'subdomain' | 'stream' | 'subject', id: string) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            if (type === 'domain') await adminService.deleteDomain(id);
            if (type === 'subdomain') await adminService.deleteSubDomain(id);
            if (type === 'stream') await adminService.deleteStream(id);
            if (type === 'subject') await adminService.deleteSubject(id);
            toast.success(`${type} deleted`);
            fetchCategories();
        } catch (error) { toast.error(`Failed to delete ${type}`); }
    };

    const handleEditCategory = async (type: 'domain' | 'subdomain' | 'stream' | 'subject', id: string, currentName: string) => {
        const name = prompt(`Enter new name for ${type}:`, currentName);
        if (!name || name === currentName) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            if (type === 'domain') await adminService.updateDomain(id, { name, slug });
            if (type === 'subdomain') await adminService.updateSubDomain(id, { name, slug });
            if (type === 'stream') await adminService.updateStream(id, { name, slug });
            if (type === 'subject') await adminService.updateSubject(id, { name, slug });
            toast.success(`${type} updated`);
            fetchCategories();
        } catch (error) { toast.error(`Failed to update ${type}`); }
    };

    // AI Handlers
    const handleToggleConfig = async (key: string, currentStatus: boolean) => {
        try {
            await adminService.updateAIConfig(key, { enabled: !currentStatus });
            toast.success(`AI feature ${!currentStatus ? 'enabled' : 'disabled'}`);
            fetchAI();
        } catch (error) { toast.error('Failed to update AI config'); }
    };

    const handleUpdateDailyLimit = async (key: string, currentLimit: number) => {
        const limitStr = prompt('Enter new daily limit:', currentLimit.toString());
        if (limitStr === null) return;
        const limit = parseInt(limitStr);
        if (isNaN(limit) || limit < 0) {
            toast.error('Invalid limit');
            return;
        }

        try {
            await adminService.updateAIConfig(key, { dailyLimit: limit });
            toast.success('Limit updated');
            fetchAI();
        } catch (error) { toast.error('Failed to update limit'); }
    };

    // Ad Handlers
    const handleToggleAd = async (id: string, currentStatus: boolean) => {
        try {
            await adminService.updateAdConfig(id, { enabled: !currentStatus });
            toast.success(`Ad placement ${!currentStatus ? 'enabled' : 'disabled'}`);
            fetchAds();
        } catch (error) { toast.error('Failed to update ad config'); }
    };

    const handleUpdateAdUnit = async (id: string, currentUnit: string | undefined) => {
        const adUnitId = prompt('Enter Google AdSense Unit ID:', currentUnit || '');
        if (adUnitId === null || adUnitId === currentUnit) return;
        try {
            await adminService.updateAdConfig(id, { adUnitId });
            toast.success('Ad Unit ID updated');
            fetchAds();
        } catch (error) { toast.error('Failed to update Ad Unit ID'); }
    };

    // Premium Handlers
    const handleTogglePlan = async (id: string, currentStatus: boolean) => {
        try {
            await adminService.updatePlan(id, { isActive: !currentStatus });
            toast.success('Plan status updated');
            fetchPremium();
        } catch (error) { toast.error('Failed to update plan'); }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminHeader
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className="flex flex-1 pt-0">
                <AdminSidebar
                    sidebarCollapsed={sidebarCollapsed}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                    activeNav={activeNav}
                    setActiveNav={setActiveNav}
                    navItems={navItems}
                />

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-300 min-w-0`}>
                    <div className="p-4 md:p-8 overflow-x-hidden max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            {/* Dashboard Tab */}
                            {activeNav === 'dashboard' && (
                                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-8">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Overview of platform performance</p>
                                    </header>

                                    {statsLoading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : stats && (
                                        <>
                                            {/* Stats Cards */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
                                                {[
                                                    { label: 'Total Users', value: stats.users.total.toLocaleString(), sub: `${stats.users.premium} premium`, icon: <UserIcon size={20} />, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                                                    { label: 'Resources', value: stats.resources.total.toLocaleString(), sub: `${stats.resources.hidden} hidden`, icon: <DocumentIcon size={20} />, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
                                                    { label: 'Today Uploads', value: stats.today.uploads.toLocaleString(), sub: `${stats.today.downloads} downloads`, icon: <TrendingIcon size={20} />, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
                                                    { label: 'AI Requests', value: stats.today.aiRequests.toLocaleString(), sub: 'today', icon: <SparkleIcon size={20} />, color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' },
                                                    { label: 'Pending Reports', value: stats.moderation.pendingReports.toLocaleString(), sub: 'need review', icon: <AlertIcon size={20} />, color: stats.moderation.pendingReports > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600' },
                                                    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, sub: `${stats.storageUsedMB} MB used`, icon: <CreditIcon size={20} />, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="flex gap-3 p-4 md:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${stat.color}`}>{stat.icon}</div>
                                                        <div className="min-w-0">
                                                            <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">{stat.label}</span>
                                                            <span className="block font-display text-lg md:text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{stat.sub}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Top Reported Resources */}
                                            {topReported.length > 0 && (
                                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <AlertIcon size={20} className="text-red-500" />
                                                        <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Top Reported Resources</h2>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {topReported.map((resource) => (
                                                            <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{resource.title}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">by {resource.author.name}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                                                        {resource.reportCount} reports
                                                                    </span>
                                                                    {resource.isHidden && (
                                                                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                                                            Hidden
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* Resources Tab */}
                            {activeNav === 'resources' && (
                                <motion.div key="resources" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Resources</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{resourcesTotal} total resources</p>
                                    </header>

                                    {/* Filters */}
                                    <div className="flex flex-col gap-3 mb-6">
                                        <div className="relative w-full">
                                            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search resources..."
                                                value={resourceSearch}
                                                onChange={(e) => { setResourceSearch(e.target.value); setResourcesPage(1); }}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                            />
                                        </div>
                                        <div className="flex flex-row gap-2 w-full">
                                            <select
                                                value={resourceFilter}
                                                onChange={(e) => { setResourceFilter(e.target.value); setResourcesPage(1); }}
                                                className="flex-1 min-w-0 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="active">Active</option>
                                                <option value="hidden">Hidden</option>
                                                <option value="deleted">Archived</option>
                                            </select>
                                            <select
                                                value={resourceSort}
                                                onChange={(e) => { setResourceSort(e.target.value); setResourcesPage(1); }}
                                                className="flex-1 min-w-0 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none"
                                            >
                                                <option value="newest">Newest</option>
                                                <option value="oldest">Oldest</option>
                                                <option value="downloads">Most Downloaded</option>
                                                <option value="views">Most Viewed</option>
                                                <option value="reports">Most Reported</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Resource List */}
                                    {resourcesLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 overflow-hidden">
                                            {resources.map((resource) => (
                                                <div key={resource.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                                    {/* Summary Row */}
                                                    <button
                                                        onClick={() => setExpandedResource(expandedResource === resource.id ? null : resource.id)}
                                                        className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left overflow-hidden"
                                                    >
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                                                            <DocumentIcon size={18} className="text-gray-500 sm:hidden" />
                                                            <DocumentIcon size={20} className="text-gray-500 hidden sm:block" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 overflow-hidden">
                                                            <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{resource.title}</h3>
                                                            <div className="flex flex-wrap gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                                                <span className="truncate max-w-[80px] sm:max-w-none">{resource.author.name}</span>
                                                                <span className="hidden xs:inline">•</span>
                                                                <span className="hidden xs:inline">{resource.resourceType}</span>
                                                                <span className="hidden sm:inline">•</span>
                                                                <span className="hidden sm:inline">{resource.viewCount} views</span>
                                                                <span className="hidden md:inline">•</span>
                                                                <span className="hidden md:inline">{resource.downloadCount} downloads</span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded-full flex-shrink-0 ${resource.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : resource.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                            {resource.status === 'REJECTED' ? 'Private' : resource.status}
                                                        </span>
                                                        <ChevronDownIcon size={16} className={`text-gray-400 transition-transform flex-shrink-0 sm:hidden ${expandedResource === resource.id ? 'rotate-180' : ''}`} />
                                                        <ChevronDownIcon size={20} className={`text-gray-400 transition-transform flex-shrink-0 hidden sm:block ${expandedResource === resource.id ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Expanded Details */}
                                                    <AnimatePresence>
                                                        {expandedResource === resource.id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                                style={{ maskSize: '100px 100px', maskPosition: 'center' }}
                                                            >
                                                                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 overflow-hidden">
                                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-3">{resource.description}</p>
                                                                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-3 text-xs sm:text-sm mb-3 sm:mb-4">
                                                                        <div className="flex flex-wrap gap-1"><span className="text-gray-500 dark:text-gray-400">Domain:</span> <span className="text-gray-900 dark:text-white break-all">{resource.domain}</span></div>
                                                                        <div className="flex flex-wrap gap-1"><span className="text-gray-500 dark:text-gray-400">Subject:</span> <span className="text-gray-900 dark:text-white break-all">{resource.subject}</span></div>
                                                                        <div className="flex flex-wrap gap-1"><span className="text-gray-500 dark:text-gray-400">Type:</span> <span className="text-gray-900 dark:text-white">{resource.fileType}</span></div>
                                                                        <div className="flex flex-wrap gap-1"><span className="text-gray-500 dark:text-gray-400">Created:</span> <span className="text-gray-900 dark:text-white">{formatDate(resource.createdAt)}</span></div>
                                                                    </div>
                                                                    {/* Status Badges */}
                                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                                        {resource.isHidden && (
                                                                            <span className="px-2 py-1 text-[10px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                                                                Hidden
                                                                            </span>
                                                                        )}
                                                                        {resource.isAutoDeleted && (
                                                                            <span className="px-2 py-1 text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                                                                Archived
                                                                            </span>
                                                                        )}
                                                                        {resource.reportCount > 0 && (
                                                                            <span className="px-2 py-1 text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                                                                                {resource.reportCount} reports
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Action Buttons */}
                                                                    <div className="flex flex-col xs:flex-row gap-2">
                                                                        {/* Hide/Restore Button */}
                                                                        {resource.isHidden || resource.isAutoDeleted ? (
                                                                            <button
                                                                                onClick={() => handleRestoreResource(resource.id)}
                                                                                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-[11px] sm:text-xs font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                                                            >
                                                                                <RestoreIcon size={14} /><span>Restore</span>
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleHideResource(resource.id)}
                                                                                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-[11px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                            >
                                                                                <EyeOffIcon size={14} /><span>Hide</span>
                                                                            </button>
                                                                        )}
                                                                        {/* Archive Button */}
                                                                        {!resource.isAutoDeleted && (
                                                                            <button
                                                                                onClick={() => handleArchiveResource(resource.id)}
                                                                                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-[11px] sm:text-xs font-medium bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                                                                            >
                                                                                <ArchiveIcon size={14} /><span>Archive</span>
                                                                            </button>
                                                                        )}
                                                                        {/* Delete Button */}
                                                                        <button
                                                                            onClick={() => handleDeleteResource(resource.id)}
                                                                            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-[11px] sm:text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                                        >
                                                                            <TrashIcon size={14} /><span>Delete</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}

                                            {resources.length === 0 && (
                                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No resources found</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {resourcesTotalPages > 1 && (
                                        <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
                                            <button
                                                onClick={() => setResourcesPage(p => Math.max(1, p - 1))}
                                                disabled={resourcesPage === 1}
                                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                                            >
                                                Prev
                                            </button>
                                            <span className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {resourcesPage} / {resourcesTotalPages}
                                            </span>
                                            <button
                                                onClick={() => setResourcesPage(p => Math.min(resourcesTotalPages, p + 1))}
                                                disabled={resourcesPage === resourcesTotalPages}
                                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Users Tab */}
                            {activeNav === 'users' && (
                                <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Users</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{usersTotal} registered users</p>
                                    </header>

                                    {/* Filters */}
                                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                                        <div className="relative flex-1">
                                            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or email..."
                                                value={userSearch}
                                                onChange={(e) => { setUserSearch(e.target.value); setUsersPage(1); }}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                            />
                                        </div>
                                        <select
                                            value={userRoleFilter}
                                            onChange={(e) => { setUserRoleFilter(e.target.value); setUsersPage(1); }}
                                            className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none"
                                        >
                                            <option value="all">All Roles</option>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                        <select
                                            value={userStatusFilter}
                                            onChange={(e) => { setUserStatusFilter(e.target.value); setUsersPage(1); }}
                                            className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="suspended">Blocked</option>
                                        </select>
                                    </div>

                                    {/* Users Table/Cards */}
                                    {usersLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Desktop Table */}
                                            <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                                                            <th className="px-6 py-4">User</th>
                                                            <th className="px-6 py-4">Role</th>
                                                            <th className="px-6 py-4">Subscription</th>
                                                            <th className="px-6 py-4">Credits</th>
                                                            <th className="px-6 py-4">Status</th>
                                                            <th className="px-6 py-4">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {users.map((user, i) => (
                                                            <tr key={user.id} className="text-sm text-gray-900 dark:text-gray-100 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-semibold">{user.name.charAt(0)}</div>
                                                                        <div>
                                                                            <div className="font-medium">{user.name}</div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 text-[11px] font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{user.role}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {user.subscription?.active ? (
                                                                        <span className="px-2 py-1 text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">{user.subscription.plan?.name || 'Pro'}</span>
                                                                    ) : (
                                                                        <select
                                                                            onChange={(e) => e.target.value && handleUpgradeSubscription(user.id, e.target.value)}
                                                                            className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded px-2 py-1"
                                                                            defaultValue=""
                                                                        >
                                                                            <option value="">Free</option>
                                                                            {plans.map(plan => (
                                                                                <option key={plan.id} value={plan.id}>Upgrade to {plan.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="text-xs">
                                                                        <div>Daily: {user.dailyCredits}</div>
                                                                        <div>Upload: {user.uploadCredits}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 text-[11px] font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                        {user.isActive ? 'Active' : 'Blocked'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleViewUser(user.id)}
                                                                            className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleToggleUserStatus(user.id)}
                                                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${user.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                                        >
                                                                            {user.isActive ? 'Block' : 'Unblock'}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Cards */}
                                            <div className="md:hidden space-y-3">
                                                {users.map((user) => (
                                                    <div key={user.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4">
                                                        <div className="flex items-start gap-2 sm:gap-3 mb-3">
                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">{user.name.charAt(0)}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{user.name}</div>
                                                                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                                            </div>
                                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold rounded-full flex-shrink-0 ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                {user.isActive ? 'Active' : 'Blocked'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold rounded ${user.role === 'ADMIN' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-green-300'}`}>{user.role}</span>
                                                            {user.subscription?.active && (
                                                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded">{user.subscription.plan?.name}</span>
                                                            )}
                                                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded">D:{user.dailyCredits} U:{user.uploadCredits}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewUser(user.id)}
                                                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleUserStatus(user.id)}
                                                                className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-md transition-colors ${user.isActive ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}
                                                            >
                                                                {user.isActive ? 'Block' : 'Unblock'}
                                                            </button>
                                                            {!user.subscription?.active && plans.length > 0 && (
                                                                <select
                                                                    onChange={(e) => e.target.value && handleUpgradeSubscription(user.id, e.target.value)}
                                                                    className="flex-1 text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-gray-900 dark:text-white"
                                                                    defaultValue=""
                                                                >
                                                                    <option value="">Upgrade</option>
                                                                    {plans.map(plan => (
                                                                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {users.length === 0 && (
                                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No users found</div>
                                            )}
                                        </>
                                    )}

                                    {/* Pagination */}
                                    {usersTotalPages > 1 && (
                                        <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
                                            <button
                                                onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                                                disabled={usersPage === 1}
                                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                                            >
                                                Prev
                                            </button>
                                            <span className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {usersPage} / {usersTotalPages}
                                            </span>
                                            <button
                                                onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                                                disabled={usersPage === usersTotalPages}
                                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Moderation Tab */}
                            {activeNav === 'moderation' && (
                                <motion.div key="moderation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Moderation</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Review reported content and moderate resources</p>
                                    </header>

                                    {moderationLoading ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                                ))}
                                            </div>
                                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Moderation Stats */}
                                            {moderationStats && (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                                    {[
                                                        { label: 'Pending Reports', value: moderationStats.pendingReports, color: 'text-red-600' },
                                                        { label: 'Auto-Hidden', value: moderationStats.autoHidden, color: 'text-yellow-600' },
                                                        { label: 'Auto-Deleted', value: moderationStats.autoDeleted, color: 'text-orange-600' },
                                                        { label: 'Reviewed Today', value: moderationStats.reviewedToday, color: 'text-green-600' },
                                                    ].map((stat, i) => (
                                                        <div key={i} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                            <span className="block text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                                                            <span className={`block text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reported Resources List */}
                                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                                    <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Reported Resources</h2>
                                                </div>
                                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {reportedResources.map((resource) => (
                                                        <div key={resource.id} className="p-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{resource.title}</h3>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">by {resource.author?.name || 'Unknown'}</p>
                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                                                            {resource.reportCount} reports
                                                                        </span>
                                                                        {resource.isHidden && (
                                                                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                                                                Hidden
                                                                            </span>
                                                                        )}
                                                                        {resource.isAutoDeleted && (
                                                                            <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                                                                                Archived
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 flex-shrink-0">
                                                                    <button
                                                                        onClick={() => handleRestoreReported(resource.id)}
                                                                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                                                    >
                                                                        <RestoreIcon size={14} className="inline mr-1" />
                                                                        Restore
                                                                    </button>
                                                                    {!resource.isAutoDeleted && (
                                                                        <button
                                                                            onClick={() => handleArchiveReported(resource.id)}
                                                                            className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                                        >
                                                                            <ArchiveIcon size={14} className="inline mr-1" />
                                                                            Archive
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Report Reasons */}
                                                            {resource.reports && resource.reports.length > 0 && (
                                                                <div className="mt-3 space-y-1">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Recent reports:</span>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {resource.reports.slice(0, 5).map((report: any, i: number) => (
                                                                            <span key={i} className="px-2 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                                                                {report.reason}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {reportedResources.length === 0 && (
                                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                            <CheckIcon size={32} className="mx-auto mb-2 text-green-500" />
                                                            <p>No reported resources! Everything looks good.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* Categories Tab */}
                            {activeNav === 'categories' && (
                                <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6 flex justify-between items-center">
                                        <div>
                                            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Category Management</h1>
                                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage learning domains, subdomains, streams, and subjects</p>
                                        </div>
                                        <button
                                            onClick={handleCreateDomain}
                                            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 font-medium text-sm transition-all shadow-md hover:shadow-lg"
                                        >
                                            <span>+ Add Domain</span>
                                        </button>
                                    </header>

                                    {categoriesLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {categories.length === 0 && (
                                                <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                                    <ArchiveIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No categories yet</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first domain to get started.</p>
                                                    <button onClick={handleCreateDomain} className="text-blue-600 dark:text-blue-400 hover:underline">Create Domain</button>
                                                </div>
                                            )}
                                            {categories.map(domain => (
                                                <div key={domain.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                    <div
                                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                        onClick={() => toggleNode(domain.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedNodes[domain.id] ? 'rotate-180' : ''}`} />
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{domain.name}</h3>
                                                                    <span className="text-xs text-gray-400 font-mono">/{domain.slug}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-500">{domain.subDomains?.length || 0} subdomains</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => handleCreateSubDomain(domain.id)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-xs font-medium">Add SubDomain</button>
                                                            <button onClick={() => handleEditCategory('domain', domain.id, domain.name)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><SettingsIcon size={16} /></button>
                                                            <button onClick={() => handleDeleteCategory('domain', domain.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><TrashIcon size={16} /></button>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedNodes[domain.id] && (
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                                                                <div className="p-4 pl-12 space-y-4">
                                                                    {domain.subDomains?.map(sub => (
                                                                        <div key={sub.id} className="border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                                                                            <div className="flex items-center justify-between group mb-2">
                                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleNode(sub.id)}>
                                                                                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${expandedNodes[sub.id] ? 'rotate-180' : ''}`} />
                                                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{sub.name}</span>
                                                                                    <span className="text-xs text-gray-400">({sub.streams?.length || 0} streams)</span>
                                                                                </div>
                                                                                <div className="hidden group-hover:flex items-center gap-2">
                                                                                    <button onClick={() => handleCreateStream(sub.id)} className="text-xs text-blue-600 hover:underline">Add Stream</button>
                                                                                    <button onClick={() => handleEditCategory('subdomain', sub.id, sub.name)} className="text-xs text-gray-500 hover:underline">Edit</button>
                                                                                    <button onClick={() => handleDeleteCategory('subdomain', sub.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                                                                                </div>
                                                                            </div>

                                                                            {expandedNodes[sub.id] && (
                                                                                <div className="pl-6 space-y-3 mt-2">
                                                                                    {sub.streams?.map(stream => (
                                                                                        <div key={stream.id} className="relative">
                                                                                            <div className="flex items-center justify-between group">
                                                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleNode(stream.id)}>
                                                                                                    <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform ${expandedNodes[stream.id] ? 'rotate-180' : ''}`} />
                                                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stream.name}</span>
                                                                                                </div>
                                                                                                <div className="hidden group-hover:flex items-center gap-2">
                                                                                                    <button onClick={() => handleCreateSubject(stream.id)} className="text-[10px] text-blue-600 hover:underline">Add Subject</button>
                                                                                                    <button onClick={() => handleEditCategory('stream', stream.id, stream.name)} className="text-[10px] text-gray-500 hover:underline">Edit</button>
                                                                                                    <button onClick={() => handleDeleteCategory('stream', stream.id)} className="text-[10px] text-red-500 hover:underline">Delete</button>
                                                                                                </div>
                                                                                            </div>

                                                                                            {expandedNodes[stream.id] && (
                                                                                                <div className="pl-5 mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                                                    {stream.subjects?.map(subject => (
                                                                                                        <div key={subject.id} className="bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-500">
                                                                                                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{subject.name}</span>
                                                                                                            <div className="hidden group-hover:flex items-center gap-1">
                                                                                                                <button onClick={() => handleEditCategory('subject', subject.id, subject.name)}><SettingsIcon size={10} className="text-gray-400 hover:text-gray-600" /></button>
                                                                                                                <button onClick={() => handleDeleteCategory('subject', subject.id)}><TrashIcon size={10} className="text-red-400 hover:text-red-600" /></button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                    <button onClick={() => handleCreateSubject(stream.id)} className="px-2 py-1 rounded border border-dashed border-gray-300 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500 text-left transition-colors">
                                                                                                        + Add Subject
                                                                                                    </button>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                    <button onClick={() => handleCreateStream(sub.id)} className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1 mt-1">
                                                                                        <span>+ Add Stream</span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    <button onClick={() => handleCreateSubDomain(domain.id)} className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                                                                        + Add SubDomain to {domain.name}
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* AI Controls Tab */}
                            {activeNav === 'ai' && (
                                <motion.div key="ai" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">AI Controls</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage AI features, limits, and monitor usage</p>
                                    </header>

                                    {aiLoading ? (
                                        <div className="space-y-6">
                                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* AI Stats */}
                                            {aiStats && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl">
                                                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Requests (7 days)</div>
                                                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{aiStats.totalRequests}</div>
                                                    </div>
                                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
                                                        <div className="text-sm text-red-600 dark:text-red-400 mb-1">Error Rate</div>
                                                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">{aiStats.errorRate.toFixed(1)}%</div>
                                                    </div>
                                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                                                        <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Most Used Feature</div>
                                                        <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                            {aiStats.byFeature.sort((a, b) => b.count - a.count)[0]?.feature || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Stats Charts */}
                                            {aiStats && (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Request Volume Chart */}
                                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Request Volume (Last 7 Days)</h3>
                                                        <div className="h-48 flex items-end justify-between gap-2">
                                                            {aiStats.byFeature.map((item, i) => {
                                                                const max = Math.max(...aiStats.byFeature.map(f => f.count));
                                                                const height = max > 0 ? (item.count / max) * 100 : 0;
                                                                return (
                                                                    <div key={item.feature} className="flex-1 flex flex-col items-center group">
                                                                        <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-t-md overflow-hidden h-full flex items-end">
                                                                            <div
                                                                                className="w-full bg-purple-500 hover:bg-purple-600 transition-all duration-500 relative"
                                                                                style={{ height: `${height}%` }}
                                                                            >
                                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                                    {item.count} reqs
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">{item.feature}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {aiStats.byFeature.length === 0 && <div className="w-full h-full flex items-center justify-center text-gray-400">No data available</div>}
                                                        </div>
                                                    </div>

                                                    {/* Usage Distribution */}
                                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Usage Distribution</h3>
                                                        <div className="flex-1 flex items-center justify-center">
                                                            <div className="w-full space-y-4">
                                                                {aiStats.byFeature.map((item, i) => {
                                                                    const total = aiStats.totalRequests;
                                                                    const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                                                                    return (
                                                                        <div key={item.feature}>
                                                                            <div className="flex justify-between text-sm mb-1">
                                                                                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{item.feature}</span>
                                                                                <span className="text-gray-500">{percentage}% ({item.count})</span>
                                                                            </div>
                                                                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Feature Configs */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                    <h3 className="font-bold text-gray-900 dark:text-white">Feature Configuration</h3>
                                                </div>
                                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {aiConfigs.map(config => (
                                                        <div key={config.featureKey} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{config.name}</h4>
                                                                    {config.premiumOnly && <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 font-bold tracking-wide rounded uppercase">PREMIUM</span>}
                                                                </div>
                                                                <p className="text-sm text-gray-500 mt-1 max-w-md">{config.description || `Manage settings for ${config.featureKey} feature.`}</p>
                                                                <div className="flex items-center gap-4 mt-3">
                                                                    <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                                        Daily Limit: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{config.dailyLimit}</span>
                                                                    </div>
                                                                    <button onClick={() => handleUpdateDailyLimit(config.featureKey, config.dailyLimit)} className="text-xs text-blue-600 hover:underline">Change Limit</button>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-sm font-medium transition-colors ${config.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                                                    {config.enabled ? 'Active' : 'Disabled'}
                                                                </span>
                                                                <button
                                                                    className={`w-12 h-6 rounded-full transition-colors relative ${config.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                                >
                                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.enabled ? 'left-7' : 'left-1'}`} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {aiConfigs.length === 0 && <p className="p-4 text-center text-gray-500">No configs found.</p>}
                                                </div>
                                            </div>

                                            {/* Recent Logs */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                    <h3 className="font-bold text-gray-900 dark:text-white">Recent AI Requests</h3>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 uppercase">
                                                            <tr>
                                                                <th className="px-4 py-2">Time</th>
                                                                <th className="px-4 py-2">User</th>
                                                                <th className="px-4 py-2">Feature</th>
                                                                <th className="px-4 py-2">Status</th>
                                                                <th className="px-4 py-2">Tokens</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {aiLogs.map(log => (
                                                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    <td className="px-4 py-2 text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                                                                    <td className="px-4 py-2 font-medium">{log.user?.name || 'Unknown'}</td>
                                                                    <td className="px-4 py-2">{log.featureKey}</td>
                                                                    <td className="px-4 py-2">
                                                                        {log.success ?
                                                                            <span className="text-green-600">Success</span> :
                                                                            <span className="text-red-500" title={log.errorMsg}>Error</span>
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-2 text-gray-500">{log.inputSize + log.outputSize} chars</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {aiLogs.length === 0 && <p className="p-4 text-center text-gray-500">No recent logs.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Monetization Tab */}
                            {activeNav === 'monetization' && (
                                <motion.div key="monetization" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Monetization & Ads</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage ad placements and view revenue stats</p>
                                    </header>

                                    {adLoading ? (
                                        <div className="space-y-6">
                                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Revenue Stats */}
                                            {adStats && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                                                        <div className="text-sm text-green-100 mb-1">Total Revenue (7 days)</div>
                                                        <div className="text-3xl font-bold">${adStats.totalRevenue.toFixed(2)}</div>
                                                        <div className="mt-2 text-xs text-green-100 bg-white/20 px-2 py-1 rounded inline-block">
                                                            {adStats.totalImpressions} Impressions
                                                        </div>
                                                    </div>
                                                    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-sm text-gray-500 mb-1">eCPM (Estimated)</div>
                                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                                ${adStats.totalImpressions > 0 ? ((adStats.totalRevenue / adStats.totalImpressions) * 1000).toFixed(2) : '0.00'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Ad Placements */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                    <h3 className="font-bold text-gray-900 dark:text-white">Ad Placements</h3>
                                                </div>
                                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {adConfigs.map(config => (
                                                        <div key={config.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{config.name}</h4>
                                                                    <span className="text-xs font-mono text-gray-400">{config.placement}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                                                        ID: {config.adUnitId || 'Not Configured'}
                                                                    </span>
                                                                    <button onClick={() => handleUpdateAdUnit(config.id, config.adUnitId)} className="text-xs text-blue-600 hover:underline">
                                                                        Change ID
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {adStats?.byPlacement.find(p => p.placement === config.placement) && (
                                                                    <div className="text-right mr-4">
                                                                        <div className="text-sm font-bold text-green-600">${adStats.byPlacement.find(p => p.placement === config.placement)?.revenue.toFixed(2)}</div>
                                                                        <div className="text-xs text-gray-400">{adStats.byPlacement.find(p => p.placement === config.placement)?.impressions} imps</div>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`text-sm ${config.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                                                        {config.enabled ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleToggleAd(config.id, config.enabled)}
                                                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                                    >
                                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.enabled ? 'left-7' : 'left-1'}`} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {adConfigs.length === 0 && <p className="p-4 text-center text-gray-500">No ad placements configured.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Premium Tab */}
                            {activeNav === 'premium' && (
                                <motion.div key="premium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6 flex items-center justify-between">
                                        <div>
                                            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Premium Plans & Users</h1>
                                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage subscription plans and view premium members</p>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2">
                                            <SparkleIcon size={16} /> Create Plan
                                        </button>
                                    </header>

                                    <div className="space-y-8">
                                        {/* Plans Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {plans.map((plan) => (
                                                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><SettingsIcon size={18} /></button>
                                                    </div>
                                                    <div className="mb-4">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                                        <div className="flex items-baseline gap-1 mt-1">
                                                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${plan.price}</span>
                                                            <span className="text-sm text-gray-500">/{plan.interval}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 mb-6">
                                                        {plan.features.map((feature, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                                <CheckIcon size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                                <span>{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                                                        <span>ID: {plan.id.substring(0, 8)}...</span>
                                                        <span className={`px-2 py-1 rounded-full ${plan.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>
                                                            {plan.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {plans.length === 0 && (
                                                <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                                    <p className="text-gray-500">No plans created yet.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Premium Users Table */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                <h3 className="font-bold text-gray-900 dark:text-white">Recent Subscribers</h3>
                                                <div className="text-sm text-gray-500">
                                                    Total: <span className="font-medium text-gray-900 dark:text-white">{premiumUsers.length}</span>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium uppercase text-xs">
                                                        <tr>
                                                            <th className="px-6 py-3">User</th>
                                                            <th className="px-6 py-3">Plan</th>
                                                            <th className="px-6 py-3">Status</th>
                                                            <th className="px-6 py-3">Renewal Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {premiumUsers.map((user) => (
                                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                                <td className="px-6 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                            {user.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3">
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                                        {user.subscription?.plan?.name || 'Unknown Plan'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3">
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.subscription?.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                                                                        {user.subscription?.active ? 'Active' : 'Expired'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                                                                    {user.subscription ? new Date(user.subscription.endDate).toLocaleDateString() : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {premiumUsers.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                                    No premium subscribers yet.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Analytics Tab */}
                            {activeNav === 'analytics' && (
                                <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Analytics & Insights</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Platform growth, content performance, and user activity</p>
                                    </header>

                                    {analyticsLoading ? (
                                        <div className="space-y-6">
                                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Growth Chart (Line Chart) */}
                                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-6">User Growth (Last 30 Days)</h3>
                                                <div className="h-64 w-full relative group">
                                                    {analyticsGrowth.length > 0 ? (
                                                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                            {/* Grid lines */}
                                                            {[0, 25, 50, 75, 100].map(p => (
                                                                <line key={p} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="currentColor" strokeOpacity="0.1" className="text-gray-500" strokeDasharray="4 4" />
                                                            ))}

                                                            {/* Line Path */}
                                                            <polyline
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                className="text-blue-500"
                                                                points={analyticsGrowth.map((d, i) => {
                                                                    const x = (i / (analyticsGrowth.length - 1)) * 100;
                                                                    const max = Math.max(...analyticsGrowth.map(g => g.count), 1);
                                                                    const y = 100 - (d.count / max) * 100;
                                                                    return `${x},${y}`;
                                                                }).join(' ')}
                                                                vectorEffect="non-scaling-stroke"
                                                            />

                                                            {/* Data Points */}
                                                            {analyticsGrowth.map((d, i) => {
                                                                const x = (i / (analyticsGrowth.length - 1)) * 100;
                                                                const max = Math.max(...analyticsGrowth.map(g => g.count), 1);
                                                                const y = 100 - (d.count / max) * 100;
                                                                return (
                                                                    <g key={i} className="group/point">
                                                                        <circle cx={`${x}%`} cy={`${y}%`} r="4" className="fill-white stroke-blue-500 stroke-2" />
                                                                        <foreignObject x={`${x}%`} y={`${y}%`} width="100" height="50" className="overflow-visible -translate-x-1/2 -translate-y-full pointer-events-none">
                                                                            <div className="pb-2 flex justify-center opacity-0 group-hover/point:opacity-100 transition-opacity">
                                                                                <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                                                                                    {d.date}: {d.count} users
                                                                                </div>
                                                                            </div>
                                                                        </foreignObject>
                                                                    </g>
                                                                );
                                                            })}
                                                        </svg>
                                                    ) : <div className="flex items-center justify-center h-full text-gray-400">No growth data</div>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Top Content */}
                                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Downloads</h3>
                                                    <div className="space-y-4">
                                                        {analyticsContent?.topDownloads.map((res, i) => (
                                                            <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                                                        #{i + 1}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{res.title}</p>
                                                                        <p className="text-xs text-gray-500 truncate">{res.domain}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-shrink-0 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                    {res.downloadCount} <span className="text-xs font-normal text-gray-500 tracking-wide uppercase">dl</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {!analyticsContent?.topDownloads.length && <p className="text-center text-gray-400 py-4">No downloads yet.</p>}
                                                    </div>
                                                </div>

                                                {/* Activity (Bar Chart) */}
                                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
                                                    <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px]">
                                                        {analyticsActivity.map((day) => {
                                                            const max = Math.max(...analyticsActivity.map(a => a.active), 10); // min max of 10 for scale
                                                            const height = (day.active / max) * 100;
                                                            return (
                                                                <div key={day.day} className="flex-1 flex flex-col items-center group">
                                                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md relative h-full flex items-end overflow-hidden">
                                                                        <div
                                                                            className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-500 relative"
                                                                            style={{ height: `${height}%` }}
                                                                        >
                                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                                {day.active} active
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 mt-2 font-medium">{day.day}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}


                            {/* Audit Logs Tab */}
                            {activeNav === 'audit' && (
                                <motion.div key="audit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Audit Logs</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Track and monitor administrative actions</p>
                                    </header>

                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className="relative w-full md:w-64">
                                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search logs..."
                                                        value={auditSearch}
                                                        onChange={(e) => setAuditSearch(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2 text-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                                <select
                                                    value={auditActionFilter}
                                                    onChange={(e) => setAuditActionFilter(e.target.value)}
                                                    className="px-3 py-2 text-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="all">All Actions</option>
                                                    <option value="user_suspended">User Suspended</option>
                                                    <option value="resource_deleted">Resource Deleted</option>
                                                    <option value="setting_update">Setting Updated</option>
                                                    <option value="access_granted">Access Granted</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 uppercase font-medium z-10">
                                                    <tr>
                                                        <th className="px-6 py-3">Admin</th>
                                                        <th className="px-6 py-3">Action</th>
                                                        <th className="px-6 py-3">Target</th>
                                                        <th className="px-6 py-3">Details</th>
                                                        <th className="px-6 py-3">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {auditLogs.map((log) => (
                                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                                                                        {log.admin.name.charAt(0)}
                                                                    </div>
                                                                    {log.admin.name}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300">
                                                                    {log.action}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-gray-500 uppercase">{log.targetType}</span>
                                                                    <span className="font-mono text-xs truncate max-w-[100px]">{log.targetId || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-gray-500 max-w-xs truncate">
                                                                {JSON.stringify(log.details)}
                                                            </td>
                                                            <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                                                {new Date(log.createdAt).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {auditLogs.length === 0 && !auditLoading && (
                                                        <tr>
                                                            <td colSpan={5} className="py-12 text-center text-gray-500">
                                                                No audit logs found matching your criteria.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {auditLoading && (
                                                        [...Array(5)].map((_, i) => (
                                                            <tr key={i}>
                                                                <td colSpan={5} className="px-6 py-4">
                                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                                            <button
                                                disabled={auditPage === 1}
                                                onClick={() => setAuditPage(p => p - 1)}
                                                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-500">Page {auditPage}</span>
                                            <button
                                                disabled={auditLogs.length < 20}
                                                onClick={() => setAuditPage(p => p + 1)}
                                                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}



                            {/* Notifications Tab */}
                            {activeNav === 'notifications' && (
                                <motion.div key="notifications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Notifications & Announcements</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Broadcast messages to users</p>
                                    </header>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Create Announcement Form */}
                                        <div className="lg:col-span-1">
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm sticky top-6">
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <SparkleIcon size={18} className="text-blue-500" />
                                                    New Announcement
                                                </h3>
                                                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={newAnnouncement.title}
                                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            placeholder="Important Update"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                                        <textarea
                                                            required
                                                            rows={4}
                                                            value={newAnnouncement.message}
                                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            placeholder="We have updated our terms..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                                            <select
                                                                value={newAnnouncement.type}
                                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            >
                                                                <option value="info">Info</option>
                                                                <option value="warning">Warning</option>
                                                                <option value="update">Update</option>
                                                                <option value="promotion">Promotion</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                                                            <select
                                                                value={newAnnouncement.target}
                                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            >
                                                                <option value="all">All Users</option>
                                                                <option value="premium">Premium Only</option>
                                                                <option value="free_users">Free Only</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At (Optional)</label>
                                                        <input
                                                            type="date"
                                                            value={newAnnouncement.expiresAt}
                                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={isPostingAnnouncement}
                                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {isPostingAnnouncement ? 'Posting...' : 'Post Announcement'}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Active Announcements List */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-gray-900 dark:text-white">Active Announcements</h3>
                                                <button onClick={fetchAnnouncements} className="text-sm text-blue-500 hover:underline">Refresh</button>
                                            </div>

                                            {announcementsLoading ? (
                                                [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)
                                            ) : announcements.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                                                    No announcements found.
                                                </div>
                                            ) : (
                                                announcements.map((announcement) => (
                                                    <div key={announcement.id} className={`p-5 rounded-xl border ${!announcement.isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-800 border-gray-200' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'} transition-all`}>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                                                                ${announcement.type === 'info' ? 'bg-blue-100 text-blue-700' :
                                                                        announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                                            announcement.type === 'update' ? 'bg-green-100 text-green-700' :
                                                                                'bg-purple-100 text-purple-700'}`}>
                                                                    {announcement.type}
                                                                </span>
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    Target: <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{announcement.target.replace('_', ' ')}</span>
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleToggleAnnouncement(announcement.id, announcement.isActive)}
                                                                    className={`p-1.5 rounded-lg transition-colors ${announcement.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                                                                    title={announcement.isActive ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {announcement.isActive ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <TrashIcon size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{announcement.title}</h4>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{announcement.message}</p>
                                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                            <span>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                                                            {announcement.expiresAt && <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Support Tab */}
                            {activeNav === 'support' && (
                                <motion.div key="support" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6 flex justify-between items-center">
                                        <div>
                                            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Support & Help</h1>
                                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage user tickets and FAQs</p>
                                        </div>
                                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                            <button
                                                onClick={() => setSupportTab('tickets')}
                                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${supportTab === 'tickets' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                            >
                                                Tickets
                                            </button>
                                            <button
                                                onClick={() => setSupportTab('faqs')}
                                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${supportTab === 'faqs' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                            >
                                                FAQs
                                            </button>
                                        </div>
                                    </header>

                                    {supportTab === 'tickets' ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                                            {/* Ticket List */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col lg:col-span-1">
                                                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex gap-2">
                                                    <select
                                                        value={ticketFilter.status}
                                                        onChange={(e) => setTicketFilter(prev => ({ ...prev, status: e.target.value }))}
                                                        className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                    >
                                                        <option value="">All Status</option>
                                                        <option value="OPEN">Open</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="RESOLVED">Resolved</option>
                                                    </select>
                                                    <select
                                                        value={ticketFilter.priority}
                                                        onChange={(e) => setTicketFilter(prev => ({ ...prev, priority: e.target.value }))}
                                                        className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                    >
                                                        <option value="">All Priority</option>
                                                        <option value="LOW">Low</option>
                                                        <option value="HIGH">High</option>
                                                        <option value="URGENT">Urgent</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1 overflow-y-auto">
                                                    {ticketsLoading ? (
                                                        [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 m-3 rounded animate-pulse" />)
                                                    ) : tickets.length === 0 ? (
                                                        <div className="p-8 text-center text-gray-500 text-sm">No tickets found.</div>
                                                    ) : (
                                                        tickets.map(ticket => (
                                                            <div
                                                                key={ticket.id}
                                                                onClick={() => { setSelectedTicket(ticket); }}
                                                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-700' : ticket.status === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                        {ticket.status}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{ticket.subject}</h4>
                                                                <p className="text-xs text-gray-500 truncate mb-2">{ticket.message}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px]">{ticket.user.name.charAt(0)}</div>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{ticket.user.email}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ticket Detail */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col lg:col-span-2 overflow-hidden">
                                                {selectedTicket ? (
                                                    <>
                                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 dark:text-white">{selectedTicket.subject}</h3>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                                    <span>Ticket #{selectedTicket.id.slice(-6)}</span>
                                                                    <span>•</span>
                                                                    <span>{selectedTicket.user.name}</span>
                                                                    <span>•</span>
                                                                    <span className={`uppercase font-bold ${selectedTicket.priority === 'URGENT' ? 'text-red-500' : 'text-blue-500'}`}>{selectedTicket.priority} Priority</span>
                                                                </div>
                                                            </div>
                                                            <select
                                                                value={selectedTicket.status}
                                                                onChange={(e) => handleUpdateTicketStatus(e.target.value)}
                                                                className="text-xs p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                            >
                                                                <option value="OPEN">Open</option>
                                                                <option value="IN_PROGRESS">In Progress</option>
                                                                <option value="RESOLVED">Resolved</option>
                                                                <option value="CLOSED">Closed</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                                            {/* Initial Message */}
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold">
                                                                    {selectedTicket.user.name.charAt(0)}
                                                                </div>
                                                                <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                                                                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedTicket.message}</p>
                                                                </div>
                                                            </div>

                                                            {/* Thread */}
                                                            {selectedTicket.messages?.map((msg) => (
                                                                <div key={msg.id} className={`flex gap-3 ${msg.sender?.role === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                                                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${msg.sender?.role === 'ADMIN' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                                                        {msg.sender?.name.charAt(0) || 'A'}
                                                                    </div>
                                                                    <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender?.role === 'ADMIN' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                                                        <p className="text-sm">{msg.message}</p>
                                                                        <span className="text-[10px] opacity-60 block mt-1">{new Date(msg.createdAt).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <form onSubmit={handleTicketReply} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={ticketReply}
                                                                    onChange={(e) => setTicketReply(e.target.value)}
                                                                    placeholder="Type your reply..."
                                                                    className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={isSendingReply || !ticketReply.trim()}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                                                                >
                                                                    Reply
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </>
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                                                        <UserIcon size={48} className="mb-4 opacity-20" />
                                                        <p>Select a ticket to view conversation</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Create FAQ */}
                                            <div className="lg:col-span-1">
                                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm sticky top-6">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Add FAQ</h3>
                                                    <form onSubmit={handleCreateFAQ} className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={newFAQ.question}
                                                                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Answer</label>
                                                            <textarea
                                                                required
                                                                rows={3}
                                                                value={newFAQ.answer}
                                                                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                                            <select
                                                                value={newFAQ.category}
                                                                onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            >
                                                                <option value="general">General</option>
                                                                <option value="account">Account</option>
                                                                <option value="billing">Billing</option>
                                                                <option value="technical">Technical</option>
                                                            </select>
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={isCreatingFAQ}
                                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                                        >
                                                            Add FAQ
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>

                                            {/* FAQ List */}
                                            <div className="lg:col-span-2 space-y-4">
                                                {faqsLoading ? (
                                                    [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)
                                                ) : faqs.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">No FAQs found.</div>
                                                ) : (
                                                    faqs.map((faq) => (
                                                        <div key={faq.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                                                            <button
                                                                onClick={() => handleDeleteFAQ(faq.id)}
                                                                className="absolute top-4 right-4 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <TrashIcon size={16} />
                                                            </button>
                                                            <div className="pr-8">
                                                                <span className="text-xs uppercase font-bold text-gray-400 mb-1 block">{faq.category}</span>
                                                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Settings Tab */}
                            {activeNav === 'settings' && (
                                <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                    <header className="mb-6">
                                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Configure system settings and thresholds</p>
                                    </header>

                                    {settingsLoading ? (
                                        <div className="space-y-4">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Group settings by category */}
                                            {['moderation', 'ai', 'upload', 'display'].map((category) => {
                                                const categorySettings = settings.filter(s => s.category === category);
                                                if (categorySettings.length === 0) return null;
                                                return (
                                                    <div key={category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                                            <h2 className="font-display text-base font-bold text-gray-900 dark:text-white capitalize">{category} Settings</h2>
                                                        </div>
                                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {categorySettings.map((setting) => (
                                                                <div key={setting.key} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                    <div className="flex-1">
                                                                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                                                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Type: {setting.type}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {editingSetting === setting.key ? (
                                                                            <>
                                                                                <input
                                                                                    type={setting.type === 'number' ? 'number' : 'text'}
                                                                                    value={settingValue}
                                                                                    onChange={(e) => setSettingValue(e.target.value)}
                                                                                    className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleSaveSetting(setting.key, settingValue)}
                                                                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                                                >
                                                                                    Save
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingSetting(null)}
                                                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="px-3 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded">
                                                                                    {setting.value}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => { setEditingSetting(setting.key); setSettingValue(setting.value); }}
                                                                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {settings.length === 0 && (
                                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                                                    <SettingsIcon size={32} className="mx-auto mb-2 text-gray-400" />
                                                    <p className="text-gray-500 dark:text-gray-400">No settings configured yet.</p>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await adminService.initializeSettings();
                                                                toast.success('Default settings initialized');
                                                                fetchSettings();
                                                            } catch (error) {
                                                                toast.error('Failed to initialize settings');
                                                            }
                                                        }}
                                                        className="mt-4 px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90"
                                                    >
                                                        Initialize Default Settings
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* User Detail Modal */}
                            {selectedUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                    >
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Details</h2>
                                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                                <CloseIcon size={20} />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            {userDetailsLoading ? (
                                                <div className="space-y-4 animate-pulse">
                                                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* Profile Header */}
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl font-bold">
                                                            {selectedUser.name?.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                                                            <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${selectedUser.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                    {selectedUser.isActive ? 'Active' : 'Blocked'}
                                                                </span>
                                                                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{selectedUser.role}</span>
                                                                {selectedUser.subscription?.active && (
                                                                    <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full">
                                                                        {selectedUser.subscription.plan.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-xs text-gray-500">
                                                            <div>Joined: {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Daily Credits</div>
                                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.dailyCredits}</div>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Upload Credits</div>
                                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.uploadCredits}</div>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Uploads</div>
                                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.uploads?.length || 0}</div>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Downloads</div>
                                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.downloads?.length || 0}</div>
                                                        </div>
                                                    </div>

                                                    {/* Recent Activity */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Recent Uploads</h4>
                                                            {selectedUser.uploads && selectedUser.uploads.length > 0 ? (
                                                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 max-h-40 overflow-y-auto space-y-2">
                                                                    {selectedUser.uploads.slice(0, 5).map((upload: any) => (
                                                                        <div key={upload.id} className="flex justify-between text-xs">
                                                                            <span className="truncate flex-1 text-gray-700 dark:text-gray-300">{upload.title}</span>
                                                                            <span className="text-gray-500">{formatDate(upload.createdAt)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-500 italic">No uploads yet.</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">AI Usage</h4>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <SparkleIcon size={16} className="text-purple-500" />
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                                    {selectedUser.aiUsage || 0} requests made
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                                            <button
                                                onClick={closeModal}
                                                className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
