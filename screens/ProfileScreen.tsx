import React, { useEffect, useState } from 'react';
import { FieldUser, Screen, Department } from '../types';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import { SunIcon, MoonIcon } from '../components/icons/Icons';
import { getDepartments } from '../utils/storage';

interface ProfileScreenProps {
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  setScreen: (screen: Screen) => void;
  user: FieldUser | null;
}

const ProfileInfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="py-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-md text-slate-800 dark:text-slate-200">{value}</p>
    </div>
);

const DarkModeToggle: React.FC<{ isDarkMode: boolean; setIsDarkMode: (isDark: boolean) => void }> = ({ isDarkMode, setIsDarkMode }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex justify-between items-center">
        <span className="font-semibold">Dark Mode</span>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-flex items-center justify-center h-4 w-4 transform bg-white rounded-full transition-transform`}>
                {isDarkMode ? <MoonIcon className="h-3 w-3 text-gray-600"/> : <SunIcon className="h-3 w-3 text-yellow-500"/>}
            </span>
        </button>
    </div>
);


const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, isDarkMode, setIsDarkMode, setScreen, user }) => {
  const [departmentName, setDepartmentName] = useState('N/A');

  useEffect(() => {
    if (user?.departmentId) {
      const departments = getDepartments();
      const userDept = departments.find(d => d.id === user.departmentId);
      if (userDept) {
        setDepartmentName(userDept.name);
      }
    } else {
        setDepartmentName('N/A');
    }
  }, [user]);

  return (
    <div>
      <Header title="Profile" />
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <img
            src={user?.avatarUrl || "https://picsum.photos/200"}
            alt="User Avatar"
            className="w-24 h-24 rounded-full mb-4 border-4 border-slate-200 dark:border-slate-600 object-cover"
          />
          <h2 className="text-2xl font-bold">{user?.fullName || 'User Name'}</h2>
          <p className="text-slate-600 dark:text-slate-400">{user?.role || 'User Role'}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md divide-y divide-slate-200 dark:divide-slate-700">
            <ProfileInfoRow label="Department" value={departmentName} />
            <ProfileInfoRow label="Contact Email" value={user?.email || ''} />
        </div>

        <div className="space-y-4">
            <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <Button onClick={() => setScreen(Screen.DevMenu)} variant="secondary">Developer Menu</Button>
            <Button onClick={onLogout} variant="danger">Log Out</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;