"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { getSkill, deleteSkill, SkillRead } from "@/services/skills"
import { getSkillReviews, createReview, deleteReview, ReviewRead } from "@/services/reviews"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StarRating, RatingStars } from "@/components/ui/star-rating"
import { DeleteConfirmDialog } from "@/components/ui/alert-dialog"
import { CossAvatar } from "@/components/ui/coss-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Download, Copy, Check, Pencil, Trash2 } from "lucide-react"

function SkillDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-64 rounded-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-5 w-20 rounded-sm" />
        </div>
        <Skeleton className="h-4 w-48 rounded-sm" />
        <Skeleton className="h-4 w-32 rounded-sm" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-sm" />
        <Skeleton className="h-9 w-24 rounded-sm" />
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-muted transition-colors duration-150"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" />
      ) : (
        <Copy className="size-4 text-muted-foreground" />
      )}
    </button>
  )
}

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [skill, setSkill] = useState<SkillRead | null>(null)
  const [reviews, setReviews] = useState<ReviewRead[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteSkillOpen, setDeleteSkillOpen] = useState(false)
  const [deletingSkill, setDeletingSkill] = useState(false)

  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null)
  const [deletingReview, setDeletingReview] = useState(false)

  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [skillData, reviewsData] = await Promise.all([
          getSkill(id),
          getSkillReviews(id),
        ])
        setSkill(skillData)
        setReviews(reviewsData)
      } catch {
        toast.error("Failed to load skill")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleDeleteSkill() {
    setDeletingSkill(true)
    try {
      await deleteSkill(id)
      toast.success("Skill deleted")
      router.push("/skills")
    } catch {
      toast.error("Failed to delete skill")
      setDeletingSkill(false)
      setDeleteSkillOpen(false)
    }
  }

  async function handleSubmitReview() {
    if (!reviewRating) {
      toast.error("Please select a rating")
      return
    }
    if (!reviewComment.trim()) {
      toast.error("Please enter a comment")
      return
    }
    setSubmittingReview(true)
    try {
      const newReview = await createReview(id, { rating: reviewRating, comment: reviewComment })
      setReviews((prev) => [newReview, ...prev])
      setReviewRating(0)
      setReviewComment("")
      toast.success("Review submitted")
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleDeleteReview() {
    if (!deleteReviewId) return
    setDeletingReview(true)
    try {
      await deleteReview(deleteReviewId)
      setReviews((prev) => prev.filter((r) => r.id !== deleteReviewId))
      toast.success("Review deleted")
    } catch {
      toast.error("Failed to delete review")
    } finally {
      setDeletingReview(false)
      setDeleteReviewId(null)
    }
  }

  if (loading) return <SkillDetailSkeleton />

  if (!skill) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Skill not found.</p>
        <Link href="/skills" className="mt-2 inline-block text-sm underline underline-offset-2">
          Back to skills
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === skill.author_id
  const hasReviewed = reviews.some((r) => r.user_id === user?.id)
  const canReview = !!user && !isOwner && !hasReviewed

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <Breadcrumbs items={[
        { label: "Skills", href: "/skills" },
        { label: skill.name },
      ]} />

      {/* Header */}
      <div className="flex flex-col gap-4 -mt-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{skill.name}</h1>
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/skills/${id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteSkillOpen(true)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" size="sm">
            {skill.category}
          </Badge>
          <Badge variant="outline" size="sm">
            {skill.framework}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={skill.avg_rating} stars={5} />
            <span className="tabular-nums font-medium text-foreground">
              {skill.avg_rating.toFixed(1)}
            </span>
            <span className="tabular-nums">({skill.review_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="size-4 shrink-0" />
            <span className="tabular-nums">{skill.installs.toLocaleString()}</span>
          </div>
          <Link
            href={`/users/${skill.author_id}`}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-150"
          >
            <CossAvatar
              src={skill.author.avatar_url}
              alt={skill.author.name}
              className="size-6"
            />
            <span>{skill.author.name}</span>
          </Link>
        </div>
      </div>

      {/* Install command */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-[#070707] border px-4 py-3 font-mono text-sm">
        <code className="text-foreground/90 flex-1 overflow-x-auto">
          {skill.install_command}
        </code>
        <CopyButton text={skill.install_command} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({skill.review_count})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {skill.description}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Version</dt>
              <dd className="font-medium tabular-nums">{skill.version}</dd>
            </div>
            {skill.repository_url && (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Repository</dt>
                <dd>
                  <a
                    href={skill.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground transition-colors duration-150 break-all"
                  >
                    {skill.repository_url}
                  </a>
                </dd>
              </div>
            )}
            {skill.documentation_url && (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Documentation</dt>
                <dd>
                  <a
                    href={skill.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground transition-colors duration-150 break-all"
                  >
                    {skill.documentation_url}
                  </a>
                </dd>
              </div>
            )}
            {skill.tags && skill.tags.length > 0 && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Tags</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {skill.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 flex flex-col gap-6">
          {canReview && (
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
              <p className="text-sm font-medium">Leave a review</p>
              <StarRating
                value={reviewRating}
                size="md"
                onRatingChange={setReviewRating}
              />
              <Textarea
                placeholder="Share your experience…"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
              <Button
                size="sm"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="self-start"
              >
                {submittingReview ? "Submitting…" : "Submit Review"}
              </Button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/users/${review.user_id}`} className="flex items-center gap-2 hover:text-foreground transition-colors duration-150">
                        <CossAvatar
                          src={review.user.avatar_url}
                          alt={review.user.name}
                          className="size-6"
                        />
                        <span className="text-sm font-medium">{review.user.name}</span>
                      </Link>
                      <RatingStars rating={review.rating} stars={5} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {user?.id === review.user_id && (
                        <button
                          onClick={() => setDeleteReviewId(review.id)}
                          className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"
                          aria-label="Delete review"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DeleteConfirmDialog
        open={deleteSkillOpen}
        onOpenChange={setDeleteSkillOpen}
        title="Delete skill?"
        description="This action cannot be undone. The skill will be permanently removed."
        onConfirm={handleDeleteSkill}
        loading={deletingSkill}
      />

      <DeleteConfirmDialog
        open={!!deleteReviewId}
        onOpenChange={(open) => { if (!open) setDeleteReviewId(null) }}
        title="Delete review?"
        description="This action cannot be undone."
        onConfirm={handleDeleteReview}
        loading={deletingReview}
      />
    </div>
  )
}
