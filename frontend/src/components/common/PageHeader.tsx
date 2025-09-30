import React, { ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  useTheme, 
  useMediaQuery, 
  SxProps, 
  Theme,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
} from '@mui/material';
import { 
  Home as HomeIcon, 
  NavigateNext as NavigateNextIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

interface BreadcrumbItem {
  /**
   * The label to display for the breadcrumb
   */
  label: string;
  /**
   * The URL to navigate to when the breadcrumb is clicked
   */
  href?: string;
  /**
   * Custom icon to display before the breadcrumb label
   */
  icon?: ReactNode;
  /**
   * If true, the breadcrumb will not be clickable
   * @default false
   */
  disabled?: boolean;
}

interface ActionButton {
  /**
   * The label for the action button
   */
  label: string;
  /**
   * The callback function to execute when the button is clicked
   */
  onClick: () => void;
  /**
   * The color of the button
   * @default 'primary'
   */
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  /**
   * The variant of the button
   * @default 'contained'
   */
  variant?: 'text' | 'outlined' | 'contained';
  /**
   * The size of the button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * The icon to display before the button label
   */
  icon?: ReactNode;
  /**
   * If true, the button will be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * If true, the button will show a loading indicator
   * @default false
   */
  loading?: boolean;
  /**
   * The type of the button
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Additional styles to apply to the button
   */
  sx?: SxProps<Theme>;
}

interface PageHeaderProps {
  /**
   * The main title of the page
   */
  title: string;
  /**
   * The subtitle or description of the page
   */
  subtitle?: string;
  /**
   * Array of breadcrumb items to display
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Array of action buttons to display on the right side
   */
  actions?: ActionButton[];
  /**
   * If true, the header will have a back button
   * @default false
   */
  showBackButton?: boolean;
  /**
   * Callback function to execute when the back button is clicked
   */
  onBack?: () => void;
  /**
   * If true, the header will have a refresh button
   * @default false
   */
  showRefreshButton?: boolean;
  /**
   * Callback function to execute when the refresh button is clicked
   */
  onRefresh?: () => void;
  /**
   * Additional styles to apply to the header container
   */
  sx?: SxProps<Theme>;
  /**
   * If true, the header will have a divider at the bottom
   * @default true
   */
  divider?: boolean;
  /**
   * If true, the header will have a paper-like background with elevation
   * @default false
   */
  elevated?: boolean;
  /**
   * Additional content to display below the title and subtitle
   */
  children?: ReactNode;
  /**
   * If true, the header will have a more options button
   * @default false
   */
  showMoreOptions?: boolean;
  /**
   * Callback function to execute when the more options button is clicked
   */
  onMoreOptionsClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Custom element to render as the title
   */
  titleComponent?: ReactNode;
  /**
   * Custom element to render as the subtitle
   */
  subtitleComponent?: ReactNode;
}

/**
 * A flexible and reusable page header component that can display a title, subtitle,
 * breadcrumbs, and action buttons. It's designed to be used at the top of pages
 * to provide context and actions related to the current view.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  showBackButton = false,
  onBack,
  showRefreshButton = false,
  onRefresh,
  sx = {},
  divider = true,
  elevated = false,
  children,
  showMoreOptions = false,
  onMoreOptionsClick,
  titleComponent,
  subtitleComponent,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;
  const hasActions = (actions && actions.length > 0) || showRefreshButton || showMoreOptions;
  
  // Default breadcrumb with home icon
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { 
      label: 'Home', 
      href: '/',
      icon: <HomeIcon fontSize="small" />,
    },
    ...breadcrumbs,
  ];
  
  // Render the header content
  const renderContent = () => (
    <>
      {/* Breadcrumbs */}
      {hasBreadcrumbs && (
        <Box mb={2}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              '& .MuiBreadcrumbs-li': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          >
            {defaultBreadcrumbs.map((item, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: item.disabled ? 'text.disabled' : 'inherit',
                }}
              >
                {item.icon && (
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-flex', 
                      mr: 0.5,
                      '& svg': {
                        fontSize: '1rem',
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                )}
                {item.href && !item.disabled ? (
                  <Link 
                    href={item.href} 
                    color="inherit" 
                    underline="hover"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Typography 
                    variant="body2" 
                    color={item.disabled ? 'text.disabled' : 'text.primary'}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            ))}
          </Breadcrumbs>
        </Box>
      )}
      
      <Box 
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 2,
          width: '100%',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1.5,
              mb: 0.5,
            }}
          >
            {showBackButton && (
              <Tooltip title="Go back">
                <IconButton 
                  onClick={onBack} 
                  size="small"
                  sx={{ mr: -1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {titleComponent || (
              <Typography 
                variant="h5" 
                component="h1"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </Typography>
            )}
          </Box>
          
          {subtitleComponent || (subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                mt: 0.5,
                maxWidth: 800,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </Typography>
          ))}
          
          {children}
        </Box>
        
        {hasActions && (
          <Box 
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
              width: isMobile ? '100%' : 'auto',
              mt: isMobile ? 2 : 0,
            }}
          >
            {showRefreshButton && (
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={onRefresh}
                  size="large"
                  color="default"
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                size={action.size || 'medium'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                type={action.type || 'button'}
                startIcon={action.loading ? <CircularProgress size={20} color="inherit" /> : action.icon}
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  ...(action.sx || {}),
                }}
              >
                {!action.loading && action.label}
              </Button>
            ))}
            
            {showMoreOptions && (
              <Tooltip title="More options">
                <IconButton 
                  onClick={onMoreOptionsClick}
                  size="large"
                  color="default"
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      
      {divider && <Divider sx={{ mt: 3 }} />}
    </>
  );
  
  // Return the header with or without elevation
  return elevated ? (
    <Paper 
      elevation={1} 
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        ...sx,
      }}
    >
      {renderContent()}
    </Paper>
  ) : (
    <Box 
      sx={{
        mb: 3,
        ...sx,
      }}
    >
      {renderContent()}
    </Box>
  );
};

export default PageHeader;
