import React, { useState, useEffect } from 'react';
import { User, Location, DbSettings, Book, BookCondition, ReadStatus, ParentRole, EducationLevel, BackupSettings } from '../types';
import { generateId, STARTER_BOOKS, calculateAge } from '../services/storageService';
import { backupService } from '../services/backupService';

interface OnboardingProps {
    onComplete: (data: {
        aiProvider: 'gemini' | 'ollama',
        ollamaUrl: string,
        ollamaModel: string,
        users: User[],
        rooms: Location[],
        dbSettings: DbSettings,
        backupSettings: Partial<BackupSettings>,
        starterBooks: Book[]
    }) => void;
    onConfigure: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onConfigure }) => {
    const [step, setStep] = useState(0);
    const [initializing, setInitializing] = useState(false);

    // Profile State
    const [adminName, setAdminName] = useState('Admin'); // Default name
    const [dob, setDob] = useState('1990-01-01'); // Default safe DOB
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [profession, setProfession] = useState('');
    const [education, setEducation] = useState<EducationLevel>('Postgraduate');

    // Locations
    const [rooms, setRooms] = useState<string[]>(['Living Room', 'Bedroom']);
    const [customRoom, setCustomRoom] = useState('');
    const [isAddingRoom, setIsAddingRoom] = useState(false);

    // AI & DB State
    const [aiProvider, setAiProvider] = useState<'gemini' | 'ollama'>('gemini');
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
    const [geminiKey, setGeminiKey] = useState('');
    // Simplified: DB is always sqlite now
    const [dbType] = useState('sqlite');

    // AI Validation State
    const [aiValidationStatus, setAiValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [aiValidationMsg, setAiValidationMsg] = useState('');
    const [hardwareProfile, setHardwareProfile] = useState<'rpi' | 'minipc' | 'gpu'>('minipc');


    const recommendedModels = {
        rpi: { label: 'Raspberry Pi 4/5', tagging: 'TinyLlama', summary: 'Phi-2', image: 'Moondream', youtube: 'Whisper-tiny', pullCommand: 'ollama pull tinyllama && ollama pull phi2' },
        minipc: { label: 'Mini PC / N100', tagging: 'Mistral 7B', summary: 'Llama 3 8B', image: 'Llava', youtube: 'Whisper-base', pullCommand: 'ollama pull mistral && ollama pull llama3' },
        gpu: { label: 'RTX Gaming PC', tagging: 'Llama 3.1 8B', summary: 'Llama 3.1 70B', image: 'Llava-v1.6', youtube: 'Whisper-large', pullCommand: 'ollama pull llama3.1 && ollama pull llava:v1.6' },
    };

    const [isAdult, setIsAdult] = useState(true);
    const [canProceedProfile, setCanProceedProfile] = useState(true);

    React.useEffect(() => {
        const age = calculateAge(dob);
        const adult = age >= 18;
        const valid = adult && adminName.trim().length > 0;

        setIsAdult(adult);
        setCanProceedProfile(valid);
    }, [adminName, dob]);

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const addCustomRoom = () => {
        if (customRoom.trim()) {
            setRooms([...rooms, customRoom.trim()]);
            setCustomRoom('');
            setIsAddingRoom(false);
        }
    };

    const validateAI = async () => {
        setAiValidationStatus('validating');
        setAiValidationMsg('');

        try {
            if (aiProvider === 'gemini') {
                if (!geminiKey) throw new Error("API Key is required");
                // Simple fetch to validate key (using models list endpoint)
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
                if (!res.ok) throw new Error("Invalid API Key");
                setAiValidationStatus('success');
                setAiValidationMsg("Gemini Connected Successfully!");
            } else {
                // Ollama
                if (!ollamaUrl) throw new Error("URL is required");
                // Using /api/tags to check connectivity
                const res = await fetch(`${ollamaUrl}/api/tags`);
                if (!res.ok) throw new Error("Could not connect to Ollama");
                setAiValidationStatus('success');
                setAiValidationMsg("Ollama Connected Successfully!");
            }
        } catch (err: any) {
            setAiValidationStatus('error');
            setAiValidationMsg(err.message || "Connection Failed");
        }
    };

    // DB & Backup State
    const [backupSettings, setBackupSettings] = useState<Partial<BackupSettings>>({
        frequency: 'daily',
        enabledLocal: true,
        enabledNas: false,
        enabledDrive: false,
        nasPath: '\\\\NAS\\Backups'
    });

    const testBackup = () => {
        // Trigger a fake backup to test config
        const dummyState: any = { status: "Backup Test", timestamp: new Date().toISOString() };
        backupService.exportToLocal(dummyState);
    };

    const handleFinish = () => {
        setInitializing(true);
        setTimeout(() => {
            const adminId = generateId();

            // 1. Create Users (Admin + Demo Family)
            const users: User[] = [
                {
                    id: adminId, name: adminName, dob, gender,
                    role: 'Admin', parentRole: 'Dad', educationLevel: education,
                    profession, avatarSeed: adminName,
                    history: [], favorites: []
                },
                {
                    id: generateId(), name: 'Family Member', dob: '1987-08-22', gender: 'Female',
                    role: 'Admin', parentRole: 'Mom', educationLevel: 'Postgraduate',
                    profession: 'Researcher', avatarSeed: 'Priya',
                    history: [], favorites: []
                },
                {
                    id: generateId(), name: 'Teenager', dob: '2010-05-15', gender: 'Other',
                    role: 'User', educationLevel: 'High School', avatarSeed: 'Teen',
                    history: [], favorites: []
                }
            ];

            // 2. Create Rooms & Nested Locations
            const roomNames = rooms.length > 0 ? rooms : ['Living Room', 'Study'];
            const locationObjects: Location[] = [];
            roomNames.forEach(rn => {
                const roomId = generateId();
                locationObjects.push({ id: roomId, name: rn, type: 'Room' });
                locationObjects.push({ id: generateId(), name: 'Shelf A', type: 'Shelf', parentId: roomId });
                locationObjects.push({ id: generateId(), name: 'Shelf B', type: 'Shelf', parentId: roomId });
                locationObjects.push({ id: generateId(), name: 'Spot 1', type: 'Spot', parentId: roomId });
            });

            // 3. Create Books localized to India
            const books = STARTER_BOOKS.map((b, index) => {
                const owner = users[index % users.length];
                return {
                    ...b,
                    id: generateId(),
                    addedByUserId: owner.id,
                    addedByUserName: owner.name,
                    addedDate: new Date().toISOString(),
                    condition: BookCondition.GOOD,
                    isFirstEdition: false,
                    isSigned: false,
                    locationId: locationObjects[0].id,
                    purchasePrice: b.estimatedValue ? b.estimatedValue * 0.8 : 0,
                    amazonLink: `https://www.amazon.in/s?k=${encodeURIComponent(b.title || '')}`
                } as Book;
            });

            onComplete({
                aiProvider,
                ollamaUrl,
                ollamaModel: 'llama3.2',
                users,
                rooms: locationObjects,
                dbSettings: { type: dbType } as DbSettings,
                backupSettings,
                starterBooks: books
            });
            // Redirect to Main App (Port 9091)
            setTimeout(() => {
                window.location.href = window.location.protocol + '//' + window.location.hostname + ':9091';
            }, 1000);
        }, 2000);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
                        <div className="relative group">
                            <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-1000"></div>
                            <div className="relative w-32 h-32 bg-gradient-to-br from-slate-900 to-black rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-center ring-1 ring-white/5 backdrop-blur-xl">
                                <span className="material-symbols-outlined text-7xl bg-gradient-to-tr from-blue-400 to-white bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(25,76,230,0.5)]">auto_stories</span>
                            </div>
                        </div>
                        <div className="text-center space-y-4 max-w-[320px]">
                            <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-xl">BiblioPi</h1>
                            <p className="text-lg text-slate-300 font-medium leading-relaxed">
                                Welcome to your personal <br />
                                <span className="text-primary font-bold">AI Librarian.</span>
                            </p>
                        </div>
                        <button
                            id="btn-onboarding-start"
                            onClick={() => setStep(1)}
                            className="w-full max-w-sm flex h-14 items-center justify-center rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                            Get Started
                        </button>
                    </div >
                );
            case 1:
                return (
                    <div className="flex flex-col space-y-5 animate-in slide-in-from-right duration-500 max-h-[85vh] overflow-y-auto no-scrollbar pb-6 px-1">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Create Profile</h2>
                            <p className="text-slate-400">Let's set up the master librarian.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Librarian Name</label>
                                <input
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                                    value={adminName}
                                    onChange={e => setAdminName(e.target.value)}
                                    placeholder="e.g. Akshat"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        max={maxDateStr}
                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all text-white"
                                        value={dob}
                                        onChange={e => {
                                            const val = e.target.value;
                                            // Strict age enforcement: 18+ only.
                                            // If user selects underage date, we immediately reset to default safe date.
                                            if (calculateAge(val) < 18) {
                                                setDob('1990-01-01');
                                                // Optional: We could trigger a toast here, but user requested silent reset ("won't even show") regarding invalid dates.
                                                // The min/max attribute helps, but direct input needs this guard.
                                            } else {
                                                setDob(val);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                    <select
                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all text-white"
                                        value={gender}
                                        onChange={e => setGender(e.target.value as any)}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Profession</label>
                                <input
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-base font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                                    value={profession}
                                    onChange={e => setProfession(e.target.value)}
                                    placeholder="e.g. Architect"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Education</label>
                                <select
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all text-white"
                                    value={education}
                                    onChange={e => setEducation(e.target.value as any)}
                                >
                                    <option value="Postgraduate">Postgraduate</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Doctorate">Doctorate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {!isAdult && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-center animate-pulse">
                                <span className="material-symbols-outlined text-red-500">warning</span>
                                <p className="text-[10px] font-bold text-red-100 uppercase tracking-tight">Master Librarian must be 18 or older.</p>
                            </div>
                        )}

                        <button
                            id="btn-onboarding-next-profile"
                            disabled={!canProceedProfile}
                            onClick={() => setStep(2)}
                            className={`flex h-14 items-center justify-center rounded-2xl font-bold text-lg transition-all ${canProceedProfile ? 'bg-white text-black hover:bg-gray-200 active:scale-95' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                        >
                            Next Step
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-col space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Library Setup</h2>
                            <p className="text-slate-400">Where will you keep your collection?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from(new Set(['Living Room', 'Study', 'Bedroom', 'Office', 'Basement', 'Attic', ...rooms])).map(r => (
                                <button
                                    key={r}
                                    onClick={() => rooms.includes(r) ? setRooms(rooms.filter(x => x !== r)) : setRooms([...rooms, r])}
                                    className={`h-14 rounded-2xl border transition-all font-bold text-sm ${rooms.includes(r) ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                >
                                    {r}
                                </button>
                            ))}
                            {/* Custom Room Button */}
                            {!isAddingRoom ? (
                                <button
                                    onClick={() => setIsAddingRoom(true)}
                                    className="h-14 rounded-2xl border border-dashed border-white/20 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/40 transition-all font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span> Custom
                                </button>
                            ) : (
                                <div className="h-14 flex gap-2 animate-in fade-in zoom-in duration-300">
                                    <input
                                        autoFocus
                                        className="flex-1 min-w-0 bg-white/10 border border-primary/50 rounded-xl px-3 text-sm font-bold outline-none"
                                        placeholder="Room Name"
                                        value={customRoom}
                                        onChange={e => setCustomRoom(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addCustomRoom()}
                                    />
                                    <button
                                        onClick={addCustomRoom}
                                        className="aspect-square h-full rounded-xl bg-primary text-white flex items-center justify-center hover:brightness-110 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined">check</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            id="btn-onboarding-next-library"
                            onClick={() => setStep(3)}
                            className="flex h-14 items-center justify-center rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 active:scale-95 transition-all"
                        >
                            Almost there
                        </button>
                        <button onClick={() => setStep(1)} className="text-slate-500 font-bold text-sm">Go Back</button>
                    </div>
                );
            case 3:
                return (
                    <div className="flex flex-col space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">AI Intelligence</h2>
                            <p className="text-slate-400">Choose your AI brains.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setAiProvider('gemini')}
                                className={`h-24 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${aiProvider === 'gemini' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">sparkle</span>
                                <span className="font-bold">Google Gemini</span>
                            </button>
                            <button
                                onClick={() => setAiProvider('ollama')}
                                className={`h-24 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${aiProvider === 'ollama' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">terminal</span>
                                <span className="font-bold">Ollama (Local)</span>
                            </button>
                        </div>

                        {aiProvider === 'gemini' ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gemini API Key</label>
                                    <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary hover:underline">Get Key &rarr;</a>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all text-white"
                                        value={geminiKey}
                                        onChange={e => {
                                            setGeminiKey(e.target.value);
                                            setAiValidationStatus('idle');
                                        }}
                                        placeholder="AIzaSy..."
                                    />
                                    <button
                                        onClick={validateAI}
                                        disabled={aiValidationStatus === 'validating' || !geminiKey}
                                        className="h-12 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-50"
                                    >
                                        {aiValidationStatus === 'validating' ? 'Checking...' : 'Validate'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ollama URL</label>
                                        <span className="text-[10px] text-slate-500">Default: 11434</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all text-white"
                                            value={ollamaUrl}
                                            onChange={e => {
                                                setOllamaUrl(e.target.value);
                                                setAiValidationStatus('idle');
                                            }}
                                            placeholder="http://localhost:11434"
                                        />
                                        <button
                                            onClick={validateAI}
                                            disabled={aiValidationStatus === 'validating' || !ollamaUrl}
                                            className="h-12 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-50"
                                        >
                                            {aiValidationStatus === 'validating' ? 'Checking...' : 'Validate'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 ml-1">Ensure Ollama is running (e.g., <code className="bg-white/10 px-1 rounded">http://10.0.0.5:11434</code>)</p>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hardware Profile</label>
                                        <select
                                            value={hardwareProfile}
                                            onChange={(e) => setHardwareProfile(e.target.value as any)}
                                            className="bg-transparent text-[10px] font-bold text-primary outline-none cursor-pointer"
                                        >
                                            <option value="rpi">Raspberry Pi</option>
                                            <option value="minipc">Mini PC</option>
                                            <option value="gpu">Gaming PC / RTX</option>
                                        </select>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <table className="w-full text-left text-[10px]">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-white/5">
                                                    <th className="pb-1">Task</th>
                                                    <th className="pb-1 text-right">Recommended Model</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-300">
                                                <tr className="border-b border-white/5"><td className="py-1">Tagging</td><td className="text-right font-mono text-primary">{recommendedModels[hardwareProfile].tagging}</td></tr>
                                                <tr className="border-b border-white/5"><td className="py-1">Summary</td><td className="text-right font-mono text-primary">{recommendedModels[hardwareProfile].summary}</td></tr>
                                                <tr className="border-b border-white/5"><td className="py-1">Vision</td><td className="text-right font-mono text-primary">{recommendedModels[hardwareProfile].image}</td></tr>
                                                <tr className="border-b border-white/5"><td className="py-1">Voice</td><td className="text-right font-mono text-primary">{recommendedModels[hardwareProfile].youtube}</td></tr>

                                                {/* Pull Command Row */}
                                                <tr>
                                                    <td colSpan={2} className="pt-2">
                                                        <div className="bg-black/30 rounded p-2 font-mono text-[9px] text-gray-400 flex justify-between items-center group cursor-pointer hover:bg-black/50 transition-colors"
                                                            onClick={() => navigator.clipboard.writeText(recommendedModels[hardwareProfile].pullCommand)}>
                                                            <span className="truncate mr-2">$ {recommendedModels[hardwareProfile].pullCommand}</span>
                                                            <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validation Status Message */}
                        {aiValidationStatus === 'error' && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-center animate-in fade-in slide-in-from-top-1">
                                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                <p className="text-xs font-bold text-red-200">{aiValidationMsg}</p>
                            </div>
                        )}
                        {aiValidationStatus === 'success' && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-3 items-center animate-in fade-in slide-in-from-top-1">
                                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                <p className="text-xs font-bold text-green-200">{aiValidationMsg}</p>
                            </div>
                        )}

                        <button
                            id="btn-onboarding-next-ai"
                            disabled={aiValidationStatus !== 'success'}
                            onClick={() => setStep(4)}
                            className={`flex h-14 items-center justify-center rounded-2xl font-bold text-lg transition-all ${aiValidationStatus === 'success' ? 'bg-white text-black hover:bg-gray-200 active:scale-95' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                        >
                            Next: Database
                        </button>
                        <button onClick={() => setStep(2)} className="text-slate-500 font-bold text-sm">Go Back</button>
                    </div>
                );
            case 4:
                return (
                    <div className="flex flex-col space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Master Data</h2>
                            <p className="text-slate-400">Where does your library live?</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-4xl text-primary">database</span>
                                <div className="text-left">
                                    <h3 className="font-bold text-lg text-white">SQLite Database</h3>
                                    <p className="text-xs text-slate-400">Fast, local, and file-based. Perfect for home libraries.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
                            <span className="material-symbols-outlined text-blue-400 mt-0.5">save</span>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-blue-100">Data Persistence</p>
                                <p className="text-xs text-blue-300 leading-relaxed">
                                    Your library is safe! We automatically mount a volume to <span className="font-mono bg-black/20 px-1 rounded mx-1">/app/data</span> ensure your data survives updates and restarts.
                                </p>
                            </div>
                        </div>

                        <button
                            id="btn-onboarding-next-db"
                            onClick={() => setStep(5)}
                            className="flex h-14 items-center justify-center rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 active:scale-95 transition-all shadow-lg"
                        >
                            Next: Backup
                        </button>
                        <button onClick={() => setStep(3)} className="text-slate-500 font-bold text-sm">Go Back</button>
                    </div>
                );
            case 5:
                return (
                    <div className="flex flex-col space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Backup Strategy</h2>
                            <p className="text-slate-400">Keep your library safe.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Frequency */}
                            <div className="grid grid-cols-4 bg-white/5 p-1 rounded-xl">
                                {['daily', 'weekly', 'monthly', 'manual'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setBackupSettings({ ...backupSettings, frequency: f as any })}
                                        className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${backupSettings.frequency === f ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            {/* Destinations */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Destinations</label>

                                {/* Local */}
                                <div
                                    onClick={() => setBackupSettings({ ...backupSettings, enabledLocal: !backupSettings.enabledLocal })}
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${backupSettings.enabledLocal ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined ${backupSettings.enabledLocal ? 'text-primary' : 'text-gray-500'}`}>hard_drive</span>
                                        <span className="font-bold text-sm">Local Storage</span>
                                    </div>
                                    <div className={`size-5 rounded-full border flex items-center justify-center ${backupSettings.enabledLocal ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                                        {backupSettings.enabledLocal && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                                    </div>
                                </div>

                                {/* NAS */}
                                <div
                                    onClick={() => setBackupSettings({ ...backupSettings, enabledNas: !backupSettings.enabledNas })}
                                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${backupSettings.enabledNas ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10'}`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined ${backupSettings.enabledNas ? 'text-primary' : 'text-gray-500'}`}>dns</span>
                                            <span className="font-bold text-sm">Network Storage (NAS)</span>
                                        </div>
                                        <div className={`size-5 rounded-full border flex items-center justify-center ${backupSettings.enabledNas ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                                            {backupSettings.enabledNas && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                                        </div>
                                    </div>
                                    {backupSettings.enabledNas && (
                                        <div className="animate-in fade-in slide-in-from-top-1 pl-9 mt-1 w-full" onClick={e => e.stopPropagation()}>
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-blue-400 text-sm mt-0.5">info</span>
                                                    <div>
                                                        <p className="text-[10px] text-blue-200 font-bold">Mount Check Required</p>
                                                        <p className="text-[10px] text-blue-300/80 leading-relaxed">
                                                            Apps running in Docker Stack cannot directly access your host NAS. You must mount it explicitly.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">1. Internal Mount Path</label>
                                                    <input
                                                        className="w-full bg-black/20 border border-blue-500/30 rounded-md px-2 py-1 text-xs text-blue-100 placeholder-blue-500/30 outline-none"
                                                        placeholder="/app/backups"
                                                        value={backupSettings.nasPath}
                                                        onChange={e => setBackupSettings({ ...backupSettings, nasPath: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">2. Run on Host</label>
                                                    <div className="bg-black/40 rounded p-2 font-mono text-[9px] text-gray-400 flex justify-between items-start group cursor-pointer hover:bg-black/60 transition-colors"
                                                        onClick={() => navigator.clipboard.writeText(`docker service update --mount-add type=bind,source=/path/to/nas,target=${backupSettings.nasPath || '/app/backups'} bibliopi_app`)}>
                                                        <span className="break-all">
                                                            docker service update --mount-add type=bind,source=/path/to/nas,target={backupSettings.nasPath || '/app/backups'} bibliopi_app
                                                        </span>
                                                        <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">content_copy</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Google Drive */}
                                <div
                                    onClick={() => setBackupSettings({ ...backupSettings, enabledDrive: !backupSettings.enabledDrive })}
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${backupSettings.enabledDrive ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined ${backupSettings.enabledDrive ? 'text-primary' : 'text-gray-500'}`}>cloud_upload</span>
                                        <span className="font-bold text-sm">Google Drive</span>
                                    </div>
                                    <div className={`size-5 rounded-full border flex items-center justify-center ${backupSettings.enabledDrive ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                                        {backupSettings.enabledDrive && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={testBackup}
                            className="w-full py-3 rounded-xl border border-dashed border-white/20 hover:bg-white/5 hover:border-white/40 transition-all font-bold text-xs text-slate-400 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">science</span> Test Backup Configuration
                        </button>

                        <button
                            id="btn-onboarding-finish"
                            onClick={handleFinish}
                            disabled={initializing}
                            className="flex h-14 items-center justify-center rounded-2xl bg-primary text-white font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            {initializing ? 'Syncing Vault...' : 'Finish Setup'}
                        </button>
                        <button onClick={() => setStep(4)} className="text-slate-500 font-bold text-sm">Go Back</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="font-display antialiased bg-[#05070a] text-white h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center px-6">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-black"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            </div>

            <div className="z-10 w-full max-w-sm">
                {renderStep()}
            </div>
        </div>
    );
};
