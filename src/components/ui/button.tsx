import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "ghost";
  size?: "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const base = "px-4 py-2 rounded font-medium transition focus:outline-none";
    const variants = {
      outline: "border border-gray-300 bg-white hover:bg-gray-100",
      ghost: "bg-transparent hover:bg-gray-100"
    };
    const sizes = {
      icon: "p-2 w-8 h-8 flex items-center justify-center"
    };
    return (
      <button
        ref={ref}
        className={cn(base, variant && variants[variant], size && sizes[size], "focus:ring-2 hover:scale-105 transition-all", className)}
        aria-label={typeof children === 'string' ? children : 'Button'}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
