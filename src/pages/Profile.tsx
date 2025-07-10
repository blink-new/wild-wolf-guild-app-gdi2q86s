import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Save, Mail, Calendar, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';

export const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    characterName: 'DragonSlayer',
    characterClass: 'Warrior',
    equipmentScore: 680,
    familyName: 'House of Dragons',
    bio: 'Veteran player with 5 years of experience. Specializing in PvP and node wars.',
    joinDate: '2019-03-15',
    lastActive: '2024-01-15'
  });

  const handleSave = () => {
    // In a real app, this would save to the database
    setIsEditing(false);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl">
                {user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-white">{user?.name || 'Guild Member'}</CardTitle>
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20">
                {user?.role || 'Member'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              Joined {profileData.joinDate}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              Last active {profileData.lastActive}
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
                    value={profileData.characterName}
                    onChange={(e) => setProfileData({...profileData, characterName: e.target.value})}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.characterName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Character Class
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.characterClass}
                    onChange={(e) => setProfileData({...profileData, characterClass: e.target.value})}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.characterClass}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Equipment Score
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={profileData.equipmentScore}
                    onChange={(e) => setProfileData({...profileData, equipmentScore: parseInt(e.target.value)})}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.equipmentScore}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Family Name
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.familyName}
                    onChange={(e) => setProfileData({...profileData, familyName: e.target.value})}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white">{profileData.familyName}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
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