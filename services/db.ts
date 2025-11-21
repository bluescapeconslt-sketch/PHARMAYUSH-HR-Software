import {
  DEFAULT_ROLES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_SHIFTS,
  DEFAULT_POLICIES,
  DEFAULT_EMPLOYEES,
  DEFAULT_LEAVE_REQUESTS,
  DEFAULT_ONBOARDING_TASKS,
  DEFAULT_MEETINGS,
  DEFAULT_NOTICES,
  DEFAULT_ATTENDANCE_RECORDS,
  DEFAULT_COMPLAINTS,
  DEFAULT_PERFORMANCE_RECORDS,
  DEFAULT_TEAM_CHAT_MESSAGES,
} from './mockData.ts';
import { CompanySettings, BuddySettings, LeaveAllocationSettings } from '../types.ts';
import { GEM_AVATAR as defaultAvatar } from '../constants.tsx';
import { db } from './firebase.ts';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    doc, 
    setDoc, 
    getDoc,
    orderBy,
    limit
} from 'firebase/firestore';

const DB_PREFIX = 'pharmayush_hr_';

// --- Local Storage Implementation (Fallback) ---
const initializeLocalTable = <T>(key: string, defaultData: T[]): void => {
  if (!localStorage.getItem(`${DB_PREFIX}${key}`)) {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(defaultData));
  }
};

const initializeLocalDB = (): void => {
  initializeLocalTable('roles', DEFAULT_ROLES);
  initializeLocalTable('departments', DEFAULT_DEPARTMENTS);
  initializeLocalTable('shifts', DEFAULT_SHIFTS);
  initializeLocalTable('policies', DEFAULT_POLICIES);
  initializeLocalTable('employees', DEFAULT_EMPLOYEES);
  initializeLocalTable('leave_requests', DEFAULT_LEAVE_REQUESTS);
  initializeLocalTable('onboarding_tasks', DEFAULT_ONBOARDING_TASKS);
  initializeLocalTable('meetings', DEFAULT_MEETINGS);
  initializeLocalTable('notices', DEFAULT_NOTICES);
  initializeLocalTable('attendance_records', DEFAULT_ATTENDANCE_RECORDS);
  initializeLocalTable('complaints', DEFAULT_COMPLAINTS);
  initializeLocalTable('performance_records', DEFAULT_PERFORMANCE_RECORDS);
  initializeLocalTable('team_chat_messages', DEFAULT_TEAM_CHAT_MESSAGES);
  
  // Initialize KV items locally
  if (!localStorage.getItem(`${DB_PREFIX}company_settings`)) {
       const defaultSettings: CompanySettings = {
          companyName: 'PHARMAYUSH HR',
          companyAddress: '123 Cloud St, Suite 500, Web City, 10101',
          companyLogo: '',
      };
      localStorage.setItem(`${DB_PREFIX}company_settings`, JSON.stringify(defaultSettings));
  }
  // ... (buddy and leave settings init logic mirrors existing code)
  if (!localStorage.getItem(`${DB_PREFIX}buddy_settings`)) {
      const defaultBuddySettings: BuddySettings = { avatarImage: defaultAvatar };
      localStorage.setItem(`${DB_PREFIX}buddy_settings`, JSON.stringify(defaultBuddySettings));
  }
  if (!localStorage.getItem(`${DB_PREFIX}leave_allocation_settings`)) {
      const defaultLeaveSettings: LeaveAllocationSettings = { short: 3, sick: 1, personal: 1 };
      localStorage.setItem(`${DB_PREFIX}leave_allocation_settings`, JSON.stringify(defaultLeaveSettings));
  }
};

// Initialize local DB immediately as fallback
initializeLocalDB();

// --- Seeding Firestore ---
const seedFirestore = async () => {
    console.log("Seeding Firestore with default data...");
    const seedTable = async (name: string, data: any[]) => {
        const colRef = collection(db!, name);
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) {
            console.log(`Seeding ${name}...`);
            for (const item of data) {
                await addDoc(colRef, item);
            }
        }
    };
    
    await Promise.all([
        seedTable('roles', DEFAULT_ROLES),
        seedTable('departments', DEFAULT_DEPARTMENTS),
        seedTable('shifts', DEFAULT_SHIFTS),
        seedTable('policies', DEFAULT_POLICIES),
        seedTable('employees', DEFAULT_EMPLOYEES),
        seedTable('leave_requests', DEFAULT_LEAVE_REQUESTS),
        seedTable('onboarding_tasks', DEFAULT_ONBOARDING_TASKS),
        seedTable('meetings', DEFAULT_MEETINGS),
        seedTable('notices', DEFAULT_NOTICES),
        seedTable('attendance_records', DEFAULT_ATTENDANCE_RECORDS),
        seedTable('complaints', DEFAULT_COMPLAINTS),
        seedTable('performance_records', DEFAULT_PERFORMANCE_RECORDS),
        seedTable('team_chat_messages', DEFAULT_TEAM_CHAT_MESSAGES),
    ]);

    // Seed Settings
    const settingsRef = doc(db!, 'settings', 'company_settings');
    if (!(await getDoc(settingsRef)).exists()) {
         await setDoc(settingsRef, {
            companyName: 'PHARMAYUSH HR',
            companyAddress: '123 Cloud St, Suite 500, Web City, 10101',
            companyLogo: '',
         });
    }
    
    const buddyRef = doc(db!, 'settings', 'buddy_settings');
    if (!(await getDoc(buddyRef)).exists()) {
        await setDoc(buddyRef, { avatarImage: defaultAvatar });
    }
    
    const leaveRef = doc(db!, 'settings', 'leave_allocation_settings');
    if (!(await getDoc(leaveRef)).exists()) {
        await setDoc(leaveRef, { short: 3, sick: 1, personal: 1 });
    }

    console.log("Firestore seeding complete.");
};

