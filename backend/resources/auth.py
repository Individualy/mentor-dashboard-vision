import json
import logging
import base64
import uuid
from datetime import datetime, timedelta
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import create_access_token
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.mime.text import MIMEText
from models import db, User
from utils.email import send_reset_password_email, send_verification_email

logging.basicConfig(level=logging.DEBUG)

# Load Gmail API credentials
with open('./resources/api/gmail.json') as f:
    gmail_credentials = json.load(f)

class SignUp(Resource):
    def post(self):
        data = request.get_json()
        logging.debug(f"Received data: {data}")

        full_name = data.get('fullName')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if role not in ['Teacher', 'Student']:
            logging.debug("Invalid role")
            return {'message': 'Invalid role'}, 400

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            if existing_user.is_active:
                logging.debug("Email already exists and is active")
                return {'message': 'Email already exists and is active. Please use a different email.'}, 400
            else:
                # Overwrite the existing user
                existing_user.full_name = full_name
                existing_user.set_password(password)
                existing_user.role = role
                existing_user.verification_token = str(uuid.uuid4())
                existing_user.token_expiry = datetime.utcnow() + timedelta(minutes=10)
                db.session.commit()
                send_verification_email(email, existing_user.verification_token)
                return {'message': 'Verification email sent, please check your email'}, 201
        else:
            user = User(
                full_name=full_name,
                email=email,
                role=role,
            )
            user.set_password(password)
            user.verification_token = str(uuid.uuid4())
            user.token_expiry = datetime.utcnow() + timedelta(minutes=10)
            db.session.add(user)
            db.session.commit()
            send_verification_email(email, user.verification_token)
            return {'message': 'Verification email sent, please check your email'}, 201

class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password) and user.is_active:
            access_token = create_access_token(identity=user.id)
            return {'access_token': access_token}, 200
        return {'message': 'Invalid credentials or inactive account'}, 401

class CheckEmail(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        user = User.query.filter_by(email=email).first()
        if user:
            logging.debug(f"Email: {email}. \nis_active: {user.is_active}")
            return {'exists': True, 'is_active': user.is_active}, 200
        return {'exists': False, 'is_active': False}, 200

class VerifyEmail(Resource):
    def get(self):
        token = request.args.get('token')
        user = User.query.filter_by(verification_token=token).first()
        if user and user.token_expiry > datetime.utcnow():
            user.is_active = True
            user.verification_token = None
            user.token_expiry = None
            db.session.commit()
            return {'message': 'Email verified successfully'}, 200
        return {'message': 'Invalid or expired token'}, 400

class ForgotPassword(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')

        logging.debug(f"Received forgot password request for email: {email}")

        user = User.query.filter_by(email=email).first()
        if not user:
            logging.debug("Email does not exist")
            return {'message': 'Email does not exist'}, 404

        current_time = datetime.utcnow()
        if user.last_email_sent and (current_time - user.last_email_sent).total_seconds() < 60:
            logging.debug("Please wait before requesting another email")
            return {'message': 'Please wait before requesting another email'}, 429

        reset_token = str(uuid.uuid4())
        token_expiry = datetime.utcnow() + timedelta(hours=1)

        # Store the reset token and expiry in the user's record
        user.verification_token = reset_token
        user.token_expiry = token_expiry
        user.last_email_sent = current_time
        db.session.commit()

        send_reset_password_email(email, reset_token)
        logging.debug("Password reset email sent")
        return {'message': 'Password reset email sent'}, 200

class VerifyResetToken(Resource):
    def get(self):
        token = request.args.get('token')
        logging.debug(f"Received token for verification: {token}")
        user = User.query.filter_by(verification_token=token).first()
        if user:
            logging.debug(f"Found user with token: {user.email}")
            if user.token_expiry > datetime.utcnow():
                logging.debug("Token is valid")
                return {'valid': True}, 200
            else:
                logging.debug("Token has expired")
        else:
            logging.debug("No user found with the provided token")
        return {'valid': False}, 400

class ResetPassword(Resource):
    def post(self):
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')

        logging.debug(f"Received token for password reset: {token}")
        user = User.query.filter_by(verification_token=token).first()
        if user:
            logging.debug(f"Found user with token: {user.email}")
            if user.token_expiry > datetime.utcnow():
                user.set_password(new_password)
                user.verification_token = None
                user.token_expiry = None
                db.session.commit()
                logging.debug("Password reset successfully")
                return {'message': 'Password reset successfully'}, 200
            else:
                logging.debug("Token has expired")
        else:
            logging.debug("No user found with the provided token")
        return {'message': 'Invalid or expired token'}, 400