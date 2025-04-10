import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+mysqlconnector://root:12345678@localhost/mentor_dashboard')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default_jwt_secret_key')
    SECURITY_TOKEN_SALT = os.getenv('SECURITY_TOKEN_SALT', 'email-verification-salt')

    # CORS Configuration
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:8081')

    # Email Configuration
    EMAIL_SENDER = os.getenv('EMAIL_SENDER', 'niencongchua@gmail.com')

    # Server Configuration
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')

    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')