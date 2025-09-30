import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout, 
  Person, 
  Settings 
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { logout } from '../../features/auth/authSlice';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  [key: string]: any;
}

interface HeaderProps {
  onDrawerToggle: () => void;
}
const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  const handleProfile = (event: React.MouseEvent) => {
    event.preventDefault();
    navigate('/profile');
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 240px)` },
        ml: { sm: '240px' },
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                alt={user?.name}
                src={user?.avatar || undefined}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={Link} to="/profile" onClick={handleClose}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
