import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models import Skill, User, UserRole
from schemas import PaginatedResponse, UserProfile

router = APIRouter(prefix="/api/admin", tags=["Admin"])


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


class RoleUpdate(BaseModel):
    role: UserRole


@router.get("/users", response_model=PaginatedResponse[UserProfile])
async def list_users(
    search: str | None = Query(None),
    role: UserRole | None = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    skill_count_sq = (
        select(Skill.author_id, func.count(Skill.id).label("skill_count"))
        .where(Skill.is_deleted == False)
        .group_by(Skill.author_id)
        .subquery()
    )

    conditions = []
    if role:
        conditions.append(User.role == role)
    if search:
        escaped = search.replace("%", "\\%").replace("_", "\\_")
        conditions.append(
            or_(User.name.ilike(f"%{escaped}%"), User.email.ilike(f"%{escaped}%"))
        )

    count_query = select(func.count()).select_from(User).where(*conditions)
    total = (await db.execute(count_query)).scalar() or 0

    query = (
        select(User, func.coalesce(skill_count_sq.c.skill_count, 0).label("skill_count"))
        .outerjoin(skill_count_sq, skill_count_sq.c.author_id == User.id)
        .where(*conditions)
    )

    sort_options = {
        "newest": User.created_at.desc(),
        "oldest": User.created_at.asc(),
        "name_asc": User.name.asc(),
        "name_desc": User.name.desc(),
        "email_asc": User.email.asc(),
        "email_desc": User.email.desc(),
        "skills_desc": func.coalesce(skill_count_sq.c.skill_count, 0).desc(),
        "skills_asc": func.coalesce(skill_count_sq.c.skill_count, 0).asc(),
    }
    query = query.order_by(sort_options.get(sort, User.created_at.desc()))

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    items = [
        UserProfile(
            id=u.id,
            email=u.email,
            name=u.name,
            bio=u.bio,
            avatar_url=u.avatar_url,
            role=u.role,
            created_at=u.created_at,
            skill_count=sc,
        )
        for u, sc in rows
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 0,
    )


@router.patch("/users/{user_id}/role", response_model=UserProfile)
async def update_user_role(
    user_id: str,
    data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own role")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = data.role
    await db.flush()
    await db.refresh(user)

    count_result = await db.execute(
        select(func.count(Skill.id)).where(
            Skill.author_id == user.id, Skill.is_deleted == False
        )
    )
    skill_count = count_result.scalar_one()

    return UserProfile(
        id=user.id,
        email=user.email,
        name=user.name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        role=user.role,
        created_at=user.created_at,
        skill_count=skill_count,
    )


