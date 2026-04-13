import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class SkillCategory(str, enum.Enum):
    BROWSER = "browser"
    DATABASE = "database"
    API = "api"
    DEVTOOLS = "devtools"
    AI = "ai"
    CLOUD = "cloud"
    MESSAGING = "messaging"
    FILE = "file"
    ANALYTICS = "analytics"


class SkillFramework(str, enum.Enum):
    LANGCHAIN = "langchain"
    CREWAI = "crewai"
    AUTOGEN = "autogen"
    CUSTOM = "custom"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    OTHER = "other"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    role: Mapped[str] = mapped_column(Enum(UserRole), default=UserRole.USER)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now(), nullable=True)

    skills: Mapped[list["Skill"]] = relationship(back_populates="author", lazy="noload")
    reviews: Mapped[list["Review"]] = relationship(back_populates="user", lazy="noload")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(Enum(SkillCategory))
    framework: Mapped[str] = mapped_column(Enum(SkillFramework))
    install_command: Mapped[str] = mapped_column(String(500))
    prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    repository_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    documentation_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    icon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    version: Mapped[str] = mapped_column(String(50), default="1.0.0")
    installs: Mapped[int] = mapped_column(Integer, default=0)
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    author_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now(), nullable=True)

    author: Mapped["User"] = relationship(back_populates="skills", lazy="noload")
    reviews: Mapped[list["Review"]] = relationship(back_populates="skill", lazy="noload")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("skill_id", "user_id", name="uq_review_skill_user"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text)
    skill_id: Mapped[str] = mapped_column(String(36), ForeignKey("skills.id"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    skill: Mapped["Skill"] = relationship(back_populates="reviews", lazy="noload")
    user: Mapped["User"] = relationship(back_populates="reviews", lazy="noload")
