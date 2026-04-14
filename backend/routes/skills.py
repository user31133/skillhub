import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from auth import get_current_user
from database import get_db
from models import SavedSkill, Skill, SkillCategory, SkillFramework, User, UserRole
from schemas import PaginatedResponse, SkillCreate, SkillRead, SkillUpdate

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("/", response_model=PaginatedResponse[SkillRead])
async def list_skills(
    search: str | None = Query(None),
    category: SkillCategory | None = Query(None),
    framework: SkillFramework | None = Query(None),
    author_id: str | None = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    base_conditions = [Skill.is_deleted == False]

    if author_id:
        base_conditions.append(Skill.author_id == author_id)
    if search:
        escaped = search.replace("%", "\\%").replace("_", "\\_")
        base_conditions.append(
            or_(Skill.name.ilike(f"%{escaped}%"), Skill.description.ilike(f"%{escaped}%"))
        )
    if category:
        base_conditions.append(Skill.category == category)
    if framework:
        base_conditions.append(Skill.framework == framework)

    count_query = select(func.count()).select_from(Skill).where(*base_conditions)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    query = select(Skill).options(joinedload(Skill.author)).where(*base_conditions)

    sort_options = {
        "newest": Skill.created_at.desc(),
        "popular": Skill.installs.desc(),
        "top_rated": Skill.avg_rating.desc(),
        "name": Skill.name.asc(),
    }
    query = query.order_by(sort_options.get(sort, Skill.created_at.desc()))

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    skills = result.unique().scalars().all()

    return PaginatedResponse(
        items=skills,
        total=total,
        page=page,
        limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 0,
    )


@router.get("/my", response_model=list[SkillRead])
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Skill)
        .options(joinedload(Skill.author))
        .where(Skill.author_id == current_user.id, Skill.is_deleted == False)
        .order_by(Skill.created_at.desc())
    )
    result = await db.execute(query)
    return result.unique().scalars().all()


@router.get("/saved", response_model=list[SkillRead])
async def get_saved_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Skill)
        .join(SavedSkill, SavedSkill.skill_id == Skill.id)
        .options(joinedload(Skill.author))
        .where(SavedSkill.user_id == current_user.id, Skill.is_deleted == False)
        .order_by(SavedSkill.created_at.desc())
    )
    result = await db.execute(query)
    return result.unique().scalars().all()


@router.get("/saved/ids", response_model=list[str])
async def get_saved_skill_ids(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(SavedSkill.skill_id).where(SavedSkill.user_id == current_user.id)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/{skill_id}/save", status_code=status.HTTP_201_CREATED)
async def save_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    skill_query = select(Skill).where(Skill.id == skill_id, Skill.is_deleted == False)
    skill_result = await db.execute(skill_query)
    if not skill_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    existing_query = select(SavedSkill).where(
        SavedSkill.user_id == current_user.id, SavedSkill.skill_id == skill_id
    )
    existing = await db.execute(existing_query)
    if existing.scalar_one_or_none():
        return {"saved": True}

    db.add(SavedSkill(user_id=current_user.id, skill_id=skill_id))
    await db.flush()
    return {"saved": True}


@router.delete("/{skill_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(SavedSkill).where(
        SavedSkill.user_id == current_user.id, SavedSkill.skill_id == skill_id
    )
    result = await db.execute(query)
    saved = result.scalar_one_or_none()
    if saved:
        await db.delete(saved)
        await db.flush()


@router.get("/{skill_id}", response_model=SkillRead)
async def get_skill(
    skill_id: str,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Skill)
        .options(joinedload(Skill.author))
        .where(Skill.id == skill_id, Skill.is_deleted == False)
    )
    result = await db.execute(query)
    skill = result.unique().scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return skill


@router.post("/", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
async def create_skill(
    data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    skill = Skill(**data.model_dump(), author_id=current_user.id)
    db.add(skill)
    await db.flush()
    await db.refresh(skill)

    query = select(Skill).options(joinedload(Skill.author)).where(Skill.id == skill.id)
    result = await db.execute(query, execution_options={"populate_existing": True})
    return result.unique().scalar_one()


@router.put("/{skill_id}", response_model=SkillRead)
async def update_skill(
    skill_id: str,
    data: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Skill).where(Skill.id == skill_id, Skill.is_deleted == False)
    result = await db.execute(query)
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    if skill.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this skill")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)

    await db.flush()
    await db.refresh(skill)

    reload_query = select(Skill).options(joinedload(Skill.author)).where(Skill.id == skill.id)
    reload_result = await db.execute(reload_query, execution_options={"populate_existing": True})
    return reload_result.unique().scalar_one()


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Skill).where(Skill.id == skill_id, Skill.is_deleted == False)
    result = await db.execute(query)
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    if skill.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this skill")

    skill.is_deleted = True
    await db.flush()
