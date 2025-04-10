from flask import Flask, request, redirect
import requests
import urllib.parse

app = Flask(__name__)

# Thông tin từ Azure Portal
CLIENT_ID = 'd5d7e288-40c6-48b5-bb79-6f58fae987d5'
CLIENT_SECRET = 'my-client-secret'  
REDIRECT_URI = 'http://localhost:3000'
AUTHORITY = 'https://login.microsoftonline.com/common'
SCOPE = 'Mail.Send offline_access'

# Bước 1: Điều hướng người dùng tới trang đăng nhập
@app.route('/login')
def login():
    query_params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': REDIRECT_URI,
        'response_mode': 'query',
        'scope': SCOPE,
        'state': '12345'
    }
    login_url = f"{AUTHORITY}/oauth2/v2.0/authorize?{urllib.parse.urlencode(query_params)}"
    return redirect(login_url)

# Bước 2: Microsoft redirect về đây kèm code
@app.route('/')
def callback():
    code = request.args.get('code')
    if not code:
        return "Không nhận được code từ Microsoft"

    # Bước 3: Gửi code để lấy access token
    token_url = f"{AUTHORITY}/oauth2/v2.0/token"
    token_data = {
        'client_id': CLIENT_ID,
        'scope': SCOPE,
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code',
        'client_secret': CLIENT_SECRET
    }

    response = requests.post(token_url, data=token_data)
    if response.status_code != 200:
        return f"Lỗi lấy token: {response.text}"

    token_info = response.json()
    return f"<h3>Access Token:</h3><pre>{token_info}</pre>"

if __name__ == '__main__':
    app.run(port=3000)
