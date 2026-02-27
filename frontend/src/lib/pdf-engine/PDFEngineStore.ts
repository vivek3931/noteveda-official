/**
 * NoteVeda PDF Engine Store
 * 
 * Zustand store for PDF viewer state management.
 * This is the SINGLE SOURCE OF TRUTH for all PDF state.
 * 
 * TWO-LAYER SCALING MODEL:
 * - baseScale: Auto-fit scale (containerWidth / pdfWidth), set on load/resize
 * - userScale: User zoom multiplier (1.0 = 100%, 1.25 = 125%, etc.)
 * - renderScale = baseScale × userScale (computed, not stored)
 * 
 * State persists across:
 * - Component remounts
 * - Fullscreen toggles
 * - Route changes (if provider is at app level)
 * 
 * State resets only when:
 * - A new PDF document is loaded
 * - Explicit reset is called
 */

import { create } from 'zustand';

export type ScrollMode = 'continuous' | 'page';

// Highlight and Note types
// Coordinates stored as percentages (0-100) of page dimensions for zoom independence
export interface HighlightRect {
    xPercent: number;      // % from left edge (0-100)
    yPercent: number;      // % from top edge (0-100)
    widthPercent: number;  // % of page width
    heightPercent: number; // % of page height
}

export interface Highlight {
    id: string;
    pageNumber: number;
    text: string;
    rects: HighlightRect[];
    color: string;
    hasNote: boolean;
    createdAt: Date;
}

export interface Note {
    id: string;
    highlightId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

// Temporary pixel-based rect for UI positioning (menus, popovers)
export interface PixelRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Resource actions (set by ResourceWorkspace, used by toolbar)
export interface ResourceActions {
    onInfo: () => void;
    onAI: () => void;
    onAskAI?: (prompt: string) => void;
}

export interface SelectionInfo {
    text: string;
    rect: DOMRect;
    pageNumber: number;
    rects?: PixelRect[];  // Absolute pixels for UI positioning
}

export interface PDFEngineState {
    // Document info
    currentUrl: string | null;
    totalPages: number;
    isLoading: boolean;
    error: string | null;

    // View state (persisted across fullscreen/remount)
    currentPage: number;
    baseScale: number;   // Auto-fit scale (containerWidth / pdfWidth) - NEVER modified by zoom
    userScale: number;   // User zoom multiplier (starts at 1.0) - ONLY modified by zoom controls
    rotation: number;    // 0, 90, 180, 270
    scrollTop: number;
    scrollMode: ScrollMode;
    isFullscreen: boolean;

    // Search state
    searchQuery: string;
    searchResults: Array<{ page: number; index: number; transform?: number[] }>;
    currentSearchIndex: number;

    // UI state
    isToolbarVisible: boolean;
    isMobileView: boolean;

    // Resource actions (set by ResourceWorkspace, used by toolbar)
    resourceActions: ResourceActions | null;

    // Selection, Highlights & Notes
    selection: SelectionInfo | null;
    highlights: Highlight[];
    notes: Note[];

    // Computed (getter)
    getRenderScale: () => number;

