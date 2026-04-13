"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getMySkills, deleteSkill, SkillRead } from "@/services/skills"
import { SkillCardSkeleton } from "@/components/ui/skill-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmDialog } from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Download, Star } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export default function MySkillsPage() {
  const router = useRouter()
  const [skills, setSkills] = useState<SkillRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setError(false)
    setLoading(true)
    try {
      const data = await getMySkills()
      setSkills(data)
    } catch {
      setError(true)
      setSkills([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSkill(deleteId)
      setSkills((prev) => prev.filter((s) => s.id !== deleteId))
      toast.success("Skill deleted")
    } catch {
      toast.error("Failed to delete skill")
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-foreground mb-1"
          >
            My Skills
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
            className="text-[14px] leading-[1.5] text-foreground/60"
          >
            {skills.length > 0 ? `${skills.length} published` : "Manage your published skills"}
          </motion.p>
        </div>
        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/skills/create">
            <Plus className="size-4" />
            New Skill
          </Link>
        </Button>
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
            onClick={load}
            className="mt-2 inline-block text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      ) : skills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.03, ease: "easeOut" }}
            >
              <div
                className={cn(
                  "relative h-full rounded-[12px] bg-[--card] p-5 flex flex-col transition-colors duration-150",
                  "border border-border/50",
                  "hover:bg-foreground/[0.02] group"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" size="sm">{skill.category}</Badge>
                    <Badge variant="outline" size="sm">{skill.framework}</Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <Link
                      href={`/skills/${skill.id}/edit`}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-foreground/[0.06] transition-colors"
                      title="Edit"
                    >
                      <Pencil className="size-3.5 text-foreground/60" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(skill.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5 text-destructive/70" />
                    </button>
                  </div>
                </div>

                <Link href={`/skills/${skill.id}`} className="flex flex-col flex-1">
                  <h3 className="text-[14px] font-medium leading-[1.5] text-foreground mb-1.5">
                    {skill.name}
                  </h3>
                  <p className="text-[12px] leading-[1.6] text-foreground/60 mb-4 flex-grow line-clamp-2">
                    {skill.description}
                  </p>

                  <div className="flex items-center gap-3 text-[12px] text-foreground/40 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      {skill.avg_rating > 0 ? skill.avg_rating.toFixed(1) : "—"}
                      <span>({skill.review_count})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="size-3" />
                      {skill.installs.toLocaleString()}
                    </span>
                    <span>v{skill.version}</span>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-sm text-muted-foreground">You haven&apos;t published any skills yet.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/skills/create">
              <Plus className="size-4" />
              Create your first skill
            </Link>
          </Button>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete skill?"
        description="This action cannot be undone. The skill will be permanently removed."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
