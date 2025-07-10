from flask import Blueprint, request, jsonify
from models import User, ActivityLog, GuildEvent, ForumPost, WikiArticle, db
from datetime import datetime, timedelta
import logging
import jwt
import os
from functools import wraps
import cloudinary.uploader
from werkzeug.utils import secure_filename

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            
            data = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
            current_user_id = data['user_id']
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated_function(current_user, *args, **kwargs):
        admin_roles = ['SuperAdmin', 'Maître', 'Conseiller']
        if current_user.role not in admin_roles:
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

def super_admin_required(f):
    @wraps(f)
    def decorated_function(current_user, *args, **kwargs):
        if current_user.role != 'SuperAdmin':
            return jsonify({'message': 'SuperAdmin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    """Get all users with admin privileges"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        role_filter = request.args.get('role', '')
        
        query = User.query
        
        if search:
            query = query.filter(
                User.username.like(f'%{search}%') |
                User.email.like(f'%{search}%') |
                User.discord_username.like(f'%{search}%')
            )
        
        if role_filter:
            query = query.filter_by(role=role_filter)
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users_data = []
        for user in users.items:
            user_data = user.to_dict()
            user_data['last_login'] = user.last_login.isoformat() if user.last_login else None
            users_data.append(user_data)
        
        return jsonify({
            'users': users_data,
            'total': users.total,
            'pages': users.pages,
            'current_page': users.page,
            'per_page': users.per_page
        })
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'message': 'Error fetching users'}), 500

