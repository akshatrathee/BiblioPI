import React, { useState } from 'react';
import { AppState, BackupSettings, DbSettings, AiSettings } from '../types';

interface SettingsProps {
    state: AppState;
    onUpdateState: (s: Partial<AppState>) => void;
    onClose: () => void;
    onDownloadBackup: () => void;
    onRestoreBackup: (json: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ state, onUpdateState, onClose, onDownloadBackup, onRestoreBackup }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'backup' | 'db' | 'api' | 'about'>('general');

    // Local state for forms
    const [aiSettings, setAiSettings] = useState<AiSettings>(state.aiSettings);
    const [dbSettings, setDbSettings] = useState<DbSettings>(state.dbSettings);
    const [backupSettings, setBackupSettings] = useState<BackupSettings>(state.backupSettings);

    const handleSave = () => {
        onUpdateState({
            aiSettings,
            dbSettings,
            backupSettings
        });
        onClose();
    };

    const handleGoogleConnect = () => {
        setTimeout(() => {
            setBackupSettings(prev => ({
                ...prev,
                googleDriveConnected: true,
                googleDriveUser: 'user@gmail.com'
            }));
        }, 1500);
    };

    const TabButton = ({ id, icon, label }: { id: any, icon: string, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all ${activeTab === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}
        >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[2rem] border border-white/10 flex overflow-hidden shadow-2xl animate-fade-in-up">

                {/* Sidebar */}
                <div className="w-72 bg-black/40 p-6 border-r border-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">settings</span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
                    </div>
                    <TabButton id="general" icon="tune" label="General Preferences" />
                    <TabButton id="ai" icon="auto_awesome" label="AI Configuration" />
                    <TabButton id="db" icon="database" label="Database Storage" />
                    <TabButton id="backup" icon="cloud_sync" label="Backup & Sync" />
                    <TabButton id="api" icon="key" label="API Keys" />
                    <div className="mt-auto pt-4 border-t border-white/5">
                        <TabButton id="about" icon="info" label="About BiblioPi" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col bg-slate-900/50">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div className="space-y-0.5">
                            <h3 className="text-lg font-bold text-white capitalize">{activeTab} Settings</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configuration Panel</p>
                        </div>
                        <button onClick={onClose} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-slate-400">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                                        <span className="material-symbols-outlined text-primary text-xl">palette</span>
                                        Interface Theme
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => onUpdateState({ theme: 'light' })}
                                            className={`group relative overflow-hidden p-6 rounded-2xl border transition-all ${state.theme === 'light' ? 'bg-white text-slate-900 border-primary ring-4 ring-primary/10' : 'bg-slate-950/40 text-slate-400 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className="flex flex-col items-center gap-3 relative z-10">
                                                <span className="material-symbols-outlined text-3xl">light_mode</span>
                                                <span className="font-bold">Light Mode</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => onUpdateState({ theme: 'dark' })}
                                            className={`group relative overflow-hidden p-6 rounded-2xl border transition-all ${state.theme === 'dark' ? 'bg-slate-800 text-white border-primary ring-4 ring-primary/10' : 'bg-slate-950/40 text-slate-400 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className="flex flex-col items-center gap-3 relative z-10">
                                                <span className="material-symbols-outlined text-3xl">dark_mode</span>
                                                <span className="font-bold">Dark Mode</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                                        <span className="material-symbols-outlined text-primary text-xl">settings_input_component</span>
                                        Library Quality of Life
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <label className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-slate-400">payments</span>
                                                <div>
                                                    <p className="text-sm font-bold text-white">Display Estimated Value</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Show INR valuation on book cards and dashboard</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={state.qolSettings.showValue}
                                                onChange={e => onUpdateState({ qolSettings: { ...state.qolSettings, showValue: e.target.checked } })}
                                                className="size-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-slate-900"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-slate-400">blur_on</span>
                                                <div>
                                                    <p className="text-sm font-bold text-white">Vibrant UI (Glassmorphism)</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Enable heavy blur and transparency effects</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={state.qolSettings.vibrantUi}
                                                onChange={e => onUpdateState({ qolSettings: { ...state.qolSettings, vibrantUi: e.target.checked } })}
                                                className="size-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-slate-900"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">robot_2</span>
                                        AI Intelligence Provider
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Primary Engine</label>
                                        <select
                                            value={aiSettings.provider}
                                            onChange={e => setAiSettings({ ...aiSettings, provider: e.target.value as any })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="gemini">Google Gemini (Cloud Performance)</option>
                                            <option value="ollama">Ollama (Local Privacy)</option>
                                        </select>
                                    </div>

                                    {aiSettings.provider === 'ollama' && (
                                        <div className="grid gap-4 mt-4 p-4 bg-black/40 rounded-xl border border-white/5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Endpoint URL</label>
                                                <input
                                                    value={aiSettings.ollamaUrl}
                                                    onChange={e => setAiSettings({ ...aiSettings, ollamaUrl: e.target.value })}
                                                    placeholder="http://localhost:11434"
                                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Model</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={aiSettings.ollamaModel}
                                                        onChange={e => setAiSettings({ ...aiSettings, ollamaModel: e.target.value })}
                                                        placeholder="llama3.1"
                                                        className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                    <select
                                                        onChange={e => setAiSettings({ ...aiSettings, ollamaModel: e.target.value })}
                                                        className="bg-slate-900 border border-white/10 rounded-lg px-2 text-[10px] font-bold text-primary uppercase"
                                                    >
                                                        <option value="">Recommended</option>
                                                        <option value="llama3.2">Llama 3.2 (Fastest)</option>
                                                        <option value="mistral">Mistral (Reasoning)</option>
                                                        <option value="gemma2">Gemma 2 (Google-like)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'db' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Database Engine</label>
                                        <select
                                            value={dbSettings.type}
                                            onChange={e => setDbSettings({ ...dbSettings, type: e.target.value as any })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="sqlite">Local SQLite (Auto-managed)</option>
                                            <option value="postgres">Remote PostgreSQL (External)</option>
                                        </select>
                                    </div>
                                    {dbSettings.type === 'postgres' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <input value={dbSettings.host} onChange={e => setDbSettings({ ...dbSettings, host: e.target.value })} placeholder="Host" className="bg-slate-900 border border-white/10 p-3 rounded-lg text-white" />
                                            <input value={dbSettings.name} onChange={e => setDbSettings({ ...dbSettings, name: e.target.value })} placeholder="DB Name" className="bg-slate-900 border border-white/10 p-3 rounded-lg text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">upload_file</span>
                                        Bulk Data Import
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium">Migrate from legacy systems. Supports CSV and JSON formats.</p>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".csv,.json"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const { parseBulkFile, validateImportedBook } = await import('../services/importService');
                                                        const { generateId } = await import('../services/storageService');
                                                        const rawBooks = await parseBulkFile(file);
                                                        const validBooks = rawBooks.filter(validateImportedBook).map(b => ({
                                                            ...b,
                                                            id: generateId(),
                                                            addedDate: new Date().toISOString(),
                                                        })) as any;

                                                        if (validBooks.length > 0) {
                                                            onUpdateState({ books: [...state.books, ...validBooks] });
                                                            alert(`Successfully imported ${validBooks.length} books!`);
                                                        } else {
                                                            alert("No valid books found in file. Ensure 'title' and 'author' are present.");
                                                        }
                                                    } catch (err: any) {
                                                        alert("Import failed: " + err.message);
                                                    }
                                                }
                                            }}
                                            className="hidden"
                                            id="bulk-import-input"
                                        />
                                        <label
                                            htmlFor="bulk-import-input"
                                            className="flex h-14 items-center justify-center rounded-2xl bg-white/5 border border-dashed border-white/20 text-white font-bold text-sm hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined mr-2">add_circle</span>
                                            Choose File (CSV or JSON)
                                        </label>
                                    </div>
                                    <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                        <span>✓ Max 10MB</span>
                                        <span>✓ UTF-8 Encoding</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'backup' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-3xl border border-primary/20">
                                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">cloud_done</span>
                                        Google Drive Sync
                                    </h4>
                                    {backupSettings.googleDriveConnected ? (
                                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                            <div className="flex items-center gap-3 text-emerald-400">
                                                <span className="material-symbols-outlined">verified_user</span>
                                                <span className="text-sm font-bold">Linked to {backupSettings.googleDriveUser}</span>
                                            </div>
                                            <button className="text-xs text-red-400 font-bold hover:underline">Disconnect</button>
                                        </div>
                                    ) : (
                                        <button onClick={handleGoogleConnect} className="w-full bg-white text-slate-900 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                                            <span className="material-symbols-outlined">add_link</span>
                                            Link Google Drive Account
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={onDownloadBackup}
                                        className="h-20 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-primary">download</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Full Backup</span>
                                    </button>
                                    <label className="h-20 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all cursor-pointer">
                                        <span className="material-symbols-outlined text-purple-400">upload</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Restore DB</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".json"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const text = await file.text();
                                                    onRestoreBackup(text);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Google API Key (OpenLibrary/Search)</label>
                                        <input
                                            type="password"
                                            value={aiSettings.googleApiKey || ''}
                                            onChange={e => setAiSettings({ ...aiSettings, googleApiKey: e.target.value })}
                                            placeholder="AIzaSy..."
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Gemini API Key</label>
                                        <input
                                            type="password"
                                            value={aiSettings.geminiApiKey || ''}
                                            onChange={e => setAiSettings({ ...aiSettings, geminiApiKey: e.target.value })}
                                            placeholder="AIzaSy..."
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-6 animate-fade-in text-center py-10">
                                <div className="relative inline-block">
                                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative w-20 h-20 bg-gradient-to-br from-slate-900 to-black rounded-3xl border border-white/10 mx-auto flex items-center justify-center shadow-2xl">
                                        <span className="material-symbols-outlined text-4xl text-primary">auto_stories</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-white tracking-tight">BiblioPi</h3>
                                    <p className="text-slate-500 text-sm font-medium">Edition 1.0.0 (Agentic Release)</p>
                                </div>
                                <div className="max-w-md mx-auto p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        A powerful, private library management system designed for the home. Inspired by Komga and Koillection.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
                        <button onClick={onClose} className="px-6 h-12 rounded-xl text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
                        {activeTab !== 'about' && (
                            <button onClick={handleSave} className="px-8 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                <span className="material-symbols-outlined">check_circle</span>
                                Apply Changes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};