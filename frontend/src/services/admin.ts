import { fetchAPI } from "@/services/api"
import { UserProfile } from "@/services/users"
import { PaginatedResponse } from "@/services/skills"

export interface AdminUserListParams {
  search?: string
  role?: "admin" | "user"
  sort?: string
  page?: number
  limit?: number
}

export async function getAdminUsers(
  params: AdminUserListParams = {}
): Promise<PaginatedResponse<UserProfile>> {
  const qs = new URLSearchParams()
  if (params.search) qs.set("search", params.search)
  if (params.role) qs.set("role", params.role)
  if (params.sort) qs.set("sort", params.sort)
  if (params.page) qs.set("page", String(params.page))
  if (params.limit) qs.set("limit", String(params.limit))
  const str = qs.toString()
  return fetchAPI(`/admin/users${str ? `?${str}` : ""}`)
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "user"
): Promise<UserProfile> {
  return fetchAPI(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  })
}
