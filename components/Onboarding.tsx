
import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import { getOnboardingTasks, updateOnboardingTask } from '../services/onboardingService.ts';
import { OnboardingTask } from '../types.ts';

const Onboarding: React.FC = () => {
  const [tasks, setTasks] = useState<(OnboardingTask & { employeeName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
        const data = await getOnboardingTasks();
        setTasks(data);
    } catch (error) {
        console.error("Failed to fetch onboarding tasks", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    try {
        await updateOnboardingTask(taskId, completed);
        fetchTasks();
    } catch (error) {
        console.error("Failed to update task", error);
        alert("Could not update the task. Please try again.");
    }
  };

  // Group tasks by Employee ID
  const groupedTasks = useMemo(() => {
    const groups: Record<number, { name: string, tasks: (OnboardingTask & { employeeName: string })[] }> = {};
    
    tasks.forEach(task => {
        if (!groups[task.employeeId]) {
            groups[task.employeeId] = {
                name: task.employeeName,
                tasks: []
            };
        }
        groups[task.employeeId].tasks.push(task);
    });

    return Object.values(groups);
  }, [tasks]);

  const renderContent = () => {
      if (isLoading) {
          return <p className="text-center text-gray-500 py-8">Loading tasks...</p>;
      }
      if (tasks.length === 0) {
          return <p className="text-center text-gray-500 py-8">No onboarding tasks found.</p>;
      }
      
      return (
          <div className="space-y-8">
              {groupedTasks.map((group, index) => {
                  // Calculate Progress stats based on ALL tasks for this user, ignoring filter
                  const totalTasks = group.tasks.length;
                  const completedTasks = group.tasks.filter(t => t.completed).length;
                  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                  // Filter the tasks to display based on the selected filter
                  const visibleTasks = group.tasks.filter(task => {
                    if (filter === 'Pending') return !task.completed;
                    if (filter === 'Completed') return task.completed;
                    return true;
                  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

                  // If filtering hides all tasks for a user, we might still want to show the user card 
                  // if the filter is "All", but maybe hide if "Pending" and they are 100% done.
                  // For this implementation, we hide the group if no tasks match the filter
                  if (visibleTasks.length === 0 && filter !== 'All') return null;

                  return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="mb-4">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{group.name}</h3>
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    {completedTasks}/{totalTasks} Tasks ({percentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {visibleTasks.length === 0 ? (
                                <p className="text-sm text-gray-500 italic text-center py-2">No {filter.toLowerCase()} tasks.</p>
                            ) : (
                                visibleTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                                            className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                                        />
                                        <div>
                                            <p className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{task.task}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Due by {task.dueDate}
                                            </p>
                                        </div>
                                        </div>
                                        {task.completed && <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Completed</span>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                  );
              })}
              
              {/* Handle case where filter hides all groups */}
              {groupedTasks.every(group => {
                    const visible = group.tasks.filter(task => {
                        if (filter === 'Pending') return !task.completed;
                        if (filter === 'Completed') return task.completed;
                        return true;
                    });
                    return visible.length === 0 && filter !== 'All';
              }) && (
                  <p className="text-center text-gray-500 py-8">No {filter.toLowerCase()} tasks found for any employee.</p>
              )}
          </div>
      );
  }

  return (
    <Card title="New Hire Onboarding Tracker">
       <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        {(['Pending', 'Completed', 'All'] as const).map(status => (
            <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                {status}
            </button>
        ))}
      </div>
      {renderContent()}
    </Card>
  );
};

export default Onboarding;
