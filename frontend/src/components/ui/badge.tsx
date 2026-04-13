import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border border-transparent font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-green-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-violet-500 text-white",
        outline: "bg-transparent border border-border text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      appearance: {
        default: "",
        light: "",
        outline: "",
        ghost: "border-transparent bg-transparent",
      },
      size: {
        lg: "rounded-sm px-2 h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5",
        md: "rounded-sm px-[0.45rem] h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5",
        sm: "rounded-sm px-[0.325rem] h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3",
        xs: "rounded-sm px-[0.25rem] h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3",
      },
      shape: {
        default: "",
        circle: "rounded-full",
      },
    },
    compoundVariants: [
      { variant: "default", appearance: "light", className: "text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-400" },
      { variant: "secondary", appearance: "light", className: "bg-secondary/50 text-secondary-foreground" },
      { variant: "success", appearance: "light", className: "text-green-800 bg-green-100 dark:bg-green-950 dark:text-green-400" },
      { variant: "warning", appearance: "light", className: "text-yellow-700 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400" },
      { variant: "info", appearance: "light", className: "text-violet-700 bg-violet-100 dark:bg-violet-950 dark:text-violet-400" },
      { variant: "destructive", appearance: "light", className: "text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-400" },
      { variant: "default", appearance: "outline", className: "text-blue-700 border-blue-100 bg-blue-50 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-400" },
      { variant: "success", appearance: "outline", className: "text-green-700 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900 dark:text-green-400" },
      { variant: "warning", appearance: "outline", className: "text-yellow-700 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900 dark:text-yellow-400" },
      { variant: "info", appearance: "outline", className: "text-violet-700 border-violet-100 bg-violet-50 dark:bg-violet-950 dark:border-violet-900 dark:text-violet-400" },
      { variant: "destructive", appearance: "outline", className: "text-red-700 border-red-100 bg-red-50 dark:bg-red-950 dark:border-red-900 dark:text-red-400" },
      { variant: "default", appearance: "ghost", className: "text-primary" },
      { variant: "success", appearance: "ghost", className: "text-green-500" },
      { variant: "warning", appearance: "ghost", className: "text-yellow-500" },
      { variant: "info", appearance: "ghost", className: "text-violet-500" },
      { variant: "destructive", appearance: "ghost", className: "text-destructive" },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, appearance, shape, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, appearance, shape }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
