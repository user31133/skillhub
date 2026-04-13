from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models import Skill, User
from schemas import UserProfile, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserProfile)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(func.count(Skill.id)).where(
            Skill.author_id == current_user.id,
            Skill.is_deleted == False,
        )
    )
    skill_count = result.scalar_one()

    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        created_at=current_user.created_at,
        skill_count=skill_count,
    )


@router.patch("/me", response_model=UserProfile)
async def update_profile(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_fields = user_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(current_user, field, value)

    await db.flush()
    await db.refresh(current_user)

    result = await db.execute(
        select(func.count(Skill.id)).where(
            Skill.author_id == current_user.id,
            Skill.is_deleted == False,
        )
    )
    skill_count = result.scalar_one()

    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        created_at=current_user.created_at,
        skill_count=skill_count,
    )


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    count_result = await db.execute(
        select(func.count(Skill.id)).where(
            Skill.author_id == user.id,
            Skill.is_deleted == False,
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
