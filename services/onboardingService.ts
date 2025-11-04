import { OnboardingTask } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { getCurrentUser, hasPermission } from './authService.ts';

export const getOnboardingTasks = async (): Promise<(OnboardingTask & { employeeName: string })[]> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    let query = supabase
      .from('onboarding_tasks')
      .select(`
        *,
        employee:employees(id, first_name, last_name)
      `)
      .order('due_date', { ascending: true });

    if (!hasPermission('manage:onboarding')) {
      query = query.eq('employee_id', currentUser.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((task: any) => ({
      id: task.id,
      employeeId: task.employee_id,
      employeeName: task.employee ? `${task.employee.first_name} ${task.employee.last_name}` : 'Unknown Employee',
      task: task.task,
      dueDate: task.due_date,
      completed: task.completed,
    }));
  } catch (error) {
    console.error('Failed to fetch onboarding tasks from database', error);
    return [];
  }
};

export const updateOnboardingTask = async (taskId: string | number, completed: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('onboarding_tasks')
      .update({
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update onboarding task', error);
  }
};
