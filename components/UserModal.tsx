import React, { useState } from 'react';
import { User } from '../types';
import { generateId } from '../services/storageService';

interface UserModalProps {
    user?: User; // If present, editing mode
    onSave: (user: User) => void;
    onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || {
        name: '',
        dob: '',
        gender: 'Male',
        role: 'User',
        educationLevel: 'Elementary',
        profession: '',
        email: '',
        authProvider: 'local',
        history: [],
        favorites: [],
        avatarSeed: Math.random().toString(36).substr(2, 7)
    });

    const [professionOptions] = useState(["Engineer", "Doctor", "Teacher", "Artist", "Writer", "Student", "Home Maker", "Business", "Lawyer", "Architect"]);
    const [showProfessionSuggestions, setShowProfessionSuggestions] = useState(false);

    const validate = () => {
        if (!formData.name || !formData.dob) {
            alert("Name and Date of Birth are required");
            return false;
        }

        const dobDate = new Date(formData.dob!);
        const today = new Date();
        if (dobDate > today) {
            alert("Date of birth cannot be in the future");
            return false;
        }

        const age = Math.abs(new Date(Date.now() - dobDate.getTime()).getUTCFullYear() - 1970);
        if (formData.role === 'Admin' && age < 18) {
            alert("Parents/Admins must be at least 18 years old");
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const newUser: User = {
            ...formData as User,
            id: user?.id || generateId(),
            avatarSeed: formData.avatarSeed || generateId()
        };

        onSave(newUser);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-lg rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
                <div className="p-6 border-b border-white/5 bg-slate-950/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person_add</span>
                        {user ? 'Edit Profile' : 'Add Family Member'}
                    </h2>
                    <button onClick={onClose} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative size-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-white border-2 border-primary shadow-xl overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed}`} alt="Avatar" />
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, avatarSeed: Math.random().toString(36).substr(2, 7) })}
                                className="absolute -bottom-1 -right-1 size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-95"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Alice"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Birthday</label>
                                <input
                                    type="date"
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Role</label>
                                <select
                                    value={formData.role === 'Admin' ? 'Parent' : 'Child'}
                                    onChange={e => setFormData({ ...formData, role: e.target.value === 'Parent' ? 'Admin' : 'User' })}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                                >
                                    <option value="Parent">Parent (Admin)</option>
                                    <option value="Child">Child (Standard)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Education</label>
                                <select
                                    value={formData.educationLevel}
                                    onChange={e => setFormData({ ...formData, educationLevel: e.target.value as any })}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary appearance-none"
                                >
                                    <option value="Preschool">Preschool</option>
                                    <option value="Elementary">Grade School</option>
                                    <option value="High School">High School</option>
                                    <option value="Undergraduate">College</option>
                                    <option value="Self-Taught">Self-Taught</option>
                                </select>
                            </div>
                        </div>

                        {formData.role === 'Admin' && (
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Profession</label>
                                <input
                                    value={formData.profession}
                                    onChange={e => {
                                        setFormData({ ...formData, profession: e.target.value });
                                        setShowProfessionSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowProfessionSuggestions(false), 200)}
                                    placeholder="e.g. Software Engineer"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary"
                                />
                                {showProfessionSuggestions && formData.profession && (
                                    <div className="absolute z-10 w-full bg-slate-900 border border-white/10 rounded-xl mt-1 shadow-xl overflow-hidden">
                                        {professionOptions.filter(p => p.toLowerCase().includes(formData.profession!.toLowerCase())).map(opt => (
                                            <div
                                                key={opt}
                                                className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-gray-300"
                                                onClick={() => setFormData({ ...formData, profession: opt })}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Account & Security</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="user@example.com"
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full">
                                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                                        </div>
                                        <div className="text-sm font-medium text-white">
                                            {formData.authProvider === 'google' ? 'Connected to Google' : 'Link Google Account'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFormData({ ...formData, authProvider: formData.authProvider === 'google' ? 'local' : 'google' })}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.authProvider === 'google'
                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                                            }`}
                                    >
                                        {formData.authProvider === 'google' ? 'Disconnect' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-slate-950/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 rounded-2xl text-slate-400 font-bold hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="flex-[1.5] py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};