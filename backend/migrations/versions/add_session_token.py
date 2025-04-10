"""Add session_token column to User table

Revision ID: add_session_token
Revises: 
Create Date: 2025-04-09 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_session_token'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('User', sa.Column('session_token', sa.String(64), nullable=True))

def downgrade():
    op.drop_column('User', 'session_token')
