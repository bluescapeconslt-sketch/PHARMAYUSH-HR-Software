import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { awardPoints } from '../../services/recognitionService.ts';
import { getEmployees } from '../../services/employeeService.ts';
import { Employee, PerformancePointCriteria } from '../../types.ts';
import { PERFORMANCE_POINT_CRITERIA } from '../../constants.tsx';

interface ManagePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const ManagePointsModal: React.FC<ManagePointsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [points, setPoints] = useState<number>(10);
  const [criteria, setCriteria] = useState<PerformancePointCriteria>('Task Completion');
  const [reason, setReason] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
        if (isOpen) {
            setIsLoading(true);
            try {
                const fetchedEmployees = await getEmployees();
                setEmployees(fetchedEmployees);
                if (fetchedEmployees.length > 0) {
                    setEmployeeId(fetchedEmployees[0].id.toString());
                }
            } catch (err) {
                setError("Could not load employees list.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchEmployees();
  }, [isOpen]);

  const handleClose = () => {
    setPoints(10);
    setCriteria('Task Completion');
    setReason('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !points || !criteria || !reason.trim()) {
      setError('Please fill out all fields.');
      return;
    }

    if (points < 0) {
        const selectedEmployee = employees.find(emp => emp.id.toString() === employeeId);
        const employeeName = selectedEmployee ? selectedEmployee.name : 'this employee';
        const confirmation = window.confirm(
            `Are you sure you want to deduct ${Math.abs(points)} points from ${employeeName}? This action cannot be undone.`
        );
        if (!confirmation) {
            return; // User cancelled the action
        }
    }
    
    setIsLoading(true);
    setError('');

    try {
        await awardPoints(Number(employeeId), points, criteria, reason);
        onSaved();
        handleClose();
    } catch (err: any) {
        setError(err.message || "An error occurred while awarding points.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Award/Deduct Performance Points">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee</label>
            <select 
                id="employeeId" 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)} 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                disabled={isLoading}
            >
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700">Points</label>
                <input 
                    type="number" 
                    id="points" 
                    value={points} 
                    onChange={(e) => setPoints(Number(e.target.value))} 
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md" 
                    placeholder="e.g., 10 or -5"
                />
            </div>
            <div>
                <label htmlFor="criteria" className="block text-sm font-medium text-gray-700">Criteria</label>
                <select 
                    id="criteria" 
                    value={criteria} 
                    onChange={(e) => setCriteria(e.target.value as PerformancePointCriteria)} 
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                    {PERFORMANCE_POINT_CRITERIA.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
        <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea 
                id="reason" 
                rows={3} 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md" 
                placeholder="Provide a brief explanation for this point adjustment."
            />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md disabled:bg-indigo-300">
            {isLoading ? 'Saving...' : 'Submit Points'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ManagePointsModal;
