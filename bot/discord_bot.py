import os
import discord
from discord.ext import commands, tasks
import asyncio
import logging
from datetime import datetime, timedelta
import requests
import json
from dotenv import load_dotenv
import aiohttp
import mysql.connector
from mysql.connector import Error

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Bot configuration
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.members = True
intents.presences = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'wild_wolf_guild'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'port': int(os.getenv('DB_PORT', 3306))
}

# API configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000/api')
GUILD_ID = int(os.getenv('DISCORD_GUILD_ID', '0'))

class DatabaseManager:
    """Database connection manager"""
    
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Connect to database"""
        try:
            self.connection = mysql.connector.connect(**DB_CONFIG)
            logger.info("Database connected successfully")
        except Error as e:
            logger.error(f"Database connection error: {e}")
            self.connection = None
    
    def disconnect(self):
        """Disconnect from database"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("Database disconnected")
    
    def execute_query(self, query, params=None):
        """Execute a query"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            result = cursor.fetchall()
            cursor.close()
            return result
        except Error as e:
            logger.error(f"Query execution error: {e}")
            return None
    
    def execute_update(self, query, params=None):
        """Execute an update query"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            self.connection.commit()
            cursor.close()
            return True
        except Error as e:
            logger.error(f"Update execution error: {e}")
            return False

# Global database manager
db_manager = DatabaseManager()

@bot.event
async def on_ready():
    """Bot startup event"""
    logger.info(f'{bot.user} has connected to Discord!')
    
    # Start background tasks
    sync_member_status.start()
    check_events.start()
    
    # Set bot status
    activity = discord.Game(name="Black Desert Online")
    await bot.change_presence(activity=activity)

@bot.event
async def on_member_join(member):
    """Handle new member joins"""
    logger.info(f'New member joined: {member.name}#{member.discriminator}')
    
    # Send welcome message
    welcome_channel = discord.utils.get(member.guild.channels, name='welcome')
    if welcome_channel:
        embed = discord.Embed(
            title="Welcome to Wild Wolf Guild!",
            description=f"Welcome {member.mention}! Please check out our website to complete your registration.",
            color=0xf59e0b
        )
        embed.add_field(
            name="Next Steps",
            value="1. Visit our guild website\n2. Complete your Discord authentication\n3. Fill out your character information\n4. Wait for validation from officers",
            inline=False
        )
        embed.set_thumbnail(url=member.avatar.url if member.avatar else member.default_avatar.url)
        await welcome_channel.send(embed=embed)

@bot.event
async def on_member_remove(member):
    """Handle member leaves"""
    logger.info(f'Member left: {member.name}#{member.discriminator}')
    
    # Update database
    query = "UPDATE users SET is_active = FALSE WHERE discord_id = %s"
    db_manager.execute_update(query, (str(member.id),))

@bot.command(name='register')
async def register_command(ctx):
    """Register command for new members"""
    embed = discord.Embed(
        title="Guild Registration",
        description="To register with Wild Wolf Guild, please visit our website and complete the Discord authentication process.",
        color=0x10b981
    )
    embed.add_field(
        name="Registration URL",
        value="[Click here to register](https://wildwolfguild.com/auth/discord/login)",
        inline=False
    )
    embed.add_field(
        name="Requirements",
        value="• Active Black Desert Online player\n• Discord account\n• Follow guild rules",
        inline=False
    )
    await ctx.send(embed=embed)

@bot.command(name='profile')
async def profile_command(ctx, member: discord.Member = None):
    """Show user profile"""
    if member is None:
        member = ctx.author
    
    # Get user data from database
    query = "SELECT * FROM users WHERE discord_id = %s"
    result = db_manager.execute_query(query, (str(member.id),))
    
    if not result:
        await ctx.send(f"No profile found for {member.mention}. Please register first using `!register`.")
        return
    
    user_data = result[0]
    
    embed = discord.Embed(
        title=f"Profile: {user_data[1]}",  # username
        color=0x3b82f6
    )
    
    embed.set_thumbnail(url=member.avatar.url if member.avatar else member.default_avatar.url)
    
    embed.add_field(name="Role", value=user_data[6] or "Unknown", inline=True)
    embed.add_field(name="Character", value=user_data[7] or "Not set", inline=True)
    embed.add_field(name="Class", value=user_data[8] or "Not set", inline=True)
    embed.add_field(name="Equipment Score", value=user_data[9] or "Not set", inline=True)
    embed.add_field(name="Family Name", value=user_data[10] or "Not set", inline=True)
    embed.add_field(name="Validated", value="✅ Yes" if user_data[13] else "❌ No", inline=True)
    
    if user_data[11]:  # bio
        embed.add_field(name="Bio", value=user_data[11][:100] + "...", inline=False)
    
    await ctx.send(embed=embed)

@bot.command(name='events')
async def events_command(ctx):
    """Show upcoming guild events"""
    query = """
    SELECT e.title, e.description, e.event_date, e.event_time, e.event_type, u.username
    FROM guild_events e
    JOIN users u ON e.created_by = u.id
    WHERE e.event_date >= CURDATE()
    ORDER BY e.event_date, e.event_time
    LIMIT 5
    """
    
    results = db_manager.execute_query(query)
    
    if not results:
        await ctx.send("No upcoming events scheduled.")
        return
    
    embed = discord.Embed(
        title="Upcoming Guild Events",
        color=0x10b981
    )
    
    for event in results:
        event_type_emoji = {
            'pvp': '⚔️',
            'pve': '🗡️',
            'meeting': '🏛️',
            'raid': '🐉',
            'other': '📅'
        }.get(event[4], '📅')
        
        embed.add_field(
            name=f"{event_type_emoji} {event[0]}",
            value=f"**Date:** {event[2]}\n**Time:** {event[3]}\n**Type:** {event[4].upper()}\n**Organizer:** {event[5]}\n**Description:** {event[1][:100]}...",
            inline=False
        )
    
    await ctx.send(embed=embed)

