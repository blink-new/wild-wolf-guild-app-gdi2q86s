import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export const NotificationCenter = () => {
  useEffect(() => {
    // Connect to Flask-SocketIO backend
    socket = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      autoConnect: true,
    });

    // Listen for notification events
    socket.on('notification', (data: { type: string; message: string; title?: string }) => {
      toast.custom((t) => (
        <div className={`max-w-xs bg-slate-900 border-l-4 ${data.type === 'error' ? 'border-red-500' : data.type === 'success' ? 'border-green-500' : 'border-amber-500'} shadow-lg rounded-lg p-4 flex flex-col gap-1 text-white animate-fade-in`}>
          {data.title && <div className="font-bold text-base mb-1">{data.title}</div>}
          <div className="text-sm">{data.message}</div>
        </div>
      ));
    });

    // Optionally: Listen for other real-time events (new message, announcement, etc.)
    socket.on('new_message', (data: { from: string; content: string }) => {
      toast(`Nouveau message de ${data.from} : ${data.content}`);
    });
    socket.on('announcement', (data: { title: string; message: string }) => {
      toast.custom((t) => (
        <div className="max-w-xs bg-blue-900 border-l-4 border-blue-500 shadow-lg rounded-lg p-4 flex flex-col gap-1 text-white animate-fade-in">
          <div className="font-bold text-base mb-1">{data.title}</div>
          <div className="text-sm">{data.message}</div>
        </div>
      ));
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  return null;
};
