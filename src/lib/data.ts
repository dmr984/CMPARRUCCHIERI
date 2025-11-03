import { Timestamp, collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Customer, Staff, Service, Appointment, Product } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const handleFirestoreError = (error: any, path: string, operation: 'get' | 'list' | 'create' | 'update' | 'delete', requestData?: any) => {
  const permissionError = new FirestorePermissionError({
    path,
    operation,
    requestResourceData: requestData,
  });
  errorEmitter.emit('permission-error', permissionError);
  // Non rilanciare l'errore per non interrompere il flusso con un errore non gestito
  // ma loggalo per visibilità se necessario (anche se l'emitter dovrebbe essere sufficiente)
  console.error(`Caught permission error for ${operation} on ${path}`, error);
};


// CUSTOMERS
export const getCustomers = async (db: Firestore): Promise<Customer[]> => {
  const collectionRef = collection(db, 'customers');
  try {
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id,
          ...data,
          lastVisit: (data.lastVisit as Timestamp).toDate(),
       } as Customer
    });
  } catch (error) {
    handleFirestoreError(error, collectionRef.path, 'list');
    return [];
  }
};

export const getCustomerById = async (db: Firestore, id: string): Promise<Customer | undefined> => {
  const docRef = doc(db, 'customers', id);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
          id: docSnap.id, 
          ...data,
          lastVisit: (data.lastVisit as Timestamp).toDate(),
      } as Customer;
    }
  } catch(error) {
    handleFirestoreError(error, docRef.path, 'get');
  }
  return undefined;
};

export const saveCustomer = (db: Firestore, customer: Omit<Customer, 'id'> & { id?: string }): void => {
  if (customer.id) {
    const docRef = doc(db, 'customers', customer.id);
    const dataToSave = {
        ...customer,
        lastVisit: customer.lastVisit instanceof Date ? Timestamp.fromDate(customer.lastVisit) : customer.lastVisit
    };
    setDoc(docRef, dataToSave, { merge: true }).catch((error) => handleFirestoreError(error, docRef.path, 'update', dataToSave));
  } else {
    const { id, ...data } = customer; // Rimuove l'id esplicitamente
    const newCustomer = {
        ...data,
        lastVisit: Timestamp.now(),
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
    };
    const collectionRef = collection(db, 'customers');
    addDoc(collectionRef, newCustomer).catch((error) => handleFirestoreError(error, collectionRef.path, 'create', newCustomer));
  }
};

export const deleteCustomer = (db: Firestore, customerId: string): void => {
    const docRef = doc(db, 'customers', customerId);
    deleteDoc(docRef).catch((error) => handleFirestoreError(error, docRef.path, 'delete'));
}

// STAFF
export const getStaff = async (db: Firestore): Promise<Staff[]> => {
    const collectionRef = collection(db, 'staff');
    try {
        const snapshot = await getDocs(collectionRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
    } catch(error) {
        handleFirestoreError(error, collectionRef.path, 'list');
        return [];
    }
};

// SERVICES
export const getServices = async (db: Firestore): Promise<Service[]> => {
    const collectionRef = collection(db, 'services');
    try {
        const snapshot = await getDocs(collectionRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    } catch(error) {
        handleFirestoreError(error, collectionRef.path, 'list');
        return [];
    }
};

export const saveService = (db: Firestore, service: Omit<Service, 'id'> & { id?: string }): void => {
    if (service.id) {
        const docRef = doc(db, 'services', service.id);
        setDoc(docRef, service, { merge: true }).catch((error) => handleFirestoreError(error, docRef.path, 'update', service));
    } else {
        const { id, ...data } = service;
        const collectionRef = collection(db, 'services');
        addDoc(collectionRef, data).catch((error) => handleFirestoreError(error, collectionRef.path, 'create', data));
    }
}

export const deleteService = (db: Firestore, serviceId: string): void => {
    const docRef = doc(db, 'services', serviceId);
    deleteDoc(docRef).catch((error) => handleFirestoreError(error, docRef.path, 'delete'));
}


// APPOINTMENTS
export const getAppointments = async (db: Firestore): Promise<Appointment[]> => {
    const collectionRef = collection(db, 'appointments');
    try {
        const snapshot = await getDocs(collectionRef);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                dateTime: (data.dateTime as Timestamp).toDate(),
            } as Appointment
        });
    } catch (error) {
        handleFirestoreError(error, collectionRef.path, 'list');
        return [];
    }
};

export const saveAppointment = (db: Firestore, appointment: Omit<Appointment, 'id' | 'dateTime'> & { id?: string, dateTime: Date }): void => {
    const dataToSave = {
        ...appointment,
        dateTime: Timestamp.fromDate(appointment.dateTime),
    };

    if (appointment.id) {
        const docRef = doc(db, 'appointments', appointment.id);
        setDoc(docRef, dataToSave, { merge: true }).catch((error) => handleFirestoreError(error, docRef.path, 'update', dataToSave));
    } else {
        const { id, ...data } = dataToSave;
        const collectionRef = collection(db, 'appointments');
        addDoc(collectionRef, data).catch((error) => handleFirestoreError(error, collectionRef.path, 'create', data));
    }
}

export const deleteAppointment = (db: Firestore, appointmentId: string): void => {
    const docRef = doc(db, 'appointments', appointmentId);
    deleteDoc(docRef).catch((error) => handleFirestoreError(error, docRef.path, 'delete'));
}


// PRODUCTS
export const getProducts = async (db: Firestore): Promise<Product[]> => {
    const collectionRef = collection(db, 'products');
    try {
        const snapshot = await getDocs(collectionRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        handleFirestoreError(error, collectionRef.path, 'list');
        return [];
    }
};

export const saveProduct = (db: Firestore, product: Omit<Product, 'id'> & { id?: string }): void => {
    if (product.id) {
        const docRef = doc(db, 'products', product.id);
        setDoc(docRef, product, { merge: true }).catch((error) => handleFirestoreError(error, docRef.path, 'update', product));
    } else {
        const { id, ...data } = product;
        const collectionRef = collection(db, 'products');
        addDoc(collectionRef, data).catch((error) => handleFirestoreError(error, collectionRef.path, 'create', data));
    }
}

export const deleteProduct = (db: Firestore, productId: string): void => {
    const docRef = doc(db, 'products', productId);
    deleteDoc(docRef).catch((error) => handleFirestoreError(error, docRef.path, 'delete'));
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
