import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import apiClient from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

interface Message {
  id: number;
  senderId: number | string;
  senderName: string;
  content: string;
  time: string;
  isOwnMessage: boolean;
}

export const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/messages/conversations');
        setConversations(response.data.conversations);
        if (response.data.conversations.length > 0) {
          setSelectedChat(response.data.conversations[0].id);
        }
      } catch {
        setError('Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/messages/${selectedChat}`);
        setMessages(response.data.messages.map((msg: any) => ({
          ...msg,
          isOwnMessage: msg.senderId === user?.id,
        })));
      } catch {
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChat, user?.id]);

  // WebSocket connection
  useEffect(() => {
    if (!user || !selectedChat) return;
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
    });
    socketRef.current = socket;
    socket.emit('join_room', { room: `chat_${selectedChat}` });
    socket.on('receive_message', (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          isOwnMessage: msg.senderId === user?.id,
        },
      ]);
    });
    socket.on('connect_error', () => {
      setWsError('WebSocket connection failed.');
    });
    return () => {
      socket.emit('leave_room', { room: `chat_${selectedChat}` });
      socket.disconnect();
    };
  }, [selectedChat, user?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedChat) return;
    setSending(true);
    setWsError(null);
    try {
      // Send via API (for persistence)
      await apiClient.post(`/messages/${selectedChat}`, { content: newMessage });
      // Send via WebSocket (for real-time)
      socketRef.current?.emit('send_message', {
        room: `chat_${selectedChat}`,
        message: {
          senderId: user.id,
          senderName: user.name || user.username,
          content: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      });
      setNewMessage('');
    } catch {
      setWsError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 h-full"
    >
      <div className="flex h-full max-h-[calc(100vh-8rem)] gap-6">
        {/* Conversations List */}
        <div className="w-1/3">
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-white">Messages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedChat === conversation.id
                      ? 'bg-amber-500/20 border border-amber-500/20'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        {conversation.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-400">{conversation.time}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">{conversation.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="text-white flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    {conversations.find(c => c.id === selectedChat)?.name[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                {conversations.find(c => c.id === selectedChat)?.name || 'Select a conversation'}
              </CardTitle>
            </CardHeader>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && <div className="text-center text-gray-400">Loading messages...</div>}
              {error && <div className="text-center text-red-500">{error}</div>}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwnMessage
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            {/* Message Input */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  disabled={sending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {wsError && <div className="text-red-500 text-sm mt-2">{wsError}</div>}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
