import { type InputHTMLAttributes, forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: boolean;
  shortcut?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, shortcut, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-neutral-500" />
        )}
        <input
          ref={ref}
          className={cn(
            "h-11 w-full rounded-md border border-neutral-200 bg-white px-4 font-sans text-body text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-primary-400",
            icon && "pl-10",
            shortcut && "pr-12",
            className,
          )}
          {...props}
        />
        {shortcut && (
          <span className="pointer-events-none absolute right-4 text-small text-neutral-500">
            {shortcut}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
