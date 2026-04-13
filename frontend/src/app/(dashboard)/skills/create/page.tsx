"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { createSkill } from "@/services/skills"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

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

export default function CreateSkillPage() {
  const router = useRouter()

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !description || !category || !framework || !installCommand) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      const skill = await createSkill({
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
      toast.success("Skill created")
      router.push(`/skills/${skill.id}`)
    } catch {
      toast.error("Failed to create skill")
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <Breadcrumbs items={[
        { label: "Skills", href: "/skills" },
        { label: "New Skill" },
      ]} />
      <h1 className="text-2xl font-semibold tracking-tight -mt-4">New Skill</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Web Scraper"
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
            placeholder="Describe what this skill does…"
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
            placeholder="pip install my-skill"
            required
            className="font-mono text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Version</label>
          <Input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
          />
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
            {submitting ? "Creating…" : "Create Skill"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/skills">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
