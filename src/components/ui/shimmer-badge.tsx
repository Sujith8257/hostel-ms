import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const shimmerBadgeVariants = cva(
  cn(
    "relative cursor-default group transition-all",
    "inline-flex items-center justify-center gap-2 shrink-0",
    "rounded-full outline-none",
    "text-xs font-medium whitespace-nowrap",
    "px-2.5 py-0.5 border",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0",
    // Shimmer animation
    "before:absolute before:inset-0 before:rounded-full",
    "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    "before:translate-x-[-100%] before:animate-shimmer",
    "overflow-hidden"
  ),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border bg-background/50 backdrop-blur-sm",
        shimmer:
          "border-0 bg-[linear-gradient(110deg,transparent_35%,var(--primary)_50%,transparent_65%)] bg-[length:200%_100%] animate-shimmer text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "shimmer",
    },
  },
);

export interface ShimmerBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shimmerBadgeVariants> {}

function ShimmerBadge({ className, variant, ...props }: ShimmerBadgeProps) {
  return (
    <div
      className={cn(shimmerBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { ShimmerBadge, shimmerBadgeVariants };
