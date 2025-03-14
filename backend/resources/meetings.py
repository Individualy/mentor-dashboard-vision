import json
import logging
from datetime import datetime, timedelta
from flask import request, jsonify
from flask_restful import Resource
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from models import db, Meeting

logging.basicConfig(level=logging.DEBUG)

# Load Gmail API credentials
with open('./resources/api/gmail.json') as f:
    gmail_credentials = json.load(f)

class CreateMeeting(Resource):
    def post(self):
        data = request.get_json()
        class_id = data.get('class_id')
        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')

        try:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
        except ValueError:
            return {'message': 'Invalid datetime format'}, 400

        try:
            creds = Credentials.from_authorized_user_info(gmail_credentials)
            service = build('calendar', 'v3', credentials=creds)

            event = {
                'summary': 'Mentor Meeting',
                'description': 'A meeting created via the Mentor Dashboard!',
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'conferenceData': {
                    'createRequest': {
                        'requestId': "some-unique-string",  # Required: a unique string for this request
                        "conferenceSolutionKey": {
                            "type": "hangoutsMeet"
                        }
                    },
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10},
                    ],
                },
            }

            event = service.events().insert(calendarId='primary', body=event, conferenceDataVersion=1).execute()
            meet_link = event['hangoutLink']

            # Create meeting in your database
            meeting = Meeting(
                title='Mentor Meeting',  # You might want to get the title from the request
                start_time=start_time,
                end_time=end_time,
                link=meet_link,
                class_id=class_id
            )
            db.session.add(meeting)
            db.session.commit()

            print(f"Event created: {event['htmlLink']}")
            return jsonify({'meet_link': meet_link})

        except HttpError as error:
            print(f'An error occurred: {error}')
            return jsonify({'error': str(error)}), 500