from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_login import LoginManager
import os
from datetime import datetime, timedelta
import redis
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'wild-wolf-guild-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql://root:password@localhost/wild_wolf_guild')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['DISCORD_CLIENT_ID'] = os.getenv('DISCORD_CLIENT_ID')
app.config['DISCORD_CLIENT_SECRET'] = os.getenv('DISCORD_CLIENT_SECRET')
app.config['DISCORD_REDIRECT_URI'] = os.getenv('DISCORD_REDIRECT_URI', 'http://localhost:3000/auth/discord/callback')
app.config['DISCORD_GUILD_ID'] = os.getenv('DISCORD_GUILD_ID')
app.config['CLOUDINARY_CLOUD_NAME'] = os.getenv('CLOUDINARY_CLOUD_NAME')
app.config['CLOUDINARY_API_KEY'] = os.getenv('CLOUDINARY_API_KEY')
app.config['CLOUDINARY_API_SECRET'] = os.getenv('CLOUDINARY_API_SECRET')

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'
cors = CORS(app, origins=['http://localhost:3000', 'https://localhost:3000'])
socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000', 'https://localhost:3000'])

# Initialize Redis
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    print("Redis connected successfully")
except:
    print("Redis not connected, caching disabled")
    redis_client = None

# Configure Cloudinary
cloudinary.config(
    cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
    api_key=app.config['CLOUDINARY_API_KEY'],
    api_secret=app.config['CLOUDINARY_API_SECRET']
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up database tables
with app.app_context():
    db.create_all()

# Import models
from models import User, GuildEvent, WikiArticle, ForumPost, ForumReply, Message, GuildRole, ActivityLog

# Import and register blueprints
from auth.routes import auth_bp
from admin.routes import admin_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Utility functions
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
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

def role_required(min_role):
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

# API Routes

# Members API
@app.route('/api/members', methods=['GET'])
@token_required
def get_members(current_user):
    try:
        members = User.query.filter_by(is_active=True).all()
        members_data = []
        
        for member in members:
            members_data.append({
                'id': member.id,
                'username': member.username,
                'email': member.email,
                'discord_id': member.discord_id,
                'discord_username': member.discord_username,
                'role': member.role,
                'character_name': member.character_name,
                'character_class': member.character_class,
                'equipment_score': member.equipment_score,
                'family_name': member.family_name,
                'bio': member.bio,
                'profile_image': member.profile_image,
                'is_validated': member.is_validated,
                'created_at': member.created_at.isoformat(),
                'updated_at': member.updated_at.isoformat()
            })
        
        return jsonify({'members': members_data})
    except Exception as e:
        logger.error(f"Error fetching members: {str(e)}")
        return jsonify({'message': 'Error fetching members'}), 500

@app.route('/api/members/<int:member_id>', methods=['GET'])
@token_required
def get_member(current_user, member_id):
    try:
        member = User.query.get_or_404(member_id)
        
        member_data = {
            'id': member.id,
            'username': member.username,
            'email': member.email,
            'discord_id': member.discord_id,
            'discord_username': member.discord_username,
            'role': member.role,
            'character_name': member.character_name,
            'character_class': member.character_class,
            'equipment_score': member.equipment_score,
            'family_name': member.family_name,
            'bio': member.bio,
            'profile_image': member.profile_image,
            'is_validated': member.is_validated,
            'created_at': member.created_at.isoformat(),
            'updated_at': member.updated_at.isoformat()
        }
        
        return jsonify({'member': member_data})
    except Exception as e:
        logger.error(f"Error fetching member: {str(e)}")
        return jsonify({'message': 'Error fetching member'}), 500

@app.route('/api/members/<int:member_id>', methods=['PUT'])
@token_required
def update_member(current_user, member_id):
    try:
        member = User.query.get_or_404(member_id)
        
        # Check if user can update this member
        if current_user.id != member_id and current_user.role not in ['SuperAdmin', 'Maître', 'Conseiller']:
            return jsonify({'message': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'character_name' in data:
            member.character_name = data['character_name']
        if 'character_class' in data:
            member.character_class = data['character_class']
        if 'equipment_score' in data:
            member.equipment_score = data['equipment_score']
        if 'family_name' in data:
            member.family_name = data['family_name']
        if 'bio' in data:
            member.bio = data['bio']
        
        # Admin-only fields
        if current_user.role in ['SuperAdmin', 'Maître', 'Conseiller']:
            if 'role' in data:
                member.role = data['role']
            if 'is_validated' in data:
                member.is_validated = data['is_validated']
        
        member.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Member updated successfully'})
    except Exception as e:
        logger.error(f"Error updating member: {str(e)}")
        return jsonify({'message': 'Error updating member'}), 500

# Events API
@app.route('/api/events', methods=['GET'])
@token_required
def get_events(current_user):
    try:
        events = GuildEvent.query.filter(GuildEvent.event_date >= datetime.utcnow().date()).all()
        events_data = []
        
        for event in events:
            events_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'event_date': event.event_date.isoformat(),
                'event_time': event.event_time.strftime('%H:%M'),
                'event_type': event.event_type,
                'max_participants': event.max_participants,
                'participants': [p.user_id for p in event.participants],
                'created_by': event.created_by,
                'created_at': event.created_at.isoformat()
            })
        
        return jsonify({'events': events_data})
    except Exception as e:
        logger.error(f"Error fetching events: {str(e)}")
        return jsonify({'message': 'Error fetching events'}), 500

@app.route('/api/events', methods=['POST'])
@token_required
@role_required('Officier')
def create_event(current_user):
    try:
        data = request.get_json()
        
        new_event = GuildEvent(
            title=data['title'],
            description=data.get('description', ''),
            event_date=datetime.strptime(data['event_date'], '%Y-%m-%d').date(),
            event_time=datetime.strptime(data['event_time'], '%H:%M').time(),
            event_type=data['event_type'],
            max_participants=data.get('max_participants'),
            created_by=current_user.id
        )
        
        db.session.add(new_event)
        db.session.commit()
        
        return jsonify({'message': 'Event created successfully', 'event_id': new_event.id}), 201
    except Exception as e:
        logger.error(f"Error creating event: {str(e)}")
        return jsonify({'message': 'Error creating event'}), 500

# Socket.IO Events
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_room')
def handle_join_room(data):
    room = data['room']
    join_room(room)
    emit('status', {'msg': f'Joined room {room}'}, room=room)

@socketio.on('leave_room')
def handle_leave_room(data):
    room = data['room']
    leave_room(room)
    emit('status', {'msg': f'Left room {room}'}, room=room)

@socketio.on('send_message')
def handle_message(data):
    room = data['room']
    message = data['message']
    emit('receive_message', {
        'message': message,
        'user': data.get('user', 'Anonymous'),
        'timestamp': datetime.utcnow().isoformat()
    }, room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)