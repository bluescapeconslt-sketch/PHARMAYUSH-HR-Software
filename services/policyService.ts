
import { Policy } from '../types.ts';
import { POLICIES as initialData } from '../constants.tsx';

const STORAGE_KEY = 'pharmayush_hr_policies';

export const getPolicies = (): Policy[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to parse policies from localStorage", error);
    return initialData;
  }
};

export const addPolicy = (newPolicyData: Omit<Policy, 'id'>): Policy[] => {
    const policies = getPolicies();
    const newPolicy: Policy = {
        ...newPolicyData,
        id: Date.now(),
    };
    const updatedPolicies = [...policies, newPolicy];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPolicies));
    return updatedPolicies;
};

export const updatePolicy = (updatedPolicy: Policy): Policy[] => {
    let policies = getPolicies();
    policies = policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    return policies;
};

export const deletePolicy = (id: number): Policy[] => {
    let policies = getPolicies();
    policies = policies.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    return policies;
};