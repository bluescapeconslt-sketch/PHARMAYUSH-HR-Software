
import React, { useState } from 'react';
import { getCurrentUser } from '../../services/authService.ts';

interface SalaryDisplayProps {
    amount: number | undefined;
}

const SalaryDisplay: React.FC<SalaryDisplayProps> = ({ amount }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isEnteringPin, setIsEnteringPin] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [error, setError] = useState(false);

    const formatInr = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleToggle = () => {
        if (isVisible) {
            setIsVisible(false);
            setPinInput('');
            return;
        }
        setIsEnteringPin(true);
    };

    const handlePinSubmit = (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        
        const currentUser = getCurrentUser();
        // Default PIN is 1234 if not set
        const userPin = currentUser?.salaryPin || '1234';

        if (pinInput === userPin) {
            setIsVisible(true);
            setIsEnteringPin(false);
            setError(false);
        } else {
            setError(true);
            setPinInput('');
            // Focus remains on input for retry
        }
    };

    const handleCancel = () => {
        setIsEnteringPin(false);
        setPinInput('');
        setError(false);
    };

    if (amount === undefined || amount === null) {
        return <span className="text-gray-400 italic">Not Set</span>;
    }

    if (isEnteringPin) {
        return (
            <form onSubmit={handlePinSubmit} className="flex items-center gap-1 justify-end">
                <input
                    type="password"
                    autoFocus
                    className={`w-16 px-2 py-1 text-xs border rounded shadow-sm focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                    placeholder="PIN"
                    value={pinInput}
                    onChange={(e) => {
                        setPinInput(e.target.value);
                        setError(false);
                    }}
                    maxLength={4}
                />
                <button 
                    type="submit"
                    className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 p-1 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    title="Submit"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </button>
                <button 
                    type="button" 
                    onClick={handleCancel}
                    className="bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400 p-1 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    title="Cancel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </form>
        );
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            <span className={`font-mono font-semibold ${isVisible ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 tracking-widest'}`}>
                {isVisible ? formatInr(amount) : '••••••'}
            </span>
            <button 
                onClick={handleToggle}
                className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none p-1 rounded hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                title={isVisible ? "Hide Salary" : "Reveal Salary"}
            >
                {isVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default SalaryDisplay;
