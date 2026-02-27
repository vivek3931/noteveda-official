/**
 * NoteVeda PDF Plugin Types
 * 
 * Simple, stable, well-documented plugin interface.
 * 
 * Plugins can:
 * - Hook into page render lifecycle
 * - React to text selection (for AI features)
 * - Add toolbar items
 * - Handle scroll events
 */

import { ReactNode } from 'react';

/**
 * Plugin lifecycle events
 */
export interface PluginEvents {
    /**
     * Called when a page finishes rendering
     */
    onPageRender?(pageNumber: number): void;

    /**
     * Called when user selects text in the PDF
     * Useful for AI explain, highlight, note features
     */
    onTextSelect?(text: string, rect: DOMRect, pageNumber: number): void;

    /**
     * Called on scroll (debounced)
     */
    onScroll?(scrollTop: number, currentPage: number): void;

    /**
     * Called when PDF document loads
     */
    onDocumentLoad?(totalPages: number, url: string): void;

    /**
     * Called when PDF document unloads
     */
    onDocumentUnload?(): void;
}

/**
 * Plugin definition
 * Keep this interface small and stable for contributor friendliness
 */
export interface NoteVedaPDFPlugin extends PluginEvents {
    /**
     * Unique plugin identifier
     */
    id: string;

    /**
     * Human-readable name
     */
    name: string;

    /**
     * Plugin version
     */
    version?: string;

    /**
     * Optional toolbar item to render
     * Should be a React element (button, dropdown, etc.)
     */
    toolbarItem?: ReactNode;

    /**
     * Called when plugin is activated
     */
    onActivate?(): void;

    /**
     * Called when plugin is deactivated
     */
    onDeactivate?(): void;
}

/**
 * Plugin registration options
 */
export interface PluginRegistrationOptions {
    /**
     * Priority for event handling (higher = first)
     * Default: 0
     */
    priority?: number;

    /**
     * Whether plugin is enabled by default
     * Default: true
     */
    enabled?: boolean;
}

/**
 * Example plugin for AI text explanation (design only)
 * 
 * Usage:
 * ```typescript
 * const aiExplainPlugin: NoteVedaPDFPlugin = {
 *   id: 'ai-explain',
 *   name: 'AI Explain',
 *   onTextSelect: (text, rect, page) => {
 *     // Show AI explanation popup at rect position
 *   },
 *   toolbarItem: <AIToolbarButton />,
 * };
 * ```
 */

/**
 * Example plugin for bookmarks (design only)
 * 
 * Usage:
 * ```typescript
 * const bookmarksPlugin: NoteVedaPDFPlugin = {
 *   id: 'bookmarks',
 *   name: 'Bookmarks',
 *   onDocumentLoad: (totalPages) => {
 *     // Load saved bookmarks for this document
 *   },
 *   toolbarItem: <BookmarksButton />,
 * };
 * ```
 */
