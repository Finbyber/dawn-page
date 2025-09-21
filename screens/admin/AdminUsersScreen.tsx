import React, { useState, useEffect, useRef } from 'react';
import { getDepartments, getUsers, saveUsers, fileToBase64 } from '../../utils/storage';
import { FieldUser, UserRole, Department } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { TrashIcon, PencilIcon, CameraIcon, UserCircleIcon } from '../../components/icons/Icons';

const initialFormData: Omit<FieldUser, 'id'> = {
    fullName: '',
    email: '',
    password: '',
    role: 'Standard User',
    companySite: '', // Legacy, not used in UI
    departmentId: '',
    status: 'Active',
    avatarUrl: '',
};

const userRoles: UserRole[] = ['Admin User', 'Super User', 'Standard User', 'Personal User'];

const AdminUsersScreen: React.FC = () => {
    const [users, setUsers] = useState<FieldUser[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<FieldUser | null>(null);
    const [formData, setFormData] = useState<Omit<FieldUser, 'id'>>(initialFormData);
    const avatarInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        setUsers(getUsers());
        setDepartments(getDepartments());
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setFormData(prev => ({ ...prev, avatarUrl: base64 }));
            } catch (error) {
                console.error("Failed to convert avatar to Base64", error);
                alert("Could not process the image. Please try another one.");
            }
        }
    };

    const handleOpenModal = (userToEdit: FieldUser | null) => {
        setEditingUser(userToEdit);
        if (userToEdit) {
            // For editing, populate form but leave password blank (for new password only)
            const { id, ...userData } = userToEdit;
            setFormData({ ...userData, password: '', avatarUrl: userToEdit.avatarUrl || '' });
        } else {
            // For creating, use the initial empty form state
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let updatedUsers: FieldUser[];

        if (editingUser) {
            // Logic to update an existing user
            updatedUsers = users.map(user => {
                if (user.id === editingUser.id) {
                    return {
                        ...editingUser, // Start with original user data
                        ...formData, // Apply form changes
                        id: user.id,
                        // Update password only if a new one was provided
                        password: formData.password ? formData.password : editingUser.password,
                    };
                }
                return user;
            });
        } else {
            // Logic to add a new user
            const userWithId: FieldUser = {
                ...formData,
                id: `user-${Date.now()}`
            };
            updatedUsers = [...users, userWithId];
        }

        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        handleCloseModal();
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            saveUsers(updatedUsers);
        }
    };

    const getDepartmentName = (departmentId?: string) => {
        if (!departmentId) return 'N/A';
        return departments.find(d => d.id === departmentId)?.name || 'Unknown';
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <Button onClick={() => handleOpenModal(null)} className="!w-auto">Create New User</Button>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-700">
                        <tr>
                            <th className="p-4 font-semibold w-20">Avatar</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Department</th>
                            <th className="p-4 font-semibold">Role</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} className={`border-t border-slate-700 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                                <td className="p-4">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={`${user.fullName}'s avatar`} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                            <UserCircleIcon className="w-6 h-6 text-slate-500" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-middle">{user.fullName}</td>
                                <td className="p-4 align-middle">{getDepartmentName(user.departmentId)}</td>
                                <td className="p-4 align-middle">{user.role}</td>
                                <td className="p-4 align-middle">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4 flex items-center space-x-4 align-middle">
                                    <button onClick={() => handleOpenModal(user)} className="text-blue-400 hover:text-blue-300">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md m-4 max-h-screen overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-white">{editingUser ? 'Edit User' : 'Create New User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col items-center space-y-2">
                                <div className="relative">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-600" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600">
                                            <UserCircleIcon className="w-16 h-16 text-slate-500" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
                                    >
                                        <CameraIcon className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <label className="text-sm font-medium text-slate-400">User Avatar</label>
                            </div>

                            <Input id="fullName" name="fullName" label="Full Name" value={formData.fullName} onChange={handleInputChange} required />
                            <Input id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleInputChange} required />
                            <Input 
                                id="password" 
                                name="password" 
                                label="Password" 
                                type="password" 
                                value={formData.password} 
                                onChange={handleInputChange} 
                                placeholder={editingUser ? 'Leave blank to keep current' : ''}
                                required={!editingUser} // Password is required only for new users
                            />
                             <Select id="departmentId" name="departmentId" label="Department" value={formData.departmentId} onChange={handleInputChange} required>
                                <option value="">Select a department...</option>
                                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                            </Select>
                            <Select id="role" name="role" label="Role" value={formData.role} onChange={handleInputChange}>
                                {userRoles.map(role => <option key={role}>{role}</option>)}
                            </Select>
                            <Select id="status" name="status" label="Status" value={formData.status} onChange={handleInputChange}>
                                <option>Active</option>
                                <option>Inactive</option>
                            </Select>
                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="secondary" onClick={handleCloseModal} className="!w-auto">Cancel</Button>
                                <Button type="submit" className="!w-auto">{editingUser ? 'Save Changes' : 'Create User'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersScreen;