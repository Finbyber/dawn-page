import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className = '', maxLength, ...props }) => {
  const value = props.value as string || '';
  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline">
        {label && 
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label}
            </label>
        }
        {maxLength && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
                {value.length} / {maxLength}
            </span>
        )}
      </div>
      <textarea
        id={id}
        className={`w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${className}`}
        rows={4}
        maxLength={maxLength}
        {...props}
      ></textarea>
    </div>
  );
};

export default Textarea;
