
import { Policy } from '../types.ts';
import { find, insert, update, remove } from './db.ts';

const TABLE = 'policies';

export const getPolicies = (): Promise<Policy[]> => find(TABLE);

export const addPolicy = (newPolicyData: Omit<Policy, 'id'>): Promise<Policy> => insert(TABLE, newPolicyData);

export const updatePolicy = (updatedPolicy: Policy): Promise<Policy> => update(TABLE, updatedPolicy);

export const deletePolicy = (id: number): Promise<void> => remove(TABLE, id);
