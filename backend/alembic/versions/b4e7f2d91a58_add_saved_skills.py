"""add saved_skills table

Revision ID: b4e7f2d91a58
Revises: a3f2d8c91e47
Create Date: 2026-04-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "b4e7f2d91a58"
down_revision = "a3f2d8c91e47"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "saved_skills",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("skill_id", sa.String(length=36), sa.ForeignKey("skills.id"), nullable=False, index=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "skill_id", name="uq_saved_user_skill"),
    )


def downgrade() -> None:
    op.drop_table("saved_skills")
