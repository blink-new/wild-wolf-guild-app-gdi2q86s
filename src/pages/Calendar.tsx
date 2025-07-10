import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import apiClient from '../lib/apiClient';

export const Calendar = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/events');
        setEvents(response.data.events);
      } catch (e) {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
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
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center text-gray-400 py-8">Loading events...</div>
      )}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}

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
                      <Button variant="outline" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                        Join Event
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
