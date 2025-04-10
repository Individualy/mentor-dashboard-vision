from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, timezone
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(36), nullable=True)  # Will store 8-digit code for email verification
    token_expiry = db.Column(db.DateTime, nullable=True)
    last_email_sent = db.Column(db.DateTime, nullable=True)
    session_token = db.Column(db.String(128), nullable=True)  # For secure verification sessions

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def generate_verification_token(self):
        # Generate a random 8-digit code
        self.verification_token = f"{uuid.uuid4().int % 100000000:08d}"
        # Generate a secure session token (shorter version)
        self.session_token = str(uuid.uuid4())
        self.token_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)

class Class(db.Model):
    __tablename__ = 'Class'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    teacher = db.relationship('User', backref=db.backref('classes', lazy=True))

class Meeting(db.Model):
    __tablename__ = 'Meeting'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    link = db.Column(db.String(255), nullable=True)
    class_id = db.Column(db.Integer, db.ForeignKey('Class.id'), nullable=False)
    classroom = db.relationship('Class', backref=db.backref('meetings', lazy=True))

class StudentClass(db.Model):
    __tablename__ = 'StudentClass'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('Class.id'), nullable=False)
    student = db.relationship('User', backref=db.backref('student_classes', lazy=True))
    classroom = db.relationship('Class', backref=db.backref('student_classes', lazy=True))