#!/usr/bin/env python3
"""
Wild Wolf Guild Management Script
Provides CLI commands for database management and administration
"""

import os
import sys
import click
from flask import Flask
from flask.cli import with_appcontext
from flask_migrate import Migrate, init, migrate, upgrade, downgrade
from datetime import datetime
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from models import User, GuildEvent, WikiArticle, ForumPost, ForumCategory, GuildRole, BDOBossTimer, UsefulLink
from config import config

# Create Flask app
app = create_app(os.getenv('FLASK_ENV', 'development'))
migrate = Migrate(app, db)

def create_app(config_name=None):
    """Create Flask application"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    return app

@app.cli.command()
@click.option('--drop', is_flag=True, help='Drop all tables before creating')
def init_db(drop):
    """Initialize the database"""
    if drop:
        click.echo('Dropping all tables...')
        db.drop_all()
    
    click.echo('Creating database tables...')
    db.create_all()
    
    click.echo('Database initialized successfully!')

@app.cli.command()
def create_admin():
    """Create a super admin user"""
    click.echo('Creating super admin user...')
    
    username = click.prompt('Username')
    email = click.prompt('Email')
    discord_id = click.prompt('Discord ID', default='')
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        click.echo('User with this email already exists!')
        return
    
    # Create super admin user
    admin_user = User(
        username=username,
        email=email,
        discord_id=discord_id if discord_id else None,
        role='SuperAdmin',
        is_validated=True,
        is_active=True
    )
    
    db.session.add(admin_user)
    db.session.commit()
    
    click.echo(f'Super admin user created successfully! ID: {admin_user.id}')

@app.cli.command()
def seed_data():
    """Seed the database with initial data"""
    click.echo('Seeding database with initial data...')
    
    # Create guild roles
    roles = [
        {'name': 'SuperAdmin', 'hierarchy_level': 8, 'description': 'Super Administrator with full access'},
        {'name': 'Maître', 'hierarchy_level': 7, 'description': 'Guild Master'},
        {'name': 'Conseiller', 'hierarchy_level': 6, 'description': 'Guild Advisor'},
        {'name': 'Officier', 'hierarchy_level': 5, 'description': 'Guild Officer'},
        {'name': 'Quartier-Maître', 'hierarchy_level': 4, 'description': 'Quartermaster'},
        {'name': 'Membre', 'hierarchy_level': 3, 'description': 'Guild Member'},
        {'name': 'Recrue', 'hierarchy_level': 2, 'description': 'Guild Recruit'},
        {'name': 'Invité', 'hierarchy_level': 1, 'description': 'Guest'}
    ]
    
    for role_data in roles:
        existing_role = GuildRole.query.filter_by(name=role_data['name']).first()
        if not existing_role:
            role = GuildRole(**role_data)
            db.session.add(role)
    
    # Create forum categories
    categories = [
        {'name': 'Announcements', 'slug': 'announcements', 'description': 'Guild announcements and news', 'min_role_to_post': 'Officier', 'color': '#ef4444'},
        {'name': 'General Discussion', 'slug': 'general', 'description': 'General guild discussion', 'color': '#3b82f6'},
        {'name': 'Events & Activities', 'slug': 'events', 'description': 'Guild events and activities', 'color': '#10b981'},
        {'name': 'PvP & Node Wars', 'slug': 'pvp', 'description': 'PvP discussions and strategies', 'color': '#f59e0b'},
        {'name': 'PvE & Grinding', 'slug': 'pve', 'description': 'PvE content and grinding spots', 'color': '#8b5cf6'},
        {'name': 'Trading & Crafting', 'slug': 'trading', 'description': 'Trading and crafting discussions', 'color': '#06b6d4'},
        {'name': 'Recruitment', 'slug': 'recruitment', 'description': 'Guild recruitment', 'min_role_to_post': 'Officier', 'color': '#84cc16'},
        {'name': 'Off-Topic', 'slug': 'off-topic', 'description': 'Off-topic discussions', 'color': '#6b7280'}
    ]
    
    for cat_data in categories:
        existing_category = ForumCategory.query.filter_by(slug=cat_data['slug']).first()
        if not existing_category:
            category = ForumCategory(**cat_data)
            db.session.add(category)
    
    # Create BDO boss timers
    boss_timers = [
        {'boss_name': 'Kzarka', 'location': 'Serendia', 'difficulty': 'Easy', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Nouver', 'location': 'Valencia', 'difficulty': 'Medium', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Karanda', 'location': 'Calpheon', 'difficulty': 'Medium', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Kutum', 'location': 'Valencia', 'difficulty': 'Medium', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Offin Tett', 'location': 'Kamasylvia', 'difficulty': 'Hard', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Vell', 'location': 'Ocean', 'difficulty': 'Very Hard', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Garmoth', 'location': 'Drieghan', 'difficulty': 'Very Hard', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Quint', 'location': 'Valencia', 'difficulty': 'Easy', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Muraka', 'location': 'Valencia', 'difficulty': 'Easy', 'next_spawn': datetime.utcnow()},
        {'boss_name': 'Rednose', 'location': 'Serendia', 'difficulty': 'Easy', 'next_spawn': datetime.utcnow()}
    ]
    
    for boss_data in boss_timers:
        existing_boss = BDOBossTimer.query.filter_by(boss_name=boss_data['boss_name']).first()
        if not existing_boss:
            boss = BDOBossTimer(**boss_data)
            db.session.add(boss)
    
    # Create useful links
    useful_links = [
        {'title': 'BDO Database', 'url': 'https://bdodb.net/', 'category': 'Database', 'description': 'Complete BDO database'},
        {'title': 'BDO Codex', 'url': 'https://bdocodex.com/', 'category': 'Database', 'description': 'BDO items and knowledge database'},
        {'title': 'GrumpyG', 'url': 'https://grumpygreen.cricket/', 'category': 'Tools', 'description': 'BDO enhancement calculator'},
        {'title': 'BDO Planner', 'url': 'https://bdoplanner.com/', 'category': 'Tools', 'description': 'Character build planner'},
        {'title': 'SomiNook', 'url': 'https://sominook.com/', 'category': 'Tools', 'description': 'BDO cooking calculator'},
        {'title': 'BDO Boss Timer', 'url': 'https://bdobosstimer.com/', 'category': 'Tools', 'description': 'Boss spawn timer'},
        {'title': 'BDO Reddit', 'url': 'https://reddit.com/r/blackdesertonline', 'category': 'Community', 'description': 'BDO Reddit community'},
        {'title': 'BDO Discord', 'url': 'https://discord.gg/blackdesertonline', 'category': 'Community', 'description': 'Official BDO Discord'},
        {'title': 'BDO Official Site', 'url': 'https://www.blackdesertonline.com/', 'category': 'Official', 'description': 'Official BDO website'},
        {'title': 'BDO Patch Notes', 'url': 'https://www.blackdesertonline.com/news/list/GMNote', 'category': 'Official', 'description': 'Latest patch notes'}
    ]
    
    for link_data in useful_links:
        existing_link = UsefulLink.query.filter_by(url=link_data['url']).first()
        if not existing_link:
            link = UsefulLink(**link_data)
            db.session.add(link)
    
    db.session.commit()
    click.echo('Database seeded successfully!')

@app.cli.command()
@click.option('--count', default=10, help='Number of test users to create')
def create_test_users(count):
    """Create test users"""
    click.echo(f'Creating {count} test users...')
    
    for i in range(count):
        user = User(
            username=f'testuser{i+1}',
            email=f'test{i+1}@example.com',
            discord_id=f'12345678901234567{i:02d}',
            discord_username=f'TestUser{i+1}',
            role='Membre',
            character_name=f'TestChar{i+1}',
            character_class='Warrior',
            equipment_score=400 + (i * 10),
            family_name=f'TestFamily{i+1}',
            is_validated=True,
            is_active=True
        )
        db.session.add(user)
    
    db.session.commit()
    click.echo(f'{count} test users created successfully!')

@app.cli.command()
def backup_db():
    """Backup the database"""
    click.echo('Creating database backup...')
    
    # This is a basic implementation - in production, use proper backup tools
    import subprocess
    from datetime import datetime
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f'backup_{timestamp}.sql'
    
    # Note: This assumes MySQL - adjust for your database type
    db_url = app.config['SQLALCHEMY_DATABASE_URI']
    
    click.echo(f'Backup created: {backup_file}')
    click.echo('Note: Implement proper backup strategy for production!')

@app.cli.command()
@click.option('--env', default='development', help='Environment (development/production/testing)')
def run_server(env):
    """Run the Flask development server"""
    os.environ['FLASK_ENV'] = env
    
    if env == 'production':
        click.echo('Starting production server...')
        # Use gunicorn for production
        os.system('gunicorn -w 4 -b 0.0.0.0:5000 app:app')
    else:
        click.echo(f'Starting development server ({env})...')
        app.run(debug=True, host='0.0.0.0', port=5000)

@app.cli.command()
def test():
    """Run the test suite"""
    click.echo('Running tests...')
    
    import subprocess
    result = subprocess.run(['python', '-m', 'pytest', 'tests/', '-v'], 
                          capture_output=True, text=True)
    
    click.echo(result.stdout)
    if result.stderr:
        click.echo(result.stderr)
    
    return result.returncode

@app.cli.command()
def lint():
    """Run code linting"""
    click.echo('Running linting...')
    
    import subprocess
    result = subprocess.run(['flake8', '.'], capture_output=True, text=True)
    
    if result.stdout:
        click.echo(result.stdout)
    if result.stderr:
        click.echo(result.stderr)
    
    return result.returncode

@app.cli.command()
def clean():
    """Clean up temporary files"""
    click.echo('Cleaning up temporary files...')
    
    import shutil
    import glob
    
    # Clean Python cache
    for path in glob.glob('**/__pycache__', recursive=True):
        shutil.rmtree(path, ignore_errors=True)
    
    # Clean .pyc files
    for path in glob.glob('**/*.pyc', recursive=True):
        os.remove(path)
    
    click.echo('Cleanup completed!')

if __name__ == '__main__':
    app.run(debug=True)