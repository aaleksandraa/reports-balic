export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  email?: string;
  role: 'doctor' | 'associate' | 'staff';
  active: boolean;
}

export interface FiscalItem {
  id: string;
  serviceName: string;
  doctorCounts: Record<string, number>; // doctorId -> count
  price: number;
}

export interface NonFiscalItem {
  id: string;
  serviceName: string;
  doctorCounts: Record<string, number>;
  price: number;
}

export interface Patient {
  id: string;
  fullName: string;
  city: string;
  reason: string;
  doctorId: string;
}

export interface WorkScheduleItem {
  id: string;
  employeeId?: string;
  employeeName: string;
  arrivalTime: string;
  departureTime: string;
  hoursWorked: number;
}

export interface CardPaymentItem {
  id: string;
  serviceName: string;
  doctorCounts: Record<string, number>; // doctorId -> count
  price: number;
}

export interface WireTransferItem {
  id: string;
  patientName: string;
  doctorCounts: Record<string, number>; // doctorId -> count
  price: number;
}

export interface AssociateItem {
  id: string;
  serviceName: string;
  doctorId: string;
  count: number;
  price: number;
  type: 'fiscal' | 'non-fiscal';
}

export interface DailyReport {
  id: string;
  locationId: string;
  date: string;
  dayOfWeek: string;
  fiscalItems: FiscalItem[];
  nonFiscalItems: NonFiscalItem[];
  patients: Patient[];
  workSchedule: WorkScheduleItem[];
  cardPayments: CardPaymentItem[];
  wireTransfers: WireTransferItem[];
  associates: AssociateItem[];
  notes: string;
  submittedBy: string;
  submittedByName?: string;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'archived';
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalFiscal: number;
  totalNonFiscal: number;
  totalCardPayments: number;
  totalWireTransfers: number;
  totalAssociates: number;
  grandTotal: number;
  examsByDoctor: Record<string, number>;
  dailyReports: DailyReport[];
}

export const VISIT_REASONS = [
  'Ginekološki',
  'Sterilitet',
  '4D',
  'Dg tr',
  'Trudnički',
  'Kontrola',
  'HSC',
  'Laparoskopija',
  'Vantjelesna',
  'Inseminacija',
  'Operacija',
  'Ostalo'
];

export const CITIES = [
  'Sarajevo',
  'Tuzla',
  'Zenica',
  'Mostar',
  'Banja Luka',
  'Bijeljina',
  'Brčko',
  'Živinice',
  'Lukavac',
  'Gračanica',
  'Srebrenik',
  'Gradačac',
  'Banovići',
  'Maglaj',
  'Kalesija',
  'Kladanj',
  'Ostalo'
];

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Ponedjeljak', short: 'Pon' },
  { key: 'tuesday', label: 'Utorak', short: 'Uto' },
  { key: 'wednesday', label: 'Srijeda', short: 'Sri' },
  { key: 'thursday', label: 'Četvrtak', short: 'Čet' },
  { key: 'friday', label: 'Petak', short: 'Pet' },
  { key: 'saturday', label: 'Subota', short: 'Sub' },
  { key: 'sunday', label: 'Nedjelja', short: 'Ned' },
];
