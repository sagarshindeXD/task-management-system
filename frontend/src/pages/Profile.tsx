import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { updateProfile, changePassword, logout, selectCurrentUser, getMe } from '../features/auth/authSlice';

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Get auth state from Redux
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch user data on component mount or when auth state changes
  useEffect(() => {
    let isMounted = true;
    
    // If we already have user data, we're done loading
    if (user) {
      if (isMounted) {
        console.log('User data already available:', user);
        setIsLoading(false);
      }
      return;
    }
    
    // If no token, we can't fetch user data
    if (!token) {
      console.log('No auth token found, user not authenticated');
      if (isMounted) {
        setIsLoading(false);
      }
      return;
    }
    
    // If we've already attempted to fetch, don't try again
    if (hasAttemptedFetch) {
      if (isMounted) {
        setIsLoading(false);
      }
      return;
    }
    
    // Set loading state and mark that we're attempting to fetch
    if (isMounted) {
      setIsLoading(true);
      setHasAttemptedFetch(true);
    }
    
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const result = await dispatch(getMe()).unwrap();
        
        if (!result) {
          throw new Error('No user data received from server');
        }
        
        console.log('User data fetched successfully:', result);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (isMounted) {
          setSnackbar({
            open: true,
            message: 'Failed to load profile. Please try again later.',
            severity: 'error'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [dispatch, token, user, hasAttemptedFetch]);

  // Profile form
  const profileForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(updateProfile(values)).unwrap();
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Failed to update profile:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update profile',
          severity: 'error'
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Password form
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Must contain at least one uppercase, one lowercase, one number and one special character'
        )
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        await dispatch(changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })).unwrap();
        
        resetForm();
        setSnackbar({
          open: true,
          message: 'Password changed successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Failed to change password:', error);
        setSnackbar({
          open: true,
          message: 'Failed to change password. Please check your current password.',
          severity: 'error'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        p={3}
        textAlign="center"
      >
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Loading your profile...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we load your information
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        p={3}
        textAlign="center"
      >
        <Typography variant="h5" gutterBottom>
          User Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We couldn't load your profile information.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} mb={4}>
        <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                fontSize: 48,
                mx: 'auto',
                mb: 2,
                bgcolor: theme.palette.primary.main
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role}
            </Typography>
          </Paper>
          
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Box>

        <Box flexGrow={1}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="profile tabs"
            >
              <Tab label="Profile" {...a11yProps(0)} />
              <Tab label="Security" {...a11yProps(1)} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <form onSubmit={profileForm.handleSubmit}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Personal Information</Typography>
                  {isEditing ? (
                    <Box>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={profileForm.isSubmitting}
                        startIcon={profileForm.isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          profileForm.resetForm();
                          setIsEditing(false);
                        }}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                <Box display="flex" flexDirection="column" gap={3} maxWidth={600}>
                  <TextField
                    label="Name"
                    name="name"
                    value={profileForm.values.name}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.name && Boolean(profileForm.errors.name)}
                    helperText={profileForm.touched.name && profileForm.errors.name}
                    disabled={!isEditing || profileForm.isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />

                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={profileForm.values.email}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.email && Boolean(profileForm.errors.email)}
                    helperText={profileForm.touched.email && profileForm.errors.email}
                    disabled={!isEditing || profileForm.isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                </Box>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <form onSubmit={passwordForm.handleSubmit}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={3} maxWidth={600}>
                  <TextField
                    label="Current Password"
                    name="currentPassword"
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordForm.values.currentPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    error={passwordForm.touched.currentPassword && Boolean(passwordForm.errors.currentPassword)}
                    helperText={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
                    disabled={passwordForm.isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('current')}
                            edge="end"
                            size="small"
                          >
                            {showPassword.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />

                  <TextField
                    label="New Password"
                    name="newPassword"
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordForm.values.newPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    error={passwordForm.touched.newPassword && Boolean(passwordForm.errors.newPassword)}
                    helperText={
                      passwordForm.touched.newPassword && 
                      (passwordForm.errors.newPassword || 'At least 8 characters with uppercase, lowercase, number & special character')
                    }
                    disabled={passwordForm.isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                            size="small"
                          >
                            {showPassword.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />

                  <TextField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordForm.values.confirmPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    error={passwordForm.touched.confirmPassword && Boolean(passwordForm.errors.confirmPassword)}
                    helperText={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
                    disabled={passwordForm.isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                            size="small"
                          >
                            {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />

                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={passwordForm.isSubmitting || !passwordForm.dirty}
                      startIcon={passwordForm.isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      Update Password
                    </Button>
                  </Box>
                </Box>
              </form>
            </TabPanel>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
