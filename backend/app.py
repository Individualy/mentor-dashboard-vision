import threading
import time 

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db, bcrypt
from resources.auth import SignUp, Login, CheckEmail, VerifyEmail, ForgotPassword, VerifyResetToken, ResetPassword
from resources.user import ChangePassword
from resources.meetings import CreateMeeting, delete_expired_meetings, GetMeetings

def background_task(app):
    with app.app_context(): 
        while True:
            delete_expired_meetings()
            time.sleep(1)

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}}, supports_credentials=True)

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)

thread = threading.Thread(target=background_task, args=(app,), daemon=True)
thread.start()

api.add_resource(SignUp, '/signup')
api.add_resource(Login, '/login')
api.add_resource(CheckEmail, '/check-email')
api.add_resource(ChangePassword, '/change-password')
api.add_resource(VerifyEmail, '/verify-email')
api.add_resource(ForgotPassword, '/forgot-password')
api.add_resource(VerifyResetToken, '/verify-reset-token')
api.add_resource(ResetPassword, '/reset-password')
api.add_resource(CreateMeeting, '/create-meeting')
api.add_resource(GetMeetings, '/get-meetings')


if __name__ == '__main__':
    app.run(debug=True)