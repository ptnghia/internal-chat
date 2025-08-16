import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Store and theme
import { store } from './store';
import { theme } from './theme';
import { router } from './router';

// Components
import NotificationProvider from './components/common/NotificationProvider';
import { useAppDispatch, useAppSelector } from './store';
import { getCurrentUser } from './store/slices/authSlice';

// App content component
function AppContent() {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated on app start
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <>
      <CssBaseline />
      <NotificationProvider />
      <RouterProvider router={router} />
    </>
  );
}

// Main App component
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
