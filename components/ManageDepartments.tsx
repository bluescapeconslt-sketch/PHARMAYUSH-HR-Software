import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import DepartmentModal from './common/DepartmentModal.tsx';
import { getDepartments, deleteDepartment } from '../services/departmentService.ts';
import { Department } from '../types.ts';

const ManageDepartments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    const fetchDepartments = () => {
        setDepartments(getDepartments());
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleOpenModal = (department: Department | null) => {
        setSelectedDepartment(department);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchDepartments();
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this department? This might affect existing employee records.')) {
            const updatedDepartments = deleteDepartment(id);
            setDepartments(updatedDepartments);
        }
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Manage Departments</h2>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Add New Department
                    </button>
                </div>
                <div className="space-y-4">
                    {departments.map(dept => (
                        <div key={dept.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                            <h3 className="font-semibold text-md text-gray-800">{dept.name}</h3>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleOpenModal(dept)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    ))}
                     {departments.length === 0 && <p className="text-center text-gray-500 py-8">No departments have been created yet.</p>}
                </div>
            </Card>
            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                department={selectedDepartment}
            />
        </>
    );
};

export default ManageDepartments;
