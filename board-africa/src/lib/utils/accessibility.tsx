/**
 * Accessibility utility functions and components
 */

'use client';

import { useEffect } from 'react';

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Hook to trap focus within a modal/dialog
 */
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        function handleTab(e: KeyboardEvent) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        }

        container.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => {
            container.removeEventListener('keydown', handleTab);
        };
    }, [isActive, containerRef]);
}

/**
 * Hook to handle Escape key
 */
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
    useEffect(() => {
        if (!isActive) return;

        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                callback();
            }
        }

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [callback, isActive]);
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * ARIA live region component
 */
interface LiveRegionProps {
    message: string;
    priority?: 'polite' | 'assertive';
    className?: string;
}

export function LiveRegion({ message, priority = 'polite', className = '' }: LiveRegionProps) {
    return (
        <div
            role="status"
            aria-live={priority}
            aria-atomic="true"
            className={`sr-only ${className}`}
        >
            {message}
        </div>
    );
}
