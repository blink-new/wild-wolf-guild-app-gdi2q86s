import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Dialog, DialogContent } from './ui/dialog';
import { Badge } from './ui/badge';
import { 
  Search, 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  Crown,

  Shield,
  Sword,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords: string[];
  shortcut?: string;
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      description: 'Go to main dashboard',
      icon: <Crown className="w-4 h-4" />,
      action: () => navigate('/'),
      category: 'Navigation',
      keywords: ['home', 'main', 'overview'],
      shortcut: 'Ctrl+D'
    },
    {
      id: 'nav-members',
      title: 'Members',
      description: 'Manage guild members',
      icon: <Users className="w-4 h-4" />,
      action: () => navigate('/members'),
      category: 'Navigation',
      keywords: ['users', 'guild', 'roster'],
      shortcut: 'Ctrl+M'
    },
    {
      id: 'nav-events',
      title: 'Events',
      description: 'View guild calendar',
      icon: <Calendar className="w-4 h-4" />,
      action: () => navigate('/calendar'),
      category: 'Navigation',
      keywords: ['calendar', 'schedule', 'raids'],
      shortcut: 'Ctrl+E'
    },
    {
      id: 'nav-wiki',
      title: 'Wiki',
      description: 'Browse guild knowledge base',
      icon: <BookOpen className="w-4 h-4" />,
      action: () => navigate('/wiki'),
      category: 'Navigation',
      keywords: ['guides', 'help', 'documentation'],
      shortcut: 'Ctrl+W'
    },
    {
      id: 'nav-forum',
      title: 'Forum',
      description: 'Guild discussions',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => navigate('/forum'),
      category: 'Navigation',
      keywords: ['discussion', 'chat', 'posts'],
      shortcut: 'Ctrl+F'
    },
    {
      id: 'nav-utilities',
      title: 'BDO Utilities',
      description: 'Game tools and timers',
      icon: <Sword className="w-4 h-4" />,
      action: () => navigate('/utilities'),
      category: 'Navigation',
      keywords: ['tools', 'timers', 'bosses'],
      shortcut: 'Ctrl+U'
    },
    {
      id: 'nav-profile',
      title: 'My Profile',
      description: 'Edit your profile',
      icon: <User className="w-4 h-4" />,
      action: () => navigate('/profile'),
      category: 'Navigation',
      keywords: ['account', 'settings', 'personal'],
      shortcut: 'Ctrl+P'
    },
    {
      id: 'nav-admin',
      title: 'Admin Panel',
      description: 'Guild administration',
      icon: <Shield className="w-4 h-4" />,
      action: () => navigate('/admin'),
      category: 'Navigation',
      keywords: ['admin', 'management', 'control'],
      shortcut: 'Ctrl+A'
    },
    // Quick Actions
    {
      id: 'action-new-event',
      title: 'Create New Event',
      description: 'Schedule a guild event',
      icon: <Calendar className="w-4 h-4" />,
      action: () => {
        navigate('/calendar');
        // TODO: Open create event modal
      },
      category: 'Quick Actions',
      keywords: ['create', 'schedule', 'event', 'raid'],
    },
    {
      id: 'action-new-post',
      title: 'Create Forum Post',
      description: 'Start a new discussion',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => {
        navigate('/forum');
        // TODO: Open create post modal
      },
      category: 'Quick Actions',
      keywords: ['post', 'discussion', 'create'],
    },
    {
      id: 'action-invite-member',
      title: 'Invite Member',
      description: 'Send guild invitation',
      icon: <Users className="w-4 h-4" />,
      action: () => {
        navigate('/members');
        // TODO: Open invite modal
      },
      category: 'Quick Actions',
      keywords: ['invite', 'recruit', 'member'],
    },
    // Settings
    {
      id: 'settings-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        // TODO: Toggle theme
      },
      category: 'Settings',
      keywords: ['theme', 'dark', 'light', 'appearance'],
    },
  ];

  const filteredCommands = commands.filter(command => {
    const searchTerm = search.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const category = command.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (command: CommandItem) => {
    command.action();
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <Badge variant="outline" className="ml-auto text-xs border-slate-600">
          ⌘K
        </Badge>
      </button>

      {/* Command Palette Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 bg-slate-900/95 backdrop-blur-sm border-slate-700">
          <Command className="rounded-lg border-none">
            <CommandInput
              ref={inputRef}
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="border-none bg-transparent text-white placeholder-gray-400"
            />
            <CommandList className="max-h-[400px] overflow-y-auto">
              <CommandEmpty className="py-6 text-center text-gray-400">
                No results found.
              </CommandEmpty>
              
              <AnimatePresence>
                {Object.entries(groupedCommands).map(([category, commands]) => (
                  <CommandGroup key={category} heading={category}>
                    {commands.map((command) => (
                      <motion.div
                        key={command.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CommandItem
                          onSelect={() => handleSelect(command)}
                          className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 cursor-pointer"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 text-amber-400">
                            {command.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{command.title}</div>
                            <div className="text-sm text-gray-400 truncate">
                              {command.description}
                            </div>
                          </div>
                          {command.shortcut && (
                            <Badge variant="outline" className="text-xs border-slate-600">
                              {command.shortcut}
                            </Badge>
                          )}
                        </CommandItem>
                      </motion.div>
                    ))}
                  </CommandGroup>
                ))}
              </AnimatePresence>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};