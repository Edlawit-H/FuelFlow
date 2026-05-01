import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEBOUNCE_MS = 300; // prevent duplicate rapid refreshes

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const roomsRef = useRef(new Set()); // track joined rooms for rejoin on reconnect
  const debounceTimers = useRef({});

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      setConnected(true);
      // Rejoin all rooms after reconnect
      roomsRef.current.forEach((room) => {
        const [type, id] = room.split(':');
        if (type === 'station') socket.emit('join-station', id);
        if (type === 'user') socket.emit('join-user', id);
      });
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinStation = useCallback((stationId) => {
    if (!stationId) return;
    roomsRef.current.add(`station:${stationId}`);
    socketRef.current?.emit('join-station', stationId);
  }, []);

  const leaveStation = useCallback((stationId) => {
    if (!stationId) return;
    roomsRef.current.delete(`station:${stationId}`);
    socketRef.current?.emit('leave-station', stationId);
  }, []);

  const joinUserRoom = useCallback((userId) => {
    if (!userId) return;
    roomsRef.current.add(`user:${userId}`);
    socketRef.current?.emit('join-user', userId);
  }, []);

  /**
   * Subscribe to queue-update events with debouncing.
   * Returns an unsubscribe function.
   * key: unique string to namespace the debounce timer (e.g. 'admin-dashboard')
   */
  const onQueueUpdate = useCallback((callback, key = 'default') => {
    const handler = (payload) => {
      // Debounce: cancel pending call for this key, schedule new one
      if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
      debounceTimers.current[key] = setTimeout(() => {
        callback(payload);
      }, DEBOUNCE_MS);
    };

    socketRef.current?.on('queue-update', handler);
    return () => {
      socketRef.current?.off('queue-update', handler);
      if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    };
  }, []);

  /**
   * Subscribe to user-specific alert events.
   */
  const onUserAlert = useCallback((callback) => {
    socketRef.current?.on('user-alert', callback);
    return () => socketRef.current?.off('user-alert', callback);
  }, []);

  return (
    <SocketContext.Provider value={{
      connected,
      joinStation,
      leaveStation,
      joinUserRoom,
      onQueueUpdate,
      onUserAlert,
      socket: socketRef,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};
