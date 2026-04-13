"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { updateProfile } from "@/services/users"
import { getMySkills, SkillRead } from "@/services/skills"
import { useAuth } from "@/hooks/use-auth"
import { CossAvatar } from "@/components/ui/coss-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SkillCardList, SkillCardSkeleton } from "@/components/ui/skill-card"
import { Pencil, X, CalendarDays, Box, Mail } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [skills, setSkills] = useState<SkillRead[]>([])
  const [skillsLoading, setSkillsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio ?? "")
      setAvatarUrl(user.avatar_url ?? "")
    }
  }, [user])

  useEffect(() => {
    getMySkills()
      .then(setSkills)
      .catch(() => setSkills([]))
      .finally(() => setSkillsLoading(false))
  }, [])

  function startEditing() {
    if (user) {
      setName(user.name)
      setBio(user.bio ?? "")
      setAvatarUrl(user.avatar_url ?? "")
    }
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    setSubmitting(true)
    try {
      const updated = await updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      })
      updateUser({
        name: updated.name,
        bio: updated.bio,
        avatar_url: updated.avatar_url,
        skill_count: updated.skill_count,
      })
      toast.success("Profile updated")
      setEditing(false)
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-5">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40 rounded-sm" />
            <Skeleton className="h-4 w-56 rounded-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative rounded-[12px] bg-[--card] p-6",
          "border border-border/50"
        )}
      >
        {!editing ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <CossAvatar
              src={user.avatar_url}
              alt={user.name}
              className="size-16"
            />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-medium tracking-[-0.02em] text-foreground">
                  {user.name}
                </h1>
                <Badge variant="outline" size="sm">{user.role}</Badge>
              </div>
              {user.bio && (
                <p className="text-[14px] text-foreground/60 leading-relaxed max-w-lg">
                  {user.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-foreground/40">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Box className="size-3.5" />
                  <span className="tabular-nums">{skills.length} skills</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startEditing}
              className="shrink-0 self-start"
            >
              <Pencil className="size-4" />
              Edit Profile
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-medium tracking-tight">Edit Profile</h2>
              <button
                type="button"
                onClick={cancelEditing}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself…"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Saving…" : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </motion.div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-medium tracking-tight text-foreground">My Skills</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/skills/mine">View all</Link>
          </Button>
        </div>

        {skillsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkillCardSkeleton key={i} />
            ))}
          </div>
        ) : skills.length > 0 ? (
          <SkillCardList
            items={skills.slice(0, 6).map((skill, index) => ({
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
            <p className="text-sm text-muted-foreground">No skills yet.</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/skills/create">Create your first skill</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
