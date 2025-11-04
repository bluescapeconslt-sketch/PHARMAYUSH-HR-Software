
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add file extension to import paths
import Card from './common/Card.tsx';
import { getEmployees } from '../services/employeeService.ts';
import { Employee, Position } from '../types.ts';
import AddEmployeeModal from './common/AddEmployeeModal.tsx';
import EditEmployeeModal from './common/EditEmployeeModal.tsx';
import EmployeeDetailModal from './common/EmployeeDetailModal.tsx';

const getPositionBadgeColor = (position: Position) => {
    switch (position) {
        case 'CEO': return 'bg-yellow-100 text-yellow-800';
        case 'Manager': return 'bg-green-100 text-green-800';
        case 'TL': return 'bg-purple-100 text-purple-800';
        case 'Worker': return 'bg-blue-100 text-blue-800';
        case 'Intern': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const EmployeeDirectory: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const fetchEmployees = async () => {
        const emps = await getEmployees();
        setEmployees(emps);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // FIX: The 'role' property on the Employee type was renamed to 'jobTitle'.
            employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);
    
    const handleViewDetails = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDetailModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleModalSubmit = () => {
        fetchEmployees(); // Refresh data after add/edit
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Employee Directory</h2>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                         <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Employee
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredEmployees.map(employee => (
                        <div key={employee.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border hover:shadow-lg transition-shadow">
                            <img src={employee.avatar} alt={employee.name} className="h-24 w-24 rounded-full object-cover mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">{employee.name}</h4>
                             <div className="my-1">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPositionBadgeColor(employee.position)}`}>
                                    {employee.position}
                                </span>
                            </div>
                            {/* FIX: The 'role' property on the Employee type was renamed to 'jobTitle'. */}
                            <p className="text-sm text-gray-600">{employee.jobTitle}</p>
                            <p className="text-xs text-gray-500">{employee.department}</p>
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => handleViewDetails(employee)} className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">View</button>
                                <button onClick={() => handleEdit(employee)} className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
                 {filteredEmployees.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No employees found.</p>
                )}
            </Card>

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmitted={handleModalSubmit}
            />
            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                employee={selectedEmployee}
                onSubmitted={handleModalSubmit}
            />
            <EmployeeDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                employee={selectedEmployee}
            />
        </>
    );
};

export default EmployeeDirectory;