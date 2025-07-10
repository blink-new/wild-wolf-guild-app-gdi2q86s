import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Activity, BarChart3, Shield, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const AdminPanel = () => {
  const [pendingMembers] = useState([
    { id: 1, name: 'NewPlayer123', joinDate: '2024-01-15', level: 45, class: 'Sorceress' },
    { id: 2, name: 'VeteranReturner', joinDate: '2024-01-14', level: 58, class: 'Warrior' },
  ]);

  const [guildStats] = useState({
    totalMembers: 45,
    activeThisWeek: 38,
    pendingApplications: 2,
    eventsThisMonth: 12,
    forumPosts: 127,
    avgLevel: 59.2,
    avgEquipmentScore: 642
  });

  const [recentActivities] = useState([
    { id: 1, user: 'DragonSlayer', action: 'created event', target: 'Node War - Balenos', time: '2 hours ago' },
    { id: 2, user: 'ShadowMage', action: 'joined guild', target: null, time: '1 day ago' },
    { id: 3, user: 'Admin', action: 'promoted', target: 'IronGuard to Officer', time: '2 days ago' },
  ]);

  const handleApproveUser = (userId: number) => {
    // In a real app, this would approve the user
    console.log('Approving user:', userId);
  };

  const handleRejectUser = (userId: number) => {
    // In a real app, this would reject the user
    console.log('Rejecting user:', userId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400">Manage guild members and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20">
            Administrator
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Members</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{guildStats.totalMembers}</div>
            <p className="text-xs text-gray-500">
              {guildStats.activeThisWeek} active this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Applications</CardTitle>
            <UserCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{guildStats.pendingApplications}</div>
            <p className="text-xs text-gray-500">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Events This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{guildStats.eventsThisMonth}</div>
            <p className="text-xs text-gray-500">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Equipment Score</CardTitle>
            <Settings className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{guildStats.avgEquipmentScore}</div>
            <p className="text-xs text-gray-500">
              Level {guildStats.avgLevel} average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Members */}
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              Pending Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                      {member.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-gray-400">
                      Level {member.level} {member.class}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveUser(member.id)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectUser(member.id)}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingMembers.length === 0 && (
              <p className="text-gray-400 text-center py-4">No pending applications</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm">
                    {activity.user[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                    {activity.target && <span className="text-amber-400"> {activity.target}</span>}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Management Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
              <h3 className="font-semibold text-white mb-2">Member Role Management</h3>
              <p className="text-sm text-gray-400 mb-3">Assign roles to guild members</p>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="bg-slate-600/50 border-slate-500 text-white">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="member1">DragonSlayer</SelectItem>
                    <SelectItem value="member2">ShadowMage</SelectItem>
                    <SelectItem value="member3">IronGuard</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                  Manage
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
              <h3 className="font-semibold text-white mb-2">Guild Settings</h3>
              <p className="text-sm text-gray-400 mb-3">Configure guild parameters</p>
              <Button variant="outline" className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                Open Settings
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50">
              <h3 className="font-semibold text-white mb-2">Export Data</h3>
              <p className="text-sm text-gray-400 mb-3">Export guild data and reports</p>
              <Button variant="outline" className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};