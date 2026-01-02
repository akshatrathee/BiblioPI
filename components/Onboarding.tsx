import React, { useState } from 'react';
import { User, Location, DbSettings, Book, BookCondition, ReadStatus } from '../types';
import { generateId, STARTER_BOOKS } from '../services/storageService';

interface OnboardingProps {
    onComplete: (data: {
        aiProvider: 'gemini' | 'ollama',
        ollamaUrl: string,
        ollamaModel: string,
        users: User[],
        rooms: Location[],
        dbSettings: DbSettings,
        starterBooks: Book[]
    }) => void;
    onConfigure: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onConfigure }) => {
    const [step, setStep] = useState(0);
    const [initializing, setInitializing] = useState(false);

    // Draft State
    const [adminName, setAdminName] = useState('Admin');
    const [rooms, setRooms] = useState<string[]>(['Living Room', 'Bedroom']);
    const [aiProvider, setAiProvider] = useState<'gemini' | 'ollama'>('gemini');

    const handleFinish = () => {
        setInitializing(true);
        setTimeout(() => {
            const adminId = generateId();

            // 1. Create Users
            const users: User[] = [
                {
                    id: adminId, name: adminName, dob: '1985-05-15', gender: 'Male',
                    role: 'Admin', parentRole: 'Dad', educationLevel: 'Postgraduate',
                    profession: 'Software Architect', avatarSeed: adminName,
                    history: [], favorites: []
                },
                {
                    id: generateId(), name: 'Priya', dob: '1987-08-22', gender: 'Female',
                    role: 'Admin', parentRole: 'Mom', educationLevel: 'Postgraduate',
                    profession: 'Doctor', avatarSeed: 'Priya',
                    history: [], favorites: []
                },
                {
                    id: generateId(), name: 'Ananya', dob: '2009-11-10', gender: 'Female',
                    role: 'User', educationLevel: 'High School', avatarSeed: 'Ananya',
                    history: [], favorites: [], personas: [{ universe: 'Harry Potter', character: 'Hermione Granger', reason: 'High intelligence and love for library' }]
                },
                {
                    id: generateId(), name: 'Ishani', dob: '2021-03-05', gender: 'Female',
                    role: 'User', educationLevel: 'Preschool', avatarSeed: 'Ishani',
                    history: [], favorites: []
                }
            ];

            // 2. Create Rooms & Nested Locations
            const roomNames = rooms.length > 0 ? rooms : ['Living Room', 'Study'];
            const locationObjects: Location[] = [];
            roomNames.forEach(rn => {
                const roomId = generateId();
                locationObjects.push({ id: roomId, name: rn, type: 'Room' });
                // Add sub-locations
                locationObjects.push({ id: generateId(), name: 'Shelf A', type: 'Shelf', parentId: roomId });
                locationObjects.push({ id: generateId(), name: 'Shelf B', type: 'Shelf', parentId: roomId });
                locationObjects.push({ id: generateId(), name: 'Box 1', type: 'Spot', parentId: roomId });
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
                ollamaUrl: 'http://localhost:11434',
                ollamaModel: 'llama3.2',
                users,
                rooms: locationObjects,
                dbSettings: { type: 'sqlite', host: 'localhost', name: 'homelibrary' },
                starterBooks: books
            });
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
                            onClick={() => setStep(1)}
                            className="w-full max-w-sm flex h-14 items-center justify-center rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                );
            case 1:
                return (
                    <div className="flex flex-col space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Create Profile</h2>
                            <p className="text-slate-400">Let's set up the master librarian.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5 text-left">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Librarian Name</label>
                                <input
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-lg font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                                    value={adminName}
                                    onChange={e => setAdminName(e.target.value)}
                                    placeholder="e.g. Akshat"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            className="flex h-14 items-center justify-center rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 active:scale-95 transition-all"
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
                            {['Living Room', 'Study', 'Bedroom', 'Office', 'Basement', 'Attic'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => rooms.includes(r) ? setRooms(rooms.filter(x => x !== r)) : setRooms([...rooms, r])}
                                    className={`h-14 rounded-2xl border transition-all font-bold text-sm ${rooms.includes(r) ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <button
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
                        <div className="space-y-3">
                            <button
                                onClick={() => setAiProvider('gemini')}
                                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 ${aiProvider === 'gemini' ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10 opacity-60'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                                <div>
                                    <p className="font-bold">Google Gemini</p>
                                    <p className="text-[10px] text-slate-400">Cloud-based, highly accurate, free tier available.</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setAiProvider('ollama')}
                                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 ${aiProvider === 'ollama' ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10 opacity-60'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">terminal</span>
                                <div>
                                    <p className="font-bold">Ollama (Local)</p>
                                    <p className="text-[10px] text-slate-400">Run locally for total privacy. Requires Ollama installed.</p>
                                </div>
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Voice (TTS/STT) integrated automatically</p>
                        <button
                            onClick={handleFinish}
                            disabled={initializing}
                            className="flex h-14 items-center justify-center rounded-2xl bg-primary text-white font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            {initializing ? 'Preparing Library...' : 'Finish Setup'}
                        </button>
                        <button onClick={() => setStep(2)} className="text-slate-500 font-bold text-sm">Go Back</button>
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