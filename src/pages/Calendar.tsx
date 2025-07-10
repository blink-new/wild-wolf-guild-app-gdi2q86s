import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  event_type: string;
  max_participants?: number;
  participants: number[];
  location?: string;
}

export const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    event_type: 'pvp',
    max_participants: '',
    location: '',
  });
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data.events);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'pvp': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'pve': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'meeting': return 'bg-green-500/20 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      await apiClient.post('/events', {
        title: form.title,
        description: form.description,
        event_date: form.event_date,
        event_time: form.event_time,
        event_type: form.event_type,
        max_participants: form.max_participants ? parseInt(form.max_participants) : undefined,
        location: form.location,
      });
      setCreateSuccess('Event created!');
      setForm({
        title: '', description: '', event_date: '', event_time: '', event_type: 'pvp', max_participants: '', location: ''
      });
      setShowCreate(false);
      fetchEvents();
    } catch {
      setCreateError('Failed to create event.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (eventId: number) => {
    setJoiningId(eventId);
    setJoinError(null);
    setJoinSuccess(null);
    try {
      await apiClient.post(`/events/${eventId}/join`);
      setJoinSuccess('Successfully joined event!');
      fetchEvents();
    } catch {
      setJoinError('Failed to join event.');
    } finally {
      setJoiningId(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Guild Events</h1>
          <p className="text-gray-400">Manage and attend guild events</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-lg border border-amber-500/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create Event</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Input required type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
              <Input required type="time" value={form.event_time} onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))} />
              <Input placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <Input placeholder="Max Participants" type="number" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))} />
              <select className="w-full bg-slate-800 text-white rounded p-2" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
                <option value="pvp">PvP</option>
                <option value="pve">PvE</option>
                <option value="meeting">Meeting</option>
                <option value="raid">Raid</option>
                <option value="other">Other</option>
              </select>
              <textarea className="w-full bg-slate-800 text-white rounded p-2" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              {createError && <div className="text-red-500 text-sm">{createError}</div>}
              {createSuccess && <div className="text-green-500 text-sm">{createSuccess}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-gray-500/20 text-gray-400 hover:bg-gray-500/10">Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center text-gray-400 py-8">Loading events...</div>
      )}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}
      {joinError && <div className="text-center text-red-500 py-2">{joinError}</div>}
      {joinSuccess && <div className="text-center text-green-500 py-2">{joinSuccess}</div>}

      {/* Events List */}
      {!loading && !error && (
        <div className="space-y-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6 text-amber-500" />
                      <div>
                        <CardTitle className="text-white">{event.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.event_date} at {event.event_time}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {event.event_type?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {event.participants?.length || 0}
                        {event.max_participants ? `/${event.max_participants}` : ''} participants
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                        disabled={joiningId === event.id}
                        onClick={() => handleJoin(event.id)}
                      >
                        {joiningId === event.id ? 'Joining...' : 'Join Event'}
                      </Button>
                      <Button variant="outline" className="border-gray-500/20 text-gray-400 hover:bg-gray-500/10">
                        View Details
                      </Button>
                    </div>
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
