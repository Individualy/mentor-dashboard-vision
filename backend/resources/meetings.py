import json
import logging
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, current_app
from flask_restful import Resource
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from models import db, Meeting
from flask import current_app as app
import pytz  # Import thư viện xử lý múi giờ

logging.basicConfig(level=logging.DEBUG)

# Gmail credentials are now loaded in utils/email.py
# For development, use dummy credentials
gmail_credentials = {
    'refresh_token': 'dummy_refresh_token',
    'token_uri': 'https://oauth2.googleapis.com/token',
    'client_id': 'dummy_client_id',
    'client_secret': 'dummy_client_secret'
}
print("Warning: Using dummy Gmail credentials in meetings.py. Email sending will not work.")

def delete_expired_meetings():
    with current_app.app_context():
        now = datetime.now(timezone.utc)
        expired_meetings = Meeting.query.filter(Meeting.end_time < now).all()

        if expired_meetings:
            for meeting in expired_meetings:
                db.session.delete(meeting)
            db.session.commit()
            print(f"Deleted {len(expired_meetings)} expired meetings.")

class CreateMeeting(Resource):
    def post(self):
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Missing or invalid JSON'}), 400

        class_id = data.get('class_id')
        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')

        if not class_id or not start_time_str or not end_time_str:
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            print("Received start_time:", start_time_str)
            print("Received end_time:", end_time_str)

            # Chuyển đổi từ chuỗi "YYYY-MM-DD HH:MM:SS" sang datetime với múi giờ người dùng
            user_tz = pytz.timezone('Asia/Ho_Chi_Minh')
            start_time = datetime.strptime(start_time_str, "%Y-%m-%d %H:%M:%S")
            end_time = datetime.strptime(end_time_str, "%Y-%m-%d %H:%M:%S")

            # Gán múi giờ cho datetime
            start_time = user_tz.localize(start_time)
            end_time = user_tz.localize(end_time)

        except ValueError:
            return jsonify({'error': 'Invalid datetime format'}), 400

        try:
            # For development mode, bypass Google Calendar API
            print("Development mode: Bypassing Google Calendar API")

            # Generate a fake meet link
            meet_link = f"https://meet.google.com/dev-meeting-{datetime.now().timestamp()}"

            # Create meeting in database
            meeting = Meeting(
                title=data.get('title', 'Untitled Meeting'),
                start_time=start_time,
                end_time=end_time,
                link=meet_link,
                class_id=class_id
            )
            db.session.add(meeting)
            db.session.commit()

            print(f"Meeting created with ID: {meeting.id}")
            return jsonify({
                'id': meeting.id,  # Include the meeting ID in the response
                'meet_link': meet_link,
                'html_link': f"#/meeting/{meeting.id}",
                'event_id': str(meeting.id)
            }), 200

        except Exception as error:
            print(f'An error occurred: {error}')
            return jsonify({'error': str(error)}), 500

from flask import make_response

class GetMeetings(Resource):
    def get(self):
        try:
            meetings = Meeting.query.all()
            meeting_list = []

            for m in meetings:
                # Convert to Asia/Ho_Chi_Minh timezone
                user_tz = pytz.timezone('Asia/Ho_Chi_Minh')
                start_time = m.start_time.astimezone(user_tz)
                end_time = m.end_time.astimezone(user_tz)

                meeting_list.append({
                    "id": m.id,
                    "title": m.title,
                    "start_time": start_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "end_time": end_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "link": m.link,
                    "class_id": m.class_id,
                    "duration": f"{start_time.strftime('%H:%M')} - {end_time.strftime('%H:%M')}"
                })

            return make_response(jsonify(meeting_list), 200)

        except Exception as e:
            print("Error in GetMeetings:", str(e))
            return make_response(jsonify({"error": str(e)}), 500)
