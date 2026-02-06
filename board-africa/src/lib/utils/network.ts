/**
 * Network utility functions for enterprise-grade error handling
 */

export interface FetchOptions extends RequestInit {
    timeout?: number;
}

/**
 * Enhanced fetch with timeout support
 */
export async function fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your connection and try again.');
            }
        }
        throw error;
    }
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Add online/offline event listeners
 */
export function setupNetworkListeners(
    onOnline?: () => void,
    onOffline?: () => void
) {
    if (onOnline) {
        window.addEventListener('online', onOnline);
    }
    if (onOffline) {
        window.addEventListener('offline', onOffline);
    }

    // Cleanup function
    return () => {
        if (onOnline) {
            window.removeEventListener('online', onOnline);
        }
        if (onOffline) {
            window.removeEventListener('offline', onOffline);
        }
    };
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelay?: number;
        maxDelay?: number;
        onRetry?: (attempt: number, error: Error) => void;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            if (attempt < maxRetries) {
                const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

                if (onRetry) {
                    onRetry(attempt + 1, lastError);
                }

                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
}

/**
 * Parse API error response
 */
export async function parseErrorResponse(response: Response): Promise<string> {
    try {
        const data = await response.json();
        return data.message || data.error || 'An unexpected error occurred';
    } catch {
        return `Request failed with status ${response.status}`;
    }
}
