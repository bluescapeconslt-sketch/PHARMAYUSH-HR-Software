import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import ShiftModal from './common/ShiftModal.tsx';
import { getShifts, deleteShift } from '../services/shiftService.ts';
import { Shift } from '../types.ts';

const ManageShifts: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

    const fetchShifts = () => {
        setShifts(getShifts());
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleOpenModal = (shift: Shift | null) => {
        setSelectedShift(shift);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchShifts();
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this shift? This might affect assigned employees.')) {
            const updatedShifts = deleteShift(id);
            setShifts(updatedShifts);
        }
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Manage Office Shifts</h2>
                    <button
                        onClick={() => handleOpenModal(null)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                        Add New Shift
                    </button>
                </div>
                <div className="space-y-4">
                    {shifts.map(shift => (
                        <div key={shift.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-md text-gray-800">{shift.name}</h3>
                                <p className="text-sm text-gray-500">{shift.startTime} - {shift.endTime}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleOpenModal(shift)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(shift.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    ))}
                     {shifts.length === 0 && <p className="text-center text-gray-500 py-8">No shifts have been created yet.</p>}
                </div>
            </Card>
            <ShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                shift={selectedShift}
            />
        </>
    );
};

export default ManageShifts;
