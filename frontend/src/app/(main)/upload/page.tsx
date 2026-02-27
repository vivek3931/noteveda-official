'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckIcon } from '@/components/icons';
import { resourcesService } from '@/lib';
import { useToast } from '@/components/ui/Toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UploadForm } from '@/components/upload/UploadWizard';
import { ResourceFormData } from '@/lib/validators/resource-validator';

export default function UploadPage() {
    return (
        <ProtectedRoute>
            <UploadPageContent />
        </ProtectedRoute>
    );
}

function UploadPageContent() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    /**
     * Handle form submission
     * Data is already validated by Zod - strictly typed
     */
    const handleUpload = async (data: ResourceFormData, file: File) => {
        setIsUploading(true);
        setError(null);

        try {
            // Generate file hash
            const fileHash = `${file.name}-${file.size}-${Date.now()}`;



            // Upload file to Cloudinary
            const uploadResult = await resourcesService.uploadFile(file);
            const fileUrl = uploadResult.url;
            const fileType = uploadResult.format ? uploadResult.format.toUpperCase() : file.type === 'application/pdf' ? 'PDF' : 'DOCX';

            // Generate thumbnail URL from Cloudinary PDF
            // Cloudinary can generate page thumbnails from PDFs using URL transformations
            const thumbnailUrl = generateThumbnailUrl(fileUrl, uploadResult.publicId, fileType);

            // Build strictly typed payload
            const payload = {
                title: data.title,
                description: data.description,
                fileUrl,
                fileHash,
                fileSize: file.size,
                fileType,
                thumbnailUrl, // Include the generated thumbnail
                category: data.category,
                metadata: {
                    ...data.metadata,
                    cloudinaryPublicId: uploadResult.publicId, // Store publicId for better management
                },
                tags: data.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
                // Map to legacy schema fields for backward compatibility
                domain: mapCategoryToDomain(data.category),
                subDomain: extractSubDomain(data),
                subject: extractSubject(data),
                resourceType: extractResourceType(data),
            };

            await resourcesService.createResource(payload);

            setUploadSuccess(true);
            addToast('File uploaded & resource created! It will be reviewed shortly.', 'success');
        } catch (err) {
            console.error('Upload failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please check your connection.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // Success state
    if (uploadSuccess) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 transition-colors">
                <div className="max-w-md mx-auto py-20 px-6 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-600 text-white rounded-full"
                    >
                        <CheckIcon size={48} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            Upload Successful!
                        </h1>
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Your resource has been submitted for review. You&apos;ll earn credits once it&apos;s approved.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setUploadSuccess(false)}
                                className="btn btn-primary"
                            >
                                Upload Another
                            </button>
                            <Link href="/browse" className="btn btn-secondary">
                                Browse Resources
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 transition-colors">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="py-10 text-center">
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                        Upload Resource
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Share your study materials and earn credits when approved
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Upload Form */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 lg:p-8">
                    <UploadForm onSubmit={handleUpload} isSubmitting={isUploading} />
                </div>

                {/* Guidelines */}
                <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        Upload Guidelines
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                        {[
                            'Ensure content is accurate and well-organized',
                            'Original work or properly attributed sources only',
                            'No copyrighted material without permission',
                            'Resources are reviewed before approval',
                            'You earn 1 credit for each approved upload',
                            'High-quality resources get featured!',
                        ].map((item, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-green-500 flex-shrink-0">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
}

// ============ HELPER FUNCTIONS ============

/** Map category to legacy domain field */
function mapCategoryToDomain(category: string): string {
    const mapping: Record<string, string> = {
        ACADEMIC: 'Academic',
        ENTRANCE: 'Entrance Exams',
        SKILL: 'Skills & Career',
        GENERAL: 'General',
    };
    return mapping[category] || 'General';
}

/** Extract subDomain from metadata */
function extractSubDomain(data: ResourceFormData): string {
    switch (data.category) {
        case 'ACADEMIC':
            return data.metadata.course || '';
        case 'ENTRANCE':
            return data.metadata.exam || '';
        case 'SKILL':
            return data.metadata.topic || '';
        case 'GENERAL':
        default:
            return data.metadata.topic || 'General';
    }
}

/** Extract subject from metadata */
function extractSubject(data: ResourceFormData): string {
    switch (data.category) {
        case 'ACADEMIC':
            return data.metadata.subject || '';
        case 'ENTRANCE':
            return data.metadata.branch || data.metadata.exam || '';
        case 'SKILL':
            return data.metadata.topic || '';
        case 'GENERAL':
        default:
            return data.metadata.topic || 'General';
    }
}

/** Map metadata to legacy resourceType */
function extractResourceType(data: ResourceFormData): string {
    switch (data.category) {
        case 'ACADEMIC': {
            const docType = data.metadata.docType || '';
            if (docType.includes('Notes') || docType.includes('Textbook')) return 'NOTES';
            if (docType.includes('Paper') || docType.includes('Question')) return 'PYQ';
            if (docType.includes('Solution')) return 'SOLUTION';
            return 'GUIDE';
        }
        case 'ENTRANCE': {
            const paperType = data.metadata.paperType || '';
            if (paperType.includes('PYQ')) return 'PYQ';
            if (paperType.includes('Solution')) return 'SOLUTION';
            if (paperType.includes('Notes') || paperType.includes('Material')) return 'NOTES';
            return 'GUIDE';
        }
        case 'SKILL': {
            const format = data.metadata.format || '';
            if (format.includes('Cheatsheet') || format.includes('Notes')) return 'NOTES';
            return 'GUIDE';
        }
        case 'GENERAL':
        default:
            return 'NOTES';
    }
}

/**
 * Generate a thumbnail URL from a Cloudinary PDF/document URL
 * Uses Cloudinary's transformation API to get the first page as an image
 */
function generateThumbnailUrl(fileUrl: string, publicId: string, fileType: string): string {
    try {
        // For PDFs, Cloudinary can generate a thumbnail of the first page
        if (fileType === 'PDF' && fileUrl.includes('cloudinary.com')) {
            // Transform the URL to get a PNG thumbnail of page 1
            // Format: https://res.cloudinary.com/{cloud}/image/upload/pg_1,w_400,h_560,c_fill,f_auto,q_auto/{publicId}.png
            const cloudinaryPattern = /(https:\/\/res\.cloudinary\.com\/[^/]+)/;
            const match = fileUrl.match(cloudinaryPattern);

            if (match) {
                const baseUrl = match[1];
                // Use Cloudinary transformations:
                // pg_1 = first page
                // w_400,h_560 = dimensions (aspect ratio ~0.71 for A4)
                // c_fill = fill the dimensions
                // f_auto = auto format (webp if supported)
                // q_auto = auto quality
                return `${baseUrl}/image/upload/pg_1,w_400,h_560,c_fill,f_auto,q_auto/${publicId}.png`;
            }
        }

        // For other file types or if transformation fails, return undefined (will use fallback)
        return '';
    } catch {
        console.warn('Failed to generate thumbnail URL');
        return '';
    }
}
