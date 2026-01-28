import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  active: boolean;
  location_ids: string[];
  daily_work_hours?: number;
  weekly_work_hours?: number;
  monthly_work_hours?: number;
  created_at: string;
}

export interface WorkHoursStats {
  employee: {
    id: string;
    name: string;
    job_title: string;
    daily_work_hours?: number;
    weekly_work_hours?: number;
    monthly_work_hours?: number;
  };
  period: 'day' | 'week' | 'month';
  start_date: string;
  end_date: string;
  total_hours: number;
  expected_hours: number;
  difference: number;
  total_days: number;
  vacation_days: number;
  sick_leave_days: number;
  absent_days: number;
  daily_breakdown: Array<{
    date: string;
    hours: number;
    entries: number;
    status: string;
    expected_hours: number;
    difference: number;
  }>;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees();
      // Ensure location_ids is always an array
      const employeesWithDefaults = data.map((emp: any) => ({
        ...emp,
        location_ids: emp.location_ids || [],
      }));
      setEmployees(employeesWithDefaults);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const createEmployee = async (employeeData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    job_title: string;
  }) => {
    try {
      const newEmployee = await api.createEmployee(employeeData);
      // Ensure location_ids exists
      const employeeWithDefaults = {
        ...newEmployee,
        location_ids: newEmployee.location_ids || [],
      };
      setEmployees([...employees, employeeWithDefaults]);
      return employeeWithDefaults;
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
      throw err;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updated = await api.updateEmployee(id, updates);
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...updated } : emp));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update employee');
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
      throw err;
    }
  };

  const assignEmployeeToLocation = async (employeeId: string, locationId: string) => {
    try {
      await api.assignEmployeeLocation(employeeId, locationId);
      setEmployees(employees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, location_ids: [...(emp.location_ids || []), locationId] }
          : emp
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to assign location');
      throw err;
    }
  };

  const removeEmployeeFromLocation = async (employeeId: string, locationId: string) => {
    try {
      await api.removeEmployeeLocation(employeeId, locationId);
      setEmployees(employees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, location_ids: (emp.location_ids || []).filter(id => id !== locationId) }
          : emp
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to remove location');
      throw err;
    }
  };

  const getWorkHoursStats = async (
    employeeId: string, 
    period: 'day' | 'week' | 'month' = 'week',
    date?: string
  ): Promise<WorkHoursStats> => {
    try {
      return await api.getEmployeeWorkHours(employeeId, period, date);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch work hours');
      throw err;
    }
  };

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    assignEmployeeToLocation,
    removeEmployeeFromLocation,
    getWorkHoursStats,
    refetch: fetchEmployees,
  };
}
