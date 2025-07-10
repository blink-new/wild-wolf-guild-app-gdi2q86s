import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Sword, Shield, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const Utilities = () => {
  const [bossTimers] = useState([
    {
      id: 1,
      name: 'Karanda',
      nextSpawn: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      location: 'Karanda Nest',
      level: 'Level 60+',
      rewards: 'Karanda Heart, Liverto Weapon'
    },
    {
      id: 2,
      name: 'Kzarka',
      nextSpawn: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      location: 'Serendia Shrine',
      level: 'Level 50+',
      rewards: 'Kzarka Weapon, Black Stone'
    },
    {
      id: 3,
      name: 'Nouver',
      nextSpawn: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      location: 'Nouver\'s Nest',
      level: 'Level 60+',
      rewards: 'Nouver Sub-weapon, Crystal'
    },
  ]);

  const [usefulLinks] = useState([
    {
      id: 1,
      title: 'BDO Database',
      url: 'https://bdocodex.com',
      description: 'Complete item and quest database',
      category: 'Database'
    },
    {
      id: 2,
      title: 'Enhancement Calculator',
      url: 'https://bdo-enhancement-calc.com',
      description: 'Calculate enhancement probabilities',
      category: 'Tools'
    },
    {
      id: 3,
      title: 'Node War Map',
      url: 'https://bdo-nodewar.com',
      description: 'Interactive node war map',
      category: 'PvP'
    },
    {
      id: 4,
      title: 'Trade Route Calculator',
      url: 'https://bdo-trade.com',
      description: 'Optimize your trading routes',
      category: 'Trading'
    },
  ]);

  const getTimeUntilSpawn = (spawnTime: Date) => {
    const now = new Date();
    const diff = spawnTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getBossIcon = (name: string) => {
    switch (name) {
      case 'Karanda': return <Crown className="w-6 h-6 text-purple-500" />;
      case 'Kzarka': return <Sword className="w-6 h-6 text-red-500" />;
      case 'Nouver': return <Shield className="w-6 h-6 text-blue-500" />;
      default: return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Database': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'Tools': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'PvP': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'Trading': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">BDO Utilities</h1>
        <p className="text-gray-400">Helpful tools and resources for Black Desert Online</p>
      </div>

      {/* Boss Timers */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Boss Timers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bossTimers.map((boss, index) => (
              <motion.div
                key={boss.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  {getBossIcon(boss.name)}
                  <div>
                    <h3 className="font-semibold text-white">{boss.name}</h3>
                    <p className="text-sm text-gray-400">{boss.location}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next spawn:</span>
                    <span className="text-amber-400 font-semibold">
                      {getTimeUntilSpawn(boss.nextSpawn)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">{boss.level}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs">Rewards:</p>
                    <p className="text-green-400 text-xs">{boss.rewards}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Useful Links */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-amber-500" />
            Useful Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usefulLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 hover:border-amber-500/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{link.title}</h3>
                  <Badge className={getCategoryColor(link.category)}>
                    {link.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-3">{link.description}</p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Site
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};