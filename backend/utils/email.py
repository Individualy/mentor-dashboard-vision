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
try:
    with open('backend/resources/api/gmail.json') as f:
        gmail_credentials = json.load(f)
except FileNotFoundError:
    # Fallback to a relative path
    try:
        with open('resources/api/gmail.json') as f:
            gmail_credentials = json.load(f)
    except FileNotFoundError:
        # For development, use dummy credentials
        gmail_credentials = {
            'refresh_token': 'dummy_refresh_token',
            'token_uri': 'https://oauth2.googleapis.com/token',
            'client_id': 'dummy_client_id',
            'client_secret': 'dummy_client_secret'
        }
        print("Warning: Using dummy Gmail credentials. Email sending will not work.")

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

        html_content = f'''
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
                .header {{ background-color: #4F46E5; color: white; padding: 15px 20px; border-radius: 5px 5px 0 0; text-align: center; }}
                .logo {{ font-size: 24px; font-weight: bold; }}
                .content {{ padding: 30px 20px; }}
                .code {{ font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; text-align: center; padding: 15px; margin: 25px 0; border: 2px dashed #4F46E5; border-radius: 8px; background-color: #f8f9ff; }}
                .instructions {{ margin-bottom: 25px; color: #555; }}
                .security-note {{ background-color: #fffaf0; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777; }}
                .social {{ margin-top: 15px; }}
                .social a {{ margin: 0 10px; color: #4F46E5; text-decoration: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">EduMeet</div>
                    <h2>Email Verification</h2>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p class="instructions">Thank you for registering with EduMeet. To ensure the security of your account, please verify your email address by entering the verification code below:</p>
                    <div class="code">{verification_token}</div>
                    <p><strong>Important:</strong> This code will expire in 10 minutes.</p>
                    <div class="security-note">
                        <p><strong>Security Note:</strong> If you did not request this verification, please ignore this email or contact our support team immediately.</p>
                    </div>
                    <p>Thank you for choosing EduMeet for your educational needs.</p>
                    <p>Best regards,<br>The EduMeet Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>&copy; 2025 EduMeet. All rights reserved.</p>
                    <div class="social">
                        <a href="#">Help Center</a> | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        '''
        message = MIMEText(html_content, 'html')
        message['to'] = email
        message['from'] = 'niencongchua@gmail.com'
        message['subject'] = 'Email Verification'

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        message = {'raw': raw_message}

        send_message = service.users().messages().send(userId='me', body=message).execute()
        print(f'Message Id: {send_message["id"]}')
        return True
    except Exception as error:
        print(f'An error occurred while sending verification email: {error}')
        # For development, print the verification code to console
        print(f'\n\n====================================')
        print(f'VERIFICATION CODE for {email}: {verification_token}')
        print(f'====================================')
        return False

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

        html_content = f'''
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
                .header {{ background-color: #4F46E5; color: white; padding: 15px 20px; border-radius: 5px 5px 0 0; text-align: center; }}
                .logo {{ font-size: 24px; font-weight: bold; }}
                .content {{ padding: 30px 20px; }}
                .code {{ font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; text-align: center; padding: 15px; margin: 25px 0; border: 2px dashed #4F46E5; border-radius: 8px; background-color: #f8f9ff; }}
                .instructions {{ margin-bottom: 25px; color: #555; }}
                .security-note {{ background-color: #fffaf0; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777; }}
                .social {{ margin-top: 15px; }}
                .social a {{ margin: 0 10px; color: #4F46E5; text-decoration: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">EduMeet</div>
                    <h2>Password Reset</h2>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p class="instructions">We received a request to reset your password. To proceed with the password reset, please use the verification code below:</p>
                    <div class="code">{reset_token}</div>
                    <p><strong>Important:</strong> This code will expire in 1 hour.</p>
                    <div class="security-note">
                        <p><strong>Security Note:</strong> If you did not request this password reset, please ignore this email or contact our support team immediately as your account may have been targeted.</p>
                    </div>
                    <p>For security reasons, please do not share this code with anyone.</p>
                    <p>Best regards,<br>The EduMeet Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>&copy; 2025 EduMeet. All rights reserved.</p>
                    <div class="social">
                        <a href="#">Help Center</a> | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        '''
        message = MIMEText(html_content, 'html')
        message['to'] = email
        message['from'] = 'niencongchua@gmail.com'
        message['subject'] = 'Password Reset'

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        message = {'raw': raw_message}

        send_message = service.users().messages().send(userId='me', body=message).execute()
        print(f'Message Id: {send_message["id"]}')
        return True
    except Exception as error:
        print(f'An error occurred while sending reset email: {error}')
        # For development, print the reset code to console
        print(f'\n\n====================================')
        print(f'RESET CODE for {email}: {reset_token}')
        print(f'====================================')
        return False