"use client"

import * as React from "react"
import { AtSign } from "lucide-react"
import { cn } from "@/lib/utils"

function OrDivider() {
  return (
    <div className="relative flex items-center py-2">
      <div className="flex-grow border-t border-border" />
      <span className="mx-4 shrink text-xs uppercase text-muted-foreground">
        Or
      </span>
      <div className="flex-grow border-t border-border" />
    </div>
  )
}

interface AuthCardProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  error?: string
  className?: string
}

function AuthCard({ title, children, footer, error, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[480px] rounded-xl border border-border bg-card p-8 shadow-sm",
        className
      )}
    >
      <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
        {title}
      </h1>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">{children}</div>

      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  )
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
AuthInput.displayName = "AuthInput"

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline"
  isLoading?: boolean
}

const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" &&
            "bg-foreground text-background hover:bg-foreground/90",
          variant === "outline" &&
            "border border-border bg-transparent text-foreground hover:bg-muted",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    )
  }
)
AuthButton.displayName = "AuthButton"

export { AuthCard, AuthInput, AuthButton, OrDivider, AtSign }
