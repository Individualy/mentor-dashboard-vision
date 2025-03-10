from google_auth_oauthlib.flow import InstalledAppFlow
import json

# Load the OAuth 2.0 credentials
with open('./resources/api/gmail.json') as f:
    credentials_info = json.load(f)

# Specify the scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/calendar']


# Run the OAuth flow to get the credentials
flow = InstalledAppFlow.from_client_config(credentials_info, SCOPES)
creds = flow.run_local_server(port=0)

# Save the credentials to a file
with open('./resources/api/gmail.json', 'w') as token:
    token.write(creds.to_json())