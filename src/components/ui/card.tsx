import * as React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-white text-black shadow transition-all duration-200 focus:ring-2 hover:shadow-lg", className)}
      aria-label="Card"
      tabIndex={0}
      {...props}
    />
  )
);
Card.displayName = "Card";
