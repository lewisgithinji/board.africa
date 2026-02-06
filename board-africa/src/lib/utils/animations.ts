/**
 * CSS transitions and animations for micro-interactions
 */

export const transitions = {
    // Button hover/press
    button: 'transition-all duration-200 ease-in-out',

    // Card hover
    card: 'transition-all duration-300 ease-out',

    // Modal/Dialog
    modal: 'transition-all duration-200 ease-in-out',

    // Fade in/out
    fade: 'transition-opacity duration-300 ease-in-out',

    // Slide
    slide: 'transition-transform duration-300 ease-out',

    // Scale
    scale: 'transition-transform duration-200 ease-out',
} as const;

/**
 * Animation variants for different states
 */
export const animations = {
    // Hover lift
    hoverLift: 'hover:shadow-lg hover:-translate-y-0.5',

    // Hover glow
    hoverGlow: 'hover:shadow-md hover:border-primary/50',

    // Press effect
    pressEffect: 'active:scale-[0.98]',

    // Pulse (for notifications)
    pulse: 'animate-pulse',

    // Bounce (for success)
    bounce: 'animate-bounce',

    // Spin (for loading)
    spin: 'animate-spin',

    // Fade in
    fadeIn: 'animate-in fade-in duration-300',

    // Slide in from bottom
    slideInBottom: 'animate-in slide-in-from-bottom duration-300',

    // Slide in from top
    slideInTop: 'animate-in slide-in-from-top duration-300',

    // Zoom in
    zoomIn: 'animate-in zoom-in duration-200',
} as const;

/**
 * Stagger children animation
 */
export function staggerChildren(index: number, baseDelay = 50) {
    return {
        style: {
            animationDelay: `${index * baseDelay}ms`,
        },
        className: 'animate-in fade-in slide-in-from-bottom-2',
    };
}
