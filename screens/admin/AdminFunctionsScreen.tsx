import React, { useState, useEffect } from 'react';
import { getReminders, saveReminders } from '../../utils/storage';
import { Reminder, Screen, UserRole } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { TrashIcon, PencilIcon } from '../../components/icons/Icons';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    ariaLabel?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, ariaLabel }) => {
    const handleToggle = () => {
        onChange(!checked);
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={handleToggle}
            className={`${
                checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
        >
            <span
                aria-hidden="true"
                className={`${
                    checked ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    );
};

const checklistOptions = [
    { value: Screen.IncidentReport, label: 'Incident CheckList' },
    { value: Screen.NearMissReport, label: 'Near Miss CheckList' },
    { value: Screen.SafetyInspection, label: 'Safety Inspection' },
    { value: Screen.EnvironmentalReport, label: 'Environmental CheckList' },
];
const roleOptions: (UserRole | 'All')[] = ['All', 'Admin User', 'Super User', 'Standard User', 'Personal User'];

const initialFormData: Omit<Reminder, 'id'> = {
    title: '',
    message: '',
    targetChecklist: Screen.IncidentReport,
    targetRole: 'All',
    isActive: true,
};

const AdminRemindersScreen: React.FC = () => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [formData, setFormData] = useState<Omit<Reminder, 'id'>>(initialFormData);

    useEffect(() => {
        setReminders(getReminders());
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const finalValue = name === 'targetChecklist' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleOpenModal = (reminderToEdit: Reminder | null) => {
        setEditingReminder(reminderToEdit);
        setFormData(reminderToEdit ? { ...reminderToEdit } : initialFormData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReminder(null);
        setFormData(initialFormData);
    };
    
    const handleToggleStatus = (reminderId: string, isActive: boolean) => {
        const updatedReminders = reminders.map(r =>
            r.id === reminderId ? { ...r, isActive } : r
        );
        setReminders(updatedReminders);
        saveReminders(updatedReminders);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let updatedReminders: Reminder[];

        if (editingReminder) {
            updatedReminders = reminders.map(r => (r.id === editingReminder.id ? { ...formData, id: r.id } : r));
        } else {
            const newReminder: Reminder = { ...formData, id: `rem-${Date.now()}` };
            updatedReminders = [...reminders, newReminder];
        }

        setReminders(updatedReminders);
        saveReminders(updatedReminders);
        handleCloseModal();
    };

    const handleDelete = (reminderId: string) => {
        if (window.confirm('Are you sure you want to delete this reminder?')) {
            const updatedReminders = reminders.filter(r => r.id !== reminderId);
            setReminders(updatedReminders);
            saveReminders(updatedReminders);
        }
    };
    
    const getChecklistLabel = (screen: Screen) => checklistOptions.find(opt => opt.value === screen)?.label || 'Unknown';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Reminder Management</h1>
                <Button onClick={() => handleOpenModal(null)} className="!w-auto">Create New Reminder</Button>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="bg-slate-700">
                        <tr>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Target Checklist</th>
                            <th className="p-4 font-semibold">Target Role</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reminders.map((reminder) => (
                            <tr key={reminder.id} className="border-t border-slate-700">
                                <td className="p-4 align-middle">{reminder.title}</td>
                                <td className="p-4 align-middle">{getChecklistLabel(reminder.targetChecklist)}</td>
                                <td className="p-4 align-middle">{reminder.targetRole}</td>
                                <td className="p-4 align-middle">
                                    <Switch
                                        checked={reminder.isActive}
                                        onChange={(checked) => handleToggleStatus(reminder.id, checked)}
                                        ariaLabel={`Toggle status for ${reminder.title}`}
                                    />
                                </td>
                                <td className="p-4 flex items-center space-x-4 align-middle">
                                    <button onClick={() => handleOpenModal(reminder)} className="text-blue-400 hover:text-blue-300">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(reminder.id)} className="text-red-400 hover:text-red-300">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {reminders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-slate-400">
                                    No reminders found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg m-4 max-h-screen overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-white">{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input id="title" name="title" label="Title" value={formData.title} onChange={handleInputChange} required />
                            <Textarea id="message" name="message" label="Message" value={formData.message} onChange={handleInputChange} required />
                            <Select id="targetChecklist" name="targetChecklist" label="Target Checklist" value={formData.targetChecklist} onChange={handleInputChange}>
                                {checklistOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                            <Select id="targetRole" name="targetRole" label="Target Role" value={formData.targetRole} onChange={handleInputChange}>
                                {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                            </Select>
                            <div className="flex items-center justify-between pt-2">
                                <label className="text-sm font-medium text-slate-300">Active</label>
                                <Switch checked={formData.isActive} onChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))} />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="secondary" onClick={handleCloseModal} className="!w-auto">Cancel</Button>
                                <Button type="submit" className="!w-auto">{editingReminder ? 'Save Changes' : 'Create Reminder'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRemindersScreen;
