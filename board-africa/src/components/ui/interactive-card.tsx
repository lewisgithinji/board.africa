/**
 * Enhanced Card component with interactive hover effects
 * Use this for cards that should respond to user interaction
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardProps } from "./card"

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Whether the card should have hover lift effect
     * @default true
     */
    hoverable?: boolean;
    /**
     * Whether the card is clickable (cursor pointer)
     * @default false
     */
    clickable?: boolean;
}

export const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
    ({ className, hoverable = true, clickable = false, ...props }, ref) => (
        <Card
            ref={ref}
            className={cn(
                hoverable && "hover:shadow-lg hover:-translate-y-0.5",
                clickable && "cursor-pointer",
                className
            )}
            {...props}
        />
    )
)

InteractiveCard.displayName = "InteractiveCard"
