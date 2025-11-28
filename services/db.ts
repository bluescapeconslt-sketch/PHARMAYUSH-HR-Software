

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
  DEFAULT_NOTIFICATIONS,
} from './mockData.ts';
import { CompanySettings, BuddySettings, LeaveAllocationSettings } from '../types.ts';
import { GEM_AVATAR as defaultAvatar } from '../constants.tsx';

const DB_PREFIX = 'pharmayush_hr_';
const VERSION_KEY = `${DB_PREFIX}version`;
const CURRENT_VERSION = '2.1.0'; // Version bumped for notifications

// --- Initialization ---
const initializeTable = <T>(key: string, defaultData: T[]): void => {
  if (!localStorage.getItem(`${DB_PREFIX}${key}`)) {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(defaultData));
  }
};

const initializeDB = (): void => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== CURRENT_VERSION) {
    console.log(`Storage version mismatch. Clearing and re-initializing database.`);
    Object.keys(localStorage)
      .filter(key => key.startsWith(DB_PREFIX))
      .forEach(key => localStorage.removeItem(key));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }

  initializeTable('roles', DEFAULT_ROLES);
  initializeTable('departments', DEFAULT_DEPARTMENTS);
  initializeTable('shifts', DEFAULT_SHIFTS);
  initializeTable('policies', DEFAULT_POLICIES);
  initializeTable('employees', DEFAULT_EMPLOYEES);
  initializeTable('leave_requests', DEFAULT_LEAVE_REQUESTS);
  initializeTable('onboarding_tasks', DEFAULT_ONBOARDING_TASKS);
  initializeTable('meetings', DEFAULT_MEETINGS);
  initializeTable('notices', DEFAULT_NOTICES);
  initializeTable('attendance_records', DEFAULT_ATTENDANCE_RECORDS);
  initializeTable('complaints', DEFAULT_COMPLAINTS);
  initializeTable('performance_records', DEFAULT_PERFORMANCE_RECORDS);
  initializeTable('team_chat_messages', DEFAULT_TEAM_CHAT_MESSAGES);
  initializeTable('notifications', DEFAULT_NOTIFICATIONS);

  // Initialize KV storage items
  if (!localStorage.getItem(`${DB_PREFIX}company_settings`)) {
      const defaultSettings: CompanySettings = {
          companyName: 'PHARMAYUSH HR',
          companyAddress: '123 Cloud St, Suite 500, Web City, 10101',
          companyLogo: '',
      };
      localStorage.setItem(`${DB_PREFIX}company_settings`, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(`${DB_PREFIX}buddy_settings`)) {
      const defaultBuddySettings: BuddySettings = { avatarImage: defaultAvatar };
      localStorage.setItem(`${DB_PREFIX}buddy_settings`, JSON.stringify(defaultBuddySettings));
  }
  if (!localStorage.getItem(`${DB_PREFIX}leave_allocation_settings`)) {
      const defaultLeaveSettings: LeaveAllocationSettings = { short: 3, sick: 1, personal: 1 };
      localStorage.setItem(`${DB_PREFIX}leave_allocation_settings`, JSON.stringify(defaultLeaveSettings));
  }
};

initializeDB();

// --- Generic DB operations ---

const getTable = <T>(table: string): T[] => {
  return JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`) || '[]');
};

const saveTable = <T>(table: string, data: T[]) => {
  localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(data));
};

const getNextId = (data: { id: number }[]): number => {
  return data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
};

// --- Exported DB functions ---

export const find = <T>(table: string): Promise<T[]> => {
  return new Promise(resolve => resolve(getTable<T>(table)));
};

export const findById = <T extends {id: number}>(table: string, id: number): Promise<T | undefined> => {
  return new Promise(resolve => {
    const data = getTable<T>(table);
    resolve(data.find(item => item.id === id));
  });
};

export const insert = <T extends {id: number}>(table: string, newItem: Omit<T, 'id'>): Promise<T> => {
  return new Promise(resolve => {
    const data = getTable<T>(table);
    const itemWithId = { ...newItem, id: getNextId(data) } as T;
    data.push(itemWithId);
    saveTable(table, data);
    resolve(itemWithId);
  });
};

export const update = <T extends {id: number}>(table: string, updatedItem: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    const data = getTable<T>(table);
    const index = data.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      data[index] = updatedItem;
      saveTable(table, data);
      resolve(updatedItem);
    } else {
      reject(new Error("Item not found"));
    }
  });
};

export const remove = <T extends {id: number}>(table: string, id: number): Promise<void> => {
  return new Promise(resolve => {
    const data = getTable<T>(table);
    const newData = data.filter(item => item.id !== id);
    saveTable(table, newData);
    resolve();
  });
};

// --- KV storage operations ---

export const getKV = <T>(key: string): Promise<T> => {
    return new Promise(resolve => {
        const data = localStorage.getItem(`${DB_PREFIX}${key}`);
        resolve(JSON.parse(data!)); // Assumes it was initialized
    });
};

export const saveKV = <T>(key: string, value: T): Promise<void> => {
    return new Promise(resolve => {
        localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(value));
        resolve();
    });
};