const API_BASE_URL = 'http://localhost:4000/api/v1';

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: User;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  tags: string[];
  likeCount: number;
  viewCount: number;
  commentCount: number;
  publishedAt: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface BlogsResponse {
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'An error occurred');
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Blog endpoints
  async getBlogs(params: { page?: number; limit?: number } = {}) {
    const query = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 10),
    });
    return this.request<BlogsResponse>(`/blogs/search?${query}`);
  }

  async searchBlogs(params: { q?: string; tags?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.tags) query.append('tags', params.tags);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    
    return this.request<BlogsResponse>(`/blogs/search?${query}`);
  }

  async getTrendingBlogs(params: { window?: '24h' | '7d'; limit?: number } = {}) {
    const query = new URLSearchParams({
      window: params.window || '24h',
      limit: String(params.limit || 10),
    });
    return this.request<Blog[]>(`/blogs/trending?${query}`);
  }

  async getBlog(id: string) {
    return this.request<Blog>(`/blogs/${id}`);
  }

  async createBlog(data: { title: string; content: string; tags: string[] }) {
    return this.request<Blog>('/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlog(id: string, data: { title: string; content: string; tags: string[] }) {
    return this.request<Blog>(`/blogs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async submitBlog(id: string) {
    return this.request<Blog>(`/blogs/${id}/submit`, {
      method: 'POST',
    });
  }

  async likeBlog(id: string) {
    return this.request<{ success: boolean }>(`/blogs/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikeBlog(id: string) {
    return this.request<{ success: boolean }>(`/blogs/${id}/unlike`, {
      method: 'POST',
    });
  }

  async commentOnBlog(id: string, content: string) {
    return this.request<{ success: boolean }>(`/blogs/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<User>('/users/me');
  }

  async updateProfile(data: { name: string }) {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async approveBlog(id: string) {
    return this.request<Blog>(`/blogs/admin/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectBlog(id: string, rejectionReason: string) {
    return this.request<Blog>(`/blogs/admin/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }
}

export const api = new ApiClient();