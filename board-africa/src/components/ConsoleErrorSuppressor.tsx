'use client';

import { useEffect } from 'react';

export function ConsoleErrorSuppressor() {
    useEffect(() => {
        const originalError = console.error;
        console.error = function (...args: any[]) {
            if (
                typeof args[0] === 'string' &&
                (args[0].includes('fdprocessedid') ||
                    args[0].includes('Received `false` for a non-boolean attribute') ||
                    args[0].includes('A tree hydrated but some attributes'))
            ) {
                return; // Suppress browser extension warnings
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    return null;
}
