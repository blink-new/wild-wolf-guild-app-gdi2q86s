import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications] = useState([
    { id: 1, message: 'New member joined the guild', time: '2 min ago' },
    { id: 2, message: 'Boss fight event in 1 hour', time: '30 min ago' },
    { id: 3, message: 'Forum post requires moderation', time: '1 hour ago' },
  ]);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-sm border-b border-amber-500/20 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search members, events, wiki..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-400 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 text-white text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
              <div className="p-3 border-b border-slate-700">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-3 text-gray-300">
                  <div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              {notifications.length === 0 && (
                <DropdownMenuItem className="p-3 text-gray-500">
                  No new notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <div className="p-3 border-b border-slate-700">
                <p className="text-sm font-medium text-white">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-400">{user?.role || 'Member'}</p>
              </div>
              <DropdownMenuItem className="text-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                onClick={logout}
                className="text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};