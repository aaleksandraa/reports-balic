import { api } from './api';

// Extended API methods for all entities

export const locationsApi = {
  getAll: () => api.request<any[]>('/locations'),
  getById: (id: string) => api.request<any>(`/locations/${id}`),
  create: (data: any) => api.request<any>('/locations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => api.request<any>(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => api.request<{ message: string }>(`/locations/${id}`, {
    method: 'DELETE',
  }),
};

export const doctorsApi = {
  getAll: () => api.request<any[]>('/doctors'),
  getById: (id: string) => api.request<any>(`/doctors/${id}`),
  getByLocation: (locationId: string) => api.request<any[]>(`/doctors/location/${locationId}`),
  create: (data: any) => api.request<any>('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => api.request<any>(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => api.request<{ message: string }>(`/doctors/${id}`, {
    method: 'DELETE',
  }),
};

export const servicesApi = {
  getAll: (params?: { category?: string; active?: boolean }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.request<any[]>(`/services${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.request<any>(`/services/${id}`),
  create: (data: any) => api.request<any>('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => api.request<any>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => api.request<{ message: string }>(`/services/${id}`, {
    method: 'DELETE',
  }),
};

export const reportsApi = {
  getByLocation: (locationId: string, params?: { startDate?: string; endDate?: string; status?: string }) => 
    api.getReports(locationId, params),
  getById: (reportId: string) => api.getReport(reportId),
  save: (data: any) => api.saveReport(data),
  submit: (reportId: string) => api.submitReport(reportId),
  downloadPDF: (reportId: string) => api.downloadReportPDF(reportId),
};

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper function to download blob as file
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
