// Central API service for backend communication
export interface User {
  id: string;
  email: string;
  role: 'employee' | 'hr';
  name: string;
  phone?: string;
  address?: string;
  hasCompletedFirstLogin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SigningRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'signed';
  createdAt: string;
  updatedAt: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  createdBy: string;
  documents: Document[];
  signedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface FirstLoginData {
  name: string;
  phone: string;
  address: string;
  idProof: File | null;
}

// API Configuration
const API_BASE_URL = 'https://your-backend-api.com/api';
const API_TIMEOUT = 10000; // 10 seconds

// Development mode - set to true to use mock data only, false to try real API first
const USE_MOCK_DATA_ONLY = true;

class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private useMockOnly: boolean;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.useMockOnly = USE_MOCK_DATA_ONLY;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Helper method to get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method for making API calls
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (this.useMockOnly) {
      return this.mockLogin(credentials);
    }

    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.token) {
        localStorage.setItem('authToken', response.token);
      }

      return response;
    } catch (error) {
      // Fallback to mock data for development
      return this.mockLogin(credentials);
    }
  }

  async logout(): Promise<void> {
    if (!this.useMockOnly) {
      try {
        await this.makeRequest('/auth/logout', { method: 'POST' });
      } catch (error) {
        // Silently handle logout errors in development
      }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (this.useMockOnly) {
      return {
        success: true,
        message: 'Password reset instructions sent to your email.',
      };
    }

    try {
      return await this.makeRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      // Mock response for development
      return {
        success: true,
        message: 'Password reset instructions sent to your email.',
      };
    }
  }

  async completeFirstLogin(userId: string, data: FirstLoginData): Promise<User> {
    if (this.useMockOnly) {
      return {
        id: userId,
        email: 'user@company.com',
        role: 'employee',
        name: data.name,
        phone: data.phone,
        address: data.address,
        hasCompletedFirstLogin: true,
      };
    }

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('address', data.address);
      if (data.idProof) {
        formData.append('idProof', data.idProof);
      }

      const response = await this.makeRequest(`/users/${userId}/complete-profile`, {
        method: 'PATCH',
        headers: {
          // Remove Content-Type to let browser set it for FormData
          ...Object.fromEntries(
            Object.entries(this.getAuthHeaders()).filter(([key]) => key !== 'Content-Type')
          ),
        },
        body: formData,
      });

      return response.user;
    } catch (error) {
      // Mock response for development
      return {
        id: userId,
        email: 'user@company.com',
        role: 'employee',
        name: data.name,
        phone: data.phone,
        address: data.address,
        hasCompletedFirstLogin: true,
      };
    }
  }

  // User Management APIs
  async getUsers(): Promise<User[]> {
    if (this.useMockOnly) {
      return this.getMockUsers();
    }

    try {
      const response = await this.makeRequest('/users');
      return response.users;
    } catch (error) {
      return this.getMockUsers();
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (this.useMockOnly) {
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response.user;
    } catch (error) {
      // Mock response
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    if (this.useMockOnly) {
      // In mock mode, just return the updated data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return { ...currentUser, ...userData };
    }

    try {
      const response = await this.makeRequest(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
      });
      return response.user;
    } catch (error) {
      // For development, return merged data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return { ...currentUser, ...userData };
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (this.useMockOnly) {
      // In mock mode, just return successfully
      return;
    }

    try {
      await this.makeRequest(`/users/${userId}`, { method: 'DELETE' });
    } catch (error) {
      // For development, just return successfully
      return;
    }
  }

  // Signing Request APIs
  async getSigningRequests(userId?: string): Promise<SigningRequest[]> {
    if (this.useMockOnly) {
      return this.getMockSigningRequests();
    }

    try {
      const endpoint = userId ? `/signing-requests?userId=${userId}` : '/signing-requests';
      const response = await this.makeRequest(endpoint);
      return response.requests;
    } catch (error) {
      return this.getMockSigningRequests();
    }
  }

  async getSigningRequest(requestId: string): Promise<SigningRequest> {
    if (this.useMockOnly) {
      const mockRequests = this.getMockSigningRequests();
      const request = mockRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      return request;
    }

    try {
      const response = await this.makeRequest(`/signing-requests/${requestId}`);
      return response.request;
    } catch (error) {
      // Return mock data
      const mockRequests = this.getMockSigningRequests();
      const request = mockRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      return request;
    }
  }

  async createSigningRequest(requestData: {
    title: string;
    description: string;
    employeeId: string;
    documents: File[];
  }): Promise<SigningRequest> {
    if (this.useMockOnly) {
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: requestData.title,
        description: requestData.description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employeeId: requestData.employeeId,
        employeeName: 'Employee Name',
        employeeEmail: 'employee@company.com',
        createdBy: 'current-user-id',
        documents: requestData.documents.map((file, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: `mock-url-${index}`,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        })),
      };
    }

    try {
      const formData = new FormData();
      formData.append('title', requestData.title);
      formData.append('description', requestData.description);
      formData.append('employeeId', requestData.employeeId);
      
      requestData.documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });

      const response = await this.makeRequest('/signing-requests', {
        method: 'POST',
        headers: {
          ...Object.fromEntries(
            Object.entries(this.getAuthHeaders()).filter(([key]) => key !== 'Content-Type')
          ),
        },
        body: formData,
      });

      return response.request;
    } catch (error) {
      // Mock response
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: requestData.title,
        description: requestData.description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employeeId: requestData.employeeId,
        employeeName: 'Employee Name',
        employeeEmail: 'employee@company.com',
        createdBy: 'current-user-id',
        documents: requestData.documents.map((file, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: `mock-url-${index}`,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        })),
      };
    }
  }

  async deleteSigningRequest(requestId: string): Promise<void> {
    if (this.useMockOnly) {
      return;
    }

    try {
      await this.makeRequest(`/signing-requests/${requestId}`, { method: 'DELETE' });
    } catch (error) {
      // For development, just return successfully
      return;
    }
  }

  async signDocument(requestId: string): Promise<SigningRequest> {
    if (this.useMockOnly) {
      const mockRequests = this.getMockSigningRequests();
      const request = mockRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      return {
        ...request,
        status: 'signed',
        signedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await this.makeRequest(`/signing-requests/${requestId}/sign`, {
        method: 'POST',
      });
      return response.request;
    } catch (error) {
      // Mock response
      const mockRequests = this.getMockSigningRequests();
      const request = mockRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      return {
        ...request,
        status: 'signed',
        signedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Mock data for development
  private mockLogin(credentials: LoginRequest): LoginResponse {
    const mockUsers = [
      {
        id: '1',
        email: 'employee@company.com',
        password: 'password123',
        role: 'employee' as const,
        name: 'John Doe',
        hasCompletedFirstLogin: true
      },
      {
        id: '2',
        email: 'hr@company.com',
        password: 'password123',
        role: 'hr' as const,
        name: 'Jane Smith',
        hasCompletedFirstLogin: true
      },
      {
        id: '3',
        email: 'newuser@company.com',
        password: 'password123',
        role: 'employee' as const,
        name: 'New Employee',
        hasCompletedFirstLogin: false
      }
    ];

    const user = mockUsers.find(
      u => u.email === credentials.email && 
           u.password === credentials.password && 
           u.role === credentials.role
    );

    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          hasCompletedFirstLogin: user.hasCompletedFirstLogin,
        },
        token: 'mock-jwt-token',
      };
    }

    return {
      success: false,
      message: 'Invalid credentials',
    };
  }

  private getMockUsers(): User[] {
    return [
      {
        id: '1',
        email: 'employee@company.com',
        role: 'employee',
        name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St, City, State',
        hasCompletedFirstLogin: true,
      },
      {
        id: '2',
        email: 'hr@company.com',
        role: 'hr',
        name: 'Jane Smith',
        phone: '+1987654321',
        address: '456 Admin Ave, City, State',
        hasCompletedFirstLogin: true,
      },
      {
        id: '3',
        email: 'newuser@company.com',
        role: 'employee',
        name: 'New User',
        hasCompletedFirstLogin: false,
      },
    ];
  }

  private getMockSigningRequests(): SigningRequest[] {
    return [
      {
        id: '1',
        title: 'Employment Contract',
        description: 'Please review and sign your employment contract',
        status: 'pending',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        employeeId: '1',
        employeeName: 'John Doe',
        employeeEmail: 'employee@company.com',
        createdBy: '2',
        documents: [
          {
            id: '1',
            name: 'employment-contract.pdf',
            url: 'mock-url-1',
            type: 'application/pdf',
            size: 1024000,
            uploadedAt: '2024-01-15T10:00:00Z',
          },
        ],
      },
      {
        id: '2',
        title: 'NDA Agreement',
        description: 'Non-disclosure agreement for sensitive information',
        status: 'signed',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-12T09:15:00Z',
        employeeId: '1',
        employeeName: 'John Doe',
        employeeEmail: 'employee@company.com',
        createdBy: '2',
        documents: [
          {
            id: '2',
            name: 'nda-agreement.pdf',
            url: 'mock-url-2',
            type: 'application/pdf',
            size: 512000,
            uploadedAt: '2024-01-10T14:30:00Z',
          },
        ],
        signedAt: '2024-01-12T09:15:00Z',
      },
      {
        id: '3',
        title: 'Employee Handbook Acknowledgment',
        description: 'Please acknowledge that you have received and will comply with the employee handbook',
        status: 'pending',
        createdAt: '2024-01-20T11:00:00Z',
        updatedAt: '2024-01-20T11:00:00Z',
        employeeId: '3',
        employeeName: 'New Employee',
        employeeEmail: 'newuser@company.com',
        createdBy: '2',
        documents: [
          {
            id: '3',
            name: 'employee-handbook.pdf',
            url: 'mock-url-3',
            type: 'application/pdf',
            size: 2048000,
            uploadedAt: '2024-01-20T11:00:00Z',
          },
        ],
      },
    ];
  }
}

export const apiService = new ApiService();
export default apiService;