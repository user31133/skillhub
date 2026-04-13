"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  Globe,
  Database,
  Code2,
  Wrench,
  Brain,
  Cloud,
  MessageSquare,
  FileText,
  BarChart2,
  Sparkles,
  ChevronRight,
  X,
  Star,
  Download,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SkillCardItem = {
  id: string | number
  index: number
  name: string
  description: string
  category: string
  framework?: string | null
  prompt?: string
  averageRating: number
  reviewCount: number
  installCount: number
  authorId?: string
  authorName: string
}

export type SkillCardListProps = {
  items: SkillCardItem[]
  className?: string
  gridClassName?: string
}

const categoryIcons: Record<string, React.ReactNode> = {
  browser: <Globe className="w-4 h-4" strokeWidth={1.5} />,
  database: <Database className="w-4 h-4" strokeWidth={1.5} />,
  api: <Code2 className="w-4 h-4" strokeWidth={1.5} />,
  devtools: <Wrench className="w-4 h-4" strokeWidth={1.5} />,
  ai: <Brain className="w-4 h-4" strokeWidth={1.5} />,
  cloud: <Cloud className="w-4 h-4" strokeWidth={1.5} />,
  messaging: <MessageSquare className="w-4 h-4" strokeWidth={1.5} />,
  file: <FileText className="w-4 h-4" strokeWidth={1.5} />,
  analytics: <BarChart2 className="w-4 h-4" strokeWidth={1.5} />,
}

function getCategoryIcon(category: string): React.ReactNode {
  return categoryIcons[category] ?? <Sparkles className="w-4 h-4" strokeWidth={1.5} />
}

