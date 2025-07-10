import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus, Crown, Shield, Sword, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [members] = useState([
    { 
      id: 1, 
      name: 'DragonSlayer', 
      role: 'SuperAdmin', 
      level: 62, 
      class: 'Warrior', 
      equipmentScore: 680, 
      status: 'online',
      avatar: '/api/placeholder/32/32',
      lastSeen: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'ShadowMage', 
      role: 'Maître', 
      level: 61, 
      class: 'Witch', 
      equipmentScore: 665, 
      status: 'online',
      avatar: '/api/placeholder/32/32',
      lastSeen: '2024-01-15'
    },
    { 
      id: 3, 
      name: 'StealthHunter', 
      role: 'Officier', 
      level: 60, 
      class: 'Ranger', 
      equipmentScore: 642, 
      status: 'offline',
      avatar: '/api/placeholder/32/32',
      lastSeen: '2024-01-14'
    },
    { 
      id: 4, 
      name: 'IronGuard', 
      role: 'Quartier-Maître', 
      level: 59, 
      class: 'Guardian', 
      equipmentScore: 635, 
      status: 'online',
      avatar: '/api/placeholder/32/32',
      lastSeen: '2024-01-15'
    },
    { 
      id: 5, 
      name: 'SwiftBlade', 
      role: 'Membre', 
      level: 58, 
      class: 'Ninja', 
      equipmentScore: 620, 
      status: 'offline',
      avatar: '/api/placeholder/32/32',
      lastSeen: '2024-01-13'
    },
    { 
      id: 6, 
      name: 'MysticHealer', 
      role: 'Membre', 
      level: 57, 
      class: 'Mystic', 
      equipmentScore: 605, 
      status: 'online',
      avatar: '/api/placeholder/32/32',
      lastSeen: '2024-01-15'
    },
  ]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return <Crown className="w-4 h-4 text-amber-500" />;
      case 'Maître': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'Officier': return <Sword className="w-4 h-4 text-blue-500" />;
      case 'Quartier-Maître': return <Users className="w-4 h-4 text-green-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
      case 'Maître': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      case 'Officier': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'Quartier-Maître': return 'bg-green-500/20 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-500';
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
          <h1 className="text-3xl font-bold text-white">Guild Members</h1>
          <p className="text-gray-400">Manage and view all guild members</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                <SelectItem value="Maître">Maître</SelectItem>
                <SelectItem value="Officier">Officier</SelectItem>
                <SelectItem value="Quartier-Maître">Quartier-Maître</SelectItem>
                <SelectItem value="Membre">Membre</SelectItem>
                <SelectItem value="Recrue">Recrue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{member.name}</h3>
                      {getRoleIcon(member.role)}
                    </div>
                    <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Level</p>
                    <p className="text-white font-semibold">{member.level}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Class</p>
                    <p className="text-white font-semibold">{member.class}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Equipment Score</p>
                    <p className="text-white font-semibold">{member.equipmentScore}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className={`font-semibold ${member.status === 'online' ? 'text-green-400' : 'text-gray-400'}`}>
                      {member.status}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last seen: {member.lastSeen}
                </div>
                <Button variant="outline" className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};