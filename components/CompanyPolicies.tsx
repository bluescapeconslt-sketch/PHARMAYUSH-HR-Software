import React, { useState, useEffect, useMemo } from 'react';
import Card from './common/Card.tsx';
import { getPolicies, deletePolicy } from '../services/policyService.ts';
import { Policy } from '../types.ts';
import PolicyModal from './common/PolicyModal.tsx';

const CompanyPolicies: React.FC = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPolicies = async () => {
        const data = await getPolicies();
        setPolicies(data);
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const filteredPolicies = useMemo(() => {
        return policies.filter(policy =>
            policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [policies, searchTerm]);

    const handleOpenModal = (policy: Policy | null) => {
        setSelectedPolicy(policy);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchPolicies();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if(window.confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
            await deletePolicy(id);
            await fetchPolicies();
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Company Policies</h2>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search policies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                         <button
                            onClick={() => handleOpenModal(null)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add New Policy
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map(policy => (
                        <div key={policy.id} className="bg-white rounded-lg shadow p-5 border flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-700">{policy.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">{policy.category}</p>
                                <p className="text-gray-600 text-sm line-clamp-3">{policy.content}</p>
                            </div>
                             <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
                                <button onClick={() => handleOpenModal(policy)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleDelete(policy.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                 {filteredPolicies.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No policies found.</p>
                )}
            </Card>

            <PolicyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                policy={selectedPolicy}
            />
        </>
    );
};

export default CompanyPolicies;
