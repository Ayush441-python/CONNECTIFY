import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useAuth as useClerkAuth } from '@clerk/react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface SocketContextValue {
  socket: Socket | null;
  onlineUserIds: Set<string>;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, onlineUserIds: new Set() });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { getToken } = useClerkAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    let isMounted = true;

    async function connectSocket() {
      const token = await getToken();
      if (!token || !isMounted) return;

      const s = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      s.on('presence:update', ({ userId, online }: { userId: string; online: boolean }) => {
        if (!isMounted) return;
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          if (online) next.add(userId);
          else next.delete(userId);
          return next;
        });
      });

      socketRef.current = s;
      setSocket(s);
    }

    connectSocket();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, getToken]);

  return <SocketContext.Provider value={{ socket, onlineUserIds }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
