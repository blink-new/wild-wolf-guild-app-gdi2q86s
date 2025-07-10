import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pin, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import apiClient from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  replies: number;
  lastReply: string;
  isPinned: boolean;
  createdAt: string;
}

export const Forum = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchForum = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, postRes] = await Promise.all([
          apiClient.get('/forum/categories'),
          apiClient.get('/forum/posts'),
        ]);
        setCategories([{ id: 0, name: 'All', description: '', slug: 'all' }, ...catRes.data.categories]);
        setPosts(postRes.data.posts);
      } catch {
        setError('Failed to load forum data.');
      } finally {
        setLoading(false);
      }
    };
    fetchForum();
  }, []);

  const filteredPosts = posts.filter(post =>
    selectedCategory === 'All' || post.category === selectedCategory
  );

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
            key={category.slug}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            className={`cursor-pointer border-amber-500/20 text-amber-400 hover:bg-amber-500/10 ${selectedCategory === category.name ? 'bg-amber-500/20' : ''}`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center text-gray-400 py-8">Loading forum...</div>
      )}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}

      {/* Posts */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
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
                    <Button variant="outline" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10" onClick={() => navigate(`/forum/${post.id}`)}>
                      View Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};