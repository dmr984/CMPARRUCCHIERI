export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  lastVisit: Date;
  preferences?: string;
};

export type Staff = {
  id: string;
  name: string;
  role: 'Stilista' | 'Manager' | 'Receptionist';
};

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
};

export type Appointment = {
  id: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  dateTime: Date;
  status: 'Programmato' | 'Completato' | 'Annullato';
};

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  supplier: string;
  price: number;
};
