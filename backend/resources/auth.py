import json
import logging
import base64
import uuid
from datetime import datetime, timedelta, timezone
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

# Gmail credentials are now loaded in utils/email.py

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
                existing_user.generate_verification_token()
                # Token expiry is set in generate_verification_token method
                db.session.commit()
                send_verification_email(email, existing_user.verification_token)
                return {
                    'message': 'Verification email sent, please check your email',
                    'session_token': existing_user.session_token
                }, 201
        else:
            user = User(
                full_name=full_name,
                email=email,
                role=role,
            )
            user.set_password(password)
            user.generate_verification_token()
            # Token expiry is set in generate_verification_token method
            db.session.add(user)
            db.session.commit()
            send_verification_email(email, user.verification_token)
            return {
                'message': 'Verification email sent, please check your email',
                'session_token': user.session_token
            }, 201

class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password) and user.is_active:
            # Create JWT token with user ID as identity
            try:
                # Convert user.id to string to avoid 'Subject must be a string' error
                access_token = create_access_token(identity=str(user.id))
                logging.info(f"Generated token for user {user.id}")
                return {'access_token': access_token}, 200
            except Exception as e:
                logging.error(f"Error creating access token: {str(e)}")
                return {'message': f'Error creating token: {str(e)}'}, 500
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
        if user and user.token_expiry:
            current_time = datetime.now(timezone.utc)
            # Ensure token_expiry is timezone-aware
            if user.token_expiry.tzinfo is None:
                # Convert naive datetime to aware datetime
                token_expiry_aware = user.token_expiry.replace(tzinfo=timezone.utc)
            else:
                token_expiry_aware = user.token_expiry

            if token_expiry_aware > current_time:
                user.is_active = True
                user.verification_token = None
                user.token_expiry = None
                db.session.commit()
                return {'message': 'Email verified successfully'}, 200
        return {'message': 'Invalid or expired token'}, 400

    def post(self):
        try:
            data = request.get_json()
            code = data.get('code')
            email = data.get('email')
            session_token = data.get('session_token')

            logging.debug(f"Received verification request: email={email}, code={code}, session_token={session_token}")

            if not code or not email:
                return {'message': 'Email and verification code are required'}, 400

            # First try with session token if provided
            if session_token:
                user = User.query.filter_by(email=email, verification_token=code, session_token=session_token).first()
                if user:
                    # Check if token_expiry exists and is valid
                    if user.token_expiry:
                        current_time = datetime.now(timezone.utc)
                        # Ensure token_expiry is timezone-aware
                        if user.token_expiry.tzinfo is None:
                            # Convert naive datetime to aware datetime
                            token_expiry_aware = user.token_expiry.replace(tzinfo=timezone.utc)
                        else:
                            token_expiry_aware = user.token_expiry

                        logging.debug(f"Token expiry: {token_expiry_aware}, Current time: {current_time}")
                        if token_expiry_aware > current_time:
                            user.is_active = True
                            user.verification_token = None
                            user.token_expiry = None
                            user.session_token = None
                            db.session.commit()
                            logging.debug(f"Email verified successfully with session token: {email}")
                            return {'message': 'Email verified successfully'}, 200
                        else:
                            logging.debug(f"Token expired for user: {email}")
                    else:
                        logging.debug(f"No token expiry for user: {email}")

            # If no session token or verification failed, try without session token
            user = User.query.filter_by(email=email, verification_token=code).first()
            if user:
                # Check if token_expiry exists and is valid
                if user.token_expiry:
                    current_time = datetime.now(timezone.utc)
                    # Ensure token_expiry is timezone-aware
                    if user.token_expiry.tzinfo is None:
                        # Convert naive datetime to aware datetime
                        token_expiry_aware = user.token_expiry.replace(tzinfo=timezone.utc)
                    else:
                        token_expiry_aware = user.token_expiry

                    logging.debug(f"Token expiry: {token_expiry_aware}, Current time: {current_time}")
                    if token_expiry_aware > current_time:
                        user.is_active = True
                        user.verification_token = None
                        user.token_expiry = None
                        user.session_token = None
                        db.session.commit()
                        logging.debug(f"Email verified successfully without session token: {email}")
                        return {'message': 'Email verified successfully'}, 200
                    else:
                        logging.debug(f"Token expired for user: {email}")
                else:
                    logging.debug(f"No token expiry for user: {email}")

            logging.debug(f"Verification failed for email: {email}")
            return {'message': 'Invalid or expired verification code'}, 400

        except Exception as e:
            logging.error(f"Error during email verification: {str(e)}")
            return {'message': 'An error occurred during verification. Please try again.'}, 500

