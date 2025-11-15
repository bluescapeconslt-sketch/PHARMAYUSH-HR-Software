

import React, { useState, useEffect } from 'react';
import Card from './common/Card.tsx';
import { getEmployees } from '../services/employeeService.ts';
import { Employee, ReviewTone } from '../types.ts';
import { generatePerformanceReview } from '../services/geminiService.ts';

const PerformanceReview: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [tone, setTone] = useState<ReviewTone>(ReviewTone.CONSTRUCTIVE);
  const [generatedReview, setGeneratedReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  useEffect(() => {
    const fetchAndSetEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const fetchedEmployees = await getEmployees();
        setEmployees(fetchedEmployees);
        if (fetchedEmployees.length > 0) {
          setSelectedEmployee(fetchedEmployees[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to load employees", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchAndSetEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !strengths || !improvements) {
      alert('Please fill out all fields.');
      return;
    }
    setIsLoading(true);
    setGeneratedReview('');

    const employeeName = employees.find(emp => emp.id.toString() === selectedEmployee)?.name || '';
    const review = await generatePerformanceReview(employeeName, strengths, improvements, tone);
    
    setGeneratedReview(review);
    setIsLoading(false);
  };

  return (
    <Card title="AI-Powered Performance Review Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Select Employee</label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                disabled={isLoadingEmployees}
              >
                {isLoadingEmployees ? <option>Loading...</option> : employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700">Key Strengths (one per line)</label>
              <textarea
                id="strengths"
                rows={4}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="e.g., Excellent team collaboration&#10;Proactive problem-solver"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="improvements" className="block text-sm font-medium text-gray-700">Areas for Improvement (one per line)</label>
              <textarea
                id="improvements"
                rows={4}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="e.g., Time management on larger projects&#10;Could provide more detailed documentation"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
             <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700">Review Tone</label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as ReviewTone)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {Object.values(ReviewTone).map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading || isLoadingEmployees}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? 'Generating...' : 'Generate Review'}
            </button>
          </div>
        </form>
        
        <div className="bg-slate-50 p-6 rounded-md border border-slate-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Generated Review</h4>
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
              </div>
            )}
            {generatedReview && (
              <div className="text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                {generatedReview}
              </div>
            )}
            {!isLoading && !generatedReview && (
                <p className="text-gray-500 text-center mt-10">Your generated review will appear here.</p>
            )}
        </div>
      </div>
    </Card>
  );
};

export default PerformanceReview;