import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppSelector } from '../store';
import { socketService } from '../services/socketService';

// Types
interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  socketId?: string;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: {
    chatId: string;
    content: string;
    type?: string;
    replyToId?: string;
  }) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  onMessage: (listener: (message: any) => void) => () => void;
  onUserStatus: (listener: (data: { userId: string; isOnline: boolean; user?: any }) => void) => () => void;
  onTyping: (listener: (data: { userId: string; isTyping: boolean; user?: any }) => void) => () => void;
  onChat: (listener: (data: { chatId: string; action: 'joined' | 'left' }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [socketId, setSocketId] = useState<string>();

  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token && !isConnected && !isConnecting) {
      setIsConnecting(true);
      
      socketService.connect(token)
        .then(() => {
          setIsConnected(true);
          setSocketId(socketService.getSocketId());
        })
        .catch((error) => {
          console.error('Failed to connect to Socket.io:', error);
        })
        .finally(() => {
          setIsConnecting(false);
        });
    } else if (!isAuthenticated && isConnected) {
      // Disconnect when user logs out
      socketService.disconnect();
      setIsConnected(false);
      setSocketId(undefined);
    }
  }, [isAuthenticated, token, isConnected, isConnecting]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      if (connected !== isConnected) {
        setIsConnected(connected);
        setSocketId(connected ? socketService.getSocketId() : undefined);
      }
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        socketService.disconnect();
      }
    };
  }, []);

  const contextValue: SocketContextType = {
    isConnected,
    isConnecting,
    socketId,
    joinChat: socketService.joinChat.bind(socketService),
    leaveChat: socketService.leaveChat.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
    onMessage: socketService.onMessage.bind(socketService),
    onUserStatus: socketService.onUserStatus.bind(socketService),
    onTyping: socketService.onTyping.bind(socketService),
    onChat: socketService.onChat.bind(socketService),
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use Socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
