import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "@/components/ui/icons"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-gray-200 bg-surface px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
