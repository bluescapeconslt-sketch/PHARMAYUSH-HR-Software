import React, { useState, useRef, useEffect } from 'react';
// FIX: Add file extension to import paths
import Card from './common/Card.tsx';
import { getHrAssistantChat } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';
import { ICONS } from '../constants.tsx';
import { getPolicies } from '../services/policyService.ts';

const HrAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hello! I'm Gem, your AI HR Assistant. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chat = useRef(getHrAssistantChat());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput.trim();
    const userMessage: ChatMessage = { sender: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    let finalPrompt = currentInput;
    const lowerCaseInput = currentInput.toLowerCase();

    // Check for policy-related keywords to provide context to the AI
    const policyKeywords = ['policy', 'policies', 'rule', 'guideline', 'bylaw', 'conduct', 'pto', 'leave', 'time off', 'vacation', 'sick'];
    if (policyKeywords.some(keyword => lowerCaseInput.includes(keyword))) {
        const policies = await getPolicies();
        
        if (policies.length > 0) {
            // We have policies, so let's use them as context for the AI.
            const policiesContext = policies.map(p => `
                --- POLICY START ---
                Title: ${p.title}
                Category: ${p.category}
                Content: ${p.content}
                --- POLICY END ---
            `).join('\n\n');

            finalPrompt = `
                You are an HR Assistant. A user is asking a question, likely related to company policies.
                Your task is to answer the user's question based *only* on the information provided in the company policies below.
                Do not use any external knowledge.
                If the answer cannot be found in the provided policies, you must state that you cannot find the information in the current company documents.

                Here are the available company policies:
                ${policiesContext}

                ---
                Now, please answer the following user's question: "${currentInput}"
            `;
        }
    }


    try {
      const response = await chat.current.sendMessage({ message: finalPrompt });
      const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message to HR assistant:", error);
      const errorMessage: ChatMessage = { sender: 'ai', text: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="HR Assistant 'Gem'" className="h-[80vh] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 rounded-md">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">G</div>
            )}
            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
             {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">U</div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">G</div>
             <div className="max-w-md p-3 rounded-lg bg-white border">
                <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder="Ask an HR-related question..."
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
        >
          {ICONS.send}
        </button>
      </div>
    </Card>
  );
};

export default HrAssistant;