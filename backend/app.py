
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db, bcrypt
from resources.auth import SignUp, Login, CheckEmail, VerifyEmail, ForgotPassword, VerifyResetToken, ResetPassword
from resources.user import ChangePassword, UserResource

app = Flask(__name__)
app.config.from_object(Config)

CORS(app) 

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)

api.add_resource(SignUp, '/signup')
api.add_resource(Login, '/login')
api.add_resource(CheckEmail, '/check-email')
api.add_resource(ChangePassword, '/change-password')
api.add_resource(VerifyEmail, '/verify-email')
api.add_resource(ForgotPassword, '/forgot-password')
api.add_resource(VerifyResetToken, '/verify-reset-token')
api.add_resource(ResetPassword, '/reset-password')
api.add_resource(UserResource, '/user')

if __name__ == '__main__':
    app.run(debug=True)
