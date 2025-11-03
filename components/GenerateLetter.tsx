import React, { useState, useEffect } from 'react';
import { getEmployees } from '../services/employeeService.ts';
import { Employee, LetterType, CompanySettings } from '../types.ts';
import { generateHrLetter } from '../services/geminiService.ts';
import { getSettings } from '../services/settingsService.ts';

const GenerateLetter: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [letterType, setLetterType] = useState<LetterType>('Offer');
  const [details, setDetails] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedEmployees, companySettings] = await Promise.all([
        getEmployees(),
        getSettings(),
      ]);
      setEmployees(fetchedEmployees as any);
      if (fetchedEmployees.length > 0) {
        setSelectedEmployee(fetchedEmployees[0].id.toString());
      }
      setSettings(companySettings);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !letterType || !details) {
      alert('Please fill out all fields.');
      return;
    }
    setIsLoading(true);
    setGeneratedLetter('');

    const employeeName = employees.find(emp => emp.id.toString() === selectedEmployee)?.name || '';
    const letter = await generateHrLetter(letterType, employeeName, details);
    
    setGeneratedLetter(letter);
    setIsLoading(false);
  };

  const getPlaceholder = () => {
    switch (letterType) {
      case 'Offer':
        return "e.g.,\nPosition: Senior Software Engineer\nSalary: $120,000 per year\nStart Date: 2024-10-01\nReporting Manager: Jane Doe";
      case 'Joining':
        return "e.g.,\nStart Date: 2024-09-15\nPosition: Marketing Coordinator\nDepartment: Marketing\nReporting Manager: Bob Smith";
      case 'Termination':
        return "e.g.,\nEffective Date: 2024-08-30\nReason: Company restructuring\nFinal Paycheck Details: Will be mailed on the effective date.";
      case 'Recommendation':
        return "e.g.,\nRelationship to employee: Direct Manager for 3 years\nKey Accomplishments: Led Project Alpha to success, increased user engagement by 15%.\nSkills to highlight: Leadership, React, Project Management.";
      default:
        return "Enter key details for the letter...";
    }
  };

  const letterTypes: LetterType[] = ['Offer', 'Joining', 'Termination', 'Recommendation'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* --- Left Side: Form --- */}
      <div className="bg-white rounded-lg shadow-lg p-8 h-fit">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Generate HR Letter</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="letterType" className="block text-sm font-medium text-gray-700 mb-1">Letter Type</label>
            <select
              id="letterType"
              value={letterType}
              onChange={(e) => setLetterType(e.target.value as LetterType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {letterTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">Key Details</label>
            <textarea
              id="details"
              rows={6}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={getPlaceholder()}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all duration-300"
          >
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{isLoading ? 'Generating...' : 'Generate Letter'}</span>
          </button>
        </form>
      </div>
      
      {/* --- Right Side: Live Preview --- */}
      <div className="bg-gray-200 p-8 rounded-lg overflow-hidden flex flex-col">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center flex-shrink-0">Live Preview</h3>
          <div className="bg-white shadow-xl rounded-md aspect-[8.5/11] p-12 overflow-y-auto relative font-serif text-sm text-gray-800 flex-grow">
              {/* Header */}
              <header className="mb-8 pb-4 border-b border-gray-200 text-center">
                  {settings?.companyLogo && (
                      <img 
                          src={settings.companyLogo} 
                          alt={`${settings.companyName} Logo`} 
                          className="h-16 w-auto mx-auto mb-4 object-contain" 
                      />
                  )}
                  <h1 className="text-3xl font-bold text-gray-900">{settings?.companyName}</h1>
                  <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{settings?.companyAddress}</p>
              </header>
              
              {/* Body */}
              <main className="text-gray-700 leading-relaxed">
                  {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                    </div>
                  )}
                  {generatedLetter && (
                      <div className="whitespace-pre-wrap">
                          {generatedLetter}
                      </div>
                  )}
                  {!isLoading && !generatedLetter && (
                      <p className="text-gray-400 text-center mt-20 font-sans">Your generated letter will appear here.</p>
                  )}
              </main>
              
              {/* Footer */}
              <footer className="absolute bottom-12 left-12 right-12 text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                  <p>{settings?.companyAddress}</p>
              </footer>
          </div>
      </div>
    </div>
  );
};

export default GenerateLetter;