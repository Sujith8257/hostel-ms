import { supabase } from '@/lib/supabase';

const API_BASE_URL = 'http://localhost:3001/api';

// Helper to refresh token if needed
const refreshTokenIfNeeded = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  // Check if token is about to expire (within 5 minutes)
  const expiresAt = session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  
  if (expiresAt) {
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 300) { // 5 minutes
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Token refresh failed:', error);
          return null;
        }
        return data.session?.access_token;
      } catch (err) {
        console.error('Token refresh error:', err);
        return null;
      }
    }
  }
  
  return session.access_token;
};

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      // Try to refresh token if needed before making the request
      const token = await refreshTokenIfNeeded();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        // If unauthorized, try to refresh token once more
        if (response.status === 401 && token) {
          try {
            const { data: refreshData, error } = await supabase.auth.refreshSession();
            if (!error && refreshData.session?.access_token) {
              // Retry the request with new token
              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${refreshData.session.access_token}`,
                  ...options.headers,
                },
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return retryData;
              }
            }
          } catch (refreshError) {
            console.error('Token refresh retry failed:', refreshError);
          }
        }
        
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Specific API endpoints

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  signup: (email: string, password: string, fullName: string, role?: string, phone?: string, organization?: string, justification?: string) =>
    apiClient.post('/auth/signup', { email, password, fullName, role, phone, organization, justification }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// Admin API
export const adminApi = {
  getDashboard: () =>
    apiClient.get('/admin/dashboard'),
  
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    apiClient.get('/admin/users', params),
  
  createUser: (userData: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    building_id?: string;
    floor_numbers?: number[];
  }) =>
    apiClient.post('/admin/users', userData),
  
  updateUser: (id: string, updates: Partial<{
    full_name: string;
    email: string;
    role: string;
    phone: string;
    is_active: boolean;
  }>) =>
    apiClient.put(`/admin/users/${id}`, updates),
  
  deleteUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}`),
  
  getSystemHealth: () =>
    apiClient.get('/admin/system-health'),
  
  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/admin/audit-logs', params),
  
  getPermissions: () =>
    apiClient.get('/admin/permissions'),
};

// Director API
export const directorApi = {
  getDashboard: () =>
    apiClient.get('/director/dashboard'),
  
  getHostels: () =>
    apiClient.get('/director/hostels'),
  
  getStaff: () =>
    apiClient.get('/director/staff'),
};

// Warden API
export const wardenApi = {
  getDashboard: () =>
    apiClient.get('/warden/dashboard'),
  
  getStudents: () =>
    apiClient.get('/warden/students'),
  
  getAlerts: () =>
    apiClient.get('/warden/alerts'),
};

// Associate Warden API
export const associateWardenApi = {
  getDashboard: () =>
    apiClient.get('/associate-warden/dashboard'),
  
  getFloors: () =>
    apiClient.get('/associate-warden/floors'),
  
  getAttendance: () =>
    apiClient.get('/associate-warden/attendance'),
};

// Caretaker API
export const caretakerApi = {
  getDashboard: () =>
    apiClient.get('/caretaker/dashboard'),
  
  getTasks: () =>
    apiClient.get('/caretaker/tasks'),
  
  getMaintenance: () =>
    apiClient.get('/caretaker/maintenance'),
};

export default apiClient;