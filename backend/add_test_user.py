from app import app
from models import db, User

with app.app_context():
    # Check if test user already exists
    test_user = User.query.filter_by(email='test@example.com').first()
    
    if test_user:
        print(f"Test user already exists: ID: {test_user.id}, Email: {test_user.email}, Role: {test_user.role}")
    else:
        # Create a new test user
        new_user = User(
            full_name='Test User',
            email='test@example.com',
            role='teacher',
            is_active=True
        )
        new_user.set_password('password123')
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"Created new test user: ID: {new_user.id}, Email: {new_user.email}, Role: {new_user.role}")
