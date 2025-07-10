import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export const Wiki = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles] = useState([
    {
      id: 1,
      title: 'Guild Rules & Guidelines',
      category: 'Administration',
      content: 'Essential rules every guild member must follow...',
      author: 'Guild Master',
      lastUpdated: '2024-01-10',
      tags: ['rules', 'guidelines', 'important']
    },
    {
      id: 2,
      title: 'Node War Strategy Guide',
      category: 'PvP',
      content: 'Complete guide to node war tactics and strategies...',
      author: 'War Commander',
      lastUpdated: '2024-01-12',
      tags: ['pvp', 'strategy', 'nodewar']
    },
    {
      id: 3,
      title: 'Boss Hunting Schedule',
      category: 'PvE',
      content: 'Weekly boss hunting schedule and strategies...',
      author: 'Hunt Master',
      lastUpdated: '2024-01-14',
      tags: ['pve', 'boss', 'schedule']
    },
  ]);

  const categories = ['All', 'Administration', 'PvP', 'PvE', 'Trading', 'Crafting'];

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold text-white">Guild Wiki</h1>
          <p className="text-gray-400">Knowledge base for guild members</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Button>
      </div>

      {/* Search */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search articles, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
        </CardContent>
      </Card>

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

      {/* Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="w-6 h-6 text-amber-500" />
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                    {article.category}
                  </Badge>
                </div>
                <CardTitle className="text-white">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {article.content}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>By {article.author}</span>
                  <span>Updated {article.lastUpdated}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                    Read More
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-500/20 text-gray-400 hover:bg-gray-500/10">
                    <Edit className="w-4 h-4" />
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