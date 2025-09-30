import React, { ReactNode } from 'react';
import { Box, Container, CssBaseline, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: theme.shadows[3],
  maxWidth: 500,
  width: '100%',
  margin: '0 auto',
}));

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Task Manager
          </Typography>
          {title && (
            <Typography variant="body1" color="text.secondary">
              {title}
            </Typography>
          )}
        </Box>
        <StyledPaper elevation={3}>
          {children}
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default AuthLayout;
