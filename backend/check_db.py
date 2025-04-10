from app import app
from models import db, User

with app.app_context():
    users = User.query.all()
    print("Users in database:")
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")
