import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md font-sans font-medium text-body-lg transition-colors disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-white hover:bg-primary-500/90 disabled:bg-neutral-100 disabled:text-neutral-300",
        secondary:
          "border border-primary-500 bg-white text-primary-500 hover:bg-primary-100 disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-white",
        tertiary:
          "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 disabled:text-neutral-300 disabled:hover:bg-white",
        text: "text-primary-500 hover:text-primary-500/80 disabled:text-neutral-300",
      },
      size: {
        lg: "h-11 px-4",
        md: "h-11 px-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
