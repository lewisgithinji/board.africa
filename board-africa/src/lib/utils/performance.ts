/**
 * Performance optimization utilities
 */

import dynamic, { DynamicOptionsLoadingProps } from 'next/dynamic';
import React, { ComponentType, ReactNode } from 'react';

/**
 * Lazy load a component with loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    LoadingComponent?: (props: DynamicOptionsLoadingProps) => ReactNode
) {
    return dynamic(importFn, {
        loading: LoadingComponent,
        ssr: false,
    });
}

/**
 * Debounce function for search/input
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Check if an element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
    elementRef: React.RefObject<Element>,
    options?: IntersectionObserverInit
) {
    const [isIntersecting, setIsIntersecting] = React.useState(false);

    React.useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => observer.disconnect();
    }, [elementRef, options]);

    return isIntersecting;
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Optimize image URL (for future Cloudflare Images integration)
 */
export function optimizeImageUrl(
    url: string,
    options: { width?: number; quality?: number } = {}
): string {
    // Placeholder for future Cloudflare Images integration
    // For now, return original URL
    return url;
}

/**
 * Cache API responses (simple in-memory cache)
 */
const cache = new Map<string, { data: any; timestamp: number }>();

export function getCachedData<T>(
    key: string,
    maxAge: number = 5 * 60 * 1000 // 5 minutes default
): T | null {
    const cached = cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
        cache.delete(key);
        return null;
    }

    return cached.data as T;
}

export function setCachedData(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(key?: string): void {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

