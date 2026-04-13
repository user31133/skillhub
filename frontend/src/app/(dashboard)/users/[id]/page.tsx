"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getUserProfile, UserProfile } from "@/services/users"
import { getSkills, SkillRead, PaginatedResponse } from "@/services/skills"
import { SkillCardList, SkillCardSkeleton } from "@/components/ui/skill-card"
import { CossAvatar } from "@/components/ui/coss-avatar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Box } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkillCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [skills, setSkills] = useState<PaginatedResponse<SkillRead> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [profileData, skillsData] = await Promise.all([
        getUserProfile(id),
        getSkills({ author_id: id, limit: 50, sort: "popular" }),
      ])
      setProfile(profileData)
      setSkills(skillsData)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <ProfileSkeleton />

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">User not found.</p>
        <Link href="/skills" className="mt-2 inline-block text-sm underline underline-offset-2">
          Back to skills
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[
        { label: "Skills", href: "/skills" },
        { label: profile.name },
      ]} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative rounded-[12px] bg-[--card] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5",
          "border border-border/50"
        )}
      >
        <CossAvatar
          src={profile.avatar_url}
          alt={profile.name}
          className="size-16"
        />
        <div className="flex flex-col gap-2 flex-1">
          <h1 className="text-[22px] font-medium tracking-[-0.02em] text-foreground">
            {profile.name}
          </h1>
          {profile.bio && (
            <p className="text-[14px] text-foreground/60 leading-relaxed max-w-lg">
              {profile.bio}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-foreground/40">
            <span className="flex items-center gap-1.5">
              <Box className="size-3.5" />
              <span className="tabular-nums">{profile.skill_count} skills</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
            <Badge variant="outline" size="sm">{profile.role}</Badge>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        <h2 className="text-[16px] font-medium tracking-tight text-foreground">
          Skills by {profile.name}
        </h2>

        {skills && skills.items.length > 0 ? (
          <SkillCardList
            items={skills.items.map((skill, index) => ({
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
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/10">
            <p className="text-sm text-muted-foreground">No published skills yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
