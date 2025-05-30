"""Add full_name column to User model

Revision ID: 5a8ed9523992
Revises: 8e0d59b32139
Create Date: 2025-03-03 00:37:58.232310

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a8ed9523992'
down_revision = '8e0d59b32139'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('full_name', sa.String(length=120), nullable=False))
        batch_op.add_column(sa.Column('last_email_sent', sa.DateTime(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('last_email_sent')
        batch_op.drop_column('full_name')

    # ### end Alembic commands ###
