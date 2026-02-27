'use client';

import React from 'react';
import { Navbar, Footer } from '@/components/layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