// --- Helper: Get Document Ref by ID field ---
const getDocRefByNumericId = async (table: string, id: number) => {
    if (!db) return null;
    const q = query(collection(db, table), where('id', '==', id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].ref;
};

// --- Generic Operations ---

export const find = async <T>(table: string): Promise<T[]> => {
  if (db) {
    // Cloud Mode
    const colRef = collection(db, table);
    const snapshot = await getDocs(colRef);
    
    // Auto-seed trigger on first read of 'roles' if empty
    if (snapshot.empty && table === 'roles') {
        await seedFirestore();
        const retrySnapshot = await getDocs(colRef);
        return retrySnapshot.docs.map(doc => doc.data() as T);
    }
    
    return snapshot.docs.map(doc => doc.data() as T);
  } else {
    // Local Mode
    return JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`) || '[]');
  }
};

export const findById = async <T extends {id: number}>(table: string, id: number): Promise<T | undefined> => {
    if (db) {
        const q = query(collection(db, table), where('id', '==', id));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return undefined;
        return snapshot.docs[0].data() as T;
    } else {
        const data = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`) || '[]');
        return data.find((item: T) => item.id === id);
    }
};

export const insert = async <T extends {id: number}>(table: string, newItem: Omit<T, 'id'>): Promise<T> => {
    if (db) {
        // Get max ID to increment. Not atomic, but sufficient for this scale.
        const colRef = collection(db, table);
        const q = query(colRef, orderBy('id', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        let newId = 1;
        if (!snapshot.empty) {
            newId = snapshot.docs[0].data().id + 1;
        }
        
        const itemWithId = { ...newItem, id: newId } as T;
        await addDoc(colRef, itemWithId);
        return itemWithId;
    } else {
        const data = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`) || '[]');
        const newId = data.length > 0 ? Math.max(...data.map((item: any) => item.id)) + 1 : 1;
        const itemWithId = { ...newItem, id: newId } as T;
        data.push(itemWithId);
        localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(data));
        return itemWithId;
    }
};

export const update = async <T extends {id: number}>(table: string, updatedItem: T): Promise<T> => {
    if (db) {
        const docRef = await getDocRefByNumericId(table, updatedItem.id);
        if (docRef) {
            await updateDoc(docRef, updatedItem as any);
            return updatedItem;
        } else {
            throw new Error(`Item with id ${updatedItem.id} not found in ${table}`);
        }
    } else {
        const data = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`) || '[]');
        const index = data.findIndex((item: T) => item.id === updatedItem.id);
        if (index !== -1) {
            data[index] = updatedItem;
            localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(data));
            return updatedItem;
        } else {
            throw new Error("Item not found");
        }
    }
};

export const remove = async <T extends {id: number}>(table: string, id: number): Promise<void> => {
    if (db) {
        const docRef = await getDocRefByNumericId(table, id);
        if (docRef) {
            await deleteDoc(docRef);
        }
    } else {
        const data = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`) || '[]');
        const newData = data.filter((item: T) => item.id !== id);
        localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(newData));
    }
};

export const getKV = async <T>(key: string): Promise<T> => {
    if (db) {
        // Map KV store to a 'settings' collection
        const docRef = doc(db, 'settings', key);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return snap.data() as T;
        }
        // If not found in cloud, try to return a default if possible, 
        // but for now return what local would have (which might be initialized defaults)
        // Fallback logic: return local default to prevent crashes
        const localData = localStorage.getItem(`${DB_PREFIX}${key}`);
        return localData ? JSON.parse(localData) : {} as T; 
    } else {
        const data = localStorage.getItem(`${DB_PREFIX}${key}`);
        return JSON.parse(data!);
    }
};

export const saveKV = async <T>(key: string, value: T): Promise<void> => {
    if (db) {
        const docRef = doc(db, 'settings', key);
        await setDoc(docRef, value as any);
    } else {
        localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(value));
    }
};