import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Doctor, DailyReport, FiscalItem, NonFiscalItem, Patient, WorkScheduleItem, CardPaymentItem, WireTransferItem, AssociateItem } from '@/types/report';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { useDoctors } from '@/hooks/useDoctors';
import { api } from '@/lib/api';

interface ReportContextType {
  doctors: Doctor[];
  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, doctor: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  refetchDoctors: () => void;
  
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  
  currentLocationId: string | null;
  setCurrentLocationId: (id: string | null) => void;
  
  currentUserId: string | null;
  currentUserName: string | null;
  setCurrentUser: (id: string | null, name: string | null) => void;
  
  reports: DailyReport[];
  currentReport: DailyReport;
  getCurrentReport: () => DailyReport;
  updateCurrentReport: (updates: Partial<DailyReport>) => void;
  
  addFiscalItem: (item: Omit<FiscalItem, 'id'>) => void;
  updateFiscalItem: (id: string, updates: Partial<FiscalItem>) => void;
  deleteFiscalItem: (id: string) => void;
  
  addNonFiscalItem: (item: Omit<NonFiscalItem, 'id'>) => void;
  updateNonFiscalItem: (id: string, updates: Partial<NonFiscalItem>) => void;
  deleteNonFiscalItem: (id: string) => void;
  
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  
  addWorkScheduleItem: (item: Omit<WorkScheduleItem, 'id'>) => void;
  updateWorkScheduleItem: (id: string, updates: Partial<WorkScheduleItem>) => void;
  deleteWorkScheduleItem: (id: string) => void;
  
  addCardPayment: (item: Omit<CardPaymentItem, 'id'>) => void;
  updateCardPayment: (id: string, updates: Partial<CardPaymentItem>) => void;
  deleteCardPayment: (id: string) => void;
  
  addWireTransfer: (item: Omit<WireTransferItem, 'id'>) => void;
  updateWireTransfer: (id: string, updates: Partial<WireTransferItem>) => void;
  deleteWireTransfer: (id: string) => void;
  
  addAssociate: (item: Omit<AssociateItem, 'id'>) => void;
  updateAssociate: (id: string, updates: Partial<AssociateItem>) => void;
  deleteAssociate: (id: string) => void;
  
  calculateTotals: () => {
    totalFiscal: number;
    totalNonFiscal: number;
    totalCardPayments: number;
    totalWireTransfers: number;
    totalAssociates: number;
    grandTotal: number;
    examsByDoctor: Record<string, number>;
  };
  
  submitReport: () => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyReport = (date: Date, locationId: string, userId: string, userName: string): DailyReport => ({
  id: generateId(),
  locationId,
  date: format(date, 'yyyy-MM-dd'),
  dayOfWeek: format(date, 'EEEE', { locale: bs }),
  fiscalItems: [],
  nonFiscalItems: [],
  patients: [],
  workSchedule: [],
  cardPayments: [],
  wireTransfers: [],
  associates: [],
  notes: '',
  submittedBy: userId,
  submittedByName: userName,
  status: 'draft',
});

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const { doctors: apiDoctors, refetch: refetchDoctors } = useDoctors();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const loadedReportsRef = useRef<Set<string>>(new Set());

  // Refetch doctors when location changes or when explicitly needed
  useEffect(() => {
    if (currentLocationId) {
      refetchDoctors();
    }
  }, [currentLocationId, refetchDoctors]);

