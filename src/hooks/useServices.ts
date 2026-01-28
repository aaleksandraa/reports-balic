import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Service {
  id: string;
  name: string;
  price: number;
  category: 'fiscal' | 'non-fiscal';
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await api.createService(service);
      setServices(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const data = await api.updateService(id, updates);
      setServices(prev => prev.map(svc => svc.id === id ? data : svc));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteService = async (id: string) => {
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(svc => svc.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
}
