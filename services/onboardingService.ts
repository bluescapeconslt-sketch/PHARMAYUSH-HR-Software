
// FIX: Add file extension to import paths
import { OnboardingTask } from '../types.ts';
import { ONBOARDING_TASKS as initialData } from '../constants.tsx';
import { getEmployees } from './employeeService.ts';
import { getCurrentUser, hasPermission } from './authService.ts';

const STORAGE_KEY = 'pharmayush_hr_onboarding_tasks';

export const getOnboardingTasks = (): (OnboardingTask & { employeeName: string })[] => {
  let allTasks: OnboardingTask[] = [];
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      allTasks = initialData;
    } else {
      allTasks = JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to parse onboarding tasks from localStorage", error);
    allTasks = [];
  }

  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  // Filter tasks based on permissions before mapping employee names
  const tasksToProcess = hasPermission('manage:onboarding')
    ? allTasks
    : allTasks.filter(task => task.employeeId === currentUser.id);
    
  const employees = getEmployees();
  return tasksToProcess.map((task: OnboardingTask) => {
      const employee = employees.find(e => e.id === task.employeeId);
      return {
          ...task,
          employeeName: employee ? employee.name : 'Unknown Employee'
      };
  });
};

export const updateOnboardingTask = (taskId: number, completed: boolean): void => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const tasks = storedData ? JSON.parse(storedData) : initialData;
    const updatedTasks = tasks.map((task: OnboardingTask) => 
      task.id === taskId ? { ...task, completed } : task
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  } catch (error) {
    console.error("Failed to update onboarding task", error);
  }
};
