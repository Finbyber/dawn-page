import React from 'react';
import { Screen, ChecklistPermissions } from '../types';
import { ShieldExclamationIcon, LightBulbIcon, ClipboardCheckIcon, GlobeAltIcon } from '../components/icons/Icons';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  permissions: ChecklistPermissions | null;
  isOnline: boolean;
}

const ReportCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 text-left"
  >
    <div className="text-blue-500 dark:text-blue-400">
        {icon}
    </div>
    <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  </button>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, permissions, isOnline }) => {
  const availableChecklists = [
    {
      screen: Screen.IncidentReport,
      title: "Incident CheckList",
      description: "Fill out a checklist for an injury, damage, or accident.",
      icon: <ShieldExclamationIcon />,
    },
    {
      screen: Screen.NearMissReport,
      title: "Near Miss CheckList",
      description: "Fill out a checklist for a potential incident that was avoided.",
      icon: <LightBulbIcon />,
    },
    {
      screen: Screen.SafetyInspection,
      title: "Safety Inspection",
      description: "Conduct and file a safety audit or inspection.",
      icon: <ClipboardCheckIcon />,
    },
    {
      screen: Screen.EnvironmentalReport,
      title: "Environmental CheckList",
      description: "Fill out a checklist for an environmental concern or spill.",
      icon: <GlobeAltIcon />,
    },
  ];

  const visibleChecklists = availableChecklists.filter(
    checklist => permissions?.[checklist.screen]
  );
  
  return (
    <div>
        <header className="bg-white dark:bg-slate-800/80 sticky top-0 z-10">
            <div className="p-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">HSE CheckList</h1>
                <p className="text-slate-600 dark:text-slate-400">Select a checklist to get started.</p>
              </div>
              <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-semibold ${isOnline ? 'text-slate-700 dark:text-slate-300' : 'text-red-500 dark:text-red-400'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                  </span>
              </div>
            </div>
        </header>
      <div className="p-4 space-y-4">
        {permissions ? (
          visibleChecklists.length > 0 ? (
            visibleChecklists.map(checklist => (
              <ReportCard
                key={checklist.screen}
                title={checklist.title}
                description={checklist.description}
                icon={checklist.icon}
                onClick={() => onNavigate(checklist.screen)}
              />
            ))
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 py-10">
              <p className="font-semibold">No checklists available.</p>
              <p className="text-sm">Please contact an administrator if you believe this is an error.</p>
            </div>
          )
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 py-10">
            <p>Loading checklists...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;