import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface StaffMember {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'staff' | 'radnik';
  location_ids: string[];
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      const users = await api.getUsers();
      
      const staffData = users.map((user: any) => ({
        id: user.id,
        user_id: user.id, // For compatibility with Staff.tsx
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'staff',
        location_ids: user.location_ids || [],
      }));

      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const assignStaffToLocation = async (userId: string, locationId: string) => {
    await api.assignUserLocation(userId, locationId);
    
    setStaff(prev => prev.map(s => 
      s.id === userId 
        ? { ...s, location_ids: [...s.location_ids, locationId] }
        : s
    ));
  };

  const removeStaffFromLocation = async (userId: string, locationId: string) => {
    await api.removeUserLocation(userId, locationId);
    
    setStaff(prev => prev.map(s => 
      s.id === userId 
        ? { ...s, location_ids: s.location_ids.filter(id => id !== locationId) }
        : s
    ));
  };

  const updateStaffRole = async (userId: string, role: 'admin' | 'staff' | 'radnik') => {
    await api.updateUserRole(userId, role);
    
    setStaff(prev => prev.map(s => 
      s.id === userId ? { ...s, role } : s
    ));
  };

  const updateStaff = async (userId: string, data: { first_name?: string; last_name?: string; email?: string }) => {
    await api.updateUser(userId, data);
    
    setStaff(prev => prev.map(s => 
      s.id === userId ? { ...s, ...data } : s
    ));
  };

  return {
    staff,
    isLoading,
    assignStaffToLocation,
    removeStaffFromLocation,
    updateStaffRole,
    updateStaff,
    refetch: fetchStaff,
  };
}
