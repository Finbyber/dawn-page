import React, { useState, useEffect } from 'react';
import { getRolePermissions, saveRolePermissions, getGpsEnabled, saveGpsEnabled, getFeaturePermissions, saveFeaturePermissions } from '../../utils/storage';
import { RolePermissions, UserRole, Screen, RoleFeaturePermissions, FeaturePermissions } from '../../types';
import Button from '../../components/common/Button';

const checklistItems = [
    { id: Screen.IncidentReport, label: 'Incident CheckList' },
    { id: Screen.NearMissReport, label: 'Near Miss CheckList' },
    { id: Screen.SafetyInspection, label: 'Safety Inspection' },
    { id: Screen.EnvironmentalReport, label: 'Environmental CheckList' },
];

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    labelId?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, labelId }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={labelId}
            onClick={() => onChange(!checked)}
            className={`${
                checked ? 'bg-blue-600' : 'bg-slate-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
        >
            <span
                className={`${
                    checked ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );
};


const AdminRoleManagementScreen: React.FC = () => {
    const [permissions, setPermissions] = useState<RolePermissions | null>(null);
    const [featurePermissions, setFeaturePermissions] = useState<RoleFeaturePermissions | null>(null);
    const [isGpsEnabled, setIsGpsEnabled] = useState<boolean>(() => getGpsEnabled());
    const [isSaving, setIsSaving] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    useEffect(() => {
        setPermissions(getRolePermissions());
        setFeaturePermissions(getFeaturePermissions());
    }, []);

    const handlePermissionChange = (role: UserRole, checklistId: Screen, isEnabled: boolean) => {
        if (!permissions) return;
        
        const updatedPermissions: RolePermissions = {
            ...permissions,
            [role]: {
                ...permissions[role],
                [checklistId]: isEnabled,
            },
        };
        setPermissions(updatedPermissions);
    };

    const handleFeaturePermissionChange = (role: UserRole, feature: keyof FeaturePermissions, isEnabled: boolean) => {
        if (!featurePermissions) return;

        setFeaturePermissions(prev => ({
            ...prev,
            [role]: {
                ...prev?.[role],
                [feature]: isEnabled,
            }
        }));
    };

    const handleGpsToggleChange = (isEnabled: boolean) => {
        setIsGpsEnabled(isEnabled);
        saveGpsEnabled(isEnabled); // Save immediately as it's a global setting
    };

    const handleSaveChanges = () => {
        if (!permissions || !featurePermissions) return;
        setIsSaving(true);
        setFeedbackMessage('');

        try {
            saveRolePermissions(permissions);
            saveFeaturePermissions(featurePermissions);
            saveGpsEnabled(isGpsEnabled); // Also save the GPS setting here
            setFeedbackMessage('Settings saved successfully!');
            setTimeout(() => setFeedbackMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save settings", error);
            setFeedbackMessage('Error: Could not save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!permissions || !featurePermissions) {
        return <div>Loading role permissions...</div>;
    }
    
    const roles = Object.keys(permissions) as UserRole[];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Role Management</h1>
                <div className="flex items-center gap-4">
                    {feedbackMessage && <span className="text-sm text-green-400">{feedbackMessage}</span>}
                    <Button onClick={handleSaveChanges} className="!w-auto" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
            
            <p className="mb-8 text-slate-400">
                Manage global settings and role-based access to checklists. Changes will apply to users upon their next login or app refresh.
            </p>

            <div className="mb-8">
                <div className="bg-slate-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-3">Global Settings</h2>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span id="gps-toggle-label" className="text-slate-300 font-medium">
                                Enable GPS Location Tracking
                                <p className="text-xs text-slate-500 font-normal">When enabled, the app will attempt to capture GPS coordinates on checklist submission.</p>
                            </span>
                            <Switch
                                checked={isGpsEnabled}
                                onChange={handleGpsToggleChange}
                                labelId="gps-toggle-label"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {roles.map(role => (
                    <div key={role} className="bg-slate-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-3">{role}</h2>
                        <div className="space-y-4">
                            {checklistItems.map(item => {
                                const switchId = `${role}-${item.id}-label`;
                                return (
                                <div key={item.id} className="flex justify-between items-center">
                                    <span id={switchId} className="text-slate-300 font-medium">{item.label}</span>
                                    <Switch
                                        checked={permissions[role][item.id]}
                                        onChange={(isEnabled) => handlePermissionChange(role, item.id, isEnabled)}
                                        labelId={switchId}
                                    />
                                </div>
                            )})}
                        </div>
                        
                        {['Admin User', 'Super User'].includes(role) && featurePermissions[role] && (
                            <div className="mt-6 pt-4 border-t border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-3">Feature Permissions</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span id={`gallery-${role}-label`} className="text-slate-300 font-medium">Photo Gallery
                                            <p className="text-xs text-slate-500 font-normal">Allow users with this role to open an interactive photo gallery.</p>
                                        </span>
                                        <Switch
                                            checked={featurePermissions[role]?.canViewPhotoGallery ?? false}
                                            onChange={(isEnabled) => handleFeaturePermissionChange(role, 'canViewPhotoGallery', isEnabled)}
                                            labelId={`gallery-${role}-label`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span id={`delete-${role}-label`} className="text-slate-300 font-medium">Allow Report Deletion
                                            <p className="text-xs text-slate-500 font-normal">Allow users to delete reports via swipe gesture on the reports list.</p>
                                        </span>
                                        <Switch
                                            checked={featurePermissions[role]?.canDeleteReport ?? false}
                                            onChange={(isEnabled) => handleFeaturePermissionChange(role, 'canDeleteReport', isEnabled)}
                                            labelId={`delete-${role}-label`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminRoleManagementScreen;