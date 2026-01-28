const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, first_name: string, last_name: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, first_name, last_name }),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Locations
  async getLocations() {
    return this.request<any[]>('/locations');
  }

  async getLocation(id: string) {
    return this.request<any>(`/locations/${id}`);
  }

  async createLocation(data: any) {
    return this.request<any>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: string, data: any) {
    return this.request<any>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLocation(id: string) {
    return this.request<{ message: string }>(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Doctors
  async getDoctors() {
    return this.request<any[]>('/doctors');
  }

  async getDoctor(id: string) {
    return this.request<any>(`/doctors/${id}`);
  }

  async getDoctorsByLocation(locationId: string) {
    return this.request<any[]>(`/doctors/location/${locationId}`);
  }

  async createDoctor(data: any) {
    return this.request<any>('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(id: string, data: any) {
    return this.request<any>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDoctor(id: string) {
    return this.request<{ message: string }>(`/doctors/${id}`, {
      method: 'DELETE',
    });
  }

  async assignDoctorLocation(doctorId: string, locationId: string) {
    return this.request<{ message: string }>(`/doctors/${doctorId}/locations`, {
      method: 'POST',
      body: JSON.stringify({ location_id: locationId }),
    });
  }

  async removeDoctorLocation(doctorId: string, locationId: string) {
    return this.request<{ message: string }>(`/doctors/${doctorId}/locations`, {
      method: 'DELETE',
      body: JSON.stringify({ location_id: locationId }),
    });
  }

  // Services
  async getServices(params?: { category?: string; active?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/services${query ? `?${query}` : ''}`);
  }

  async getService(id: string) {
    return this.request<any>(`/services/${id}`);
  }

  async createService(data: any) {
    return this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: any) {
    return this.request<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Users/Staff
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async updateUserRole(userId: string, role: 'admin' | 'staff' | 'radnik') {
    return this.request<any>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async updateUser(userId: string, data: { first_name?: string; last_name?: string; email?: string }) {
    return this.request<any>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async assignUserLocation(userId: string, locationId: string) {
    return this.request<{ message: string }>(`/users/${userId}/locations`, {
      method: 'POST',
      body: JSON.stringify({ location_id: locationId }),
    });
  }

  async removeUserLocation(userId: string, locationId: string) {
    return this.request<{ message: string }>(`/users/${userId}/locations`, {
      method: 'DELETE',
      body: JSON.stringify({ location_id: locationId }),
    });
  }

  // Employees
  async getEmployees() {
    return this.request<any[]>('/employees');
  }

  async createEmployee(data: any) {
    return this.request<any>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: any) {
    return this.request<any>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request<{ message: string }>(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async assignEmployeeLocation(employeeId: string, locationId: string) {
    return this.request<{ message: string }>(`/employees/${employeeId}/locations`, {
      method: 'POST',
      body: JSON.stringify({ location_id: locationId }),
    });
  }

  async removeEmployeeLocation(employeeId: string, locationId: string) {
    return this.request<{ message: string }>(`/employees/${employeeId}/locations`, {
      method: 'DELETE',
      body: JSON.stringify({ location_id: locationId }),
    });
  }

  async getEmployeeWorkHours(employeeId: string, period: 'day' | 'week' | 'month' = 'week', date?: string) {
    const params = new URLSearchParams({ period });
    if (date) params.append('date', date);
    return this.request<any>(`/employees/${employeeId}/work-hours?${params.toString()}`);
  }

  // Reports
  async getReportsByLocation(locationId: string, params?: { start_date?: string; end_date?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/reports/location/${locationId}${query ? `?${query}` : ''}`);
  }

  async getReport(reportId: string) {
    return this.request<any>(`/reports/${reportId}`);
  }

  async saveReport(data: any) {
    return this.request<{ id: string; message: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportReport(reportId: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/reports/${reportId}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  async emailReport(reportId: string, email?: string) {
    return this.request<{ message: string }>(`/reports/${reportId}/email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async submitReport(reportId: string) {
    return this.request<{ message: string }>(`/reports/${reportId}/submit`, {
      method: 'POST',
    });
  }

  async downloadReportPDF(reportId: string): Promise<Blob> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/reports/${reportId}/pdf`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    return response.blob();
  }
}

export const api = new ApiClient();
