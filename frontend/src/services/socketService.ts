import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../store/slices/uiSlice';

// Types
interface ServerToClientEvents {
  'message:new': (message: any) => void;
  'user:online': (data: { userId: string; user: any }) => void;
  'user:offline': (data: { userId: string }) => void;
  'typing:start': (data: { userId: string; user: any }) => void;
  'typing:stop': (data: { userId: string }) => void;
  'chat:joined': (data: { chatId: string }) => void;
  'chat:left': (data: { chatId: string }) => void;
  'error': (error: { message: string }) => void;
}

interface ClientToServerEvents {
  'chat:join': (chatId: string) => void;
  'chat:leave': (chatId: string) => void;
  'message:send': (data: {
    chatId: string;
    content: string;
    type?: string;
    replyToId?: string;
  }) => void;
  'typing:start': (chatId: string) => void;
  'typing:stop': (chatId: string) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // Event listeners
  private messageListeners: ((message: any) => void)[] = [];
  private userStatusListeners: ((data: { userId: string; isOnline: boolean; user?: any }) => void)[] = [];
  private typingListeners: ((data: { userId: string; isTyping: boolean; user?: any }) => void)[] = [];
  private chatListeners: ((data: { chatId: string; action: 'joined' | 'left' }) => void)[] = [];

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        this.socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001', {
          auth: {
            token,
          },
          query: {
            token,
          },
          extraHeaders: {
            'Authorization': `Bearer ${token}`,
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.setupEventListeners();

        this.socket.on('connect', () => {
          console.log('✅ Socket.io connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          store.dispatch(addNotification({
            type: 'success',
            title: 'Connected',
            message: 'Real-time messaging is now active',
            duration: 3000,
          }));

          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.io connection error:', error.message);
          this.isConnecting = false;
          
          store.dispatch(addNotification({
            type: 'error',
            title: 'Connection Error',
            message: 'Failed to connect to real-time messaging',
            duration: 5000,
          }));

          reject(error);
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Message events
    this.socket.on('message:new', (message) => {
      console.log('📨 New message received:', message);
      this.messageListeners.forEach(listener => listener(message));
    });

    // User status events
    this.socket.on('user:online', (data) => {
      console.log('🟢 User came online:', data.user);
      this.userStatusListeners.forEach(listener => 
        listener({ userId: data.userId, isOnline: true, user: data.user })
      );
    });

    this.socket.on('user:offline', (data) => {
      console.log('🔴 User went offline:', data.userId);
      this.userStatusListeners.forEach(listener => 
        listener({ userId: data.userId, isOnline: false })
      );
    });

    // Typing events
    this.socket.on('typing:start', (data) => {
      console.log('⌨️ User started typing:', data.user);
      this.typingListeners.forEach(listener => 
        listener({ userId: data.userId, isTyping: true, user: data.user })
      );
    });

    this.socket.on('typing:stop', (data) => {
      console.log('⏹️ User stopped typing:', data.userId);
      this.typingListeners.forEach(listener => 
        listener({ userId: data.userId, isTyping: false })
      );
    });

    // Chat events
    this.socket.on('chat:joined', (data) => {
      console.log('✅ Successfully joined chat:', data.chatId);
      this.chatListeners.forEach(listener => 
        listener({ chatId: data.chatId, action: 'joined' })
      );
    });

    this.socket.on('chat:left', (data) => {
      console.log('👋 Left chat:', data.chatId);
      this.chatListeners.forEach(listener => 
        listener({ chatId: data.chatId, action: 'left' })
      );
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      store.dispatch(addNotification({
        type: 'error',
        title: 'Socket Error',
        message: error.message,
        duration: 5000,
      }));
    });

    // Disconnect events
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      }
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      store.dispatch(addNotification({
        type: 'success',
        title: 'Reconnected',
        message: 'Real-time messaging restored',
        duration: 3000,
      }));
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection failed:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(addNotification({
          type: 'error',
          title: 'Connection Lost',
          message: 'Unable to restore real-time messaging',
          duration: 0, // Persistent notification
        }));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // Chat methods
  joinChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:join', chatId);
    }
  }

  leaveChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:leave', chatId);
    }
  }

  // Message methods
  sendMessage(data: {
    chatId: string;
    content: string;
    type?: string;
    replyToId?: string;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('message:send', data);
    }
  }

  // Typing methods
  startTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', chatId);
    }
  }

  stopTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', chatId);
    }
  }

  // Event listener management
  onMessage(listener: (message: any) => void) {
    this.messageListeners.push(listener);
    return () => {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  onUserStatus(listener: (data: { userId: string; isOnline: boolean; user?: any }) => void) {
    this.userStatusListeners.push(listener);
    return () => {
      const index = this.userStatusListeners.indexOf(listener);
      if (index > -1) {
        this.userStatusListeners.splice(index, 1);
      }
    };
  }

  onTyping(listener: (data: { userId: string; isTyping: boolean; user?: any }) => void) {
    this.typingListeners.push(listener);
    return () => {
      const index = this.typingListeners.indexOf(listener);
      if (index > -1) {
        this.typingListeners.splice(index, 1);
      }
    };
  }

  onChat(listener: (data: { chatId: string; action: 'joined' | 'left' }) => void) {
    this.chatListeners.push(listener);
    return () => {
      const index = this.chatListeners.indexOf(listener);
      if (index > -1) {
        this.chatListeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
