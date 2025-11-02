
import React, { useState } from 'react';
// FIX: Add file extension to import paths
import Card from './common/Card.tsx';
import { generateJobDescription } from '../services/geminiService.ts';

const JobDescriptionGenerator: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [skills, setSkills] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !responsibilities || !skills) {
      alert('Please fill out all fields.');
      return;
    }
    setIsLoading(true);
    setGeneratedDescription('');

    const description = await generateJobDescription(jobTitle, responsibilities, skills);
    
    setGeneratedDescription(description);
    setIsLoading(false);
  };

  return (
    <Card title="AI-Powered Job Description Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior React Developer"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">Key Responsibilities (one per line)</label>
              <textarea
                id="responsibilities"
                rows={5}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="e.g., Develop and maintain web applications using React.js&#10;Collaborate with cross-functional teams"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Required Skills (one per line)</label>
              <textarea
                id="skills"
                rows={5}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., 5+ years of experience with React&#10;Proficiency in TypeScript&#10;Strong understanding of RESTful APIs"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? 'Generating...' : 'Generate Description'}
            </button>
          </div>
        </form>
        
        <div className="bg-slate-50 p-6 rounded-md border border-slate-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Generated Job Description</h4>
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
              </div>
            )}
            {generatedDescription && (
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                {generatedDescription}
              </div>
            )}
            {!isLoading && !generatedDescription && (
                <p className="text-gray-500 text-center mt-10">Your generated job description will appear here.</p>
            )}
        </div>
      </div>
    </Card>
  );
};

export default JobDescriptionGenerator;