@admin_bp.route('/users/<int:user_id>/validate', methods=['POST'])
@token_required
@admin_required
def validate_user(current_user, user_id):
    """Validate a user account"""
    try:
        user = User.query.get_or_404(user_id)
        
        data = request.get_json()
        is_validated = data.get('is_validated', True)
        
        user.is_validated = is_validated
        user.updated_at = datetime.utcnow()
        
        if is_validated and user.role == 'Recrue':
            user.role = 'Membre'  # Auto-promote validated recruits to members
        
        db.session.commit()
        
        # Log the validation activity
        activity_log = ActivityLog(
            user_id=current_user.id,
            action='validate_user',
            details={
                'target_user_id': user_id,
                'validated': is_validated,
                'username': user.username
            },
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(activity_log)
        db.session.commit()
        
        return jsonify({
            'message': f'User {"validated" if is_validated else "invalidated"} successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error validating user: {str(e)}")
        return jsonify({'message': 'Error validating user'}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@token_required
@super_admin_required
def update_user_role(current_user, user_id):
    """Update user role (SuperAdmin only)"""
    try:
        user = User.query.get_or_404(user_id)
        
        data = request.get_json()
        new_role = data.get('role')
        
        if not new_role:
            return jsonify({'message': 'Role is required'}), 400
        
        valid_roles = ['Invité', 'Recrue', 'Membre', 'Quartier-Maître', 'Officier', 'Conseiller', 'Maître', 'SuperAdmin']
        if new_role not in valid_roles:
            return jsonify({'message': 'Invalid role'}), 400
        
        # Prevent demoting yourself
        if user.id == current_user.id and new_role != 'SuperAdmin':
            return jsonify({'message': 'Cannot demote yourself'}), 400
        
        old_role = user.role
        user.role = new_role
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Log the role change activity
        activity_log = ActivityLog(
            user_id=current_user.id,
            action='change_user_role',
            details={
                'target_user_id': user_id,
                'old_role': old_role,
                'new_role': new_role,
                'username': user.username
            },
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(activity_log)
        db.session.commit()
        
        return jsonify({
            'message': f'User role updated from {old_role} to {new_role}',
            'user': user.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Error updating user role: {str(e)}")
        return jsonify({'message': 'Error updating user role'}), 500

@admin_bp.route('/users/<int:user_id>/upload-avatar', methods=['POST'])
@token_required
@admin_required
def upload_user_avatar(current_user, user_id):
    """Upload profile image for a user"""
    try:
        user = User.query.get_or_404(user_id)
        
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        # Upload to Cloudinary
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder=f"guild_avatars/{user_id}",
                public_id=f"avatar_{user_id}",
                overwrite=True,
                resource_type="image",
                transformation=[
                    {'width': 300, 'height': 300, 'crop': 'fill'},
                    {'quality': 'auto'},
                    {'format': 'jpg'}
                ]
            )
            
            user.profile_image = upload_result['secure_url']
            user.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            # Log the avatar upload activity
            activity_log = ActivityLog(
                user_id=current_user.id,
                action='upload_user_avatar',
                details={
                    'target_user_id': user_id,
                    'image_url': user.profile_image,
                    'username': user.username
                },
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            db.session.add(activity_log)
            db.session.commit()
            
            return jsonify({
                'message': 'Avatar uploaded successfully',
                'image_url': user.profile_image,
                'user': user.to_dict()
            })
            
        except Exception as e:
            logger.error(f"Cloudinary upload error: {str(e)}")
            return jsonify({'message': 'Error uploading image'}), 500
            
    except Exception as e:
        logger.error(f"Error uploading avatar: {str(e)}")
        return jsonify({'message': 'Error uploading avatar'}), 500

@admin_bp.route('/activity-logs', methods=['GET'])
@token_required
@admin_required
def get_activity_logs(current_user):
    """Get activity logs"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        user_id = request.args.get('user_id', type=int)
        action = request.args.get('action', '')
        
        query = ActivityLog.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        if action:
            query = query.filter(ActivityLog.action.like(f'%{action}%'))
        
        logs = query.order_by(ActivityLog.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        logs_data = []
        for log in logs.items:
            log_data = {
                'id': log.id,
                'user_id': log.user_id,
                'username': log.user.username if log.user else 'Unknown',
                'action': log.action,
                'details': log.details,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'created_at': log.created_at.isoformat()
            }
            logs_data.append(log_data)
        
        return jsonify({
            'logs': logs_data,
            'total': logs.total,
            'pages': logs.pages,
            'current_page': logs.page,
            'per_page': logs.per_page
        })
        
    except Exception as e:
        logger.error(f"Error fetching activity logs: {str(e)}")
        return jsonify({'message': 'Error fetching activity logs'}), 500

@admin_bp.route('/statistics', methods=['GET'])
@token_required
@admin_required
def get_guild_statistics(current_user):
    """Get guild statistics"""
    try:
        # User statistics
        total_users = User.query.filter_by(is_active=True).count()
        validated_users = User.query.filter_by(is_active=True, is_validated=True).count()
        active_users_week = User.query.filter(
            User.is_active == True,
            User.last_login >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        # Role distribution
        role_stats = db.session.query(User.role, db.func.count(User.id)).filter_by(is_active=True).group_by(User.role).all()
        role_distribution = {role: count for role, count in role_stats}
        
        # Event statistics
        total_events = GuildEvent.query.count()
        upcoming_events = GuildEvent.query.filter(GuildEvent.event_date >= datetime.utcnow().date()).count()
        
        # Forum statistics
        total_forum_posts = ForumPost.query.filter_by(is_deleted=False).count()
        forum_posts_week = ForumPost.query.filter(
            ForumPost.is_deleted == False,
            ForumPost.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        # Wiki statistics
        total_wiki_articles = WikiArticle.query.filter_by(is_published=True).count()
        
        # Activity statistics
        recent_activities = ActivityLog.query.filter(
            ActivityLog.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'validated': validated_users,
                'active_week': active_users_week,
                'role_distribution': role_distribution
            },
            'events': {
                'total': total_events,
                'upcoming': upcoming_events
            },
            'forum': {
                'total_posts': total_forum_posts,
                'posts_this_week': forum_posts_week
            },
            'wiki': {
                'total_articles': total_wiki_articles
            },
            'activity': {
                'recent_activities': recent_activities
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching statistics: {str(e)}")
        return jsonify({'message': 'Error fetching statistics'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@super_admin_required
def delete_user(current_user, user_id):
    """Delete a user (SuperAdmin only)"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent deleting yourself
        if user.id == current_user.id:
            return jsonify({'message': 'Cannot delete yourself'}), 400
        
        # Soft delete - just deactivate
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Log the deletion activity
        activity_log = ActivityLog(
            user_id=current_user.id,
            action='delete_user',
            details={
                'target_user_id': user_id,
                'username': user.username
            },
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(activity_log)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({'message': 'Error deleting user'}), 500