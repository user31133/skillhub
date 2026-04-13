"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface ShiftingDropdownProps {
  tabs: Tab[]
  className?: string
}

export function ShiftingDropdown({ tabs, className }: ShiftingDropdownProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [direction, setDirection] = useState<"l" | "r">("l")

  const handleSetSelected = (val: string | null) => {
    if (typeof selected === "string" && typeof val === "string") {
      const selectedIndex = tabs.findIndex((t) => t.id === selected)
      const valIndex = tabs.findIndex((t) => t.id === val)

      if (valIndex > selectedIndex) {
        setDirection("r")
      } else {
        setDirection("l")
      }
    }

    setSelected(val)
  }

  return (
    <div onMouseLeave={() => handleSetSelected(null)} className={cn("relative flex h-fit gap-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onMouseEnter={() => handleSetSelected(tab.id)}
          className={cn(
            "flex items-center gap-1 rounded-[6px] px-3 py-1.5 text-[14px] font-medium transition-colors duration-150",
            selected === tab.id ? "bg-foreground/[0.04] text-foreground" : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.02]"
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-300", selected === tab.id ? "rotate-180" : "")}
          />
        </button>
      ))}

      <AnimatePresence>
        {selected && (
          <Content
            key={selected}
            direction={direction}
            selected={selected}
            tabs={tabs}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Content({
  selected,
  direction,
  tabs,
}: {
  selected: string
  direction: "l" | "r"
  tabs: Tab[]
}) {
  const activeTab = tabs.find((t) => t.id === selected)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 4 }}
      className="absolute top-[calc(100%+12px)] right-0 md:left-auto md:right-0 z-50 min-w-[280px] rounded-[14px] border border-border/50 bg-[--card] p-4 shadow-2xl dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
    >
      {/* Invisible bridge covering the gap between trigger and dropdown */}
      <div className="absolute -top-3 left-0 right-0 h-3" />
      <motion.div
        initial={{
          opacity: 0,
          x: direction === "l" ? 100 : -100,
        }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {activeTab?.content}
      </motion.div>
    </motion.div>
  )
}
