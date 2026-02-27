'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface PDFState {
    currentPage: number;
    numPages: number;
    scale: number;
    isFitWidth: boolean;
    rotation: number;
}

interface PDFContextValue {
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean | ((prev: boolean) => boolean)) => void;
    state: PDFState;
    setCurrentPage: (page: number) => void;
    setNumPages: (pages: number) => void;
    setScale: (value: number | 'fit') => void;
    setRotation: (updater: (prev: number) => number) => void;
}

const PDFContext = createContext<PDFContextValue | null>(null);

export function PDFProvider({ children }: { children: ReactNode }) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const [state, setState] = useState<PDFState>({
        currentPage: 1,
        numPages: 0,
        scale: 1,
        isFitWidth: true,
        rotation: 0,
    });

    const setCurrentPage = useCallback((page: number) => {
        setState(prev => prev.currentPage === page ? prev : { ...prev, currentPage: page });
    }, []);

    const setNumPages = useCallback((pages: number) => {
        setState(prev => ({ ...prev, numPages: pages }));
    }, []);

    const setScale = useCallback((value: number | 'fit') => {
        setState(prev => {
            const isFit = value === 'fit';
            return { 
                ...prev, 
                isFitWidth: isFit, 
                scale: isFit ? 1 : value 
            };
        });
    }, []);

    const setRotation = useCallback((updater: (prev: number) => number) => {
        setState(prev => ({ ...prev, rotation: updater(prev.rotation) }));
    }, []);

    return (
        <PDFContext.Provider value={{
            isFullScreen,
            setIsFullScreen,
            state,
            setCurrentPage,
            setNumPages,
            setScale,
            setRotation
        }}>
            {children}
        </PDFContext.Provider>
    );
}

export function usePDF() {
    const context = useContext(PDFContext);
    if (!context) throw new Error('usePDF must be used within a PDFProvider');
    return context;
}