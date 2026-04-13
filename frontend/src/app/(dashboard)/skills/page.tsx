"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getSkills, SkillRead, PaginatedResponse } from "@/services/skills"
import { SkillCardList, SkillCardSkeleton } from "@/components/ui/skill-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus } from "lucide-react"
import { motion } from "motion/react"

const CATEGORIES = [
  "browser",
  "database",
  "api",
  "devtools",
  "ai",
  "cloud",
  "messaging",
  "file",
  "analytics",
]

const FRAMEWORKS = [
  "langchain",
  "crewai",
  "autogen",
  "custom",
  "openai",
  "anthropic",
  "other",
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "name", label: "Name" },
]

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "ellipsis")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("ellipsis")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push("ellipsis")
  pages.push(total)
  return pages
}

export default function SkillsPage() {
  return (
    <Suspense fallback={null}>
      <SkillsPageInner />
    </Suspense>
  )
}

function SkillsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const framework = searchParams.get("framework") ?? ""
  const sort = searchParams.get("sort") ?? "newest"
  const page = Number(searchParams.get("page") ?? "1")

  const [searchInput, setSearchInput] = useState(q)
  const [result, setResult] = useState<PaginatedResponse<SkillRead> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function buildUrl(overrides: Record<string, string | number>) {
    const params = new URLSearchParams()
    const resolved = {
      q,
      category,
      framework,
      sort,
      page: String(page),
      ...Object.fromEntries(
        Object.entries(overrides).map(([k, v]) => [k, String(v)])
      ),
    }
    if (resolved.q) params.set("q", resolved.q)
    if (resolved.category) params.set("category", resolved.category)
    if (resolved.framework) params.set("framework", resolved.framework)
    if (resolved.sort && resolved.sort !== "newest") params.set("sort", resolved.sort)
    if (resolved.page && resolved.page !== "1") params.set("page", resolved.page)
    const str = params.toString()
    return `/skills${str ? `?${str}` : ""}`
  }

  function pushFilter(key: string, value: string) {
    router.push(buildUrl({ [key]: value, page: "1" }))
  }

  const fetchSkills = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getSkills({
        search: q || undefined,
        category: category || undefined,
        framework: framework || undefined,
        sort: sort || undefined,
        page,
        limit: 12,
      })
      setResult(data)
    } catch {
      setResult(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [q, category, framework, sort, page])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  // Debounce search input → URL param
  useEffect(() => {
    if (searchInput === q) return
    const timer = setTimeout(() => {
      pushFilter("q", searchInput)
    }, 400)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  // Sync input when URL changes from outside
  useEffect(() => {
    setSearchInput(q)
  }, [q])

  const hasFilters = q || category || framework || sort !== "newest"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-foreground mb-2"
          >
            Skills Library
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
            className="text-[14px] leading-[1.5] text-foreground/60"
          >
            Select a skill or prompt template to get started
          </motion.p>
        </div>
        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/skills/create">
            <Plus className="size-4" />
            New Skill
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search skills…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:w-56"
        />
        <Combobox
          options={[
            { value: "__all__", label: "All Categories" },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: c.charAt(0).toUpperCase() + c.slice(1),
            })),
          ]}
          value={category || "__all__"}
          onValueChange={(v) => pushFilter("category", v === "__all__" ? "" : v)}
          placeholder="All Categories"
          searchPlaceholder="Search category…"
          className="w-[160px]"
        />
        <Combobox
          options={[
            { value: "__all__", label: "All Frameworks" },
            ...FRAMEWORKS.map((f) => ({
              value: f,
              label: f.charAt(0).toUpperCase() + f.slice(1),
            })),
          ]}
          value={framework || "__all__"}
          onValueChange={(v) => pushFilter("framework", v === "__all__" ? "" : v)}
          placeholder="All Frameworks"
          searchPlaceholder="Search framework…"
          className="w-[160px]"
        />
        <Combobox
          options={SORT_OPTIONS}
          value={sort}
          onValueChange={(v) => pushFilter("sort", v)}
          className="w-[140px]"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-sm text-muted-foreground">Failed to load skills.</p>
          <button
            onClick={fetchSkills}
            className="mt-2 inline-block text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      ) : result && result.items.length > 0 ? (
        <>
          <SkillCardList
            items={result.items.map((skill, index) => ({
              id: skill.id,
              index,
              name: skill.name,
              description: skill.description,
              category: skill.category,
              framework: skill.framework,
              prompt: skill.prompt,
              averageRating: skill.avg_rating,
              reviewCount: skill.review_count,
              installCount: skill.installs,
              authorId: skill.author_id,
              authorName: skill.author.name,
            }))}
          />

          {result.pages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={buildUrl({ page: page - 1 })}
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) router.push(buildUrl({ page: page - 1 }))
                    }}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {getPageNumbers(page, result.pages).map((p, i) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={buildUrl({ page: p })}
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(buildUrl({ page: p }))
                        }}
                        isActive={p === page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href={buildUrl({ page: page + 1 })}
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < result.pages) router.push(buildUrl({ page: page + 1 }))
                    }}
                    aria-disabled={page >= result.pages}
                    className={page >= result.pages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-sm text-muted-foreground">No skills found.</p>
          {hasFilters && (
            <Link
              href="/skills"
              className="mt-2 inline-block text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Clear filters
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
