import { fetchAPI } from "@/services/api"

export interface UserProfile {
  id: string
  email: string
  name: string
  bio?: string
  avatar_url?: string
  role: string
  created_at: string
  skill_count: number
}

export async function updateProfile(data: {
  name?: string
  bio?: string
  avatar_url?: string
}): Promise<UserProfile> {
  return fetchAPI("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  return fetchAPI(`/users/${id}`)
}
