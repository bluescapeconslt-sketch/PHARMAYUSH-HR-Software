import React, { useState, useRef, useEffect } from 'react';
import Card from './common/Card.tsx';
import { getHrAssistantChat } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';
import { ICONS } from '../constants.tsx';
import { getPolicies } from '../services/policyService.ts';
import { getCurrentUser } from '../services/authService.ts';
import { getBuddySettings } from '../services/buddyService.ts';

const HrAssistant: React.FC = () => {
  const currentUser = getCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: `Hello ${currentUser?.name.split(' ')[0] || ''}! I'm Gem, your AI HR Assistant. How can I help you today?` }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState('');
  const chat = useRef(getHrAssistantChat());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const settings = getBuddySettings();
    setAvatar(settings.avatarImage);
  }, []);

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = async (messageOverride?: string) => {
    const currentInput = (messageOverride || userInput).trim();
    if (!currentInput) return;

    const userMessage: ChatMessage = { sender: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    if (!chat.current) {
      const errorMessage: ChatMessage = { sender: 'ai', text: "AI features are currently unavailable. Please configure the Gemini API key." };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }

    let finalPrompt = currentInput;
    const lowerCaseInput = currentInput.toLowerCase();

    // Check for policy-related keywords to provide context to the AI
    const policyKeywords = ['policy', 'policies', 'rule', 'guideline', 'bylaw', 'conduct', 'pto', 'leave', 'time off', 'vacation', 'sick'];
    if (policyKeywords.some(keyword => lowerCaseInput.includes(keyword))) {
        const policies = getPolicies();

        if (policies.length > 0) {
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
  
  const suggestionChips = [
    "What is the PTO policy?",
    "How do I request a leave?",
    "Summarize the Code of Conduct.",
  ];

  return (
    <Card className="h-[80vh] flex flex-col p-0 overflow-hidden">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-800 text-center">HR Assistant 'Gem'</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gradient-to-br from-gray-50 to-slate-100">
        {messages.length === 1 && (
             <div className="text-center py-8 animate-message-in">
                <img src={avatar} alt="Gem Avatar" className="h-24 w-24 mx-auto mb-4 buddy-avatar"/>
                <h3 className="text-2xl font-bold text-gray-800">Hi, {currentUser?.name.split(' ')[0]}! I'm Gem.</h3>
                <p className="text-gray-600 mt-2">Your friendly HR Assistant. Ask me anything about our policies, procedures, or benefits.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {suggestionChips.map((chip, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSendMessage(chip)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all shadow-sm"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>
        )}
      
        {messages.length > 1 && messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}>
            {msg.sender === 'ai' && (
              <img src={avatar} alt="Gem Avatar" className="h-8 w-8 object-contain flex-shrink-0 self-start" />
            )}
            <div className={`max-w-xl p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-white border rounded-bl-none shadow-sm'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-3 justify-start animate-message-in">
             <img src={avatar} alt="Gem Avatar" className="h-8 w-8 object-contain flex-shrink-0 self-start" />
             <div className="max-w-lg p-3 rounded-2xl shadow-sm bg-white border rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">Gem is typing</span>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t flex-shrink-0">
        <div className="relative">
            <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Ask an HR-related question..."
            className="w-full p-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            disabled={isLoading}
            />
            <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !userInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
                {ICONS.send}
            </button>
        </div>
      </div>
    </Card>
  );
};

export default HrAssistant;