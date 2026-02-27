/**
 * NoteVeda PDF Engine - Public API
 * 
 * This is the main entry point for the PDF engine.
 * 
 * Usage:
 * ```typescript
 * import { NoteVedaPDFViewer } from '@/lib/pdf-engine';
 * 
 * <NoteVedaPDFViewer fileUrl="/path/to/file.pdf" />
 * ```
 */

// Core Engine
export { PDFEngine, type PDFEngineOptions, type PDFEngineError } from './PDFEngine';
export {
    usePDFEngineStore,
    useCurrentPage,
    useTotalPages,
    useBaseScale,
    useUserScale,
    useRotation,
    useIsFullscreen,
    useIsLoading,
    useError,
    type PDFEngineState,
    type ScrollMode,
} from './PDFEngineStore';
export { usePDFEngine, usePageDimensions } from './usePDFEngine';

// Search
export { searchPDF, getSearchCountByPage, type SearchResult } from './PDFSearch';
export { useSearch } from './useSearch';

// Plugins
export { PluginManager } from './plugins/PluginManager';
export type { NoteVedaPDFPlugin, PluginEvents, PluginRegistrationOptions } from './plugins/types';

// Page Rendering (for advanced customization)
export { default as PDFPageContainer } from './PDFPageContainer';
export { default as VirtualScroller } from './VirtualScroller';
export { default as CanvasLayer } from './layers/CanvasLayer';
export { default as TextLayer } from './layers/TextLayer';
export { default as AnnotationLayer } from './layers/AnnotationLayer';
