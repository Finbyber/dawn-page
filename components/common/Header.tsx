import React from 'react';
import { ArrowLeftIcon } from '../icons/Icons';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, actions }) => {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
            {onBack && (
            <button onClick={onBack} className="mr-4 p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                <ArrowLeftIcon />
            </button>
            )}
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
        </div>
        {actions && <div className="text-slate-300">{actions}</div>}
      </div>
    </header>
  );
};

export default Header;