export function SkillCardList({ items, className, gridClassName }: SkillCardListProps) {
  const router = useRouter()
  const [selectedCard, setSelectedCard] = React.useState<SkillCardItem | null>(null)
  const [hoveredCard, setHoveredCard] = React.useState<string | number | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleCardClick = (item: SkillCardItem) => {
    setSelectedCard(item)
    setCopied(false)
  }

  const handleCopy = () => {
    if (!selectedCard?.prompt) return
    navigator.clipboard.writeText(selectedCard.prompt)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className={cn("w-full", className)}>
      <div className={gridClassName || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {items.map((item) => {
          const tags = [item.category, item.framework].filter(Boolean) as string[]
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: items.indexOf(item) * 0.03, ease: "easeOut" }}
              onHoverStart={() => setHoveredCard(item.id)}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => handleCardClick(item)}
              className="group relative text-left w-full"
            >
              <div
                className={cn(
                  "relative h-full rounded-[12px] bg-[--card] p-5 transition-colors duration-150",
                  "border border-border/50",
                  "hover:bg-foreground/[0.02]"
                )}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-foreground/40">
                        {getCategoryIcon(item.category)}
                      </div>
                      <span className="text-[12px] text-foreground/40 font-variant-numeric: tabular-nums">
                        {String(item.index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{
                        opacity: hoveredCard === item.id ? 1 : 0,
                        x: hoveredCard === item.id ? 0 : -4,
                      }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                    >
                      <ChevronRight className="w-4 h-4 text-foreground/60" strokeWidth={1.5} />
                    </motion.div>
                  </div>

                  <h3 className="text-[14px] font-medium leading-[1.5] text-foreground mb-2">
                    {item.name}
                  </h3>

                  <p className="text-[12px] leading-[1.6] text-foreground/60 mb-4 flex-grow">
                    {item.description}
                  </p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-[12px] leading-none rounded-[4px] bg-foreground/[0.04] text-foreground/60 border border-border/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-6"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "relative w-full max-w-xl rounded-[14px] bg-[--card] p-8",
                "border border-border/50",
                "shadow-2xl dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCard(null)}
                className={cn(
                  "absolute top-5 right-5 p-2 rounded-[6px] bg-foreground/[0.04]",
                  "hover:bg-foreground/[0.08] transition-colors duration-150"
                )}
              >
                <X className="w-4 h-4 text-foreground/60" strokeWidth={1.5} />
              </button>

              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 rounded-[8px] bg-[--input] text-foreground/40 shrink-0">
                  {getCategoryIcon(selectedCard.category)}
                </div>
                <div className="flex-1 pr-8">
                  <h2 className="text-[20px] font-medium leading-[1.2] tracking-[-0.02em] text-foreground mb-2">
                    {selectedCard.name}
                  </h2>
                  <p className="text-[14px] leading-[1.5] text-foreground/60">
                    {selectedCard.description}
                  </p>
                </div>
              </div>

              {[selectedCard.category, selectedCard.framework].filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {[selectedCard.category, selectedCard.framework].filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-[12px] leading-none rounded-[4px] bg-foreground/[0.04] text-foreground/60 border border-border/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="rounded-[8px] bg-[--input] p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-foreground/40" strokeWidth={1.5} />
                  <span className="text-[12px] font-medium text-foreground/40 uppercase tracking-wider">
                    PROMPT TEMPLATE
                  </span>
                </div>
                <div className="text-[14px] leading-[1.6] text-foreground font-mono max-h-40 overflow-y-auto whitespace-pre-wrap break-words">
                  {selectedCard.prompt || "Start your prompt here..."}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[12px] text-foreground/40 tabular-nums mb-8">
                {selectedCard.authorId ? (
                  <Link
                    href={`/users/${selectedCard.authorId}`}
                    onClick={() => setSelectedCard(null)}
                    className="font-medium text-foreground/60 hover:text-foreground transition-colors duration-150"
                  >
                    {selectedCard.authorName}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground/60">{selectedCard.authorName}</span>
                )}
                <span className="text-foreground/20">·</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-foreground/60">{selectedCard.averageRating.toFixed(1)}</span>
                  <span className="text-foreground/40">({selectedCard.reviewCount})</span>
                </span>
                <span className="text-foreground/20">·</span>
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-foreground/60">{selectedCard.installCount.toLocaleString()}</span>
                </span>
              </div>

              <div className="flex gap-3">
                {selectedCard.prompt && (
                  <button
                    onClick={handleCopy}
                    disabled={copied}
                    className={cn(
                      "flex-1 h-10 px-4 rounded-[6px] bg-foreground/[0.04] text-foreground text-[14px] font-medium",
                      "hover:bg-foreground/[0.08] transition-all duration-150 border border-border/50",
                      "flex items-center justify-center gap-2",
                      copied && "bg-foreground/[0.08] text-foreground"
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      "Copy Prompt"
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedCard(null)
                    router.push(`/skills/${selectedCard.id}`)
                  }}
                  className={cn(
                    "h-10 px-4 rounded-[6px] bg-foreground text-background text-[14px] font-medium",
                    "hover:bg-foreground/90 transition-colors duration-150 flex items-center gap-2"
                  )}
                >
                  Open Skill <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SkillCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[12px] border border-border/50 bg-[--card] h-[160px]", className)}>
      <div className="flex flex-col p-5 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-[4px] bg-foreground/[0.04] animate-pulse" />
            <div className="h-3 w-4 rounded-[2px] bg-foreground/[0.04] animate-pulse" />
          </div>
          <div className="size-4 rounded-full bg-foreground/[0.04] animate-pulse" />
        </div>
        <div className="h-4 w-2/3 rounded-[4px] bg-foreground/[0.04] animate-pulse mb-2" />
        <div className="space-y-1.5 flex-grow">
          <div className="h-3 w-full rounded-[4px] bg-foreground/[0.04] animate-pulse" />
          <div className="h-3 w-4/5 rounded-[4px] bg-foreground/[0.04] animate-pulse" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-5 w-12 rounded-[4px] bg-foreground/[0.04] animate-pulse" />
          <div className="h-5 w-14 rounded-[4px] bg-foreground/[0.04] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
