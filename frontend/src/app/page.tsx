"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSkills, SkillRead } from "@/services/skills"
import { getDashboardStats, DashboardStats } from "@/services/dashboard"
import { SkillCardList, SkillCardSkeleton } from "@/components/ui/skill-card"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [skills, setSkills] = useState<SkillRead[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getSkills({ sort: "popular", limit: 6 }),
      getDashboardStats(),
    ])
      .then(([skillsRes, statsRes]) => {
        setSkills(skillsRes.items)
        setStats(statsRes)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-[-0.03em] leading-[1.1] max-w-2xl sm:text-5xl lg:text-6xl mb-4">
            The marketplace for<br />AI Agent Skills
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mb-8 leading-relaxed">
            Discover, install, and publish reusable skills for LangChain, CrewAI, AutoGen, and more.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild size="lg">
              <Link href="/skills">Browse Skills</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-border py-8">
          <div className="mx-auto max-w-4xl px-6 flex items-center justify-center gap-12 text-sm text-muted-foreground tabular-nums flex-wrap">
            {loading ? (
              <>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
              </>
            ) : (
              <>
                <span>{stats?.total_skills ?? "—"} skills</span>
                <span>{stats?.total_installs.toLocaleString() ?? "—"} installs</span>
                <span>{stats?.total_users ?? "—"} users</span>
              </>
            )}
          </div>
        </section>

        {/* Browse by Category */}
        {!loading && stats && stats.skills_by_category.filter((c) => c.count > 0).length > 0 && (
          <section className="mx-auto w-full max-w-6xl px-6 py-16 border-t border-border">
            <h2 className="text-xl font-semibold tracking-[-0.02em] mb-6">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              {stats.skills_by_category
                .filter((c) => c.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((cat) => (
                  <Link
                    key={cat.category}
                    href={`/skills?category=${cat.category}`}
                    className="border border-border rounded-full px-4 py-1.5 text-sm hover:bg-muted/60 transition-colors duration-150"
                  >
                    {cat.category}
                    <span className="text-muted-foreground tabular-nums ml-1">{cat.count}</span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Popular Skills */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-xl font-semibold tracking-[-0.02em] mb-6">Popular Skills</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkillCardSkeleton key={i} />
              ))}
            </div>
          ) : skills.length > 0 ? (
            <SkillCardList
              items={skills.map((skill, index) => ({
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
          ) : null}
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/skills">View all skills</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
