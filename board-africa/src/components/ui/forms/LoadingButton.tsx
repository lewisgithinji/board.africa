import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { forwardRef, ReactNode } from 'react';

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean;
    loadingText?: string;
    icon?: ReactNode;
    showSuccessIcon?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ children, isLoading, loadingText, icon, showSuccessIcon, disabled, ...props }, ref) => {
        return (
            <Button ref={ref} disabled={disabled || isLoading} {...props}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {loadingText || 'Loading...'}
                    </>
                ) : (
                    <>
                        {icon && <span className="mr-2">{icon}</span>}
                        {children}
                    </>
                )}
            </Button>
        );
    }
);

LoadingButton.displayName = 'LoadingButton';
