from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, EmailStr, Field

from models import SkillCategory, SkillFramework

T = TypeVar("T")


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=6, max_length=100)


class UserRead(BaseModel):
    id: str
    email: str
    name: str
    bio: str | None = None
    avatar_url: str | None = None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    bio: str | None = Field(None, max_length=500)
    avatar_url: str | None = Field(None, max_length=500)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class SkillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    category: SkillCategory
    framework: SkillFramework
    install_command: str = Field(min_length=1, max_length=500)
    prompt: str | None = None
    repository_url: str | None = Field(None, max_length=500)
    documentation_url: str | None = Field(None, max_length=500)
    icon_url: str | None = Field(None, max_length=500)
    version: str = Field(default="1.0.0", max_length=50)
    tags: list[str] | None = None


class SkillRead(BaseModel):
    id: str
    name: str
    description: str
    category: SkillCategory
    framework: SkillFramework
    install_command: str
    prompt: str | None = None
    repository_url: str | None = None
    documentation_url: str | None = None
    icon_url: str | None = None
    version: str
    installs: int
    avg_rating: float
    review_count: int
    tags: list[str] | None = None
    author_id: str
    author: UserRead
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class SkillUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    category: SkillCategory | None = None
    framework: SkillFramework | None = None
    install_command: str | None = Field(None, max_length=500)
    prompt: str | None = None
    repository_url: str | None = Field(None, max_length=500)
    documentation_url: str | None = Field(None, max_length=500)
    icon_url: str | None = Field(None, max_length=500)
    version: str | None = Field(None, max_length=50)
    tags: list[str] | None = None


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1)


class ReviewRead(BaseModel):
    id: str
    rating: int
    comment: str
    skill_id: str
    user_id: str
    user: UserRead
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(UserRead):
    skill_count: int


class CategoryCount(BaseModel):
    category: str
    count: int


class DashboardStats(BaseModel):
    total_skills: int
    total_installs: int
    avg_rating: float
    total_users: int
    skills_by_category: list[CategoryCount]
    recent_skills: list[SkillRead]
    top_skills: list[SkillRead]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int
