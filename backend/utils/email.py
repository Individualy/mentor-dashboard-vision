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


# Load Gmail API credentials
with open('./resources/api/gmail.json') as f:
    gmail_credentials = json.load(f)

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

        verification_link = f'http://localhost:8080/verify-email?token={verification_token}'
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

def send_reset_password_email(email, reset_token):
    try:
        creds = Credentials(
            None,
            refresh_token=gmail_credentials['refresh_token'],
            token_uri=gmail_credentials['token_uri'],
            client_id=gmail_credentials['client_id'],
            client_secret=gmail_credentials['client_secret']
        )
        service = build('gmail', 'v1', credentials=creds)

        reset_link = f'http://localhost:8080/reset-password?token={reset_token}'
        message = MIMEText(f'Please reset your password by clicking on the following link: {reset_link}')
        message['to'] = email
        message['from'] = 'niencongchua@gmail.com'
        message['subject'] = 'Password Reset'

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        message = {'raw': raw_message}

        send_message = service.users().messages().send(userId='me', body=message).execute()
        print(f'Message Id: {send_message["id"]}')
    except HttpError as error:
        print(f'An error occurred: {error}')