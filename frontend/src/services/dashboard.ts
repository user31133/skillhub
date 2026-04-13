import { fetchAPI } from "@/services/api"
import { SkillRead } from "@/services/skills"

export interface DashboardStats {
  total_skills: number
  total_installs: number
  avg_rating: number
  total_users: number
  skills_by_category: { category: string; count: number }[]
  recent_skills: SkillRead[]
  top_skills: SkillRead[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI("/dashboard/stats")
}