  // Load report from API when date or location changes
  useEffect(() => {
    const loadReport = async () => {
      if (!currentLocationId || !currentDate) return;
      
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const cacheKey = `${currentLocationId}-${dateStr}`;
      
      // Check if already loaded
      if (loadedReportsRef.current.has(cacheKey)) return;
      
      setIsLoadingReport(true);
      try {
        const response = await api.getReportsByLocation(currentLocationId, {
          start_date: dateStr,
          end_date: dateStr,
        });
        
        if (response && response.length > 0) {
          const apiReport = response[0];
          
          // Transform API report to local format
          const transformedReport: DailyReport = {
            id: apiReport.id,
            locationId: apiReport.location_id,
            date: apiReport.date.split('T')[0], // Extract just the date part (YYYY-MM-DD)
            dayOfWeek: apiReport.day_of_week,
            fiscalItems: (apiReport.fiscal_items || []).map((item: any) => ({
              id: item.id,
              serviceName: item.service_name,
              doctorCounts: typeof item.doctor_counts === 'string' 
                ? JSON.parse(item.doctor_counts) 
                : (item.doctor_counts || {}),
              price: parseFloat(item.price) || 0,
            })),
            nonFiscalItems: (apiReport.non_fiscal_items || []).map((item: any) => ({
              id: item.id,
              serviceName: item.service_name,
              doctorCounts: typeof item.doctor_counts === 'string' 
                ? JSON.parse(item.doctor_counts) 
                : (item.doctor_counts || {}),
              price: parseFloat(item.price) || 0,
            })),
            cardPayments: (apiReport.card_payments || []).map((item: any) => ({
              id: item.id,
              serviceName: item.service_name,
              doctorCounts: typeof item.doctor_counts === 'string' 
                ? JSON.parse(item.doctor_counts) 
                : (item.doctor_counts || {}),
              price: parseFloat(item.price) || 0,
            })),
            wireTransfers: (apiReport.wire_transfers || []).map((item: any) => ({
              id: item.id,
              patientName: item.patient_name,
              doctorCounts: typeof item.doctor_counts === 'string' 
                ? JSON.parse(item.doctor_counts) 
                : (item.doctor_counts || {}),
              price: parseFloat(item.price) || 0,
            })),
            patients: (apiReport.patients || []).map((patient: any) => ({
              id: patient.id,
              fullName: patient.full_name,
              city: patient.city,
              reason: patient.reason,
              doctorId: patient.doctor_id,
            })),
            workSchedule: (apiReport.work_schedule || []).map((item: any) => ({
              id: item.id,
              employeeId: item.employee_id,
              employeeName: item.employee_name,
              arrivalTime: item.arrival_time,
              departureTime: item.departure_time,
              hoursWorked: parseFloat(item.hours_worked) || 0,
            })),
            associates: [],
            notes: apiReport.notes || '',
            submittedBy: apiReport.submitted_by,
            submittedByName: apiReport.submitted_by?.first_name 
              ? `${apiReport.submitted_by.first_name} ${apiReport.submitted_by.last_name || ''}`.trim()
              : '',
            status: apiReport.status,
            submittedAt: apiReport.submitted_at,
          };
          
          setReports(prev => [...prev, transformedReport]);
          loadedReportsRef.current.add(cacheKey);
        } else {
          loadedReportsRef.current.add(cacheKey);
        }
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        setIsLoadingReport(false);
      }
    };
    
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, currentLocationId]);

  // Convert API doctors to Report format
  const doctors: Doctor[] = useMemo(() => {
    return apiDoctors.map(doc => ({
      id: doc.id,
      firstName: doc.first_name,
      lastName: doc.last_name || '',
      initials: doc.initials,
      email: doc.email,
      role: doc.role as 'doctor' | 'associate' | 'staff',
      active: doc.active,
    }));
  }, [apiDoctors]);
  
