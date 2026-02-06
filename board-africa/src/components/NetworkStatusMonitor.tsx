'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { setupNetworkListeners } from '@/lib/utils/network';

/**
 * Global network status monitor
 * Displays toast notifications when connection is lost/restored
 */
export function NetworkStatusMonitor() {
    useEffect(() => {
        const cleanup = setupNetworkListeners(
            () => {
                toast.success('Connection restored', {
                    description: 'You are back online',
                });
            },
            () => {
                toast.warning('Connection lost', {
                    description: 'You are offline. Changes will be saved when connection is restored.',
                    duration: Infinity, // Stay visible until online
                });
            }
        );

        return cleanup;
    }, []);

    return null;
}
