import React from 'react';
import { Screen } from '../types';
import { HomeIcon, DocumentTextIcon, UserCircleIcon, BellIcon } from './icons/Icons';

interface BottomNavProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  unreadCount: number;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ icon, label, isActive, onClick, badgeCount = 0 }) => {
  const activeClass = 'text-blue-500 dark:text-blue-400';
  const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400';

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
    >
      {badgeCount > 0 && (
        <span className="absolute top-1 right-1/2 -mr-5 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
          {badgeCount}
        </span>
      )}
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen, unreadCount }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg">
      <div className="flex justify-around items-center h-full">
        <NavItem
          icon={<HomeIcon />}
          label="Home"
          isActive={currentScreen === Screen.Home}
          onClick={() => setScreen(Screen.Home)}
        />
        <NavItem
          icon={<DocumentTextIcon />}
          label="Reports"
          isActive={currentScreen === Screen.Reports}
          onClick={() => setScreen(Screen.Reports)}
        />
        <NavItem
          icon={<BellIcon />}
          label="Notifications"
          isActive={currentScreen === Screen.Notifications}
          onClick={() => setScreen(Screen.Notifications)}
          badgeCount={unreadCount}
        />
        <NavItem
          icon={<UserCircleIcon />}
          label="Profile"
          isActive={currentScreen === Screen.Profile}
          onClick={() => setScreen(Screen.Profile)}
        />
      </div>
    </div>
  );
};

export default BottomNav;