  // Memoized current report - doesn't trigger state updates
  const currentReport = useMemo(() => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const existing = reports.find(r => r.date === dateStr && r.locationId === currentLocationId);
    if (existing) return existing;
    
    // Return empty report without adding to state
    return createEmptyReport(
      currentDate, 
      currentLocationId || '', 
      currentUserId || '', 
      currentUserName || ''
    );
  }, [currentDate, currentLocationId, currentUserId, currentUserName, reports]);
  
  const setCurrentUser = useCallback((id: string | null, name: string | null) => {
    setCurrentUserId(id);
    setCurrentUserName(name);
  }, []);

  const getCurrentReport = useCallback((): DailyReport => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const existing = reports.find(r => r.date === dateStr && r.locationId === currentLocationId);
    
    if (existing) return existing;
    
    // Only create and add new report when explicitly called (not during render)
    const newReport = createEmptyReport(
      currentDate, 
      currentLocationId || '', 
      currentUserId || '', 
      currentUserName || ''
    );
    setReports(prev => [...prev, newReport]);
    return newReport;
  }, [currentDate, currentLocationId, currentUserId, currentUserName, reports]);

  const updateCurrentReport = useCallback((updates: Partial<DailyReport>) => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    setReports(prev => {
      const idx = prev.findIndex(r => r.date === dateStr && r.locationId === currentLocationId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      }
      return [...prev, { ...createEmptyReport(
        currentDate, 
        currentLocationId || '', 
        currentUserId || '', 
        currentUserName || ''
      ), ...updates }];
    });
  }, [currentDate, currentLocationId, currentUserId, currentUserName]);

  // Fiscal Items
  const addFiscalItem = useCallback((item: Omit<FiscalItem, 'id'>) => {
    updateCurrentReport({
      fiscalItems: [...currentReport.fiscalItems, { ...item, id: generateId() }]
    });
  }, [currentReport, updateCurrentReport]);

  const updateFiscalItem = useCallback((id: string, updates: Partial<FiscalItem>) => {
    updateCurrentReport({
      fiscalItems: currentReport.fiscalItems.map(i => i.id === id ? { ...i, ...updates } : i)
    });
  }, [currentReport, updateCurrentReport]);

  const deleteFiscalItem = useCallback((id: string) => {
    updateCurrentReport({
      fiscalItems: currentReport.fiscalItems.filter(i => i.id !== id)
    });
  }, [currentReport, updateCurrentReport]);

  // Non-Fiscal Items
  const addNonFiscalItem = useCallback((item: Omit<NonFiscalItem, 'id'>) => {
    updateCurrentReport({
      nonFiscalItems: [...currentReport.nonFiscalItems, { ...item, id: generateId() }]
    });
  }, [currentReport, updateCurrentReport]);

  const updateNonFiscalItem = useCallback((id: string, updates: Partial<NonFiscalItem>) => {
    updateCurrentReport({
      nonFiscalItems: currentReport.nonFiscalItems.map(i => i.id === id ? { ...i, ...updates } : i)
    });
  }, [currentReport, updateCurrentReport]);

  const deleteNonFiscalItem = useCallback((id: string) => {
    updateCurrentReport({
      nonFiscalItems: currentReport.nonFiscalItems.filter(i => i.id !== id)
    });
  }, [currentReport, updateCurrentReport]);

  // Patients
  const addPatient = useCallback((patient: Omit<Patient, 'id'>) => {
    updateCurrentReport({
      patients: [...currentReport.patients, { ...patient, id: generateId() }]
    });
  }, [currentReport, updateCurrentReport]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    updateCurrentReport({
      patients: currentReport.patients.map(p => p.id === id ? { ...p, ...updates} : p)
    });
  }, [currentReport, updateCurrentReport]);

  const deletePatient = useCallback((id: string) => {
    updateCurrentReport({
      patients: currentReport.patients.filter(p => p.id !== id)
    });
  }, [currentReport, updateCurrentReport]);

  // Work Schedule
  const addWorkScheduleItem = useCallback((item: Omit<WorkScheduleItem, 'id'>) => {
    updateCurrentReport({
      workSchedule: [...currentReport.workSchedule, { ...item, id: generateId() }]
    });
  }, [currentReport, updateCurrentReport]);

  const updateWorkScheduleItem = useCallback((id: string, updates: Partial<WorkScheduleItem>) => {
    updateCurrentReport({
      workSchedule: currentReport.workSchedule.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  }, [currentReport, updateCurrentReport]);

  const deleteWorkScheduleItem = useCallback((id: string) => {
    updateCurrentReport({
      workSchedule: currentReport.workSchedule.filter(w => w.id !== id)
    });
  }, [currentReport, updateCurrentReport]);

  // Card Payments
  const addCardPayment = useCallback((item: Omit<CardPaymentItem, 'id'>) => {
    updateCurrentReport({
      cardPayments: [...currentReport.cardPayments, { ...item, id: generateId() }]
    });
  }, [currentReport, updateCurrentReport]);

  const updateCardPayment = useCallback((id: string, updates: Partial<CardPaymentItem>) => {
    updateCurrentReport({
      cardPayments: currentReport.cardPayments.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  }, [currentReport, updateCurrentReport]);

  const deleteCardPayment = useCallback((id: string) => {
    updateCurrentReport({
      cardPayments: currentReport.cardPayments.filter(c => c.id !== id)
    });
  }, [currentReport, updateCurrentReport]);

  // Wire Transfers
  const addWireTransfer = useCallback((item: Omit<WireTransferItem, 'id'>) => {
    updateCurrentReport({
      wireTransfers: [...currentReport.wireTransfers, { ...item, id: generateId() }]
    });
  }, [currentReport, updateCurrentReport]);

  const updateWireTransfer = useCallback((id: string, updates: Partial<WireTransferItem>) => {
    updateCurrentReport({
      wireTransfers: currentReport.wireTransfers.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  }, [currentReport, updateCurrentReport]);

  const deleteWireTransfer = useCallback((id: string) => {
    updateCurrentReport({
      wireTransfers: currentReport.wireTransfers.filter(w => w.id !== id)
    });
  }, [currentReport, updateCurrentReport]);

  // Associates
  const addAssociate = useCallback((item: Omit<AssociateItem, 'id'>) => {
    updateCurrentReport({
      associates: [...currentReport.associates, { ...item, id: generateId() }]
    });
  }, [currentReport, updateCurrentReport]);

  const updateAssociate = useCallback((id: string, updates: Partial<AssociateItem>) => {
    updateCurrentReport({
      associates: currentReport.associates.map(a => a.id === id ? { ...a, ...updates } : a)
    });
  }, [currentReport, updateCurrentReport]);

  const deleteAssociate = useCallback((id: string) => {
    updateCurrentReport({
      associates: currentReport.associates.filter(a => a.id !== id)
    });
  }, [currentReport, updateCurrentReport]);

  const calculateTotals = useCallback(() => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const report = reports.find(r => r.date === dateStr && r.locationId === currentLocationId);
    
    // If no report exists yet, return zeros
    if (!report) {
      return {
        totalFiscal: 0,
        totalNonFiscal: 0,
        totalCardPayments: 0,
        totalWireTransfers: 0,
        totalAssociates: 0,
        grandTotal: 0,
        examsByDoctor: {},
      };
    }
    
    const totalFiscal = report.fiscalItems.reduce((sum, item) => sum + item.price, 0);
    const totalNonFiscal = report.nonFiscalItems.reduce((sum, item) => sum + item.price, 0);
    const totalCardPayments = report.cardPayments.reduce((sum, item) => sum + item.price, 0);
    const totalWireTransfers = report.wireTransfers.reduce((sum, item) => sum + item.price, 0);
    const totalAssociates = report.associates.reduce((sum, item) => sum + item.price, 0);
    
    const examsByDoctor: Record<string, number> = {};
    
    report.fiscalItems.forEach(item => {
      Object.entries(item.doctorCounts).forEach(([doctorId, count]) => {
        examsByDoctor[doctorId] = (examsByDoctor[doctorId] || 0) + count;
      });
    });
    
    report.cardPayments.forEach(item => {
      Object.entries(item.doctorCounts).forEach(([doctorId, count]) => {
        examsByDoctor[doctorId] = (examsByDoctor[doctorId] || 0) + count;
      });
    });
    
    report.wireTransfers.forEach(item => {
      Object.entries(item.doctorCounts).forEach(([doctorId, count]) => {
        examsByDoctor[doctorId] = (examsByDoctor[doctorId] || 0) + count;
      });
    });
    
    return {
      totalFiscal,
      totalNonFiscal,
      totalCardPayments,
      totalWireTransfers,
      totalAssociates,
      grandTotal: totalFiscal + totalNonFiscal + totalCardPayments + totalWireTransfers + totalAssociates,
      examsByDoctor,
    };
  }, [currentDate, currentLocationId, reports]);

  const submitReport = useCallback(() => {
    updateCurrentReport({
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });
  }, [updateCurrentReport]);

  return (
    <ReportContext.Provider value={{
      doctors,
      addDoctor: () => {}, // Deprecated - use Doctors page
      updateDoctor: () => {}, // Deprecated - use Doctors page
      deleteDoctor: () => {}, // Deprecated - use Doctors page
      refetchDoctors,
      currentDate,
      setCurrentDate,
      currentLocationId,
      setCurrentLocationId,
      currentUserId,
      currentUserName,
      setCurrentUser,
      reports,
      currentReport,
      getCurrentReport,
      updateCurrentReport,
      addFiscalItem,
      updateFiscalItem,
      deleteFiscalItem,
      addNonFiscalItem,
      updateNonFiscalItem,
      deleteNonFiscalItem,
      addPatient,
      updatePatient,
      deletePatient,
      addWorkScheduleItem,
      updateWorkScheduleItem,
      deleteWorkScheduleItem,
      addCardPayment,
      updateCardPayment,
      deleteCardPayment,
      addWireTransfer,
      updateWireTransfer,
      deleteWireTransfer,
      addAssociate,
      updateAssociate,
      deleteAssociate,
      calculateTotals,
      submitReport,
    }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}

// Alias for backward compatibility
export const useReportContext = useReport;
