import { Typography, Box } from '@mui/material';
import SimpleChatTest from '../../components/chat/SimpleChatTest';

const ChatsPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Chats
      </Typography>
      <SimpleChatTest />
    </Box>
  );
};

export default ChatsPage;
