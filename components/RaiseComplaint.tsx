import React, { useState } from 'react';
import Card from './common/Card.tsx';
import { addComplaint } from '../services/complaintService.ts';
import { getCurrentUser } from '../services/authService.ts';
import { Complaint } from '../types.ts';

const RaiseComplaint: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [details, setDetails] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const currentUser = getCurrentUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!subject.trim() || !details.trim()) {
            setError('Both subject and details are required.');
            return;
        }

        setIsSubmitting(true);

        const complaintData: Omit<Complaint, 'id'> = {
            employeeId: isAnonymous ? 'anonymous' : (currentUser?.id || 0),
            employeeName: isAnonymous ? 'Anonymous' : (currentUser?.name || 'Unknown'),
            subject,
            details,
            date: new Date().toISOString().split('T')[0],
            status: 'Submitted',
        };

        try {
            await addComplaint(complaintData);
            setSuccessMessage('Your complaint has been submitted successfully. It will be reviewed by the appropriate personnel.');
            setSubject('');
            setDetails('');
            setIsAnonymous(false);
        } catch (err) {
            setError('Failed to submit complaint. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card title="Raise a Confidential Complaint">
            <div className="max-w-2xl mx-auto">
                <p className="mb-6 text-sm text-gray-600">
                    This form allows you to submit a confidential complaint directly to the CEO. Please provide as much detail as possible. You have the option to submit anonymously. All submissions are taken seriously and will be investigated thoroughly.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-gray-700">Complaint Details</label>
                        <textarea
                            id="details"
                            rows={8}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Please describe the issue in detail, including dates, times, locations, and any individuals involved."
                            required
                        />
                    </div>
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="isAnonymous"
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isAnonymous" className="font-medium text-gray-700">Submit Anonymously</label>
                            <p className="text-gray-500">If you check this, your name and employee ID will not be attached to this complaint.</p>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </div>
        </Card>
    );
};

export default RaiseComplaint;
