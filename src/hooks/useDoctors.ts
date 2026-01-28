import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  initials: string;
  email?: string;
  role: 'doctor' | 'associate' | 'staff';
  active: boolean;
  created_at?: string;
  updated_at?: string;
  location_ids?: string[];
}

export function useDoctors(locationId?: string) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const data = locationId 
        ? await api.getDoctorsByLocation(locationId)
        : await api.getDoctors();
      setDoctors(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const addDoctor = async (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await api.createDoctor(doctor);
      setDoctors(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateDoctor = async (id: string, updates: Partial<Doctor>) => {
    try {
      const data = await api.updateDoctor(id, updates);
      setDoctors(prev => prev.map(doc => doc.id === id ? data : doc));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      await api.deleteDoctor(id);
      setDoctors(prev => prev.filter(doc => doc.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const getDoctorLocations = (doctorId: string): string[] => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.location_ids || [];
  };

  const assignDoctorToLocation = async (doctorId: string, locationId: string) => {
    try {
      await api.assignDoctorLocation(doctorId, locationId);
      setDoctors(prev => prev.map(doc => 
        doc.id === doctorId 
          ? { ...doc, location_ids: [...(doc.location_ids || []), locationId] }
          : doc
      ));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const removeDoctorFromLocation = async (doctorId: string, locationId: string) => {
    try {
      await api.removeDoctorLocation(doctorId, locationId);
      setDoctors(prev => prev.map(doc => 
        doc.id === doctorId 
          ? { ...doc, location_ids: (doc.location_ids || []).filter(id => id !== locationId) }
          : doc
      ));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    doctors,
    loading,
    error,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorLocations,
    assignDoctorToLocation,
    removeDoctorFromLocation,
    refetch: fetchDoctors,
  };
}
