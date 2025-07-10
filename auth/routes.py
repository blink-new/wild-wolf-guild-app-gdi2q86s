from flask import Blueprint, request, jsonify, redirect, url_for, session
from flask_login import login_user, logout_user, login_required, current_user
from models import User, ActivityLog, db
from datetime import datetime, timedelta
import jwt
import requests
import os
from urllib.parse import urlencode
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/discord/login')
def discord_login():
    """Initiate Discord OAuth2 login"""
    try:
        discord_auth_url = "https://discord.com/api/oauth2/authorize"
        params = {
            'client_id': os.getenv('DISCORD_CLIENT_ID'),
            'redirect_uri': os.getenv('DISCORD_REDIRECT_URI'),
            'response_type': 'code',
            'scope': 'identify email guilds'
        }
        
        auth_url = f"{discord_auth_url}?{urlencode(params)}"
        return jsonify({'auth_url': auth_url})
    except Exception as e:
        logger.error(f"Error initiating Discord login: {str(e)}")
        return jsonify({'message': 'Error initiating login'}), 500

@auth_bp.route('/discord/callback')
def discord_callback():
    """Handle Discord OAuth2 callback"""
    try:
        code = request.args.get('code')
        if not code:
            return jsonify({'message': 'No authorization code provided'}), 400
        
        # Exchange code for access token
        token_url = "https://discord.com/api/oauth2/token"
        token_data = {
            'client_id': os.getenv('DISCORD_CLIENT_ID'),
            'client_secret': os.getenv('DISCORD_CLIENT_SECRET'),
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': os.getenv('DISCORD_REDIRECT_URI'),
            'scope': 'identify email guilds'
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if 'access_token' not in token_json:
            return jsonify({'message': 'Failed to get access token'}), 400
        
        access_token = token_json['access_token']
        refresh_token = token_json.get('refresh_token')
        
        # Get user info from Discord
        user_url = "https://discord.com/api/users/@me"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_url, headers=headers)
        user_data = user_response.json()
        
        # Get user guilds to verify membership
        guilds_url = "https://discord.com/api/users/@me/guilds"
        guilds_response = requests.get(guilds_url, headers=headers)
        guilds_data = guilds_response.json()
        
        # Check if user is in the specified guild
        guild_id = os.getenv('DISCORD_GUILD_ID')
        is_guild_member = any(guild['id'] == guild_id for guild in guilds_data)
        
        if not is_guild_member:
            return jsonify({'message': 'You must be a member of the Wild Wolf guild to access this application'}), 403
        
        # Find or create user
        user = User.query.filter_by(discord_id=user_data['id']).first()
        
        if not user:
            # Create new user
            user = User(
                username=user_data['username'],
                email=user_data.get('email', ''),
                discord_id=user_data['id'],
                discord_username=user_data['username'],
                discord_discriminator=user_data.get('discriminator', '0000'),
                discord_avatar=user_data.get('avatar'),
                access_token=access_token,
                refresh_token=refresh_token,
                role='Recrue',  # Default role for new users
                is_validated=False
            )
            db.session.add(user)
        else:
            # Update existing user
            user.username = user_data['username']
            user.email = user_data.get('email', user.email)
            user.discord_username = user_data['username']
            user.discord_discriminator = user_data.get('discriminator', '0000')
            user.discord_avatar = user_data.get('avatar')
            user.access_token = access_token
            user.refresh_token = refresh_token
            user.last_login = datetime.utcnow()
            user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Log the login activity
        activity_log = ActivityLog(
            user_id=user.id,
            action='login',
            details={'method': 'discord_oauth'},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(activity_log)
        db.session.commit()
        
        # Generate JWT token
        payload = {
            'user_id': user.id,
            'discord_id': user.discord_id,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(days=30)
        }
        
        token = jwt.encode(payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')
        
        # Return success response with token
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error in Discord callback: {str(e)}")
        return jsonify({'message': 'Error processing login'}), 500

@auth_bp.route('/me')
def get_current_user():
    """Get current user information"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        
        try:
            payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
            user_id = payload['user_id']
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({'message': 'User not found'}), 404
            
            return jsonify({'user': user.to_dict()})
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
            
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return jsonify({'message': 'Error getting user information'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token.split(' ')[1]
            
            try:
                payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
                user_id = payload['user_id']
                
                # Log the logout activity
                activity_log = ActivityLog(
                    user_id=user_id,
                    action='logout',
                    details={'method': 'manual'},
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                db.session.add(activity_log)
                db.session.commit()
                
            except jwt.InvalidTokenError:
                pass  # Token is invalid, but we can still log out
        
        return jsonify({'message': 'Logout successful'})
        
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        return jsonify({'message': 'Error during logout'}), 500

@auth_bp.route('/validate-token', methods=['POST'])
def validate_token():
    """Validate JWT token"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'valid': False, 'message': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        
        try:
            payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
            user_id = payload['user_id']
            
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'valid': False, 'message': 'User not found or inactive'}), 401
            
            return jsonify({
                'valid': True,
                'user': user.to_dict(),
                'expires_at': payload['exp']
            })
            
        except jwt.ExpiredSignatureError:
            return jsonify({'valid': False, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'valid': False, 'message': 'Invalid token'}), 401
            
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}")
        return jsonify({'valid': False, 'message': 'Error validating token'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh JWT token"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        
        try:
            # Decode without verification to get user_id (even if expired)
            payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'], options={"verify_exp": False})
            user_id = payload['user_id']
            
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'message': 'User not found or inactive'}), 401
            
            # Generate new token
            new_payload = {
                'user_id': user.id,
                'discord_id': user.discord_id,
                'role': user.role,
                'exp': datetime.utcnow() + timedelta(days=30)
            }
            
            new_token = jwt.encode(new_payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')
            
            return jsonify({
                'message': 'Token refreshed successfully',
                'token': new_token,
                'user': user.to_dict()
            })
            
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
            
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        return jsonify({'message': 'Error refreshing token'}), 500