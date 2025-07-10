import { createClient } from '@blinkdotnew/sdk';

export const blink = createClient({
  projectId: 'wild-wolf-guild-app-gdi2q86s',
  authRequired: true
});

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  discordId?: string;
  role?: 'SuperAdmin' | 'Maître' | 'Conseiller' | 'Officier' | 'Quartier-Maître' | 'Membre' | 'Recrue' | 'Invité';
  gameData?: {
    characterName?: string;
    characterClass?: string;
    equipmentScore?: number;
    familyName?: string;
    bio?: string;
    isValidated?: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type GuildEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'raid' | 'pvp' | 'pve' | 'meeting' | 'other';
  maxParticipants?: number;
  participants: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type WikiArticle = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ForumPost = {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  isPinned: boolean;
  replies: ForumReply[];
  createdAt: string;
  updatedAt: string;
};

export type ForumReply = {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};