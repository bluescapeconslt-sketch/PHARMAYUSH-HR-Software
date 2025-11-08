import React, { useState, useEffect } from 'react';
// FIX: Add file extension to import paths
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
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const renderContent = () => {
      if (isLoading) {
          return <p className="text-center text-gray-500 py-8">Loading tasks...</p>;
      }
      if (filteredTasks.length === 0) {
          return <p className="text-center text-gray-500 py-8">No {filter.toLowerCase()} tasks found.</p>;
      }
      return (
          <div className="space-y-4">
              {filteredTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                       <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                        className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div>
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.task}</p>
                        <p className="text-sm text-gray-500">
                          For <span className="font-semibold">{task.employeeName}</span> - Due by {task.dueDate}
                        </p>
                      </div>
                    </div>
                    {task.completed && <span className="text-sm font-semibold text-green-600">Completed</span>}
                </div>
            ))}
          </div>
      );
  }

  return (
    <Card title="New Hire Onboarding Tracker">
       <div className="flex items-center gap-2 mb-6 border-b pb-4">
        {(['Pending', 'Completed', 'All'] as const).map(status => (
            <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
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