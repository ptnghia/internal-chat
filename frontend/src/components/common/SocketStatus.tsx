import React from 'react';
import { 
  Box, 
  Chip, 
  Tooltip, 
  CircularProgress,
  useTheme 
} from '@mui/material';
import { 
  Wifi, 
  WifiOff, 
  Sync 
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

const SocketStatus: React.FC = () => {
  const theme = useTheme();
  const { isConnected, isConnecting, socketId } = useSocket();

  const getStatusConfig = () => {
    if (isConnecting) {
      return {
        label: 'Connecting...',
        color: 'warning' as const,
        icon: <CircularProgress size={16} />,
        tooltip: 'Connecting to real-time messaging...',
      };
    }

    if (isConnected) {
      return {
        label: 'Connected',
        color: 'success' as const,
        icon: <Wifi />,
        tooltip: `Real-time messaging active${socketId ? ` (${socketId.substring(0, 8)}...)` : ''}`,
      };
    }

    return {
      label: 'Disconnected',
      color: 'error' as const,
      icon: <WifiOff />,
      tooltip: 'Real-time messaging unavailable',
    };
  };

  const config = getStatusConfig();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={config.tooltip} arrow>
        <Chip
          icon={config.icon}
          label={config.label}
          color={config.color}
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.75rem',
            height: 24,
            '& .MuiChip-icon': {
              fontSize: 16,
            },
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default SocketStatus;
