import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-sm",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};