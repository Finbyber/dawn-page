import React from 'react';
import { Screen } from '../types';
import Header from '../components/common/Header';

interface DevMenuScreenProps {
  setScreen: (screen: Screen) => void;
  onLogout: () => void;
}

const screensToPreview: { name: string; screen: Screen | 'Logout' }[] = [
    { name: 'Home Screen', screen: Screen.Home },
    { name: 'Reports List', screen: Screen.Reports },
    { name: 'User Profile', screen: Screen.Profile },
    { name: 'Incident Report Form', screen: Screen.IncidentReport },
    { name: 'Near Miss Report Form', screen: Screen.NearMissReport },
    { name: 'Safety Inspection Form', screen: Screen.SafetyInspection },
    { name: 'Environmental Report Form', screen: Screen.EnvironmentalReport },
    { name: 'Login Screen (logs out)', screen: 'Logout' },
];


const DevMenuScreen: React.FC<DevMenuScreenProps> = ({ setScreen, onLogout }) => {
    const handleItemClick = (screen: Screen | 'Logout') => {
        if (screen === 'Logout') {
            onLogout();
        } else {
            setScreen(screen);
        }
    };

    return (
        <div>
            <Header title="Developer Menu" onBack={() => setScreen(Screen.Profile)} />
            <div className="p-4 space-y-3">
                <p className="text-center text-slate-500 dark:text-slate-400 pb-2">
                    Select a screen to preview.
                </p>
                {screensToPreview.map(({ name, screen }) => (
                    <button
                        key={name}
                        onClick={() => handleItemClick(screen)}
                        className="w-full bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-left"
                    >
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DevMenuScreen;