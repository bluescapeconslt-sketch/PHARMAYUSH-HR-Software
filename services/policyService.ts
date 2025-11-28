

import { Policy } from '../types.ts';
import { find, insert, update, remove } from './db.ts';
import { notifyAllEmployees } from './notificationService.ts';

const TABLE = 'policies';

export const getPolicies = (): Promise<Policy[]> => find(TABLE);

export const addPolicy = async (newPolicyData: Omit<Policy, 'id'>): Promise<Policy> => {
    const policy = await insert(TABLE, newPolicyData);
    
    // Notify all employees about the new policy
    await notifyAllEmployees(
        'policy_update',
        'New Company Policy',
        `A new policy "${policy.title}" has been added. Please review it.`,
        'policies'
    );
    
    return policy;
};

export const updatePolicy = (updatedPolicy: Policy): Promise<Policy> => update(TABLE, updatedPolicy);

export const deletePolicy = (id: number): Promise<void> => remove(TABLE, id);