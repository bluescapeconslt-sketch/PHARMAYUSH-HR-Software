import { Policy } from '../types.ts';
import { DEFAULT_POLICIES } from './mockData.ts';

const POLICIES_KEY = 'pharmayush_hr_policies';

const getFromStorage = (): Policy[] => {
    try {
        const data = localStorage.getItem(POLICIES_KEY);
        if (!data) {
            localStorage.setItem(POLICIES_KEY, JSON.stringify(DEFAULT_POLICIES));
            return DEFAULT_POLICIES;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_POLICIES;
    }
};

const saveToStorage = (policies: Policy[]): void => {
    localStorage.setItem(POLICIES_KEY, JSON.stringify(policies));
};

export const getPolicies = async (): Promise<Policy[]> => {
  return Promise.resolve(getFromStorage());
};

export const addPolicy = async (newPolicyData: Omit<Policy, 'id'>): Promise<Policy> => {
    const policies = getFromStorage();
    const newId = policies.length > 0 ? Math.max(...policies.map(p => p.id)) + 1 : 1;
    const newPolicy = { ...newPolicyData, id: newId };
    saveToStorage([...policies, newPolicy]);
    return Promise.resolve(newPolicy);
};

export const updatePolicy = async (updatedPolicy: Policy): Promise<Policy> => {
    let policies = getFromStorage();
    policies = policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p);
    saveToStorage(policies);
    return Promise.resolve(updatedPolicy);
};

export const deletePolicy = async (id: number): Promise<void> => {
    let policies = getFromStorage();
    policies = policies.filter(p => p.id !== id);
    saveToStorage(policies);
    return Promise.resolve();
};
