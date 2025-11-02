import { subDays, addHours, set } from 'date-fns';
import type { Customer, Staff, Service, Appointment, Product } from './types';
import { PlaceHolderImages } from './placeholder-images';

const now = new Date();

const getAvatar = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const customers: Customer[] = [
  { id: '1', name: 'Elena Rossi', email: 'elena.rossi@example.com', phone: '+393331234567', avatarUrl: getAvatar('customer-1'), lastVisit: subDays(now, 10), preferences: 'Adora il profumo di lavanda, preferisce il caffè al tè.' },
  { id: '2', name: 'Marco Bianchi', email: 'marco.bianchi@example.com', phone: '+393332345678', avatarUrl: getAvatar('customer-2'), lastVisit: subDays(now, 25) },
  { id: '3', name: 'Giulia Romano', email: 'giulia.romano@example.com', phone: '+393333456789', avatarUrl: getAvatar('customer-3'), lastVisit: subDays(now, 5), preferences: 'Allergica alle noci.' },
  { id: '4', name: 'Sofia Ricci', email: 'sofia.ricci@example.com', phone: '+393334567890', avatarUrl: getAvatar('customer-4'), lastVisit: subDays(now, 40) },
  { id: '5', name: 'Alessandro Ferri', email: 'alessandro.ferri@example.com', phone: '+393335678901', avatarUrl: getAvatar('customer-5'), lastVisit: subDays(now, 15) },
];

export const staff: Staff[] = [
  { id: '1', name: 'Carmelinda', role: 'Manager' },
  { id: '2', name: 'Beatrice', role: 'Stilista' },
  { id: '3', name: 'Valentina', role: 'Stilista' },
];

export const services: Service[] = [
  { id: '1', name: 'Taglio Donna', description: 'Taglio e styling per donna.', duration: 45, price: 35 },
  { id: '2', name: 'Colore', description: 'Applicazione colore e styling.', duration: 90, price: 70 },
  { id: '3', name: 'Piega', description: 'Lavaggio e piega.', duration: 30, price: 20 },
  { id: '4', name: 'Taglio Uomo', description: 'Taglio classico per uomo.', duration: 30, price: 25 },
  { id: '5', name: 'Trattamento Keratina', description: 'Trattamento lisciante alla keratina.', duration: 120, price: 150 },
  { id: '6', name: 'Shatush', description: 'Tecnica di schiaritura per capelli.', duration: 150, price: 120 },
];

export const appointments: Appointment[] = [
  { id: '1', customerId: '3', staffId: '2', serviceId: '1', dateTime: set(now, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), status: 'Programmato' },
  { id: '2', customerId: '1', staffId: '3', serviceId: '2', dateTime: set(now, { hours: 14, minutes: 30, seconds: 0, milliseconds: 0 }), status: 'Programmato' },
  { id: '3', customerId: '5', staffId: '2', serviceId: '4', dateTime: addHours(now, 2), status: 'Programmato' },
  { id: '4', customerId: '2', staffId: '3', serviceId: '1', dateTime: subDays(now, 2), status: 'Completato' },
  { id: '5', customerId: '4', staffId: '2', serviceId: '6', dateTime: subDays(now, 5), status: 'Completato' },
  { id: '6', customerId: '1', staffId: '3', serviceId: '3', dateTime: subDays(now, 10), status: 'Completato' },
];

export const products: Product[] = [
  { id: '1', name: 'Shampoo Volumizzante', category: 'Shampoo', stock: 15, reorderLevel: 10, supplier: 'Beauty Supplies S.p.A.', price: 18 },
  { id: '2', name: 'Balsamo Idratante', category: 'Balsamo', stock: 8, reorderLevel: 10, supplier: 'Beauty Supplies S.p.A.', price: 22 },
  { id: '3', name: 'Lacca Fissaggio Forte', category: 'Styling', stock: 25, reorderLevel: 15, supplier: 'HairPro Italia', price: 15 },
  { id: '4', name: 'Olio di Argan', category: 'Trattamenti', stock: 12, reorderLevel: 5, supplier: 'Natural Hair Care', price: 30 },
  { id: '5', name: 'Tinta Castano Chiaro 5.0', category: 'Colore', stock: 5, reorderLevel: 8, supplier: 'Colorificio S.r.l.', price: 45 },
];

// Async functions to simulate data fetching
export const getCustomers = async (): Promise<Customer[]> => customers;
export const getCustomerById = async (id: string): Promise<Customer | undefined> => customers.find(c => c.id === id);
export const getStaff = async (): Promise<Staff[]> => staff;
export const getServices = async (): Promise<Service[]> => services;
export const getAppointments = async (): Promise<Appointment[]> => appointments;
export const getProducts = async (): Promise<Product[]> => products;

export const getAppointmentDetails = async (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return null;

    const customer = await getCustomerById(appointment.customerId);
    const service = services.find(s => s.id === appointment.serviceId);
    const stylist = staff.find(s => s.id === appointment.staffId);

    return {
        ...appointment,
        customer,
        service,
        stylist,
    }
}
