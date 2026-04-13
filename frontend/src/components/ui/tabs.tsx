"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { indicatorClassName?: string }
>(({ className, indicatorClassName, ...props }, ref) => {
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, top: 0, width: 0, height: 0 })
  const listRef = React.useRef<HTMLDivElement | null>(null)

  const updateIndicator = React.useCallback(() => {
    if (!listRef.current) return
    const activeTab = listRef.current.querySelector<HTMLElement>('[data-state="active"]')
    if (!activeTab) return
    const activeRect = activeTab.getBoundingClientRect()
    const listRect = listRef.current.getBoundingClientRect()
    requestAnimationFrame(() => {
      setIndicatorStyle({
        left: activeRect.left - listRect.left,
        top: activeRect.top - listRect.top,
        width: activeRect.width,
        height: activeRect.height,
      })
    })
  }, [])

  React.useEffect(() => {
    const id = setTimeout(updateIndicator, 0)
    window.addEventListener("resize", updateIndicator)
    const observer = new MutationObserver(updateIndicator)
    if (listRef.current) {
      observer.observe(listRef.current, { attributes: true, childList: true, subtree: true })
    }
    return () => {
      clearTimeout(id)
      window.removeEventListener("resize", updateIndicator)
      observer.disconnect()
    }
  }, [updateIndicator])

  return (
    <div className="relative" ref={listRef}>
      <TabsPrimitive.List
        ref={ref}
        data-slot="tabs-list"
        className={cn(
          "bg-muted text-muted-foreground relative inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
          className
        )}
        {...props}
      />
      <div
        className={cn(
          "absolute rounded-md border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30 transition-all duration-300 ease-in-out pointer-events-none",
          indicatorClassName
        )}
        style={indicatorStyle}
      />
    </div>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 z-10",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn("flex-1 outline-none", className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