    // Actions
    setCurrentUrl: (url: string | null) => void;
    setTotalPages: (pages: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    setCurrentPage: (page: number) => void;
    setBaseScale: (baseScale: number) => void;  // Called on load/resize only
    setUserScale: (userScale: number) => void;  // Direct set (e.g., from dropdown)
    zoomIn: () => void;
    zoomOut: () => void;
    resetUserScale: () => void;  // Reset to 1.0 (100%)
    setRotation: (rotation: number) => void;
    rotate: () => void;
    setScrollTop: (top: number) => void;
    setScrollMode: (mode: ScrollMode) => void;
    toggleFullscreen: () => void;
    setFullscreen: (isFullscreen: boolean) => void;

    setSearchQuery: (query: string) => void;
    setSearchResults: (results: Array<{ page: number; index: number; transform?: number[] }>) => void;
    nextSearchResult: () => void;
    prevSearchResult: () => void;
    clearSearch: () => void;

    setToolbarVisible: (visible: boolean) => void;
    setMobileView: (isMobile: boolean) => void;
    setResourceActions: (actions: ResourceActions | null) => void;

    // Selection & Annotation actions
    setSelection: (selection: SelectionInfo | null) => void;
    clearSelection: () => void;
    addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => string;
    removeHighlight: (id: string) => void;
    updateHighlight: (id: string, updates: Partial<Highlight>) => void;
    addNote: (highlightId: string, content: string) => string;
    updateNote: (id: string, content: string) => void;
    removeNote: (id: string) => void;
    getHighlightsForPage: (pageNumber: number) => Highlight[];
    getNoteForHighlight: (highlightId: string) => Note | undefined;

    // Document lifecycle
    onDocumentLoad: (url: string, totalPages: number) => void;
    reset: () => void;
}

const INITIAL_STATE = {
    currentUrl: null as string | null,
    totalPages: 0,
    isLoading: false,
    error: null as string | null,

    currentPage: 1,
    baseScale: 1,    // Will be calculated on container mount
    userScale: 1,    // 1.0 = 100% zoom
    rotation: 0,
    scrollTop: 0,
    scrollMode: 'continuous' as ScrollMode,
    isFullscreen: false,

    searchQuery: '',
    searchResults: [] as Array<{ page: number; index: number }>,
    currentSearchIndex: 0,

    isToolbarVisible: true,
    isMobileView: false,
    resourceActions: null,

    // Selection & Annotations
    selection: null as SelectionInfo | null,
    highlights: [] as Highlight[],
    notes: [] as Note[],
};

// User zoom limits (applied to userScale only, NOT baseScale)
const MIN_USER_SCALE = 0.5;   // 50%
const MAX_USER_SCALE = 3.0;   // 300%
const ZOOM_STEP = 0.15;

export const usePDFEngineStore = create<PDFEngineState>((set, get) => ({
    ...INITIAL_STATE,

    // Computed getter: renderScale = baseScale × userScale
    getRenderScale: () => get().baseScale * get().userScale,

    // Document setters
    setCurrentUrl: (url) => set({ currentUrl: url }),
    setTotalPages: (pages) => set({ totalPages: pages }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // View state setters
    setCurrentPage: (page) => {
        const { totalPages } = get();
        if (page >= 1 && page <= totalPages) {
            set({ currentPage: page });
        }
    },

    // Two-layer scaling: baseScale (auto-fit) is set separately from userScale (zoom)
    setBaseScale: (baseScale: number) => {
        // Called on container resize / PDF load - does NOT touch userScale
        set({ baseScale });
    },

    setUserScale: (userScale: number) => {
        // Direct set from dropdown or other controls
        const clampedScale = Math.max(MIN_USER_SCALE, Math.min(MAX_USER_SCALE, userScale));
        set({ userScale: clampedScale });
    },

    zoomIn: () => {
        // ONLY modifies userScale, NEVER touches baseScale
        const { userScale } = get();
        const newScale = Math.min(MAX_USER_SCALE, userScale + ZOOM_STEP);
        set({ userScale: newScale });
    },

    zoomOut: () => {
        // ONLY modifies userScale, NEVER touches baseScale
        const { userScale } = get();
        const newScale = Math.max(MIN_USER_SCALE, userScale - ZOOM_STEP);
        set({ userScale: newScale });
    },

    resetUserScale: () => {
        // Reset userScale to 1.0 (100%) - returns to "fit width" appearance
        set({ userScale: 1.0 });
    },

    setRotation: (rotation) => {
        // Normalize to 0, 90, 180, 270
        const normalized = ((rotation % 360) + 360) % 360;
        set({ rotation: normalized });
    },

    rotate: () => {
        const { rotation } = get();
        set({ rotation: (rotation + 90) % 360 });
    },

    setScrollTop: (top) => set({ scrollTop: top }),
    setScrollMode: (mode) => set({ scrollMode: mode }),

    toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
    setFullscreen: (isFullscreen) => set({ isFullscreen }),

    // Search
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSearchResults: (results) => set({ searchResults: results, currentSearchIndex: 0 }),

    nextSearchResult: () => {
        const { searchResults, currentSearchIndex } = get();
        if (searchResults.length > 0) {
            const nextIndex = (currentSearchIndex + 1) % searchResults.length;
            set({
                currentSearchIndex: nextIndex,
                currentPage: searchResults[nextIndex].page
            });
        }
    },

    prevSearchResult: () => {
        const { searchResults, currentSearchIndex } = get();
        if (searchResults.length > 0) {
            const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
            set({
                currentSearchIndex: prevIndex,
                currentPage: searchResults[prevIndex].page
            });
        }
    },

    clearSearch: () => set({
        searchQuery: '',
        searchResults: [],
        currentSearchIndex: 0
    }),

    // UI
    setToolbarVisible: (visible) => set({ isToolbarVisible: visible }),
    setMobileView: (isMobile) => set({ isMobileView: isMobile }),
    setResourceActions: (actions) => set({ resourceActions: actions }),

    // Selection & Annotation actions
    setSelection: (selection) => set({ selection }),
    clearSelection: () => set({ selection: null }),

    addHighlight: (highlight) => {
        const id = `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newHighlight: Highlight = {
            ...highlight,
            id,
            createdAt: new Date(),
        };
        set((state) => ({
            highlights: [...state.highlights, newHighlight],
        }));
        return id;
    },

    removeHighlight: (id) => {
        set((state) => ({
            highlights: state.highlights.filter((h) => h.id !== id),
            notes: state.notes.filter((n) => n.highlightId !== id),
        }));
    },

    updateHighlight: (id, updates) => {
        set((state) => ({
            highlights: state.highlights.map((h) =>
                h.id === id ? { ...h, ...updates } : h
            ),
        }));
    },

    addNote: (highlightId, content) => {
        const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        const newNote: Note = {
            id,
            highlightId,
            content,
            createdAt: now,
            updatedAt: now,
        };
        set((state) => ({
            notes: [...state.notes, newNote],
            highlights: state.highlights.map((h) =>
                h.id === highlightId ? { ...h, hasNote: true } : h
            ),
        }));
        return id;
    },

    updateNote: (id, content) => {
        set((state) => ({
            notes: state.notes.map((n) =>
                n.id === id ? { ...n, content, updatedAt: new Date() } : n
            ),
        }));
    },

    removeNote: (id) => {
        const note = get().notes.find((n) => n.id === id);
        if (note) {
            set((state) => ({
                notes: state.notes.filter((n) => n.id !== id),
                highlights: state.highlights.map((h) =>
                    h.id === note.highlightId ? { ...h, hasNote: false } : h
                ),
            }));
        }
    },

    getHighlightsForPage: (pageNumber) => {
        return get().highlights.filter((h) => h.pageNumber === pageNumber);
    },

    getNoteForHighlight: (highlightId) => {
        return get().notes.find((n) => n.highlightId === highlightId);
    },

    // Document lifecycle
    onDocumentLoad: (url, totalPages) => {
        const { currentUrl } = get();

        // If same document, preserve state
        if (currentUrl === url) {
            set({ totalPages, isLoading: false, error: null });
            return;
        }

        // New document - reset view state but keep UI preferences
        // Reset userScale to 1.0 for new documents
        set({
            currentUrl: url,
            totalPages,
            isLoading: false,
            error: null,
            currentPage: 1,
            userScale: 1.0,  // Reset zoom for new document
            scrollTop: 0,
            searchQuery: '',
            searchResults: [],
            currentSearchIndex: 0,
            // Keep: baseScale (will be recalculated), rotation, isFullscreen, scrollMode
        });
    },

    reset: () => set(INITIAL_STATE),
}));

// Selector hooks for performance (avoid re-renders)
export const useCurrentPage = () => usePDFEngineStore((s) => s.currentPage);
export const useTotalPages = () => usePDFEngineStore((s) => s.totalPages);
export const useBaseScale = () => usePDFEngineStore((s) => s.baseScale);
export const useUserScale = () => usePDFEngineStore((s) => s.userScale);
export const useRotation = () => usePDFEngineStore((s) => s.rotation);
export const useIsFullscreen = () => usePDFEngineStore((s) => s.isFullscreen);
export const useIsLoading = () => usePDFEngineStore((s) => s.isLoading);
export const useError = () => usePDFEngineStore((s) => s.error);


