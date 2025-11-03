import { OnboardingTask } from '../types.ts';
import { supabase } from './supabaseClient.ts';
import { getEmployees } from './employeeService.ts';
import { getCurrentUser, hasPermission } from './authService.ts';

interface OnboardingTaskData {
  id: string;
  employee_id: string;
  task: string;
  due_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const transformToOnboardingTask = (data: OnboardingTaskData, index: number, employeeId: number): OnboardingTask => {
  return {
    id: index + 1,
    employeeId: employeeId,
    task: data.task,
    dueDate: data.due_date,
    completed: data.completed
  };
};

export const getOnboardingTasks = async (): Promise<(OnboardingTask & { employeeName: string })[]> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching onboarding tasks:', error);
      return [];
    }

    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const employees = await getEmployees();
    const { data: allEmployees } = await supabase.from('employees').select('id, name');
    const empMap = new Map(allEmployees?.map(e => [e.id, e.name]) || []);

    let allTasks = (data || []).map((task, index) => {
      const empName = empMap.get(task.employee_id);
      const empIndex = employees.findIndex(e => e.name === empName);
      const employeeId = empIndex >= 0 ? empIndex + 1 : 1;

      return {
        ...transformToOnboardingTask(task, index, employeeId),
        employeeName: empName || 'Unknown Employee'
      };
    });

    if (hasPermission('manage:onboarding')) {
      return allTasks;
    }

    return allTasks.filter(task => task.employeeId === currentUser.id);
  } catch (error) {
    console.error('Failed to fetch onboarding tasks:', error);
    return [];
  }
};

export const updateOnboardingTask = async (taskId: number, completed: boolean): Promise<boolean> => {
  try {
    const { data: tasks } = await supabase
      .from('onboarding_tasks')
      .select('id')
      .order('due_date', { ascending: true });

    if (!tasks || tasks.length === 0) return false;

    const targetId = tasks[taskId - 1]?.id;
    if (!targetId) return false;

    const { error } = await supabase
      .from('onboarding_tasks')
      .update({ completed })
      .eq('id', targetId);

    if (error) {
      console.error('Error updating onboarding task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update onboarding task:', error);
    return false;
  }
};
