
import { Employee } from '../types.ts';
import * as db from './db.ts';
import { getCurrentUser, updateCurrentUserSession, buildAuthenticatedUser } from './authService.ts';

const TABLE = 'employees';

export const getEmployees = (): Promise<Employee[]> => db.find<Employee>(TABLE);

export const addEmployee = (newEmployeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    // With mock DB, password is just a property on the employee object.
    return db.insert<Employee>(TABLE, newEmployeeData);
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    const data = await db.update<Employee>(TABLE, updatedEmployee);
    
    // If the updated employee is the one currently logged in, update the session object.
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === data.id) {
        // Re-build user to capture potential role/permission changes
        const fullUser = await buildAuthenticatedUser(data);
        if (fullUser) {
            updateCurrentUserSession(fullUser);
        }
    }
    
    return data;
};

export const deleteEmployee = (id: number): Promise<void> => db.remove<Employee>(TABLE, id);
