import React, { useState } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { 
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/reduxHooks';

const Settings: React.FC = () => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC+05:30',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  const handleSave = () => {
    // TODO: Implement save settings to backend
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          }
          title={user?.name || 'User'}
          subheader={user?.email}
        />
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Notification Settings"
          avatar={
            <NotificationsIcon color="primary" />
          }
        />
        <CardContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Email Notifications" 
                secondary="Receive email notifications for important updates"
              />
              <Switch
                checked={settings.emailNotifications}
                onChange={handleSettingChange('emailNotifications')}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Push Notifications" 
                secondary="Enable browser notifications"
              />
              <Switch
                checked={settings.pushNotifications}
                onChange={handleSettingChange('pushNotifications')}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Appearance"
          avatar={
            <PaletteIcon color="primary" />
          }
        />
        <CardContent>
          <List>
            <ListItem>
              <ListItemText 
                primary="Dark Mode" 
                secondary="Switch between light and dark theme"
              />
              <Switch
                checked={settings.darkMode}
                onChange={handleSettingChange('darkMode')}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Account Settings"
          avatar={
            <SecurityIcon color="primary" />
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Language"
                select
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                SelectProps={{
                  native: true,
                }}
                variant="outlined"
                margin="normal"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Timezone"
                select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                SelectProps={{
                  native: true,
                }}
                variant="outlined"
                margin="normal"
              >
                <option value="UTC+00:00">UTC+00:00 (GMT)</option>
                <option value="UTC+05:30">UTC+05:30 (IST)</option>
                <option value="UTC-05:00">UTC-05:00 (EST)</option>
                <option value="UTC-08:00">UTC-08:00 (PST)</option>
              </TextField>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          size="large"
        >
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
