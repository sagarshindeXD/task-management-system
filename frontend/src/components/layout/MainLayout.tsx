import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';

import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header onDrawerToggle={handleDrawerToggle} />
      <Sidebar 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Toolbar /> {/* This pushes content below the app bar */}
        <Box sx={{ mt: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
