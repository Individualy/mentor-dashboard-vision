
import threading
import time
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from flask import Flask, jsonify
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
from resources.me import Me

def background_task(app):
    with app.app_context():
        while True:
            delete_expired_meetings()
            time.sleep(1)

app = Flask(__name__)
app.config.from_object(Config)

# Custom error handler for 500 errors
@app.errorhandler(500)
def handle_500_error(e):
    logging.error(f"Internal server error: {str(e)}")
    response = jsonify({'message': 'Internal server error occurred. Please try again later.'})
    response.status_code = 500
    # Add CORS headers to error responses
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Handle OPTIONS requests explicitly
@app.route('/<path:path>', methods=['OPTIONS'])
@app.route('/', methods=['OPTIONS'])
def options_handler(path=''):
    response = app.make_default_options_response()
    return response

# CORS headers are handled by the Flask-CORS extension

# Configure CORS - more permissive for development
frontend_url = app.config.get('FRONTEND_URL', 'http://localhost:8080')
# For development, allow all origins
CORS(app,
     resources={r"/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=False)

# Configure logging
log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO'))
logging.basicConfig(level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
# Configure JWT
jwt = JWTManager(app)

# Add JWT configuration
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Configure JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    logger.error(f"Invalid token: {error_string}")
    return jsonify({
        'error': 'Invalid token',
        'message': error_string
    }), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    logger.error(f"Token expired: {jwt_payload}")
    return jsonify({
        'error': 'Token expired',
        'message': 'The token has expired'
    }), 401

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    logger.error(f"Unauthorized: {error_string}")
    return jsonify({
        'error': 'Missing token',
        'message': error_string
    }), 401

@jwt.token_verification_failed_loader
def verification_failed_callback(jwt_header, jwt_payload):
    logger.error(f"Token verification failed: {jwt_payload}")
    return jsonify({
        'error': 'Token verification failed',
        'message': 'Token verification failed'
    }), 401

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
api.add_resource(Me, '/me')


if __name__ == '__main__':
    host = app.config.get('HOST', '0.0.0.0')
    port = app.config.get('PORT', 5000)
    debug = os.getenv('FLASK_DEBUG', '1') == '1'

    logger.info(f"Starting server on {host}:{port} with debug={debug}")
    logger.info(f"Frontend URL: {frontend_url}")

    app.run(host=host, port=port, debug=debug)
