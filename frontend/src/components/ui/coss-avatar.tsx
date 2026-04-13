"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react"
import { cn } from "@/lib/utils"

export interface CossAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  className?: string
}

export function CossAvatar({ src, alt, fallback, className }: CossAvatarProps) {
  return (
    <AvatarPrimitive.Root className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-foreground/[0.04] border border-border/50 text-[12px] text-foreground/60 font-medium"
      >
        {fallback || (alt ? alt.charAt(0).toUpperCase() : "U")}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
