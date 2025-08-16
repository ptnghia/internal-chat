import { api } from './authService';

// Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Users API
export const usersAPI = {
  getUsers: async (params?: PaginationParams) => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Departments API
export const departmentsAPI = {
  getDepartments: async (params?: PaginationParams) => {
    const response = await api.get('/departments', { params });
    return response.data.data;
  },

  getDepartment: async (id: string) => {
    const response = await api.get(`/departments/${id}`);
    return response.data.data;
  },

  createDepartment: async (departmentData: any) => {
    const response = await api.post('/departments', departmentData);
    return response.data.data;
  },

  updateDepartment: async (id: string, departmentData: any) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data.data;
  },

  deleteDepartment: async (id: string) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

// Teams API
export const teamsAPI = {
  getTeams: async (params?: PaginationParams) => {
    const response = await api.get('/teams', { params });
    return response.data.data;
  },

  getTeam: async (id: string) => {
    const response = await api.get(`/teams/${id}`);
    return response.data.data;
  },

  createTeam: async (teamData: any) => {
    const response = await api.post('/teams', teamData);
    return response.data.data;
  },

  updateTeam: async (id: string, teamData: any) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data.data;
  },

  deleteTeam: async (id: string) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },
};

// Chats API
export const chatsAPI = {
  getChats: async (params?: PaginationParams) => {
    const response = await api.get('/chats', { params });
    return response.data.data;
  },

  getChat: async (id: string) => {
    const response = await api.get(`/chats/${id}`);
    return response.data.data;
  },

  createChat: async (chatData: any) => {
    const response = await api.post('/chats', chatData);
    return response.data.data;
  },

  updateChat: async (id: string, chatData: any) => {
    const response = await api.put(`/chats/${id}`, chatData);
    return response.data.data;
  },

  deleteChat: async (id: string) => {
    const response = await api.delete(`/chats/${id}`);
    return response.data;
  },

  getChatMessages: async (chatId: string, params?: PaginationParams) => {
    const response = await api.get(`/chats/${chatId}/messages`, { params });
    return response.data.data;
  },

  sendMessage: async (chatId: string, messageData: any) => {
    const response = await api.post(`/chats/${chatId}/messages`, messageData);
    return response.data.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (params?: PaginationParams) => {
    const response = await api.get('/tasks', { params });
    return response.data.data;
  },

  getTask: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  createTask: async (taskData: any) => {
    const response = await api.post('/tasks', taskData);
    return response.data.data;
  },

  updateTask: async (id: string, taskData: any) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getTaskComments: async (taskId: string, params?: PaginationParams) => {
    const response = await api.get(`/tasks/${taskId}/comments`, { params });
    return response.data.data;
  },

  addTaskComment: async (taskId: string, commentData: any) => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    return response.data.data;
  },
};
