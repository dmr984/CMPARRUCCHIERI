import { subDays, addHours, set, subMinutes } from 'date-fns';
import type { Customer, Staff, Service, Appointment, Product } from './types';

// Let's use a stable date for our seed data
const now = new Date(2024, 6, 22);

const getAvatar = (id: string, gender: 'men' | 'women', index: number) => {
    return `https://randomuser.me/api/portraits/${gender}/${index}.jpg`;
};

let customersData: Customer[] = [
  { id: '1', name: 'Elena Rossi', email: 'elena.rossi@example.com', phone: '+393331234567', avatarUrl: getAvatar('1', 'women', 1), lastVisit: subDays(now, 10), preferences: 'Adora il profumo di lavanda, preferisce il caffè al tè.' },
  { id: '2', name: 'Marco Bianchi', email: 'marco.bianchi@example.com', phone: '+393332345678', avatarUrl: getAvatar('2', 'men', 2), lastVisit: subDays(now, 25) },
  { id: '3', name: 'Giulia Romano', email: 'giulia.romano@example.com', phone: '+393333456789', avatarUrl: getAvatar('3', 'women', 3), lastVisit: subDays(now, 5), preferences: 'Allergica alle noci.' },
  { id: '4', name: 'Sofia Ricci', email: 'sofia.ricci@example.com', phone: '+393334567890', avatarUrl: getAvatar('4', 'women', 4), lastVisit: subDays(now, 40) },
  { id: '5', name: 'Alessandro Ferri', email: 'alessandro.ferri@example.com', phone: '+393335678901', avatarUrl: getAvatar('5', 'men', 5), lastVisit: subDays(now, 15) },
];

let staffData: Staff[] = [
  { id: '1', name: 'Carmelinda', role: 'Manager' },
  { id: '2', name: 'Beatrice', role: 'Stilista' },
  { id: '3', name: 'Valentina', role: 'Stilista' },
];

let servicesData: Service[] = [
  { id: '1', name: 'Taglio Donna', description: 'Taglio e styling per donna.', duration: 45, price: 35 },
  { id: '2', name: 'Colore', description: 'Applicazione colore e styling.', duration: 90, price: 70 },
  { id: '3', name: 'Piega', description: 'Lavaggio e piega.', duration: 30, price: 20 },
  { id: '4', name: 'Taglio Uomo', description: 'Taglio classico per uomo.', duration: 30, price: 25 },
  { id: '5', name: 'Trattamento Keratina', description: 'Trattamento lisciante alla keratina.', duration: 120, price: 150 },
  { id: '6', name: 'Shatush', description: 'Tecnica di schiaritura per capelli.', duration: 150, price: 120 },
];

let appointmentsData: Appointment[] = [
  { id: '1', customerId: '3', staffId: '2', serviceIds: ['1'], dateTime: set(now, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), status: 'Programmato' },
  { id: '2', customerId: '1', staffId: '3', serviceIds: ['2', '3'], dateTime: set(now, { hours: 11, minutes: 30, seconds: 0, milliseconds: 0 }), status: 'Programmato' },
  { id: '3', customerId: '5', staffId: '2', serviceIds: ['4'], dateTime: set(now, { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }), status: 'Programmato' },
  { id: '4', customerId: '2', staffId: '3', serviceIds: ['1'], dateTime: subDays(now, 2), status: 'Completato' },
  { id: '5', customerId: '4', staffId: '2', serviceIds: ['6'], dateTime: subDays(now, 5), status: 'Completato' },
  { id: '6', customerId: '1', staffId: '3', serviceIds: ['3'], dateTime: subDays(now, 10), status: 'Completato' },
  { id: '7', customerId: '3', staffId: '2', serviceIds: ['1', '3'], dateTime: subDays(now, 1), status: 'Completato', notes: 'Cliente arrivata in ritardo di 15 min.'},
  { id: '8', customerId: '2', staffId: '3', serviceIds: ['4'], dateTime: set(subDays(now,1), { hours: 16, minutes: 0 }), status: 'Annullato' },
];

let productsData: Product[] = [
  { id: '1', name: 'Shampoo Volumizzante', category: 'Shampoo', stock: 15, reorderLevel: 10, supplier: 'Beauty Supplies S.p.A.', price: 18 },
  { id: '2', name: 'Balsamo Idratante', category: 'Balsamo', stock: 8, reorderLevel: 10, supplier: 'Beauty Supplies S.p.A.', price: 22 },
  { id: '3', name: 'Lacca Fissaggio Forte', category: 'Styling', stock: 25, reorderLevel: 15, supplier: 'HairPro Italia', price: 15 },
  { id: '4', name: 'Olio di Argan', category: 'Trattamenti', stock: 4, reorderLevel: 5, supplier: 'Natural Hair Care', price: 30 },
  { id: '5', name: 'Tinta Castano Chiaro 5.0', category: 'Colore', stock: 5, reorderLevel: 8, supplier: 'Colorificio S.r.l.', price: 45 },
];


// Async functions to simulate data fetching from a mutable source
export const getCustomers = async (): Promise<Customer[]> => JSON.parse(JSON.stringify(customersData));
export const getCustomerById = async (id: string): Promise<Customer | undefined> => customersData.find(c => c.id === id);
export const getStaff = async (): Promise<Staff[]> => JSON.parse(JSON.stringify(staffData));
export const getServices = async (): Promise<Service[]> => JSON.parse(JSON.stringify(servicesData));
export const getAppointments = async (): Promise<Appointment[]> => {
    // Deep copy and parse dates
    const data = JSON.parse(JSON.stringify(appointmentsData));
    return data.map((d: any) => ({...d, dateTime: new Date(d.dateTime)}));
}
export const getProducts = async (): Promise<Product[]> => JSON.parse(JSON.stringify(productsData));

export const getAppointmentDetails = async (id: string) => {
    const appointment = appointmentsData.find(a => a.id === id);
    if (!appointment) return null;

    const customer = await getCustomerById(appointment.customerId);
    const services = await getServices();
    const appointmentServices = appointment.serviceIds.map(id => services.find(s => s.id === id)).filter(Boolean);
    const stylist = staffData.find(s => s.id === appointment.staffId);

    return {
        ...appointment,
        customer,
        services: appointmentServices,
        stylist,
    }
}