@bot.command(name='bosses')
async def bosses_command(ctx):
    """Show boss timers"""
    query = """
    SELECT boss_name, next_spawn, location, difficulty
    FROM bdo_boss_timers
    ORDER BY next_spawn
    LIMIT 10
    """
    
    results = db_manager.execute_query(query)
    
    if not results:
        await ctx.send("No boss timers available.")
        return
    
    embed = discord.Embed(
        title="BDO Boss Timers",
        color=0xdc2626
    )
    
    for boss in results:
        difficulty_emoji = {
            'Easy': '🟢',
            'Medium': '🟡',
            'Hard': '🟠',
            'Very Hard': '🔴'
        }.get(boss[3], '⚪')
        
        embed.add_field(
            name=f"{difficulty_emoji} {boss[0]}",
            value=f"**Next Spawn:** {boss[1]}\n**Location:** {boss[2]}\n**Difficulty:** {boss[3]}",
            inline=True
        )
    
    await ctx.send(embed=embed)

@bot.command(name='stats')
@commands.has_any_role('SuperAdmin', 'Maître', 'Conseiller', 'Officier')
async def stats_command(ctx):
    """Show guild statistics (Officers+ only)"""
    queries = {
        'total_members': "SELECT COUNT(*) FROM users WHERE is_active = TRUE",
        'validated_members': "SELECT COUNT(*) FROM users WHERE is_active = TRUE AND is_validated = TRUE",
        'online_members': "SELECT COUNT(*) FROM users WHERE is_active = TRUE AND last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
        'upcoming_events': "SELECT COUNT(*) FROM guild_events WHERE event_date >= CURDATE()",
        'total_posts': "SELECT COUNT(*) FROM forum_posts WHERE is_deleted = FALSE"
    }
    
    stats = {}
    for key, query in queries.items():
        result = db_manager.execute_query(query)
        stats[key] = result[0][0] if result else 0
    
    embed = discord.Embed(
        title="Guild Statistics",
        color=0x8b5cf6
    )
    
    embed.add_field(name="Total Members", value=stats['total_members'], inline=True)
    embed.add_field(name="Validated Members", value=stats['validated_members'], inline=True)
    embed.add_field(name="Active (7 days)", value=stats['online_members'], inline=True)
    embed.add_field(name="Upcoming Events", value=stats['upcoming_events'], inline=True)
    embed.add_field(name="Forum Posts", value=stats['total_posts'], inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='validate')
@commands.has_any_role('SuperAdmin', 'Maître', 'Conseiller', 'Officier')
async def validate_command(ctx, member: discord.Member):
    """Validate a member (Officers+ only)"""
    query = "UPDATE users SET is_validated = TRUE WHERE discord_id = %s"
    success = db_manager.execute_update(query, (str(member.id),))
    
    if success:
        embed = discord.Embed(
            title="Member Validated",
            description=f"{member.mention} has been validated!",
            color=0x10b981
        )
        await ctx.send(embed=embed)
        
        # Send DM to validated member
        try:
            await member.send("Congratulations! Your guild membership has been validated. You now have full access to guild features.")
        except discord.Forbidden:
            pass
    else:
        await ctx.send("Failed to validate member. Please check if they are registered.")

@tasks.loop(minutes=30)
async def sync_member_status():
    """Sync member online status with database"""
    guild = bot.get_guild(GUILD_ID)
    if not guild:
        return
    
    for member in guild.members:
        if member.bot:
            continue
        
        # Update last seen status
        query = "UPDATE users SET last_login = NOW() WHERE discord_id = %s AND is_active = TRUE"
        db_manager.execute_update(query, (str(member.id),))

@tasks.loop(hours=1)
async def check_events():
    """Check for upcoming events and send notifications"""
    query = """
    SELECT e.title, e.description, e.event_date, e.event_time, e.event_type
    FROM guild_events e
    WHERE e.event_date = CURDATE() 
    AND e.event_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
    """
    
    results = db_manager.execute_query(query)
    
    if not results:
        return
    
    guild = bot.get_guild(GUILD_ID)
    if not guild:
        return
    
    # Find events channel
    events_channel = discord.utils.get(guild.channels, name='events')
    if not events_channel:
        return
    
    for event in results:
        embed = discord.Embed(
            title=f"Event Starting Soon: {event[0]}",
            description=event[1],
            color=0xf59e0b
        )
        
        embed.add_field(name="Time", value=f"{event[2]} at {event[3]}", inline=True)
        embed.add_field(name="Type", value=event[4].upper(), inline=True)
        
        await events_channel.send("@everyone", embed=embed)

@bot.event
async def on_command_error(ctx, error):
    """Handle command errors"""
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"Missing required argument: {error.param.name}")
    elif isinstance(error, commands.MissingAnyRole):
        await ctx.send("You don't have permission to use this command.")
    elif isinstance(error, commands.MemberNotFound):
        await ctx.send("Member not found.")
    else:
        logger.error(f"Command error: {error}")
        await ctx.send("An error occurred while processing the command.")

def run_bot():
    """Run the Discord bot"""
    token = os.getenv('DISCORD_BOT_TOKEN')
    if not token:
        logger.error("DISCORD_BOT_TOKEN not found in environment variables")
        return
    
    # Connect to database
    db_manager.connect()
    
    try:
        bot.run(token)
    except Exception as e:
        logger.error(f"Bot error: {e}")
    finally:
        db_manager.disconnect()

if __name__ == "__main__":
    run_bot()