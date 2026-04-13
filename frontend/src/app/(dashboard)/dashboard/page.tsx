"use client"

import { useEffect, useState } from "react"
import { getDashboardStats, DashboardStats } from "@/services/dashboard"
import { SkillCardList, SkillCardSkeleton } from "@/components/ui/skill-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

function StatCard({
  label,
  value,
  index = 0,
}: {
  label: string
  value: string | number
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.05, ease: "easeOut" }}
      className="group relative"
    >
      <div className={cn(
        "relative h-full rounded-[12px] bg-[--card] p-5 flex flex-col gap-1 transition-colors duration-150",
        "border border-border/50",
        "hover:bg-foreground/[0.02]"
      )}>
        <span className="text-[12px] text-foreground/50 tracking-wider uppercase font-medium">{label}</span>
        <span className="text-[28px] font-medium tracking-tight tabular-nums leading-tight">
          {value}
        </span>
      </div>
    </motion.div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-1">
      <Skeleton className="h-3 w-24 rounded-sm" />
      <Skeleton className="h-7 w-20 rounded-sm mt-1" />
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    setError(false)
    setLoading(true)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {error ? (
        <div className="text-sm text-muted-foreground">
          Failed to load.{" "}
          <button
            onClick={load}
            className="underline underline-offset-2 hover:text-foreground transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : stats ? (
              <>
                <StatCard index={0} label="Total Skills" value={stats.total_skills.toLocaleString()} />
                <StatCard index={1} label="Total Installs" value={stats.total_installs.toLocaleString()} />
                <StatCard index={2}
                  label="Avg Rating"
                  value={stats.avg_rating > 0 ? stats.avg_rating.toFixed(2) : "—"}
                />
                <StatCard index={3} label="Total Users" value={stats.total_users.toLocaleString()} />
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="flex flex-col gap-4">
              <h2 className="text-base font-semibold tracking-tight">Recent Skills</h2>
              <div className="flex flex-col gap-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkillCardSkeleton key={i} />)
                ) : stats?.recent_skills.length ? (
                  <SkillCardList
                    gridClassName="flex flex-col gap-3"
                    items={stats.recent_skills.map((skill, index) => ({
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
                ) : (
                  <p className="text-sm text-muted-foreground">No skills yet.</p>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-base font-semibold tracking-tight">Top Skills</h2>
              <div className="flex flex-col gap-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkillCardSkeleton key={i} />)
                ) : stats?.top_skills.length ? (
                  <SkillCardList
                    gridClassName="flex flex-col gap-3"
                    items={stats.top_skills.map((skill, index) => ({
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
                ) : (
                  <p className="text-sm text-muted-foreground">No skills yet.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
