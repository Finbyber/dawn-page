import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', icon, maxLength, ...props }) => {
    const hasIcon = !!icon;
    const value = props.value as string || '';
    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {label}
                    </label>
                )}
                {maxLength && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {value.length} / {maxLength}
                    </span>
                )}
            </div>
            <div className="relative">
                {hasIcon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${hasIcon ? 'pl-11' : ''} ${className}`}
                    maxLength={maxLength}
                    {...props}
                />
            </div>
        </div>
  );
};

export default Input;
