
import { OnboardingTask } from '../types.ts';
import { find, update } from './db.ts';
import { getEmployees } from './employeeService.ts';

const TABLE = 'onboarding_tasks';

export const getOnboardingTasks = async (): Promise<(OnboardingTask & { employeeName: string })[]> => {
    const [tasks, employees] = await Promise.all([
        find<OnboardingTask>(TABLE),
        getEmployees()
    ]);
    
    const employeeMap = new Map(employees.map(e => [e.id, e.name]));

    const enrichedTasks = tasks.map((task: OnboardingTask) => ({
        ...task,
        employeeName: employeeMap.get(task.employeeId) || 'Unknown Employee'
    }));
    return enrichedTasks;
};

export const updateOnboardingTask = async (taskId: number, completed: boolean): Promise<OnboardingTask> => {
    const task = (await find<OnboardingTask>(TABLE)).find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");
    
    return update<OnboardingTask>(TABLE, { ...task, completed });
};
