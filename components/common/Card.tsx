
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-black/20 p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;