import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          px: isMobile ? 2 : 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: isMobile ? 3 : 6,
            borderRadius: 4,
            width: '100%',
            maxWidth: 600,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '"404"',
              position: 'absolute',
              top: isMobile ? -40 : -60,
              right: isMobile ? -30 : -50,
              fontSize: isMobile ? '12rem' : '18rem',
              fontWeight: 900,
              color: theme.palette.grey[200],
              lineHeight: 1,
              zIndex: 0,
              userSelect: 'none',
            },
          }}
        >
          <Box position="relative" zIndex={1}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: isMobile ? '4rem' : '6rem',
                fontWeight: 900,
                lineHeight: 1,
                mb: 2,
                color: theme.palette.primary.main,
              }}
            >
              Oops!
            </Typography>
            
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              Page Not Found
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              The page you are looking for might have been removed, had its name changed, or is
              temporarily unavailable.
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                sx={{
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                Go to Homepage
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => window.history.back()}
                sx={{
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Go Back
              </Button>
            </Box>
          </Box>
        </Paper>
        
        <Box mt={6} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Need help?{' '}
            <RouterLink 
              to="/contact" 
              style={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Contact our support team
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
