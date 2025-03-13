from flask import jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

class Me(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            if not user_id:
                return jsonify({"error": "Invalid token"}), 401

            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            return jsonify({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500
