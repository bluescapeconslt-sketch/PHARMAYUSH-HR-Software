
import React from 'react';
import { Employee } from '../../types.ts';

interface BirthdayNotificationProps {
  employees: Employee[];
}

const BirthdayNotification: React.FC<BirthdayNotificationProps> = ({ employees }) => {
  if (employees.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No upcoming birthdays this week.
      </div>
    );
  }

  return (
    <div>
      {employees.map(employee => (
        <div key={employee.id} className="flex items-center p-2 border-b last:border-b-0">
          <img className="h-10 w-10 rounded-full" src={employee.avatar} alt={employee.name} />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
            <p className="text-sm text-gray-500">{new Date(employee.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BirthdayNotification;