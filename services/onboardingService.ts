
import { OnboardingTask } from '../types.ts';
import { DEFAULT_ONBOARDING_TASKS } from './mockData.ts';
import { getEmployees } from './employeeService.ts';

const ONBOARDING_KEY = 'pharmayush_hr_onboarding';

const getFromStorage = (): OnboardingTask[] => {
    try {
        const data = localStorage.getItem(ONBOARDING_KEY);
        if (!data) {
            localStorage.setItem(ONBOARDING_KEY, JSON.stringify(DEFAULT_ONBOARDING_TASKS));
            return DEFAULT_ONBOARDING_TASKS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_ONBOARDING_TASKS;
    }
};

const saveToStorage = (tasks: OnboardingTask[]): void => {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(tasks));
};


export const getOnboardingTasks = async (): Promise<(OnboardingTask & { employeeName: string })[]> => {
    const tasks = getFromStorage();
    const employees = await getEmployees();
    const employeeMap = new Map(employees.map(e => [e.id, e.name]));

    const enrichedTasks = tasks.map(task => ({
        ...task,
        employeeName: employeeMap.get(task.employeeId) || 'Unknown Employee'
    }));
    return Promise.resolve(enrichedTasks);
};

export const updateOnboardingTask = async (taskId: number, completed: boolean): Promise<OnboardingTask> => {
    let tasks = getFromStorage();
    let updatedTask: OnboardingTask | undefined;
    tasks = tasks.map(t => {
        if (t.id === taskId) {
            updatedTask = { ...t, completed };
            return updatedTask;
        }
        return t;
    });
    if (!updatedTask) return Promise.reject(new Error("Task not found"));
    saveToStorage(tasks);
    return Promise.resolve(updatedTask);
};