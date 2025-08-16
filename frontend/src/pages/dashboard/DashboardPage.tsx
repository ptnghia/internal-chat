import { Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { Dashboard, People, Business, Groups, Chat, Assignment } from '@mui/icons-material';

const DashboardPage = () => {
  const stats = [
    { title: 'Total Users', value: '156', icon: <People />, color: '#1976d2' },
    { title: 'Departments', value: '12', icon: <Business />, color: '#388e3c' },
    { title: 'Teams', value: '24', icon: <Groups />, color: '#f57c00' },
    { title: 'Active Chats', value: '89', icon: <Chat />, color: '#7b1fa2' },
    { title: 'Open Tasks', value: '45', icon: <Assignment />, color: '#d32f2f' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
