import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';

type DialogType = 'warning' | 'error' | 'info' | 'success' | 'question';

interface ConfirmDialogProps {
  /**
   * Controls the visibility of the dialog
   */
  open: boolean;
  /**
   * Callback function called when the dialog is closed
   */
  onClose: () => void;
  /**
   * Callback function called when the confirm action is triggered
   */
  onConfirm: () => void;
  /**
   * The title of the dialog
   */
  title: string;
  /**
   * The main content/message of the dialog
   */
  content: React.ReactNode;
  /**
   * The text for the confirm button
   * @default 'Confirm'
   */
  confirmText?: string;
  /**
   * The text for the cancel button
   * @default 'Cancel'
   */
  cancelText?: string;
  /**
   * The color of the confirm button
   * @default 'primary'
   */
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /**
   * The color of the cancel button
   * @default 'inherit'
   */
  cancelColor?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /**
   * If true, the confirm button will be disabled
   * @default false
   */
  disableConfirm?: boolean;
  /**
   * If true, the cancel button will be disabled
   * @default false
   */
  disableCancel?: boolean;
  /**
   * If true, the dialog will show a loading state
   * @default false
   */
  loading?: boolean;
  /**
   * The type of the dialog which determines the icon and default colors
   * @default 'warning'
   */
  type?: DialogType;
  /**
   * If true, the dialog will be fullscreen on mobile devices
   * @default false
   */
  fullScreenMobile?: boolean;
  /**
   * The maximum width of the dialog
   * @default 'sm'
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /**
   * Custom icon to display in the dialog header
   */
  customIcon?: React.ReactNode;
  /**
   * If true, the dialog will not close when clicking the backdrop
   * @default false
   */
  disableBackdropClick?: boolean;
  /**
   * If true, the dialog will not close when pressing the escape key
   * @default false
   */
  disableEscapeKeyDown?: boolean;
  /**
   * Additional styles to apply to the dialog
   */
  sx?: SxProps<Theme>;
  /**
   * Additional props to pass to the Dialog component
   */
  dialogProps?: object;
  /**
   * Additional props to pass to the DialogTitle component
   */
  titleProps?: object;
  /**
   * Additional props to pass to the DialogContent component
   */
  contentProps?: object;
  /**
   * Additional props to pass to the DialogActions component
   */
  actionsProps?: object;
  /**
   * Additional props to pass to the confirm button
   */
  confirmButtonProps?: object;
  /**
   * Additional props to pass to the cancel button
   */
  cancelButtonProps?: object;
  /**
   * If true, the dialog will not show the cancel button
   * @default false
   */
  hideCancelButton?: boolean;
  /**
   * If true, the dialog will not show the close icon in the header
   * @default false
   */
  hideCloseButton?: boolean;
  /**
   * Custom content to render in the dialog actions
   */
  customActions?: React.ReactNode;
}

/**
 * A reusable confirmation dialog component that can be used for various confirmation actions
 * like delete, discard changes, etc. It supports different types (warning, error, info, success, question)
 * and is fully customizable.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  cancelColor = 'inherit',
  disableConfirm = false,
  disableCancel = false,
  loading = false,
  type = 'warning',
  fullScreenMobile = false,
  maxWidth = 'sm',
  customIcon,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  sx = {},
  dialogProps = {},
  titleProps = {},
  contentProps = {},
  actionsProps = {},
  confirmButtonProps = {},
  cancelButtonProps = {},
  hideCancelButton = false,
  hideCloseButton = false,
  customActions,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = fullScreenMobile && isMobile;

  // Get icon and color based on dialog type
  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return {
          icon: <ErrorIcon fontSize="large" color="error" />,
          color: theme.palette.error.main,
        };
      case 'info':
        return {
          icon: <InfoIcon fontSize="large" color="info" />,
          color: theme.palette.info.main,
        };
      case 'success':
        return {
          icon: <CheckCircleIcon fontSize="large" color="success" />,
          color: theme.palette.success.main,
        };
      case 'question':
        return {
          icon: <HelpOutlineIcon fontSize="large" color="primary" />,
          color: theme.palette.primary.main,
        };
      case 'warning':
      default:
        return {
          icon: <WarningIcon fontSize="large" color="warning" />,
          color: theme.palette.warning.main,
        };
    }
  };

  const { icon, color } = getIconAndColor();
  const dialogIcon = customIcon || icon;

  // Handle dialog close
  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (disableBackdropClick && reason === 'backdropClick') return;
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') return;
    onClose();
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (!loading && !disableConfirm) {
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      disableEscapeKeyDown={disableEscapeKeyDown}
      {...dialogProps}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: fullScreen ? 0 : 2,
          ...(sx as any),
        },
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          ...(titleProps as any)?.sx,
        }}
        {...titleProps}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', color }}>
          {dialogIcon}
        </Box>
        <Typography variant="h6" component="div" sx={{ flex: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        {!hideCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={loading}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent
        id="confirm-dialog-description"
        sx={{
          py: 3,
          '&:first-of-type': { pt: 3 },
          ...(contentProps as any)?.sx,
        }}
        {...contentProps}
      >
        {typeof content === 'string' ? (
          <Typography variant="body1" color="text.primary">
            {content}
          </Typography>
        ) : (
          content
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          ...(actionsProps as any)?.sx,
        }}
        {...actionsProps}
      >
        {customActions ? (
          customActions
        ) : (
          <>
            {!hideCancelButton && (
              <Button
                onClick={onClose}
                color={cancelColor}
                disabled={disableCancel || loading}
                variant="text"
                {...cancelButtonProps}
                sx={{
                  minWidth: 100,
                  ...(cancelButtonProps as any)?.sx,
                }}
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              color={confirmColor}
              variant="contained"
              disabled={disableConfirm || loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              {...confirmButtonProps}
              sx={{
                minWidth: 100,
                '&.Mui-disabled': {
                  backgroundColor: `${color}30`,
                  color: `${color}80`,
                },
                ...(confirmButtonProps as any)?.sx,
              }}
            >
              {loading ? 'Processing...' : confirmText}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
