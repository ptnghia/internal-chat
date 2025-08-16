import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

export interface UIState {
  // Layout
  sidebarOpen: boolean;
  sidebarWidth: number;
  
  // Loading states
  globalLoading: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Modals and dialogs
  activeModal: string | null;
  modalData: any;
  
  // Theme
  darkMode: boolean;
  
  // Mobile
  isMobile: boolean;
}

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  sidebarWidth: 280,
  globalLoading: false,
  notifications: [],
  activeModal: null,
  modalData: null,
  darkMode: false,
  isMobile: false,
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = action.payload;
    },
    
    // Loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action: PayloadAction<{ modal: string; data?: any }>) => {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
    
    // Theme
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    
    // Mobile
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setSidebarWidth,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleDarkMode,
  setDarkMode,
  setIsMobile,
} = uiSlice.actions;

export default uiSlice.reducer;
