import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getLocations();
      setLocations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await api.createLocation(location);
      setLocations(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      const data = await api.updateLocation(id, updates);
      setLocations(prev => prev.map(loc => loc.id === id ? data : loc));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      await api.deleteLocation(id);
      setLocations(prev => prev.filter(loc => loc.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    locations,
    loading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations,
  };
}
