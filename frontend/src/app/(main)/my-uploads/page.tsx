'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResourceCard } from '@/components/features';
import { resourcesService } from '@/lib';
import { UploadIcon, GridIcon, ChevronRightIcon, TrashIcon, ArrowLeftIcon } from '@/components/icons';
import SwiperResourceCarousel from '@/components/SwiperResourceCarousel';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Resource } from '@/types';

export default function MyUploadsPage() {
    return (
        <ProtectedRoute>
            <MyUploadsContent />
        </ProtectedRoute>
    );
}

function MyUploadsContent() {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

    // Fetch uploads
    const { data: userUploads = [], isLoading } = useQuery({
        queryKey: ['userUploads'],
        queryFn: () => resourcesService.getUserUploads(),
        staleTime: 2 * 60 * 1000,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (resourceId: string) => resourcesService.deleteResource(resourceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userUploads'] });
            addToast('Resource deleted successfully', 'success');
            setDeleteModalOpen(false);
            setResourceToDelete(null);
        },
        onError: (error: Error) => {
            addToast(error.message || 'Failed to delete resource', 'error');
        },
    });

    const handleDeleteClick = (resource: Resource) => {
        setResourceToDelete(resource);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (resourceToDelete) {
            deleteMutation.mutate(resourceToDelete.id);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 transition-colors">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
                <div className="flex items-center gap-4 mb-2">
                    <Link
                        href="/profile"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeftIcon size={20} />
                    </Link>
                    <div>
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            My Uploads
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {userUploads.length} {userUploads.length === 1 ? 'resource' : 'resources'} uploaded
                        </p>
                    </div>
                </div>
            </div>

            {/* Content - Full Width */}
            {isLoading ? (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-64 skeleton rounded-xl" />
                        ))}
                    </div>
                </div>
            ) : userUploads.length > 0 ? (
                <div className="max-w-7xl mx-auto px-6">
                    <SwiperResourceCarousel
                        resources={userUploads}
                        onDelete={handleDeleteClick}
                    />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                        <GridIcon size={64} className="text-gray-300 dark:text-gray-600 mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No uploads yet
                        </h3>
                        <p className="mb-8 max-w-sm">
                            Share your study materials with the community and earn credits when others download them!
                        </p>
                        <Link href="/upload" className="btn btn-primary inline-flex items-center gap-2">
                            <UploadIcon size={18} />
                            Upload Your First Resource
                        </Link>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Resource"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{resourceToDelete?.title}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <TrashIcon size={16} />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </main>
    );
}
