'use client';

import { ReactNode } from 'react';

interface DummyProviderProps {
    children: ReactNode;
}

export function DummyProvider({ children }: DummyProviderProps) {
    return <>{children}</>;
}
