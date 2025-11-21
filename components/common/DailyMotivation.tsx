
import React, { useState, useEffect } from 'react';
import { getMotivationalQuote } from '../../services/geminiService.ts';

const STORAGE_KEY = 'pharmayush_hr_daily_motivation';

interface StoredQuote {
    quote: string;
    date: string;
}

interface DailyMotivationProps {
    className?: string;
    authorClassName?: string;
}

const DailyMotivation: React.FC<DailyMotivationProps> = ({ 
    className = "text-gray-700 dark:text-gray-300", 
    authorClassName = "text-gray-500 dark:text-gray-400" 
}) => {
    const [quote, setQuote] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchQuote = async () => {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            try {
                const storedData = localStorage.getItem(STORAGE_KEY);
                if (storedData) {
                    const { quote: storedQuote, date: storedDate }: StoredQuote = JSON.parse(storedData);
                    if (storedDate === today) {
                        setQuote(storedQuote);
                        setIsLoading(false);
                        return;
                    }
                }
                
                // If no stored quote or date is old, fetch a new one
                const newQuote = await getMotivationalQuote();
                setQuote(newQuote);
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ quote: newQuote, date: today }));

            } catch (error) {
                console.error("Failed to fetch or parse motivational quote", error);
                setQuote(`"The best way to predict the future is to create it." - Peter Drucker`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuote();
    }, []);

    if (isLoading) {
        return (
            <div className="animate-pulse flex flex-col items-center justify-center text-center p-4">
                <div className={`h-4 rounded w-3/4 mb-2 ${className.includes('text-white') ? 'bg-white/30' : 'bg-slate-200 dark:bg-gray-700'}`}></div>
                <div className={`h-3 rounded w-1/4 ${className.includes('text-white') ? 'bg-white/30' : 'bg-slate-200 dark:bg-gray-700'}`}></div>
            </div>
        );
    }
    
    // Simple parsing of "Quote" - Author format
    const quoteParts = quote.split('" - ');
    const mainQuote = quoteParts[0].replace(/"/g, '');
    const author = quoteParts.length > 1 ? `- ${quoteParts[1]}` : '';


    return (
        <div className="text-center p-4">
            <blockquote className={`text-lg italic ${className}`}>
                "{mainQuote}"
            </blockquote>
            {author && <cite className={`block text-right mt-2 text-sm ${authorClassName}`}>{author}</cite>}
        </div>
    );
};

export default DailyMotivation;
