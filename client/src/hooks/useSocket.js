import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { autoConnect: true });
    ref.current = s;
    setSocket(s);
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    s.on('connect', () => {
      if (adminToken) s.emit('join', { adminToken });
      if (token) s.emit('join', { token });
      try {
        const user = null;
        void user;
      } catch {}
      const admin = localStorage.getItem('adminToken');
      if (admin) s.emit('join:admin');
    });
    return () => s.disconnect();
  }, []);

  return socket;
}
