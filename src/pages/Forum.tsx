import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pin, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

export const Forum = () => {
  const [posts] = useState([
    {
      id: 1,
      title: 'Node War Discussion - Balenos Strategy',
      content: 'Lets discuss our strategy for the upcoming node war...',
      author: 'WarCommander',
      category: 'PvP',
      replies: 12,
      lastReply: '2 hours ago',
      isPinned: true,
      createdAt: '2024-01-14'
    },
    {
      id: 2,
      title: 'Guild Enhancement Event Planning',
      content: 'Planning our next guild enhancement event...',
      author: 'GuildMaster',
      category: 'Events',
      replies: 8,
      lastReply: '4 hours ago',
      isPinned: false,
      createdAt: '2024-01-13'
    },
    {
      id: 3,
      title: 'New Member Introductions',
      content: 'Welcome thread for new guild members...',
      author: 'Quartermaster',
      category: 'General',
      replies: 25,
      lastReply: '1 hour ago',
      isPinned: false,
      createdAt: '2024-01-12'
    },
  ]);

  const categories = ['All', 'General', 'PvP', 'PvE', 'Events', 'Trading'];

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
          <h1 className="text-3xl font-bold text-white">Guild Forum</h1>
          <p className="text-gray-400">Discuss and share with guild members</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className="cursor-pointer border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        {post.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-white">{post.title}</CardTitle>
                        {post.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                      </div>
                      <p className="text-sm text-gray-400">
                        by {post.author} • {post.createdAt}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                    {post.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.replies} replies
                    </div>
                    <div>Last reply: {post.lastReply}</div>
                  </div>
                  <Button variant="outline" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                    View Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};