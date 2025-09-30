import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { ReportProblem as ReportProblemIcon } from '@mui/icons-material';

interface Props {
  /**
   * Content to be rendered inside the error boundary
   */
  children: ReactNode;
  /**
   * Custom fallback UI to show when an error occurs
   */
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  /**
   * Callback function that gets called when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * If true, shows a "Report Error" button that calls onReportError when clicked
   */
  showReportButton?: boolean;
  /**
   * Function to handle error reporting (e.g., sending to an error tracking service)
   */
  onReportError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Custom message to display in the default error UI
   */
  errorMessage?: string;
  /**
   * Custom button text for the "Try again" button
   */
  retryButtonText?: string;
  /**
   * Callback function that gets called when the "Try again" button is clicked
   */
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * A reusable error boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static defaultProps = {
    showReportButton: true,
    errorMessage: 'Something went wrong!',
    retryButtonText: 'Try again',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: { componentStack: '' },
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ error, errorInfo });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    // Call the onRetry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    
    // Reset the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    
    if (error && this.props.onReportError) {
      this.props.onReportError(error, errorInfo || { componentStack: '' });
    }
    
    // You can also implement your error reporting logic here
    // For example, send the error to a logging service
    console.log('Error reported:', error, errorInfo);
  };

  public render() {
    const { 
      children, 
      fallback, 
      showReportButton, 
      errorMessage, 
      retryButtonText,
    } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // If a custom fallback is provided, render it
      if (fallback && error) {
        return fallback(error, errorInfo || { componentStack: '' });
      }

      // Otherwise, render the default error UI
      return (
        <ErrorBoundaryUI
          error={error}
          errorInfo={errorInfo}
          message={errorMessage}
          retryButtonText={retryButtonText}
          showReportButton={showReportButton}
          onRetry={this.handleRetry}
          onReportError={this.handleReportError}
        />
      );
    }

    return children;
  }
}

// A separate functional component for the UI to leverage hooks
interface ErrorBoundaryUIProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  message?: string;
  retryButtonText?: string;
  showReportButton?: boolean;
  onRetry: () => void;
  onReportError: () => void;
}

const ErrorBoundaryUI: React.FC<ErrorBoundaryUIProps> = ({
  error,
  errorInfo,
  message = 'Something went wrong!',
  retryButtonText = 'Try again',
  showReportButton = true,
  onRetry,
  onReportError,
}) => {
  const theme = useTheme();
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 4,
        textAlign: 'center',
      }}
    >
      <ReportProblemIcon 
        sx={{ 
          fontSize: 64, 
          color: 'error.main',
          mb: 2,
        }} 
      />
      
      <Typography variant="h5" component="h2" gutterBottom>
        {message}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        We're sorry for the inconvenience. The application has encountered an unexpected error.
      </Typography>
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          sx={{ textTransform: 'none' }}
        >
          {retryButtonText}
        </Button>
        
        {showReportButton && (
          <Button
            variant="outlined"
            color="primary"
            onClick={onReportError}
            sx={{ textTransform: 'none' }}
          >
            Report Error
          </Button>
        )}
      </Box>
      
      {/* Show error details in development */}
      {isDev && error && (
        <Box 
          sx={{ 
            mt: 4, 
            p: 2, 
            textAlign: 'left',
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            width: '100%',
            maxWidth: 800,
            overflow: 'auto',
            maxHeight: 300,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Error Details (only visible in development):
          </Typography>
          
          <Typography 
            variant="caption" 
            component="pre" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: theme.palette.error.main,
            }}
          >
            {error.toString()}
            {errorInfo?.componentStack}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ErrorBoundary;
