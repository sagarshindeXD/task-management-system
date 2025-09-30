import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface LoadingProps {
  /**
   * Optional message to display below the loading indicator
   */
  message?: string;
  /**
   * Size of the loading spinner
   * @default 40
   */
  size?: number;
  /**
   * If true, will take up the full viewport height
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Additional styles to apply to the container
   */
  sx?: object;
}

/**
 * A customizable loading component that displays a circular progress indicator
 * with an optional message. Can be used as a full-screen overlay or inline.
 */
const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 40,
  fullScreen = false,
  sx = {},
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.background.default,
          zIndex: theme.zIndex.modal,
        }),
        ...sx,
      }}
    >
      <CircularProgress 
        size={size} 
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          mb: message ? 2 : 0,
        }} 
      />
      {message && (
        <Typography 
          variant="body1" 
          color="textSecondary"
          sx={{
            mt: 1,
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
