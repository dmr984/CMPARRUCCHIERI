import { Timestamp, collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Customer, Staff, Service, Appointment, Product } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// CUSTOMERS
export const getCustomers = async (db: Firestore): Promise<Customer[]> => {
  const snapshot = await getDocs(collection(db, 'customers'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
        id: doc.id,
        ...data,
        lastVisit: (data.lastVisit as Timestamp).toDate(),
     } as Customer
  });
};

export const getCustomerById = async (db: Firestore, id: string): Promise<Customer | undefined> => {
  const docRef = doc(db, 'customers', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return { 
        id: docSnap.id, 
        ...data,
        lastVisit: (data.lastVisit as Timestamp).toDate(),
    } as Customer;
  }
};

export const saveCustomer = async (db: Firestore, customer: Omit<Customer, 'id'> & { id?: string }): Promise<string> => {
  if (customer.id) {
    const docRef = doc(db, 'customers', customer.id);
    const dataToSave = {
        ...customer,
        lastVisit: customer.lastVisit instanceof Date ? Timestamp.fromDate(customer.lastVisit) : customer.lastVisit
    };
    setDoc(docRef, dataToSave, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    return customer.id;
  } else {
    const newCustomer = {
        ...customer,
        lastVisit: Timestamp.now(),
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
    };
    const collectionRef = collection(db, 'customers');
    const docRef = await addDoc(collectionRef, newCustomer).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'create',
            requestResourceData: newCustomer,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
    return docRef.id;
  }
};

export const deleteCustomer = async (db: Firestore, customerId: string): Promise<void> => {
    const docRef = doc(db, 'customers', customerId);
    deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

// STAFF
export const getStaff = async (db: Firestore): Promise<Staff[]> => {
    const snapshot = await getDocs(collection(db, 'staff'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
};

// SERVICES
export const getServices = async (db: Firestore): Promise<Service[]> => {
    const snapshot = await getDocs(collection(db, 'services'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
};

export const saveService = async (db: Firestore, service: Omit<Service, 'id'> & { id?: string }): Promise<string> => {
    if (service.id) {
        const docRef = doc(db, 'services', service.id);
        setDoc(docRef, service, { merge: true }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: service,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        return service.id;
    } else {
        const collectionRef = collection(db, 'services');
        const docRef = await addDoc(collectionRef, service).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: service,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
        return docRef.id;
    }
}

export const deleteService = async (db: Firestore, serviceId: string): Promise<void> => {
    const docRef = doc(db, 'services', serviceId);
    deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}


// APPOINTMENTS
export const getAppointments = async (db: Firestore): Promise<Appointment[]> => {
    const snapshot = await getDocs(collection(db, 'appointments'));
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            dateTime: (data.dateTime as Timestamp).toDate(),
        } as Appointment
    });
};

export const saveAppointment = async (db: Firestore, appointment: Omit<Appointment, 'id' | 'dateTime'> & { id?: string, dateTime: Date }): Promise<string> => {
    const dataToSave = {
        ...appointment,
        dateTime: Timestamp.fromDate(appointment.dateTime),
    };

    if (appointment.id) {
        const docRef = doc(db, 'appointments', appointment.id);
        setDoc(docRef, dataToSave, { merge: true }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        return appointment.id;
    } else {
        const { id, ...data } = dataToSave;
        const collectionRef = collection(db, 'appointments');
        const docRef = await addDoc(collectionRef, data).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
        return docRef.id;
    }
}

export const deleteAppointment = async (db: Firestore, appointmentId: string): Promise<void> => {
    const docRef = doc(db, 'appointments', appointmentId);
    deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}


// PRODUCTS
export const getProducts = async (db: Firestore): Promise<Product[]> => {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const saveProduct = async (db: Firestore, product: Omit<Product, 'id'> & { id?: string }): Promise<string> => {
    if (product.id) {
        const docRef = doc(db, 'products', product.id);
        setDoc(docRef, product, { merge: true }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: product,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        return product.id;
    } else {
        const { id, ...data } = product;
        const collectionRef = collection(db, 'products');
        const docRef = await addDoc(collectionRef, data).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
        return docRef.id;
    }
}

export const deleteProduct = async (db: Firestore, productId: string): Promise<void> => {
    const docRef = doc(db, 'products', productId);
    deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

// Seed function if needed
export const seedDatabase = async (db: Firestore) => {
  console.log("Seeding database...");
  const staffData: Omit<Staff, 'id'>[] = [
    { name: 'Carmelinda', role: 'Manager' },
    { name: 'Beatrice', role: 'Stilista' },
    { name: 'Valentina', role: 'Stilista' },
  ];
  
  const servicesData: Omit<Service, 'id'>[] = [
    { name: 'Taglio Donna', description: 'Taglio e styling per donna.', duration: 45, price: 35 },
    { name: 'Colore', description: 'Applicazione colore e styling.', duration: 90, price: 70 },
    { name: 'Piega', description: 'Lavaggio e piega.', duration: 30, price: 20 },
    { name: 'Taglio Uomo', description: 'Taglio classico per uomo.', duration: 30, price: 25 },
    { name: 'Trattamento Keratina', description: 'Trattamento lisciante alla keratina.', duration: 120, price: 150 },
    { name: 'Shatush', description: 'Tecnica di schiaritura per capelli.', duration: 150, price: 120 },
  ];

  const productsData: Omit<Product, 'id'>[] = [
    { name: 'Shampoo Volumizzante', category: 'Shampoo', stock: 15, reorderLevel: 10, supplier: 'Beauty Supplies S.p.A.', price: 18 },
    { name: 'Balsamo Idratante', category: 'Balsamo', stock: 8, reorderLevel: 10, supplier: 'Beauty Supplies S.p.A.', price: 22 },
    { name: 'Lacca Fissaggio Forte', category: 'Styling', stock: 25, reorderLevel: 15, supplier: 'HairPro Italia', price: 15 },
    { name: 'Olio di Argan', category: 'Trattamenti', stock: 4, reorderLevel: 5, supplier: 'Natural Hair Care', price: 30 },
    { name: 'Tinta Castano Chiaro 5.0', category: 'Colore', stock: 5, reorderLevel: 8, supplier: 'Colorificio S.r.l.', price: 45 },
  ];

  const batch = writeBatch(db);

  staffData.forEach(staff => {
    const docRef = doc(collection(db, 'staff'));
    batch.set(docRef, staff);
  });

  servicesData.forEach(service => {
    const docRef = doc(collection(db, 'services'));
    batch.set(docRef, service);
  });

  productsData.forEach(product => {
    const docRef = doc(collection(db, 'products'));
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database: ', error);
  }
};
