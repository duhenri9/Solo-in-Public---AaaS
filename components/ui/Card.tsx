import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 transition-all duration-300 hover:border-blue-500/80 hover:-translate-y-1.5 hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;