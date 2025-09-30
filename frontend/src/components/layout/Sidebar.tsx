import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Task as TaskIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          Task Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                borderRadius: 2,
                mx: 1,
                my: 0.5,
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: location.pathname === item.path ? 'primary.main' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              borderRadius: 2,
              mx: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[3],
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
