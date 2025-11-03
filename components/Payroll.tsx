import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import { calculatePayrollForMonth, PayrollData } from '../services/payrollService.ts';

const Payroll: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    useEffect(() => {
        setIsLoading(true);
        const data = calculatePayrollForMonth(currentYear, currentMonth);
        setPayrollData(data);
        setIsLoading(false);
    }, [currentYear, currentMonth]);
    
    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <Card>
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Payroll Report</h2>
                <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg">
                    <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-md hover:bg-gray-200">
                        &lt;
                    </button>
                    <span className="font-semibold w-36 text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                     <button onClick={() => handleMonthChange(1)} className="p-2 rounded-md hover:bg-gray-200">
                        &gt;
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base Monthly Salary</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Working Days</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days Attended</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payable Salary</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center py-8">Calculating...</td></tr>
                        ) : payrollData.map(data => (
                            <tr key={data.employeeId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.employeeName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(data.baseMonthlySalary)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{data.workingDays}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{data.attendedDays}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 text-right">{formatCurrency(data.payableSalary)}</td>
                            </tr>
                        ))}
                         {payrollData.length === 0 && !isLoading && (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No payroll data available for this month.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Payroll;