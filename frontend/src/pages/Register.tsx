import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { register } from '../features/auth/authSlice';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name should be at least 2 characters')
    .max(50, 'Name should not exceed 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password should be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Please confirm your password'),
});

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await dispatch(register({
          name: values.name,
          email: values.email,
          password: values.password
        })).unwrap();
        // Redirect to login page after successful registration
        navigate('/login');
      } catch (error: any) {
        if (error.includes('email')) {
          setFieldError('email', error);
        } else {
          setFieldError('email', 'Registration failed. Please try again.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={formik.handleSubmit}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <Box sx={{ width: '100%' }}>
          <TextField
            autoComplete="name"
            name="name"
            required
            fullWidth
            id="name"
            label="Full Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
      
      <Button
        type="submit"
        fullWidth
        disabled={status === 'loading'}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
        }}
      >
        {status === 'loading' ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Sign Up'
        )}
      </Button>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            sx={{ textDecoration: 'none', fontWeight: 500 }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
