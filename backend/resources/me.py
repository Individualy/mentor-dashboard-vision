import logging
from flask import jsonify, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, decode_token
from models import User

class Me(Resource):
    @jwt_required()
    def get(self):
        try:
            logging.info("Accessing /me endpoint")

            # Log the Authorization header
            auth_header = request.headers.get('Authorization', '')
            logging.info(f"Authorization header: {auth_header}")

            # Get user ID from token
            user_id = get_jwt_identity()
            logging.info(f"JWT identity: {user_id}")

            if not user_id:
                logging.error("Invalid token: No user ID in token")
                return jsonify({"error": "Invalid token"}), 401

            # Get user from database
            # Convert user_id to int if it's a string (from JWT token)
            try:
                if isinstance(user_id, str) and user_id.isdigit():
                    user_id = int(user_id)
                logging.info(f"Looking up user with ID: {user_id} (type: {type(user_id).__name__})")
                user = User.query.get(user_id)
            except Exception as e:
                logging.error(f"Error converting user_id: {str(e)}")
                user = None

            if not user:
                logging.error(f"User not found for ID: {user_id}")
                return jsonify({"error": "User not found"}), 404

            # Return user info
            logging.info(f"Returning user info for ID: {user_id}")
            return jsonify({
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            })

        except Exception as e:
            logging.error(f"Error in /me endpoint: {str(e)}")
            return jsonify({"error": str(e)}), 500
