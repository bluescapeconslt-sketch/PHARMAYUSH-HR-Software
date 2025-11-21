
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from './common/Card.tsx';
import { getTeamMessages, sendTeamMessage } from '../services/chatService.ts';
import { TeamChatMessage } from '../types.ts';
import { getCurrentUser } from '../services/authService.ts';
import { ICONS } from '../constants.tsx';

const TeamChat: React.FC = () => {
    const [messages, setMessages] = useState<TeamChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = useMemo(() => getCurrentUser(), []);

    const fetchMessages = async () => {
        try {
            const data = await getTeamMessages();
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch chat messages", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 3 seconds (simulating real-time)
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            await sendTeamMessage(newMessage.trim());
            setNewMessage('');
            await fetchMessages(); // Refresh immediately
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    // Helper to check if two dates are different days
    const isDifferentDay = (d1: string, d2: string) => {
        return new Date(d1).toDateString() !== new Date(d2).toDateString();
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-sm p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Team Chat</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Connect with your colleagues</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scrollbar-hide">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-400">Loading conversation...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-indigo-50 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                            {ICONS.chat}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.employeeId === currentUser?.id;
                        const showDate = index === 0 || isDifferentDay(messages[index-1].timestamp, msg.timestamp);

                        return (
                            <React.Fragment key={msg.id}>
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="text-xs font-medium text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full">
                                            {formatDate(msg.timestamp)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {!isMe && (
                                        <img 
                                            src={msg.employeeAvatar} 
                                            alt={msg.employeeName} 
                                            className="w-8 h-8 rounded-full object-cover mb-1 border border-gray-200 dark:border-gray-600" 
                                            title={msg.employeeName}
                                        />
                                    )}
                                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                                            isMe 
                                            ? 'bg-indigo-600 text-white rounded-br-none' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                        }`}>
                                            {msg.message}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {!isMe && `${msg.employeeName.split(' ')[0]} • `}{formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                    {isMe && (
                                        <img 
                                            src={msg.employeeAvatar} 
                                            alt={msg.employeeName} 
                                            className="w-8 h-8 rounded-full object-cover mb-1 border border-gray-200 dark:border-gray-600" 
                                        />
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors shadow-md flex items-center justify-center"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                           ICONS.send
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TeamChat;