class ForgotPassword(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')

        logging.debug(f"Received forgot password request for email: {email}")

        user = User.query.filter_by(email=email).first()
        if not user:
            logging.debug("Email does not exist")
            return {'message': 'Email does not exist'}, 404

        current_time = datetime.now(timezone.utc)
        if user.last_email_sent and (current_time - user.last_email_sent).total_seconds() < 60:
            logging.debug("Please wait before requesting another email")
            return {'message': 'Please wait before requesting another email'}, 429

        # Generate a random 8-digit code for password reset
        reset_token = f"{uuid.uuid4().int % 100000000:08d}"
        token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)

        # Store the reset token and expiry in the user's record
        user.verification_token = reset_token
        user.token_expiry = token_expiry
        user.last_email_sent = current_time
        db.session.commit()

        send_reset_password_email(email, reset_token)
        logging.debug("Password reset email sent")
        return {
            'message': 'Password reset email sent',
            'session_token': user.session_token
        }, 200

class VerifyResetToken(Resource):
    def get(self):
        token = request.args.get('token')
        logging.debug(f"Received token for verification: {token}")
        user = User.query.filter_by(verification_token=token).first()
        if user:
            logging.debug(f"Found user with token: {user.email}")
            if user.token_expiry:
                current_time = datetime.now(timezone.utc)
                # Ensure token_expiry is timezone-aware
                if user.token_expiry.tzinfo is None:
                    # Convert naive datetime to aware datetime
                    token_expiry_aware = user.token_expiry.replace(tzinfo=timezone.utc)
                else:
                    token_expiry_aware = user.token_expiry

                if token_expiry_aware > current_time:
                    logging.debug("Token is valid")
                    return {'valid': True}, 200
            else:
                logging.debug("Token has expired")
        else:
            logging.debug("No user found with the provided token")
        return {'valid': False}, 400

    def post(self):
        data = request.get_json()
        code = data.get('code')
        email = data.get('email')
        session_token = data.get('session_token')

        if not code or not email:
            return {'message': 'Email and verification code are required', 'valid': False}, 400

        logging.debug(f"Verifying reset code: {code} for email: {email}, session_token: {session_token}")

        # First try with session token if provided
        if session_token:
            user = User.query.filter_by(email=email, verification_token=code, session_token=session_token).first()
            if user:
                logging.debug(f"Found user with code and session token: {user.email}")
                if user.token_expiry and user.token_expiry > datetime.now(timezone.utc):
                    logging.debug("Code is valid (with session token)")
                    return {'valid': True, 'email': email, 'session_token': session_token}, 200
                else:
                    logging.debug("Code has expired (with session token)")

        # If no session token or verification failed, try without session token
        user = User.query.filter_by(email=email, verification_token=code).first()
        if user:
            logging.debug(f"Found user with code (no session token): {user.email}")
            if user.token_expiry and user.token_expiry > datetime.now(timezone.utc):
                logging.debug("Code is valid (without session token)")
                return {'valid': True, 'email': email, 'session_token': user.session_token}, 200
            else:
                logging.debug("Code has expired (without session token)")

        logging.debug("No valid user found with the provided code")
        return {'valid': False}, 400

class ResetPassword(Resource):
    def post(self):
        data = request.get_json()
        token = data.get('token')
        code = data.get('code')
        email = data.get('email')
        session_token = data.get('session_token')
        new_password = data.get('password')

        logging.debug(f"Reset password request: token={token}, code={code}, email={email}, session_token={session_token}")

        # Support both token-based and code-based reset
        if token:
            logging.debug(f"Received token for password reset: {token}")
            user = User.query.filter_by(verification_token=token).first()
        elif code and email:
            logging.debug(f"Received code for password reset: {code} for email: {email}")

            # First try with session token if provided
            if session_token:
                user = User.query.filter_by(email=email, verification_token=code, session_token=session_token).first()
                if user:
                    logging.debug(f"Found user with code and session token: {user.email}")
            else:
                user = None

            # If no session token or verification failed, try without session token
            if not user:
                user = User.query.filter_by(email=email, verification_token=code).first()
                if user:
                    logging.debug(f"Found user with code (no session token): {user.email}")
        else:
            return {'message': 'Invalid request parameters'}, 400

        if user:
            logging.debug(f"Found user: {user.email}")
            if user.token_expiry and user.token_expiry > datetime.now(timezone.utc):
                user.set_password(new_password)
                user.verification_token = None
                user.token_expiry = None
                user.session_token = None
                db.session.commit()
                logging.debug("Password reset successfully")
                return {'message': 'Password reset successfully'}, 200
            else:
                logging.debug("Token/code has expired")
        else:
            logging.debug("No user found with the provided token/code")
        return {'message': 'Invalid or expired verification code'}, 400