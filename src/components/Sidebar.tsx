import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Mail, 
  Settings, 
  User, 
  Crown,
  Shield,
  Sword
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/members', icon: Users, label: 'Members' },
  { path: '/calendar', icon: Calendar, label: 'Events' },
  { path: '/wiki', icon: BookOpen, label: 'Wiki' },
  { path: '/forum', icon: MessageSquare, label: 'Forum' },
  { path: '/messages', icon: Mail, label: 'Messages' },
  { path: '/utilities', icon: Sword, label: 'Utilities' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/admin', icon: Settings, label: 'Admin', adminOnly: true },
];

export const Sidebar = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-amber-500/20 p-6"
    >
      {/* Guild Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Wild Wolf</h1>
            <p className="text-sm text-gray-400">Guild</p>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.role || 'Member'}
            </p>
          </div>
          <div className="flex items-center">
            {user?.role === 'SuperAdmin' && <Crown className="w-4 h-4 text-amber-500" />}
            {user?.role === 'Maître' && <Shield className="w-4 h-4 text-purple-500" />}
            {user?.role === 'Officier' && <Sword className="w-4 h-4 text-blue-500" />}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isAdmin = item.adminOnly && user?.role !== 'SuperAdmin';
          
          if (isAdmin) return null;
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-slate-800/50 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-amber-400 border-l-4 border-amber-500' 
                      : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-700/50">
        <p className="text-xs text-gray-500 text-center">
          Wild Wolf Guild Management
        </p>
        <p className="text-xs text-gray-600 text-center mt-1">
          Black Desert Online
        </p>
      </div>
    </motion.div>
  );
};