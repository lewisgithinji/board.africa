'use client';

import * as React from 'react';
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 max-w-md">
                        <h2 className="text-xl font-semibold text-destructive mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Simple error fallback component
 */
export function ErrorFallback({ error, resetError }: { error: Error; resetError?: () => void }) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 max-w-md space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-destructive mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                </div>
                {resetError && (
                    <button
                        onClick={resetError}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}
