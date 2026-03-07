
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { User, Role, EmploymentType, Department } from '../../types';
import { USERS } from '../../data';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (newUser: Omit<User, 'user_id' | 'startDate'>) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>('Learner');
    const [employmentType, setEmploymentType] = useState<EmploymentType>('Part-time');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [managerId, setManagerId] = useState<string>('');

    const managers = USERS.filter(u => u.role === 'Admin');
    const allDepartments: Department[] = ['Lumber', 'Garden', 'Paint', 'Cashier', 'General'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || departments.length === 0 || !managerId) {
            alert("Please fill out all required fields.");
            return;
        }
        onAddUser({ name, role, employmentType, departments, managerId });
        onClose();
    };
    
    const handleDeptChange = (dept: Department) => {
        setDepartments(prev => 
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    };

    return (
        <BaseModal title="Add New Staff Member" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-hh-red focus:border-hh-red" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-hh-red focus:border-hh-red">
                            <option value="Learner">Learner</option>
                            <option value="Admin">Manager (Admin)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Employment</label>
                        <select value={employmentType} onChange={e => setEmploymentType(e.target.value as EmploymentType)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-hh-red focus:border-hh-red">
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to Manager</label>
                    <select value={managerId} onChange={e => setManagerId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-hh-red focus:border-hh-red">
                        <option value="">Select a manager...</option>
                        {managers.map(m => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Departments</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {allDepartments.map(dept => (
                            <label key={dept} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border ${departments.includes(dept) ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600'}`}>
                                <input type="checkbox" checked={departments.includes(dept)} onChange={() => handleDeptChange(dept)} className="form-checkbox rounded text-hh-red focus:ring-hh-red" />
                                <span className="text-sm">{dept}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="bg-hh-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-hh-red-dark">Add Staff Member</button>
                </div>
            </form>
        </BaseModal>
    );
};

export default AddUserModal;
