import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import { getEmployees, deleteEmployee } from '../services/employeeService.ts';
import { getRoles } from '../services/roleService.ts';
import { Employee, Role } from '../types.ts';
import AddEmployeeModal from './common/AddEmployeeModal.tsx';
import EditEmployeeModal from './common/EditEmployeeModal.tsx';

const UserManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const fetchData = async () => {
        const emps = await getEmployees();
        setEmployees(emps);
        const rolesData = await getRoles();
        setRoles(rolesData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getRoleName = (roleId: number) => roles.find(r => r.id === roleId)?.name || 'Unknown Role';

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getRoleName(employee.roleId).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, roles, searchTerm]);
    
    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if(window.confirm('Are you sure you want to delete this user? This action is permanent.')) {
            await deleteEmployee(id);
            await fetchData();
        }
    };
    
    const handleModalSubmit = () => {
        fetchData(); // Refresh data after add/edit
    };
    
    const getStatusBadgeColor = (status: Employee['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'On Leave': return 'bg-yellow-100 text-yellow-800';
            case 'Probation': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                         <input
                            type="text"
                            placeholder="Search users..."
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
                            Add User
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map(employee => (
                                <tr key={employee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full" src={employee.avatar} alt={employee.name} />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getRoleName(employee.roleId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(employee.status)}`}>
                                            {employee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-4">
                                            <button onClick={() => handleEdit(employee)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
        </>
    );
};

export default UserManagement;