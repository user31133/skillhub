import { fetchAPI } from "@/services/api"
import { UserRead } from "@/services/skills"

export interface ReviewRead {
  id: string
  rating: number
  comment: string
  skill_id: string
  user_id: string
  user: UserRead
  created_at: string
}

export async function getSkillReviews(skillId: string): Promise<ReviewRead[]> {
  return fetchAPI(`/reviews/skill/${skillId}`)
}

export async function createReview(
  skillId: string,
  data: { rating: number; comment: string }
): Promise<ReviewRead> {
  return fetchAPI(`/reviews/skill/${skillId}`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function deleteReview(reviewId: string): Promise<void> {
  return fetchAPI(`/reviews/${reviewId}`, { method: "DELETE" })
}
