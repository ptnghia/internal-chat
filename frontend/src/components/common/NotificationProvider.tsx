import { useEffect } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';

const NotificationProvider = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  useEffect(() => {
    // Auto-remove notifications after their duration
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  const handleClose = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            mt: index * 7, // Stack notifications
          }}
        >
          <Alert
            severity={notification.type}
            onClose={() => handleClose(notification.id)}
            variant="filled"
            sx={{ minWidth: '300px' }}
          >
            <AlertTitle>{notification.title}</AlertTitle>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationProvider;
