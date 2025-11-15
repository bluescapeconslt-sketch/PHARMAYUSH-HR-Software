
import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { Policy } from '../../types.ts';
import { addPolicy, updatePolicy } from '../../services/policyService.ts';
import { generatePolicyDocument } from '../../services/geminiService.ts';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  policy: Policy | null;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, onSave, policy }) => {
  const [formData, setFormData] = useState<Omit<Policy, 'id'> | Policy>({ title: '', category: '', content: '' });
  const [keyPoints, setKeyPoints] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        setFormData(policy || { title: '', category: '', content: '' });
        setKeyPoints('');
        setError('');
    }
  }, [isOpen, policy]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenerate = async () => {
    if (!formData.title || !keyPoints) {
      setError("Please provide a title and some key points to generate content.");
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const generatedContent = await generatePolicyDocument(formData.title, keyPoints);
      setFormData(prev => ({ ...prev, content: generatedContent }));
    } catch (e) {
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.category) {
      setError('Title, Category, and Content fields are required.');
      return;
    }

    if ('id' in formData) {
      updatePolicy(formData);
    } else {
      addPolicy(formData);
    }
    onSave();
  };

  const modalTitle = 'id' in formData && formData.id ? 'Edit Company Policy' : 'Add New Company Policy';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Policy Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Remote Work Policy"
                />
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Workplace, Ethics, Finance"
                />
            </div>
        </div>
        
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="text-sm font-semibold text-indigo-800 mb-2">AI Content Generation</h3>
            <div>
                <label htmlFor="keyPoints" className="block text-xs font-medium text-gray-600">Key Points (one per line)</label>
                <textarea
                    id="keyPoints"
                    name="keyPoints"
                    rows={3}
                    value={keyPoints}
                    onChange={(e) => setKeyPoints(e.target.value)}
                    className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Define eligibility for remote work&#10;Set core work hours&#10;Outline communication expectations"
                />
            </div>
            <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-2 flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isGenerating ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                </>
                ) : (
                'Generate Content with AI'
              )}
            </button>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Policy Content</label>
          <textarea
            id="content"
            name="content"
            rows={10}
            value={formData.content}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="The full policy text will be generated or can be pasted here."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Policy</button>
        </div>
      </form>
    </Modal>
  );
};

export default PolicyModal;