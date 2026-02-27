'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import { resourcesService, creditsService } from '@/lib';
import { Resource } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { CreditsModal } from '@/components/ui/CreditsModal';
import { useFeedback } from '@/components/ui/FeedbackModal';
import { DocumentIcon } from '@/components/icons';
import { useSaved } from '@/contexts/SavedContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

// New Redesigned Workspace Layout
import { ResourceWorkspace } from '@/components/resource/ResourceWorkspace';

import { PDFPageSkeleton } from '@/components/ui/Skeleton';

// Dynamically import PDF viewer
const PDFViewer = dynamic(() => import('./PDFViewer'), {
    ssr: false,
    loading: () => (
        <div className="flex-1 relative pt-4 md:pt-8 px-2 md:px-4">
            <PDFPageSkeleton />
        </div>
    ),
});

// ============ MAIN PAGE COMPONENT ============
export default function ResourcePage() {
    const params = useParams();
    const resourceId = params.id as string;
    const toast = useToast();
    const feedback = useFeedback();
    const { savedResourceIds, saveResource, unsaveResource } = useSaved();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Strict Auth Check - Redirect to login if unauthenticated
    useEffect(() => {
        if (!authLoading && !user) {
            // Save current path for redirect after login
            const currentPath = window.location.pathname;
            router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }
    }, [user, authLoading, router]);



    // UI State
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);

    // PDF State
    const [numPages, setNumPages] = useState<number>(0);

    // Fetch resource
    const { data: resource, isLoading: resourceLoading, error: resourceError } = useQuery({
        queryKey: ['resource', resourceId],
        queryFn: () => resourcesService.getResource(resourceId),
        staleTime: 5 * 60 * 1000,
        enabled: !!resourceId,
    });

    // Fetch user credits
    const { data: creditsData } = useQuery({
        queryKey: ['userCredits', user?.id],
        queryFn: () => creditsService.getCredits().catch(() => ({
            dailyCredits: 0, uploadCredits: 0, totalCredits: 0, isPro: false
        })),
        staleTime: 2 * 60 * 1000,
        enabled: !!user, // Only fetch if authenticated
    });

    const userCredits = creditsData ? creditsData.dailyCredits + creditsData.uploadCredits : 0;
    const isSaved = resource ? savedResourceIds.has(resource.id) : false;

    // Fetch related resources
    const { data: relatedResources = [] } = useQuery({
        queryKey: ['relatedResources', resource?.subject, resourceId],
        queryFn: async () => {
            if (!resource?.subject) return [];
            const result = await resourcesService.getResources({ subject: resource.subject, limit: 4 });
            return result.items?.filter((r: Resource) => r.id !== resourceId).slice(0, 3) || [];
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!resource?.subject,
    });

    // ============ ACTIONS ============

    const handlePDFLoadSuccess = useCallback((pages: number) => {
        setNumPages(pages);
    }, []);

    const handleDownload = async () => {
        if (!resource) return;
        if (userCredits < 1) {
            setShowCreditsModal(true);
            return;
        }
        setIsDownloading(true);
        try {
            const result = await creditsService.downloadResource(resource.id);
            if (result.success) {
                setDownloadSuccess(true);
                toast.success('Download started!');
                if (result.fileUrl) window.open(result.fileUrl, '_blank');
                const downloadCount = parseInt(localStorage.getItem('noteveda_download_count') || '0', 10) + 1;
                localStorage.setItem('noteveda_download_count', downloadCount.toString());
                if (downloadCount % 3 === 0 && !feedback.hasSubmittedFeedback) {
                    setTimeout(() => feedback.showFeedbackModal(), 1500);
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Download failed';
            if (errorMessage.toLowerCase().includes('credit')) {
                setShowCreditsModal(true);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSave = useCallback(() => {
        if (resource) {
            if (isSaved) {
                unsaveResource(resource.id);
                toast.success('Removed from saved');
            } else {
                saveResource(resource);
                toast.success('Saved to library');
            }
        }
    }, [resource, isSaved, saveResource, unsaveResource, toast]);

    const handleShare = useCallback(async () => {
        if (navigator.share && resource) {
            try {
                await navigator.share({ title: resource.title, url: window.location.href });
            } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
        }
    }, [resource, toast]);

    // Strict Auth Check - Prevent rendering content
    if (!authLoading && !user) {
        return null; // Or a nice redirect message component
    }

    // ============ RENDER ============
    // Handle error state
    if (resourceError && !resourceLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
                <div className="text-center">
                    <DocumentIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Resource not found</p>
                    <Link href="/browse" className="mt-4 inline-block text-violet-600 hover:underline">
                        Browse Resources
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <ResourceWorkspace
                resource={resource}
                isLoading={resourceLoading}
                numPages={numPages}
                isSaved={isSaved}
                onSave={handleSave}
                onShare={handleShare}
                onDownload={handleDownload}
                isDownloading={isDownloading}
                downloadSuccess={downloadSuccess}
                userCredits={userCredits}
                relatedResources={relatedResources}
            >
                {/* PDF Viewer - only render when we have resource data */}
                {resource && (
                    <PDFViewer
                        fileUrl={resource.fileUrl}
                        showToolbar={true}
                        onLoadSuccess={handlePDFLoadSuccess}
                    />
                )}
            </ResourceWorkspace>

            <CreditsModal
                isOpen={showCreditsModal}
                onClose={() => setShowCreditsModal(false)}
                currentCredits={userCredits}
                requiredCredits={1}
            />
        </>
    );
}
