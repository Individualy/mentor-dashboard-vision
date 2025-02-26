import json
import logging
import base64
from datetime import datetime, timedelta
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import create_access_token
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.mime.text import MIMEText
from models import db, User

logging.basicConfig(level=logging.DEBUG)

# Load Gmail API credentials
with open('./resources/api/gmail.json') as f:
    gmail_credentials = json.load(f)

# Temporary storage for unverified users
unverified_users = {}

def send_verification_email(email, verification_token):
    try:
        creds = Credentials(
            None,
            refresh_token=gmail_credentials['refresh_token'],
            token_uri=gmail_credentials['token_uri'],
            client_id=gmail_credentials['client_id'],
            client_secret=gmail_credentials['client_secret']
        )
        service = build('gmail', 'v1', credentials=creds)

        verification_link = f'http://localhost:3000/verify-email?token={verification_token}'
        message = MIMEText(f'Please verify your email by clicking on the following link: {verification_link}')
        message['to'] = email
        message['from'] = 'niencongchua@gmail.com'
        message['subject'] = 'Email Verification'

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        message = {'raw': raw_message}

        send_message = service.users().messages().send(userId='me', body=message).execute()
        print(f'Message Id: {send_message["id"]}')
    except HttpError as error:
        print(f'An error occurred: {error}')

class SignUp(Resource):
    def post(self):
        data = request.get_json()
        logging.debug(f"Received data: {data}")

        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        if role not in ['Teacher', 'Student']:
            logging.debug("Invalid role")
            return {'message': 'Invalid role'}, 400

        if User.query.filter_by(email=email).first():
            logging.debug("Email already exists")
            return {'message': 'Email already exists'}, 400

        verification_token = str(uuid.uuid4())
        token_expiry = datetime.utcnow() + timedelta(minutes=10)

        # Store user information temporarily
        unverified_users[email] = {
            'password': password,
            'role': role,
            'verification_token': verification_token,
            'token_expiry': token_expiry
        }

        send_verification_email(email, verification_token)
        logging.debug("Verification email sent")
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
            return {'exists': True}, 200
        return {'exists': False}, 200

class VerifyEmail(Resource):
    def get(self):
        token = request.args.get('token')
        email = None

        # Find the email associated with the token
        for key, value in unverified_users.items():
            if value['verification_token'] == token:
                email = key
                break

        if email and unverified_users[email]['token_expiry'] > datetime.utcnow():
            user_data = unverified_users.pop(email)
            user = User(email=email, role=user_data['role'])
            user.set_password(user_data['password'])
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            return {'message': 'Email verified successfully'}, 200

        return {'message': 'Invalid or expired token'}, 400