from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from auth import get_current_user
from database import get_db
from models import Review, Skill, User
from schemas import ReviewCreate, ReviewRead

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("/skill/{skill_id}", response_model=list[ReviewRead])
async def get_skill_reviews(skill_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Skill).where(Skill.id == skill_id, Skill.is_deleted == False)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    result = await db.execute(
        select(Review)
        .where(Review.skill_id == skill_id)
        .options(joinedload(Review.user))
        .order_by(Review.created_at.desc())
    )
    return result.unique().scalars().all()


@router.post("/skill/{skill_id}", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    skill_id: str,
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Skill).where(Skill.id == skill_id, Skill.is_deleted == False)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    result = await db.execute(
        select(Review).where(Review.skill_id == skill_id, Review.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this skill",
        )

    review = Review(
        rating=review_data.rating,
        comment=review_data.comment,
        skill_id=skill_id,
        user_id=current_user.id,
    )
    db.add(review)
    await db.flush()

    await _recalculate_skill_rating(db, skill_id)

    result = await db.execute(
        select(Review)
        .where(Review.id == review.id)
        .options(joinedload(Review.user))
    )
    return result.scalar_one()


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this review")

    skill_id = review.skill_id
    await db.delete(review)
    await db.flush()

    await _recalculate_skill_rating(db, skill_id)


async def _recalculate_skill_rating(db: AsyncSession, skill_id: str):
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.skill_id == skill_id)
    )
    row = result.one()
    avg_rating = float(row[0]) if row[0] is not None else 0.0
    review_count = row[1]

    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one()
    skill.avg_rating = round(avg_rating, 2)
    skill.review_count = review_count
