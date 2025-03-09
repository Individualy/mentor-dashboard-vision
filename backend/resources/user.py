from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

class ChangePassword(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if user and user.check_password(old_password):
            user.set_password(new_password)
            db.session.commit()
            return {'message': 'Password updated successfully'}, 200
        return {'message': 'Invalid old password'}, 400