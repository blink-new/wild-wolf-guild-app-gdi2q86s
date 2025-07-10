import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Activity, 
  Clock, 
  Users, 
  Zap, 
  TrendingUp, 
  Calendar, 
  MessageSquare,
  Crown,

  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Wifi,
  Server
} from 'lucide-react';

interface Widget {
  id: string;
  title: string;
  type: 'stat' | 'activity' | 'progress' | 'status' | 'chart';
  size: 'small' | 'medium' | 'large';
  data: unknown;
  priority: number;
}

interface ActivityItem {
  id: string;
  type: 'join' | 'leave' | 'event' | 'forum' | 'achievement';
  user: string;
  action: string;
  timestamp: Date;
  icon: React.ReactNode;
}

interface ServerStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  players: number;
  maxPlayers: number;
  ping: number;
}

export const AdvancedWidgets = () => {

  const [realtimeData, setRealtimeData] = useState({
    onlineMembers: 0,
    serverStatus: [] as ServerStatus[],
    recentActivity: [] as ActivityItem[],
    guildExp: 0,
    nextNodeWar: null as Date | null,
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        onlineMembers: Math.floor(Math.random() * 45) + 15,
        serverStatus: [
          {
            name: 'Heidel',
            status: 'online',
            players: Math.floor(Math.random() * 2000) + 1500,
            maxPlayers: 3000,
            ping: Math.floor(Math.random() * 50) + 20,
          },
          {
            name: 'Calpheon',
            status: 'online',
            players: Math.floor(Math.random() * 1800) + 1200,
            maxPlayers: 2500,
            ping: Math.floor(Math.random() * 60) + 25,
          },
          {
            name: 'Valencia',
            status: Math.random() > 0.1 ? 'online' : 'maintenance',
            players: Math.floor(Math.random() * 1500) + 800,
            maxPlayers: 2000,
            ping: Math.floor(Math.random() * 80) + 30,
          },
        ],
        guildExp: Math.floor(Math.random() * 100),
        nextNodeWar: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generate recent activity
  useEffect(() => {
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'join',
        user: 'ShadowKnight',
        action: 'joined the guild',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        icon: <Users className="w-4 h-4 text-green-500" />
      },
      {
        id: '2',
        type: 'event',
        user: 'GuildMaster',
        action: 'scheduled Node War event',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        icon: <Calendar className="w-4 h-4 text-blue-500" />
      },
      {
        id: '3',
        type: 'achievement',
        user: 'DragonSlayer',
        action: 'earned Conqueror achievement',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        icon: <Crown className="w-4 h-4 text-amber-500" />
      },
      {
        id: '4',
        type: 'forum',
        user: 'TacticalWolf',
        action: 'posted in Strategy Discussion',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        icon: <MessageSquare className="w-4 h-4 text-purple-500" />
      },
    ];

    setRealtimeData(prev => ({
      ...prev,
      recentActivity: activities
    }));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <XCircle className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Real-time Guild Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Live Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time guild updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence mode="popLayout">
              {realtimeData.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30"
                >
                  <div className="flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Server Status Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-500" />
              Server Status
            </CardTitle>
            <CardDescription className="text-gray-400">
              BDO server monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {realtimeData.serverStatus.map((server, index) => (
              <motion.div
                key={server.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 ${getStatusColor(server.status)}`}>
                    {getStatusIcon(server.status)}
                    <span className="text-sm font-medium">{server.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {server.players}/{server.maxPlayers}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{server.ping}ms</span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Online Members Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Online Now
            </CardTitle>
            <CardDescription className="text-gray-400">
              Active guild members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <motion.div
                key={realtimeData.onlineMembers}
                initial={{ scale: 1.2, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-white mb-2"
              >
                {realtimeData.onlineMembers}
              </motion.div>
              <p className="text-sm text-gray-400">members online</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Guild Progress Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Guild Progress
            </CardTitle>
            <CardDescription className="text-gray-400">
              Weekly objectives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Guild EXP</span>
                <span className="text-sm text-gray-400">{realtimeData.guildExp}%</span>
              </div>
              <Progress 
                value={realtimeData.guildExp} 
                className="h-2 bg-slate-700" 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Node War Prep</span>
                <span className="text-sm text-gray-400">75%</span>
              </div>
              <Progress 
                value={75} 
                className="h-2 bg-slate-700" 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Guild Missions</span>
                <span className="text-sm text-gray-400">60%</span>
              </div>
              <Progress 
                value={60} 
                className="h-2 bg-slate-700" 
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Event Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Next Event
            </CardTitle>
            <CardDescription className="text-gray-400">
              Upcoming guild activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">
                Node War
              </div>
              <div className="text-sm text-gray-400 mb-3">
                Balenos Territory
              </div>
              <div className="text-2xl font-mono text-amber-400">
                2d 14h 32m
              </div>
              <Button 
                size="sm" 
                className="mt-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                Join Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left border-slate-600 hover:bg-slate-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Event
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left border-slate-600 hover:bg-slate-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Forum Post
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left border-slate-600 hover:bg-slate-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};