import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Edit, Save, Mail, Calendar, Crown, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';

export const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/members/${user.id}`);
        setProfileData(response.data.member);
      } catch (e) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiClient.put(`/members/${user.id}`, {
        character_name: profileData.character_name,
        character_class: profileData.character_class,
        equipment_score: profileData.equipment_score,
        family_name: profileData.family_name,
        bio: profileData.bio,
      });
      setSuccess('Profile updated!');
      setIsEditing(false);
    } catch (e) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!user || !avatarFile) return;
    setAvatarUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('image', avatarFile);
      const response = await apiClient.post(`/admin/users/${user.id}/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileData((prev: any) => ({ ...prev, profile_image: response.data.image_url }));
      setSuccess('Avatar updated!');
      setAvatarFile(null);
    } catch (e) {
      setError('Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Loading profile...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }
  if (!profileData) {
    return null;
  }

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
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-400">Manage your guild profile and character information</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className={isEditing ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10" : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"}
        >
          {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      {success && <div className="text-green-500 text-center">{success}</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={profileData.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl">
                {profileData.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex justify-center mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-amber-400 hover:underline">
                <UploadCloud className="w-4 h-4" />
                <span>Change Avatar</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              {avatarFile && (
                <Button size="sm" onClick={handleAvatarUpload} disabled={avatarUploading} className="ml-2">
                  {avatarUploading ? 'Uploading...' : 'Upload'}
                </Button>
              )}
            </div>
            <CardTitle className="text-white mt-2">{profileData.username || 'Guild Member'}</CardTitle>
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20">
                {profileData.role || 'Member'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              {profileData.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              Joined {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : '-'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <UserIcon className="w-4 h-4" />
              Last active {profileData.last_login ? new Date(profileData.last_login).toLocaleDateString() : '-'}
            </div>
          </CardContent>
        </Card>

        {/* Character Information */}
        <Card className="lg:col-span-2 border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Character Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Character Name
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.character_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, character_name: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.character_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Character Class
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.character_class || ''}
                    onChange={(e) => setProfileData({ ...profileData, character_class: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.character_class}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Equipment Score
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={profileData.equipment_score || ''}
                    onChange={(e) => setProfileData({ ...profileData, equipment_score: parseInt(e.target.value) })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.equipment_score}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Family Name
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.family_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, family_name: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.family_name}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              {isEditing ? (
                <Textarea
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  rows={3}
                />
              ) : (
                <p className="text-white">{profileData.bio}</p>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-500/20 text-gray-400 hover:bg-gray-500/10"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
