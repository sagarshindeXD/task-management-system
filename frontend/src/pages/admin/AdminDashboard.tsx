import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { People as PeopleIcon, Group as GroupIcon, Settings as SettingsIcon } from '@mui/icons-material';
import StatCard from '../../components/admin/StatCard';

const AdminDashboard = () => {
  // TODO: Replace with actual data from API
  const stats = [
    { title: 'Total Users', value: '24', icon: <PeopleIcon fontSize="large" /> },
    { title: 'Active Clients', value: '156', icon: <GroupIcon fontSize="large" /> },
    { title: 'System Health', value: '100%', icon: <SettingsIcon fontSize="large" /> },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          </Grid>
        ))}
      </Grid>

      {/* Add more admin dashboard content here */}
    </Box>
  );
};

export default AdminDashboard;
