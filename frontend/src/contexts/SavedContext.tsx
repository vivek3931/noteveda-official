'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Resource } from '@/types';

// Storage key
const SAVED_RESOURCES_KEY = 'noteveda_saved_resources';

interface SavedContextType {
    savedResources: Resource[];
    savedResourceIds: Set<string>;
    saveResource: (resource: Resource) => void;
    unsaveResource: (resourceId: string) => void;
    isResourceSaved: (resourceId: string) => boolean;
    savedCount: number;
    isLoading: boolean;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

// Get saved resources from localStorage
const getSavedFromStorage = (): Resource[] => {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(SAVED_RESOURCES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

// Save to localStorage
const saveToStorage = (resources: Resource[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SAVED_RESOURCES_KEY, JSON.stringify(resources));
};

export const SavedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [savedResources, setSavedResources] = useState<Resource[]>([]);
    const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Load saved resources on mount
    useEffect(() => {
        const saved = getSavedFromStorage();
        setSavedResources(saved);
        setSavedResourceIds(new Set(saved.map(r => r.id)));
        setIsLoading(false);
    }, []);

    // Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === SAVED_RESOURCES_KEY) {
                const saved = getSavedFromStorage();
                setSavedResources(saved);
                setSavedResourceIds(new Set(saved.map(r => r.id)));
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const saveResource = useCallback((resource: Resource) => {
        setSavedResources(prev => {
            if (prev.some(r => r.id === resource.id)) return prev;
            const updated = [resource, ...prev];
            saveToStorage(updated);
            return updated;
        });
        setSavedResourceIds(prev => new Set([...prev, resource.id]));
    }, []);

    const unsaveResource = useCallback((resourceId: string) => {
        setSavedResources(prev => {
            const updated = prev.filter(r => r.id !== resourceId);
            saveToStorage(updated);
            return updated;
        });
        setSavedResourceIds(prev => {
            const updated = new Set(prev);
            updated.delete(resourceId);
            return updated;
        });
    }, []);

    const isResourceSaved = useCallback((resourceId: string): boolean => {
        return savedResourceIds.has(resourceId);
    }, [savedResourceIds]);

    return (
        <SavedContext.Provider value={{
            savedResources,
            savedResourceIds,
            saveResource,
            unsaveResource,
            isResourceSaved,
            savedCount: savedResources.length,
            isLoading,
        }}>
            {children}
        </SavedContext.Provider>
    );
};

export const useSaved = () => {
    const context = useContext(SavedContext);
    if (!context) {
        throw new Error('useSaved must be used within a SavedProvider');
    }
    return context;
};

export default SavedProvider;
