/**
 * PDF Search Module
 * 
 * Full-text search across PDF document.
 * Critical for academic use - students need to find content quickly.
 * 
 * Features:
 * - Search across all pages
 * - Highlight matching results
 * - Navigate between matches
 */

import { PDFEngine } from './PDFEngine';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

export interface SearchResult {
    page: number;
    index: number;
    text: string;
    context: string;
    // For highlighting and navigation
    transform?: number[]; // [scaleX, skewY, skewX, scaleY, tx, ty]
    width?: number;
    height?: number;
    yRatio?: number; // Normalized Y position from top (0 to 1)
}

/**
 * Search for text across all pages
 * Returns matches with page numbers, context, and coordinates
 */
/**
 * Search for text across all pages
 * Returns matches with page numbers, context, and coordinates
 * 
 * IMPROVED: Concatenates text items to find multi-word matches across item boundaries.
 */
export async function searchPDF(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const totalPages = PDFEngine.getTotalPages();
    if (totalPages === 0) return [];

    const results: SearchResult[] = [];
    const normalizedQuery = query.toLowerCase();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const textContent = await PDFEngine.getTextContent(pageNum);
        if (!textContent) continue;

        // Get page info for coordinates
        const page = await PDFEngine.getPage(pageNum);
        if (!page) continue;
        const [, , , pdfHeight] = page.view;

        const textItems = textContent.items as TextItem[];

        // 1. Join all items into one string (keeping track of mapping)
        const fullPageText = textItems
            .map(item => 'str' in item ? item.str : '')
            .join(' '); // Join with space to ensure word separation

        const normalizedPageText = fullPageText.toLowerCase();

        // 2. Find matches in the full text
        let searchIndex = 0;
        while ((searchIndex = normalizedPageText.indexOf(normalizedQuery, searchIndex)) !== -1) {

            // 3. Map back to specific item for coordinates
            // We need to find which item corresponds to 'searchIndex'
            let currentLength = 0;
            let matchedItem: TextItem | null = null;
            let matchContext = "";

            for (const item of textItems) {
                if (!('str' in item)) continue;

                const strLen = item.str.length;
                // +1 for the joined space
                if (currentLength + strLen + 1 > searchIndex) {
                    matchedItem = item;
                    matchContext = item.str;
                    break;
                }
                currentLength += strLen + 1;
            }

            if (matchedItem) {
                // Calculate normalized Y ratio (0 = top, 1 = bottom)
                const yFromBottom = matchedItem.transform[5];
                const yRatio = 1 - (yFromBottom / pdfHeight);

                results.push({
                    page: pageNum,
                    index: results.length,
                    text: query, // Use query text as display
                    context: matchContext, // Rough context
                    transform: matchedItem.transform,
                    width: matchedItem.width,
                    height: matchedItem.height,
                    yRatio: Math.max(0, Math.min(1, yRatio)) // clamp 0-1
                });
            }

            searchIndex += normalizedQuery.length;
        }
    }

    return results;
}

/**
 * Get search match count per page (for search bar preview)
 */
export async function getSearchCountByPage(query: string): Promise<Map<number, number>> {
    if (!query || query.length < 2) return new Map();

    const totalPages = PDFEngine.getTotalPages();
    const counts = new Map<number, number>();
    const normalizedQuery = query.toLowerCase();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const textContent = await PDFEngine.getTextContent(pageNum);
        if (!textContent) continue;

        const textItems = textContent.items as TextItem[];
        const pageText = textItems
            .filter((item): item is TextItem => 'str' in item)
            .map((item) => item.str)
            .join(' ')
            .toLowerCase();

        // Count occurrences
        let count = 0;
        let pos = 0;
        while ((pos = pageText.indexOf(normalizedQuery, pos)) !== -1) {
            count++;
            pos += normalizedQuery.length;
        }

        if (count > 0) {
            counts.set(pageNum, count);
        }
    }

    return counts;
}
