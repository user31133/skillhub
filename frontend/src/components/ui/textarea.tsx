"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-vertical transition-colors",
  {
    variants: {
      variant: {
        default: "border-input",
        destructive: "border-destructive focus-visible:ring-destructive",
        ghost: "border-transparent bg-muted focus-visible:bg-background focus-visible:border-input",
      },
      size: {
        default: "min-h-[80px] px-3 py-2",
        sm: "min-h-[60px] px-3 py-2 text-xs",
        lg: "min-h-[120px] px-4 py-3",
        fixed: "h-[80px] px-3 py-2 resize-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  clearable?: boolean
  onClear?: () => void
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, clearable, onClear, value, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(props.defaultValue || "")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(ref, () => textareaRef.current!)

    const isControlled = value !== undefined
    const textareaValue = isControlled ? value : internalValue
    const showClear = clearable && textareaValue && String(textareaValue).length > 0
    const resolvedVariant = error ? "destructive" : variant

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(e.target.value)
      props.onChange?.(e)
    }

    const handleClear = () => {
      if (!isControlled) setInternalValue("")
      onClear?.()
      if (textareaRef.current) {
        const textarea = textareaRef.current
        textarea.value = ""
        const syntheticEvent = {
          target: textarea,
          currentTarget: textarea,
          nativeEvent: new Event("input", { bubbles: true }),
          isDefaultPrevented: () => false,
          isPropagationStopped: () => false,
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {},
          bubbles: true,
          cancelable: true,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: true,
          timeStamp: Date.now(),
          type: "change",
        } as React.ChangeEvent<HTMLTextAreaElement>
        props.onChange?.(syntheticEvent)
        textarea.focus()
      }
    }

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            textareaVariants({ variant: resolvedVariant, size }),
            showClear && "pr-10",
            className
          )}
          ref={textareaRef}
          {...(isControlled ? { value: textareaValue } : { defaultValue: props.defaultValue })}
          onChange={handleChange}
          {...(({ defaultValue, ...rest }) => rest)(props)}
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors [&_svg]:size-4"
          >
            <X />
          </button>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
