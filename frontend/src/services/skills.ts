import { fetchAPI } from "@/services/api"

export interface UserRead {
  id: string
  email: string
  name: string
  bio?: string
  avatar_url?: string
  role: string
  created_at: string
}

export interface SkillRead {
  id: string
  name: string
  description: string
  category: string
  framework: string
  install_command: string
  prompt?: string
  repository_url?: string
  documentation_url?: string
  icon_url?: string
  version: string
  installs: number
  avg_rating: number
  review_count: number
  tags?: string[]
  author_id: string
  author: UserRead
  created_at: string
  updated_at?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface SkillCreate {
  name: string
  description: string
  category: string
  framework: string
  install_command: string
  prompt?: string
  version?: string
  repository_url?: string
  documentation_url?: string
  tags?: string[]
}

export interface SkillUpdate {
  name?: string
  description?: string
  category?: string
  framework?: string
  install_command?: string
  prompt?: string
  version?: string
  repository_url?: string
  documentation_url?: string
  tags?: string[]
}

export interface GetSkillsParams {
  search?: string
  category?: string
  framework?: string
  author_id?: string
  sort?: string
  page?: number
  limit?: number
}

export async function getSkills(params: GetSkillsParams = {}): Promise<PaginatedResponse<SkillRead>> {
  const qs = new URLSearchParams()
  if (params.search) qs.set("search", params.search)
  if (params.category) qs.set("category", params.category)
  if (params.framework) qs.set("framework", params.framework)
  if (params.author_id) qs.set("author_id", params.author_id)
  if (params.sort) qs.set("sort", params.sort)
  if (params.page) qs.set("page", String(params.page))
  if (params.limit) qs.set("limit", String(params.limit))
  const query = qs.toString()
  return fetchAPI(`/skills${query ? `?${query}` : ""}`)
}

export async function getMySkills(): Promise<SkillRead[]> {
  return fetchAPI("/skills/my")
}

export async function getSkill(id: string): Promise<SkillRead> {
  return fetchAPI(`/skills/${id}`)
}

export async function createSkill(data: SkillCreate): Promise<SkillRead> {
  return fetchAPI("/skills", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateSkill(id: string, data: SkillUpdate): Promise<SkillRead> {
  return fetchAPI(`/skills/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteSkill(id: string): Promise<void> {
  return fetchAPI(`/skills/${id}`, { method: "DELETE" })
}
