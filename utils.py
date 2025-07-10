import os
import secrets
import string
from datetime import datetime, timedelta
from functools import wraps
from typing import Optional, Dict, Any, List
import jwt
from flask import request, jsonify, current_app
from models import User, ActivityLog, db
import redis
import logging
from PIL import Image
import io
import base64
import requests
from slugify import slugify
import re

logger = logging.getLogger(__name__)

# Redis client
redis_client = None
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
except:
    logger.warning("Redis not available, caching disabled")

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_jwt_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT token for user"""
    if expires_delta is None:
        expires_delta = timedelta(days=30)
    
    payload = {
        'user_id': user.id,
        'discord_id': user.discord_id,
        'role': user.role,
        'exp': datetime.utcnow() + expires_delta,
        'iat': datetime.utcnow()
    }
    
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token and return payload"""
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'message': 'Token is invalid or expired'}), 401
        
        current_user = User.query.get(payload['user_id'])
        if not current_user or not current_user.is_active:
            return jsonify({'message': 'User not found or inactive'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def role_required(min_role: str):
    """Decorator to require minimum role level"""
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            role_hierarchy = {
                'Invité': 1,
                'Recrue': 2,
                'Membre': 3,
                'Quartier-Maître': 4,
                'Officier': 5,
                'Conseiller': 6,
                'Maître': 7,
                'SuperAdmin': 8
            }
            
            user_role_level = role_hierarchy.get(current_user.role, 1)
            required_level = role_hierarchy.get(min_role, 1)
            
            if user_role_level < required_level:
                return jsonify({'message': 'Insufficient permissions'}), 403
            
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(current_user, *args, **kwargs):
        admin_roles = ['SuperAdmin', 'Maître', 'Conseiller']
        if current_user.role not in admin_roles:
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

def super_admin_required(f):
    """Decorator to require super admin role"""
    @wraps(f)
    def decorated_function(current_user, *args, **kwargs):
        if current_user.role != 'SuperAdmin':
            return jsonify({'message': 'SuperAdmin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

def log_activity(user_id: int, action: str, details: Optional[Dict[str, Any]] = None):
    """Log user activity"""
    try:
        activity_log = ActivityLog(
            user_id=user_id,
            action=action,
            details=details or {},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', '')
        )
        db.session.add(activity_log)
        db.session.commit()
    except Exception as e:
        logger.error(f"Error logging activity: {str(e)}")

def cache_set(key: str, value: Any, timeout: int = 300):
    """Set value in cache"""
    if redis_client:
        try:
            redis_client.setex(key, timeout, str(value))
        except Exception as e:
            logger.error(f"Cache set error: {str(e)}")

def cache_get(key: str) -> Optional[str]:
    """Get value from cache"""
    if redis_client:
        try:
            return redis_client.get(key)
        except Exception as e:
            logger.error(f"Cache get error: {str(e)}")
    return None

def cache_delete(key: str):
    """Delete value from cache"""
    if redis_client:
        try:
            redis_client.delete(key)
        except Exception as e:
            logger.error(f"Cache delete error: {str(e)}")

def validate_image(file) -> bool:
    """Validate uploaded image file"""
    if not file or not file.filename:
        return False
    
    # Check file extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    
    if file_extension not in allowed_extensions:
        return False
    
    # Check file size (16MB max)
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset position
    
    if file_size > 16 * 1024 * 1024:  # 16MB
        return False
    
    # Try to open as image
    try:
        with Image.open(file) as img:
            img.verify()
        file.seek(0)  # Reset position after verification
        return True
    except Exception:
        return False

def resize_image(image_data: bytes, max_size: tuple = (800, 600)) -> bytes:
    """Resize image while maintaining aspect ratio"""
    try:
        with Image.open(io.BytesIO(image_data)) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Save resized image
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            return output.getvalue()
    except Exception as e:
        logger.error(f"Error resizing image: {str(e)}")
        return image_data

def create_slug(text: str, max_length: int = 100) -> str:
    """Create URL-friendly slug from text"""
    slug = slugify(text, max_length=max_length)
    return slug if slug else 'untitled'

def validate_discord_user(discord_id: str, access_token: str) -> Optional[Dict[str, Any]]:
    """Validate Discord user and check guild membership"""
    try:
        # Get user info
        user_url = "https://discord.com/api/users/@me"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_url, headers=headers)
        
        if user_response.status_code != 200:
            return None
        
        user_data = user_response.json()
        
        # Get user guilds
        guilds_url = "https://discord.com/api/users/@me/guilds"
        guilds_response = requests.get(guilds_url, headers=headers)
        
        if guilds_response.status_code != 200:
            return None
        
        guilds_data = guilds_response.json()
        
        # Check guild membership
        guild_id = current_app.config.get('DISCORD_GUILD_ID')
        is_member = any(guild['id'] == guild_id for guild in guilds_data)
        
        if not is_member:
            return None
        
        return user_data
        
    except Exception as e:
        logger.error(f"Error validating Discord user: {str(e)}")
        return None

def send_discord_webhook(webhook_url: str, content: str, embeds: Optional[List[Dict[str, Any]]] = None):
    """Send message to Discord webhook"""
    try:
        if not webhook_url:
            return
        
        payload = {
            'content': content,
            'embeds': embeds or []
        }
        
        response = requests.post(webhook_url, json=payload)
        if response.status_code not in [200, 204]:
            logger.error(f"Discord webhook error: {response.status_code}")
            
    except Exception as e:
        logger.error(f"Error sending Discord webhook: {str(e)}")

def format_datetime(dt: datetime, format_str: str = '%Y-%m-%d %H:%M:%S') -> str:
    """Format datetime to string"""
    return dt.strftime(format_str) if dt else ''

def parse_datetime(date_string: str, format_str: str = '%Y-%m-%d %H:%M:%S') -> Optional[datetime]:
    """Parse string to datetime"""
    try:
        return datetime.strptime(date_string, format_str)
    except ValueError:
        return None

def validate_email(email: str) -> bool:
    """Validate email address"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_discord_id(discord_id: str) -> bool:
    """Validate Discord ID format"""
    return discord_id.isdigit() and len(discord_id) >= 17 and len(discord_id) <= 20

def get_user_permissions(user: User) -> List[str]:
    """Get list of permissions for user based on role"""
    role_permissions = {
        'Invité': ['read_public'],
        'Recrue': ['read_public', 'read_member'],
        'Membre': ['read_public', 'read_member', 'write_forum', 'write_wiki'],
        'Quartier-Maître': ['read_public', 'read_member', 'write_forum', 'write_wiki', 'manage_events'],
        'Officier': ['read_public', 'read_member', 'write_forum', 'write_wiki', 'manage_events', 'moderate_forum'],
        'Conseiller': ['read_public', 'read_member', 'write_forum', 'write_wiki', 'manage_events', 'moderate_forum', 'manage_members'],
        'Maître': ['read_public', 'read_member', 'write_forum', 'write_wiki', 'manage_events', 'moderate_forum', 'manage_members', 'admin_access'],
        'SuperAdmin': ['all']
    }
    
    return role_permissions.get(user.role, ['read_public'])

def has_permission(user: User, permission: str) -> bool:
    """Check if user has specific permission"""
    user_permissions = get_user_permissions(user)
    return 'all' in user_permissions or permission in user_permissions

def sanitize_html(html_content: str) -> str:
    """Sanitize HTML content (basic implementation)"""
    # This is a basic implementation - in production, use a proper HTML sanitizer like bleach
    import html
    return html.escape(html_content)

def get_client_ip() -> str:
    """Get client IP address"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def calculate_bdo_stats(equipment_score: int) -> Dict[str, Any]:
    """Calculate BDO-related statistics"""
    stats = {
        'tier': 'Beginner',
        'tier_color': '#94a3b8',
        'recommended_content': []
    }
    
    if equipment_score >= 700:
        stats['tier'] = 'Endgame'
        stats['tier_color'] = '#dc2626'
        stats['recommended_content'] = ['Atoraxxion', 'Thornwood', 'Sycraia', 'Hadum']
    elif equipment_score >= 600:
        stats['tier'] = 'Advanced'
        stats['tier_color'] = '#ea580c'
        stats['recommended_content'] = ['Abyss Dungeons', 'Valencia', 'Kamasylvia', 'Drieghan']
    elif equipment_score >= 500:
        stats['tier'] = 'Intermediate'
        stats['tier_color'] = '#ca8a04'
        stats['recommended_content'] = ['Mediah', 'Valencia', 'Node Wars']
    elif equipment_score >= 400:
        stats['tier'] = 'Novice'
        stats['tier_color'] = '#16a34a'
        stats['recommended_content'] = ['Calpheon', 'Mediah', 'Guild Missions']
    else:
        stats['tier'] = 'Beginner'
        stats['tier_color'] = '#94a3b8'
        stats['recommended_content'] = ['Balenos', 'Serendia', 'Calpheon']
    
    return stats

def get_pagination_params(request) -> Dict[str, int]:
    """Get pagination parameters from request"""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
    return {'page': page, 'per_page': per_page}

def create_pagination_response(pagination, items_key: str = 'items'):
    """Create standardized pagination response"""
    return {
        items_key: [item.to_dict() if hasattr(item, 'to_dict') else item for item in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next,
            'prev_num': pagination.prev_num,
            'next_num': pagination.next_num
        }
    }