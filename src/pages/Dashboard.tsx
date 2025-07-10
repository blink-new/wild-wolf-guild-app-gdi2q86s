import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, MessageSquare, TrendingUp, Crown, Shield, Sword } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';


export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    upcomingEvents: 0,
    forumPosts: 0,
  });

  const [recentEvents] = useState([
    { id: 1, title: 'Node War - Balenos', date: '2024-01-15', time: '20:00', type: 'pvp' },
    { id: 2, title: 'Guild Boss Hunt', date: '2024-01-16', time: '19:00', type: 'pve' },
    { id: 3, title: 'Weekly Meeting', date: '2024-01-17', time: '18:30', type: 'meeting' },
  ]);

  const [guildNews] = useState([
    { id: 1, title: 'New Member Orientation', content: 'Welcome to all new members! Please check the wiki for guild guidelines.', author: 'Guild Master', date: '2024-01-14' },
    { id: 2, title: 'Node War Victory!', content: 'Congratulations to all members for our victory in last nights node war!', author: 'Officer', date: '2024-01-13' },
    { id: 3, title: 'Equipment Enhancement Event', content: 'Dont forget about the guild enhancement event this weekend.', author: 'Quartermaster', date: '2024-01-12' },
  ]);

  useEffect(() => {
    // Simulate loading stats
    const loadStats = async () => {
      // In a real app, this would fetch from the database
      setStats({
        totalMembers: 45,
        activeMembers: 38,
        upcomingEvents: 3,
        forumPosts: 127,
      });
    };

    loadStats();
  }, []);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'pvp': return 'bg-red-500';
      case 'pve': return 'bg-blue-500';
      case 'meeting': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'pvp': return <Sword className="w-4 h-4" />;
      case 'pve': return <Shield className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Welcome Section */}
      <div className="text-center py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Welcome back, {user?.name || 'Guild Member'}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg"
        >
          Wild Wolf Guild Dashboard - {new Date().toLocaleDateString()}
        </motion.p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Members</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalMembers}</div>
              <p className="text-xs text-gray-500">
                {stats.activeMembers} active this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.upcomingEvents}</div>
              <p className="text-xs text-gray-500">
                This week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Forum Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.forumPosts}</div>
              <p className="text-xs text-gray-500">
                12 new this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Guild Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Very High</div>
              <p className="text-xs text-gray-500">
                +15% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Upcoming Events
              </CardTitle>
              <CardDescription className="text-gray-400">
                Don't miss these important guild activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50">
                  <div className={`w-10 h-10 rounded-lg ${getEventTypeColor(event.type)} flex items-center justify-center text-white`}>
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <p className="text-sm text-gray-400">{event.date} at {event.time}</p>
                  </div>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    {event.type.toUpperCase()}
                  </Badge>
                </div>
              ))}
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                View All Events
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Guild News */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Guild News
              </CardTitle>
              <CardDescription className="text-gray-400">
                Latest announcements and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guildNews.map((news) => (
                <div key={news.id} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{news.title}</h3>
                    <span className="text-xs text-gray-500">{news.date}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{news.content}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {news.author}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                View All News
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};