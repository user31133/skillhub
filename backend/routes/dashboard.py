from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from auth import get_current_user
from database import get_db
from models import Skill, User
from schemas import CategoryCount, DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(
            func.count(Skill.id),
            func.coalesce(func.sum(Skill.installs), 0),
        ).where(Skill.is_deleted == False)
    )
    row = result.one()
    total_skills = row[0]
    total_installs = int(row[1])

    result = await db.execute(
        select(func.avg(Skill.avg_rating)).where(
            Skill.is_deleted == False,
            Skill.review_count > 0,
        )
    )
    avg_val = result.scalar_one()
    avg_rating = round(float(avg_val), 2) if avg_val is not None else 0.0

    result = await db.execute(select(func.count(User.id)))
    total_users = result.scalar_one()

    result = await db.execute(
        select(Skill.category, func.count(Skill.id))
        .where(Skill.is_deleted == False)
        .group_by(Skill.category)
    )
    skills_by_category = [
        CategoryCount(category=row[0].value if hasattr(row[0], "value") else row[0], count=row[1])
        for row in result.all()
    ]

    result = await db.execute(
        select(Skill)
        .where(Skill.is_deleted == False)
        .options(joinedload(Skill.author))
        .order_by(Skill.created_at.desc())
        .limit(5)
    )
    recent_skills = result.unique().scalars().all()

    result = await db.execute(
        select(Skill)
        .where(Skill.is_deleted == False)
        .options(joinedload(Skill.author))
        .order_by(Skill.installs.desc())
        .limit(5)
    )
    top_skills = result.unique().scalars().all()

    return DashboardStats(
        total_skills=total_skills,
        total_installs=total_installs,
        avg_rating=avg_rating,
        total_users=total_users,
        skills_by_category=skills_by_category,
        recent_skills=recent_skills,
        top_skills=top_skills,
    )
