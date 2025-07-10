import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface WikiArticle {
  id: number;
  title: string;
  category: string;
  content: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const WikiArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/wiki/${id}`);
        setArticle(response.data.article);
        setEditContent(response.data.article.content);
        setEditTitle(response.data.article.title);
        setEditTags(response.data.article.tags.join(', '));
      } catch {
        setError('Failed to load article.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const canEdit = user && (user.role === 'SuperAdmin' || user.role === 'Maître' || user.role === 'Conseiller' || user.role === 'Officier');

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);
    try {
      await apiClient.put(`/wiki/${id}`, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map(t => t.trim()),
      });
      setEditSuccess('Article updated!');
      setIsEditing(false);
      setArticle(a => a ? { ...a, title: editTitle, content: editContent, tags: editTags.split(',').map(t => t.trim()) } : a);
    } catch {
      setEditError('Failed to update article.');
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-8">Loading article...</div>;
  if (error || !article) return <div className="text-center text-red-500 py-8">{error || 'Article not found.'}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-3xl mx-auto space-y-6"
    >
      <Button variant="outline" className="mb-2 border-gray-500/20 text-gray-400 hover:bg-gray-500/10" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Wiki
      </Button>
      <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 mr-2">{article.category}</Badge>
              <CardTitle className="text-white inline-block">{article.title}</CardTitle>
            </div>
            {canEdit && (
              <Button size="sm" variant="outline" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="w-4 h-4 mr-1" /> {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 mb-4">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-4">
            By {article.created_by} • Updated {article.updated_at ? new Date(article.updated_at).toLocaleDateString() : '-'}
          </div>
          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <input
                className="w-full bg-slate-800 text-white rounded p-2 mb-2"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full bg-slate-800 text-white rounded p-2"
                rows={10}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                required
              />
              <input
                className="w-full bg-slate-800 text-white rounded p-2"
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                placeholder="Tags (comma separated)"
              />
              {editError && <div className="text-red-500 text-sm">{editError}</div>}
              {editSuccess && <div className="text-green-500 text-sm">{editSuccess}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="border-gray-500/20 text-gray-400 hover:bg-gray-500/10">Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">Save</Button>
              </div>
            </form>
          ) : (
            <div className="prose prose-invert max-w-none text-white" style={{ whiteSpace: 'pre-line' }}>
              {article.content}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
