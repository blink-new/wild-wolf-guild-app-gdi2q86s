import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Activity, BarChart3, Shield, UserCheck, Search, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import apiClient from '../lib/apiClient';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_validated: boolean;
  character_class?: string;
  equipment_score?: number;
  created_at: string;
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  target: string | null;
  time: string;
}

export const AdminPanel = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingMembers, setPendingMembers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, usersRes, logsRes] = await Promise.all([
          apiClient.get('/admin/statistics'),
          apiClient.get('/admin/users'),
          apiClient.get('/admin/activity-logs'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
        setPendingMembers(usersRes.data.users.filter((u: User) => !u.is_validated));
        setLogs(logsRes.data.logs);
      } catch {
        setError('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const filteredUsers = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApproveUser = async (userId: number) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiClient.post(`/admin/users/${userId}/validate`, { is_validated: true });
      setActionSuccess('User approved!');
      setPendingMembers(pendingMembers.filter(u => u.id !== userId));
      setUsers(users.map(u => u.id === userId ? { ...u, is_validated: true } : u));
    } catch {
      setActionError('Failed to approve user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectUser = async (userId: number) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setActionSuccess('User rejected/deleted!');
      setPendingMembers(pendingMembers.filter(u => u.id !== userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch {
      setActionError('Failed to reject/delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
      setActionSuccess('Role updated!');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      setActionError('Failed to update role.');
    } finally {
      setActionLoading(false);
    }
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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Members</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.users.total}</div>
              <p className="text-xs text-gray-500">
                {stats.users.active_week} active this week
              </p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Validated Members</CardTitle>
              <UserCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.users.validated}</div>
              <p className="text-xs text-gray-500">
                Awaiting approval: {stats.users.total - stats.users.validated}
              </p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Events This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.events.total}</div>
              <p className="text-xs text-gray-500">
                Upcoming: {stats.events.upcoming}
              </p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Forum Posts</CardTitle>
              <Activity className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.forum.total_posts}</div>
              <p className="text-xs text-gray-500">
                This week: {stats.forum.posts_this_week}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
                    {member.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">{member.username}</h3>
                  <p className="text-sm text-gray-400">
                    {member.character_class || ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApproveUser(member.id)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={actionLoading}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectUser(member.id)}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  disabled={actionLoading}
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

      {/* Users Table */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            All Guild Members
          </CardTitle>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-md py-2 px-3 w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                <SelectItem value="Maître">Maître</SelectItem>
                <SelectItem value="Conseiller">Conseiller</SelectItem>
                <SelectItem value="Officier">Officier</SelectItem>
                <SelectItem value="Quartier-Maître">Quartier-Maître</SelectItem>
                <SelectItem value="Membre">Membre</SelectItem>
                <SelectItem value="Recrue">Recrue</SelectItem>
                <SelectItem value="Invité">Invité</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700 text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Validated</th>
                <th className="px-4 py-2 text-left">Joined</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-slate-700">
                  <td className="px-4 py-2 text-white font-medium">{user.username}</td>
                  <td className="px-4 py-2 text-gray-400">{user.email}</td>
                  <td className="px-4 py-2">
                    <Select value={user.role} onValueChange={role => handleRoleChange(user.id, role)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                        <SelectItem value="Maître">Maître</SelectItem>
                        <SelectItem value="Conseiller">Conseiller</SelectItem>
                        <SelectItem value="Officier">Officier</SelectItem>
                        <SelectItem value="Quartier-Maître">Quartier-Maître</SelectItem>
                        <SelectItem value="Membre">Membre</SelectItem>
                        <SelectItem value="Recrue">Recrue</SelectItem>
                        <SelectItem value="Invité">Invité</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2">
                    {user.is_validated ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Yes</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/20">No</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => handleRejectUser(user.id)} disabled={actionLoading}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10" disabled>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700 text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Target</th>
                <th className="px-4 py-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-slate-700">
                  <td className="px-4 py-2 text-white font-medium">{log.user}</td>
                  <td className="px-4 py-2 text-gray-400">{log.action}</td>
                  <td className="px-4 py-2 text-gray-400">{log.target || '-'}</td>
                  <td className="px-4 py-2 text-gray-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Feedback */}
      {actionError && <div className="text-red-500 text-center mt-4">{actionError}</div>}
      {actionSuccess && <div className="text-green-500 text-center mt-4">{actionSuccess}</div>}
    </motion.div>
  );
};
