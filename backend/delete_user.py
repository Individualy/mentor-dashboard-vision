from models import db, User
from app import app

with app.app_context():
    user = User.query.filter_by(email='niencongchua@gmail.com').first()
    if user:
        db.session.delete(user)
        db.session.commit()
        print(f"User {user.email} deleted successfully.")
    else:
        print("User not found.")