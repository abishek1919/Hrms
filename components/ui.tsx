import React from 'react';
import { TimesheetStatus } from '../types';
import { tokens } from '../styles/tokens';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' }> = ({
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; className?: string }> = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white ${className}`}
    style={{
      boxShadow: tokens.elevation.card,
      border: tokens.elevation.border,
      borderRadius: tokens.elevation.radius,
    }}
    {...props}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ status: TimesheetStatus; className?: string }> = ({ status, className = '' }) => {
  const styles = {
    [TimesheetStatus.DRAFT]: 'bg-gray-100 text-gray-600',
    [TimesheetStatus.SUBMITTED]: 'bg-yellow-50 text-yellow-700',
    [TimesheetStatus.APPROVED]: 'bg-green-50 text-green-700',
    [TimesheetStatus.REJECTED]: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${styles[status]} ${className}`}>
      {status === TimesheetStatus.SUBMITTED ? 'Pending' : status}
    </span>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: React.ReactNode }> = ({ label, icon, className = '', ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
        {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
        )}
        <input
        className={`block w-full ${icon ? 'pl-10' : 'px-4'} py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 sm:text-sm transition-all ${className}`}
        {...props}
        />
    </div>
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
          <select
          className={`block w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 sm:text-sm transition-all appearance-none bg-white ${className}`}
          {...props}
          >
              {children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
      </div>
    </div>
);