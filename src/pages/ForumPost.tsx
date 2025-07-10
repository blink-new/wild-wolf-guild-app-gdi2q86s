import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface ForumReply {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  replies: ForumReply[];
}

export const ForumPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [sending, setSending] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/forum/posts/${id}`);
        setPost(response.data.post);
      } catch {
        setError('Failed to load post.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [post?.replies]);

  const handleReply = async () => {
    if (!newReply.trim() || !user) return;
    setSending(true);
    try {
      const response = await apiClient.post(`/forum/posts/${id}/replies`, { content: newReply });
      setPost(p => p ? { ...p, replies: [...p.replies, response.data.reply] } : p);
      setNewReply('');
    } catch {
      setError('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-8">Loading post...</div>;
  if (error || !post) return <div className="text-center text-red-500 py-8">{error || 'Post not found.'}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      <Button variant="outline" className="mb-2 border-gray-500/20 text-gray-400 hover:bg-gray-500/10" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Forum
      </Button>

      {/* Original Post */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{post.title}</CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">{post.category}</Badge>
          </div>
          <p className="text-sm text-gray-400">By {post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
        </CardHeader>
        <CardContent>
          <p className="text-white whitespace-pre-line">{post.content}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        {post.replies.map(reply => (
          <Card key={reply.id} className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                    {reply.author[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{reply.author}</p>
                    <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-gray-300 mt-1 whitespace-pre-line">{reply.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div ref={repliesEndRef} />
      </div>

      {/* Reply Form */}
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Your Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Write your reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
              rows={4}
            />
            <Button onClick={handleReply} disabled={sending} className="self-end bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Post Reply'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
