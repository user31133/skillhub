"""add prompt to skills

Revision ID: a3f2d8c91e47
Revises: c54a1b6e5803
Create Date: 2026-04-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "a3f2d8c91e47"
down_revision = "c54a1b6e5803"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("skills", sa.Column("prompt", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("skills", "prompt")
