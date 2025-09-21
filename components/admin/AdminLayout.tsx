import React from 'react';
import { AdminScreen } from '../../types';
import { HseLogo } from '../icons/Icons';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentScreen: AdminScreen;
    setScreen: (screen: AdminScreen) => void;
    onLogout: () => void;
}

const NavItem: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
        }`}
    >
        {label}
    </button>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentScreen, setScreen, onLogout }) => {
    return (
        <div className="flex min-h-screen bg-slate-900 text-slate-200">
            <aside className="w-64 bg-slate-800 p-4 flex flex-col border-r border-slate-700">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <HseLogo className="text-blue-400 h-8 w-8" />
                    <span className="text-xl font-bold text-white">Admin Panel</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <NavItem label="Dashboard" isActive={currentScreen === AdminScreen.Dashboard} onClick={() => setScreen(AdminScreen.Dashboard)} />
                    <NavItem label="User Management" isActive={currentScreen === AdminScreen.Users} onClick={() => setScreen(AdminScreen.Users)} />
                    <NavItem label="Department Mngmt" isActive={currentScreen === AdminScreen.Departments} onClick={() => setScreen(AdminScreen.Departments)} />
                    <NavItem label="Role Management" isActive={currentScreen === AdminScreen.RoleManagement} onClick={() => setScreen(AdminScreen.RoleManagement)} />
                    <NavItem label="Reminders" isActive={currentScreen === AdminScreen.Reminders} onClick={() => setScreen(AdminScreen.Reminders)} />
                </nav>
                <div>
                    <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors text-red-400 hover:bg-red-500/20"
                    >
                        Log Out
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;