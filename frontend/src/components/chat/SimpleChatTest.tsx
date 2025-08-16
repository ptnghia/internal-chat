import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send, Person } from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';
import { useAppSelector } from '../../store';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface TypingUser {
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

const SimpleChatTest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [currentChatId] = useState('cm0qs5r83zbkg38acmed8s94f'); // Test chat ID
  const [isJoined, setIsJoined] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { user } = useAppSelector((state) => state.auth);
  const {
    isConnected,
    isConnecting,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    onMessage,
    onUserStatus,
    onTyping,
    onChat,
  } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join chat when connected
  useEffect(() => {
    if (isConnected && !isJoined) {
      joinChat(currentChatId);
    }
  }, [isConnected, isJoined, joinChat, currentChatId]);

  // Setup event listeners
  useEffect(() => {
    const unsubscribeMessage = onMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    const unsubscribeUserStatus = onUserStatus((data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    const unsubscribeTyping = onTyping((data) => {
      if (data.userId === user?.id) return; // Ignore own typing

      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add user to typing list
          const exists = prev.find(u => u.userId === data.userId);
          if (!exists && data.user) {
            return [...prev, { userId: data.userId, user: data.user }];
          }
          return prev;
        } else {
          // Remove user from typing list
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    });

    const unsubscribeChat = onChat((data) => {
      if (data.action === 'joined' && data.chatId === currentChatId) {
        setIsJoined(true);
      } else if (data.action === 'left' && data.chatId === currentChatId) {
        setIsJoined(false);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeUserStatus();
      unsubscribeTyping();
      unsubscribeChat();
    };
  }, [onMessage, onUserStatus, onTyping, onChat, user?.id, currentChatId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isJoined) {
        leaveChat(currentChatId);
      }
    };
  }, [isJoined, leaveChat, currentChatId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected || !isJoined) return;

    sendMessage({
      chatId: currentChatId,
      content: newMessage.trim(),
      type: 'text',
    });

    setNewMessage('');
    stopTyping(currentChatId);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isConnected || !isJoined) return;

    if (value.trim()) {
      startTyping(currentChatId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentChatId);
      }, 2000);
    } else {
      stopTyping(currentChatId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isConnecting) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Connecting to chat...
        </Typography>
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Alert severity="warning">
        Not connected to real-time messaging. Please check your connection.
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chat Test Room
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Chip
            icon={<Person />}
            label={`${onlineUsers.size} online`}
            color="success"
            size="small"
          />
          {isJoined ? (
            <Chip label="Joined" color="success" size="small" />
          ) : (
            <Chip label="Not joined" color="warning" size="small" />
          )}
        </Box>
      </Paper>

      {/* Messages */}
      <Paper sx={{ flex: 1, p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <List sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((message) => (
            <ListItem key={message.id} alignItems="flex-start">
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" color="primary">
                      {message.sender.firstName} {message.sender.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                }
                secondary={message.content}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            {typingUsers.map(u => `${u.user.firstName} ${u.user.lastName}`).join(', ')} 
            {typingUsers.length === 1 ? ' is' : ' are'} typing...
          </Typography>
        )}

        {/* Message input */}
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || !isJoined}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected || !isJoined}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <Send />
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SimpleChatTest;
