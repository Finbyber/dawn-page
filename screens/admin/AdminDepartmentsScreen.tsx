import React, { useState, useEffect } from 'react';
import { getDepartments, saveDepartments } from '../../utils/storage';
import { Department } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { TrashIcon, PencilIcon } from '../../components/icons/Icons';

const initialFormData = { name: '' };

const AdminDepartmentsScreen: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        setDepartments(getDepartments());
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (deptToEdit: Department | null) => {
        setEditingDept(deptToEdit);
        setFormData(deptToEdit ? { name: deptToEdit.name } : initialFormData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDept(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let updatedDepts: Department[];

        if (editingDept) {
            updatedDepts = departments.map(d => (d.id === editingDept.id ? { ...d, name: formData.name } : d));
        } else {
            const newDept: Department = { id: `dept-${Date.now()}`, name: formData.name };
            updatedDepts = [...departments, newDept];
        }

        setDepartments(updatedDepts);
        saveDepartments(updatedDepts);
        handleCloseModal();
    };

    const handleDelete = (deptId: string) => {
        if (window.confirm('Are you sure you want to delete this department? This cannot be undone.')) {
            const updatedDepts = departments.filter(d => d.id !== deptId);
            setDepartments(updatedDepts);
            saveDepartments(updatedDepts);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Department Management</h1>
                <Button onClick={() => handleOpenModal(null)} className="!w-auto">Create Department</Button>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="bg-slate-700">
                        <tr>
                            <th className="p-4 font-semibold">Department Name</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept) => (
                            <tr key={dept.id} className="border-t border-slate-700">
                                <td className="p-4 align-middle">{dept.name}</td>
                                <td className="p-4 flex items-center space-x-4 align-middle">
                                    <button onClick={() => handleOpenModal(dept)} className="text-blue-400 hover:text-blue-300">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(dept.id)} className="text-red-400 hover:text-red-300">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {departments.length === 0 && (
                            <tr>
                                <td colSpan={2} className="text-center p-8 text-slate-400">
                                    No departments found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg p-8 w-full max-w-lg m-4">
                        <h2 className="text-2xl font-bold mb-6 text-white">{editingDept ? 'Edit Department' : 'Create New Department'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input id="name" name="name" label="Department Name" value={formData.name} onChange={handleInputChange} required />
                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="secondary" onClick={handleCloseModal} className="!w-auto">Cancel</Button>
                                <Button type="submit" className="!w-auto">{editingDept ? 'Save Changes' : 'Create Department'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDepartmentsScreen;