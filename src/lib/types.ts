import { Timestamp } from 'firebase/firestore';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  lastVisit: Date;
  preferences?: string;
};

export type StaffRole = 'Stilista' | 'Manager' | 'Receptionist';

export type Staff = {
  id: string;
  name: string;
  role: StaffRole;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
};

export type AppointmentStatus = 'Programmato' | 'Completato' | 'Annullato';

export type Appointment = {
  id: string;
  customerId: string;
  staffId: string;
  serviceIds: string[];
  dateTime: Date;
  status: AppointmentStatus;
  notes?: string;
};

export type FirebaseAppointment = Omit<Appointment, 'dateTime'> & {
    dateTime: Timestamp;
}

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  supplier: string;
  price: number;
};

export type SalonProfile = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

// Type for contact imported from device
export type ImportedContact = {
    name: string;
    email: string;
    phone: string;
}
