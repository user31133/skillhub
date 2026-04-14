"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { getSkill, updateSkill, deleteSkill } from "@/services/skills"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { DeleteConfirmDialog } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Trash2 } from "lucide-react"

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

export default function EditSkillPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [framework, setFramework] = useState("")
  const [installCommand, setInstallCommand] = useState("")
  const [version, setVersion] = useState("1.0.0")
  const [repositoryUrl, setRepositoryUrl] = useState("")
  const [documentationUrl, setDocumentationUrl] = useState("")
  const [tags, setTags] = useState("")
  const [prompt, setPrompt] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const skill = await getSkill(id)
        if (user && skill.author_id !== user.id && user.role !== "admin") {
          router.replace(`/skills/${id}`)
          return
        }
        setName(skill.name)
        setDescription(skill.description)
        setCategory(skill.category)
        setFramework(skill.framework)
        setInstallCommand(skill.install_command)
        setVersion(skill.version)
        setRepositoryUrl(skill.repository_url ?? "")
        setDocumentationUrl(skill.documentation_url ?? "")
        setPrompt(skill.prompt ?? "")
        setTags(skill.tags?.join(", ") ?? "")
      } catch {
        toast.error("Failed to load skill")
        router.replace("/skills")
      } finally {
        setLoading(false)
      }
    }
    if (user !== undefined) load()
  }, [id, user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !description || !category || !framework || !installCommand) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      await updateSkill(id, {
        name,
        description,
        category,
        framework,
        install_command: installCommand,
        version: version || "1.0.0",
        repository_url: repositoryUrl || undefined,
        documentation_url: documentationUrl || undefined,
        prompt: prompt || undefined,
        tags: tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      })
      toast.success("Skill updated")
      router.push(`/skills/${id}`)
    } catch {
      toast.error("Failed to update skill")
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteSkill(id)
      toast.success("Skill deleted")
      router.push("/skills")
    } catch {
      toast.error("Failed to delete skill")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl flex flex-col gap-8">
        <Skeleton className="h-8 w-40 rounded-sm" />
        <div className="flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-20 rounded-sm" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <Breadcrumbs items={[
        { label: "Skills", href: "/skills" },
        { label: name || "Skill", href: `/skills/${id}` },
        { label: "Edit" },
      ]} />

      <div className="flex items-center justify-between gap-4 -mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Skill</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          <label className="text-sm font-medium">
            Description <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </label>
            <Combobox
              options={CATEGORIES.map((c) => ({
                value: c,
                label: c.charAt(0).toUpperCase() + c.slice(1),
              }))}
              value={category}
              onValueChange={setCategory}
              placeholder="Select category"
              searchPlaceholder="Search category…"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Framework <span className="text-destructive">*</span>
            </label>
            <Combobox
              options={FRAMEWORKS.map((f) => ({
                value: f,
                label: f.charAt(0).toUpperCase() + f.slice(1),
              }))}
              value={framework}
              onValueChange={setFramework}
              placeholder="Select framework"
              searchPlaceholder="Search framework…"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Install Command <span className="text-destructive">*</span>
          </label>
          <Input
            value={installCommand}
            onChange={(e) => setInstallCommand(e.target.value)}
            required
            className="font-mono text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Version</label>
          <Input value={version} onChange={(e) => setVersion(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Repository URL</label>
          <Input
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Documentation URL</label>
          <Input
            value={documentationUrl}
            onChange={(e) => setDocumentationUrl(e.target.value)}
            placeholder="https://docs.example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="System prompt or usage template for this skill"
            rows={5}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Tags</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="scraping, automation, browser (comma-separated)"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/skills/${id}`}>Cancel</Link>
          </Button>
        </div>
      </form>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete skill?"
        description="This action cannot be undone. The skill will be permanently removed."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
