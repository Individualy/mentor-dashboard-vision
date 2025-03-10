import json
import logging
from datetime import datetime, timedelta
from flask import request, jsonify
from flask_restful import Resource
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logging.basicConfig(level=logging.DEBUG)

# Load Gmail API credentials
with open('./resources/api/gmail.json') as f:
    gmail_credentials = json.load(f)

class CreateMeeting(Resource):
    def post(self):
        try:
            creds = Credentials.from_authorized_user_info(gmail_credentials)
            service = build('calendar', 'v3', credentials=creds)

            now = datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
            event = {
                'summary': 'Mentor Meeting',
                'description': 'A meeting created via the Mentor Dashboard!',
                'start': {
                    'dateTime': now,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': (datetime.utcnow() + timedelta(hours=1)).isoformat() + 'Z',
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
            print(f"Event created: {event['htmlLink']}")
            return jsonify({'meet_link': meet_link})

        except HttpError as error:
            print(f'An error occurred: {error}')
            return jsonify({'error': str(error)}), 500