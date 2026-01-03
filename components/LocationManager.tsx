import React, { useState } from 'react';
import { Location } from '../types';
import { generateId } from '../services/storageService';

interface LocationManagerProps {
    locations: Location[];
    onUpdate: (locs: Location[]) => void;
    onBack: () => void;
}

const LocationItem = ({ loc, allLocs, onUpdate, onDelete }: { loc: Location, allLocs: Location[], onUpdate: (l: Location[]) => void, onDelete: (id: string) => void }) => {
    const children = allLocs.filter(l => l.parentId === loc.id);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newSubName, setNewSubName] = useState('');

    const getDepth = (lId: string, depth = 0): number => {
        const item = allLocs.find(l => l.id === lId);
        if (!item?.parentId) return depth;
        return getDepth(item.parentId, depth + 1);
    };

    const currentDepth = getDepth(loc.id);
    const canAddSub = currentDepth < 2;

    const handleAddSub = () => {
        if (!newSubName || !canAddSub) return;
        const subType = currentDepth === 0 ? 'Shelf' : 'Spot';
        onUpdate([...allLocs, { id: generateId(), name: newSubName, type: subType, parentId: loc.id }]);
        setNewSubName('');
        setIsAdding(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updated = allLocs.map(l => l.id === loc.id ? { ...l, imageUrl: reader.result as string } : l);
                onUpdate(updated);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="pl-4 border-l border-white/10 ml-2">
            <div className="flex items-center gap-3 py-2 group">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`size-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all ${children.length === 0 ? 'invisible' : ''}`}
                >
                    <span className={`material-symbols-outlined text-base transition-transform ${isExpanded ? 'rotate-90' : ''}`}>chevron_right</span>
                </button>

                <div className="relative size-12 shrink-0 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    {loc.imageUrl ? (
                        <img src={loc.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined text-white/20">
                            {loc.type === 'Room' ? 'meeting_room' : 'shelves'}
                        </span>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <span className="material-symbols-outlined text-white text-sm">upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-200 truncate">{loc.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{loc.type}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canAddSub && (
                        <button onClick={() => setIsAdding(true)} className="p-2 text-primary hover:bg-white/5 rounded-lg">
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                    )}
                    <button onClick={() => onDelete(loc.id)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg">
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="ml-10 mb-2 flex gap-2 animate-fade-in">
                    <input
                        className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-sm text-white w-full outline-none focus:border-primary"
                        placeholder="New Sub-Location Name..."
                        value={newSubName}
                        onChange={e => setNewSubName(e.target.value)}
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleAddSub()}
                    />
                    <button onClick={handleAddSub} className="text-[10px] font-bold bg-primary text-white px-3 rounded-lg">ADD</button>
                    <button onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-gray-500 px-2">CANCEL</button>
                </div>
            )}

            {isExpanded && (
                <div className="space-y-1">
                    {children.map(child => (
                        <LocationItem key={child.id} loc={child} allLocs={allLocs} onUpdate={onUpdate} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const LocationManager: React.FC<LocationManagerProps> = ({ locations, onUpdate, onBack }) => {
    const rooms = locations.filter(l => !l.parentId);

    const handleDelete = (id: string) => {
        if (confirm("Delete this location and all its contents?")) {
            // Recursive delete
            const toDelete = [id];
            const collectChildren = (pid: string) => {
                locations.filter(l => l.parentId === pid).forEach(c => {
                    toDelete.push(c.id);
                    collectChildren(c.id);
                });
            };
            collectChildren(id);
            onUpdate(locations.filter(l => !toDelete.includes(l.id)));
        }
    };

    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');

    const handleAddRoom = () => {
        if (!newRoomName) return;
        onUpdate([...locations, { id: generateId(), name: newRoomName, type: 'Room' }]);
        setNewRoomName('');
        setIsAddingRoom(false);
    };

    return (
        <div className="bg-[#0f172a] min-h-screen text-white font-display flex flex-col pb-32">
            <div className="sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-16">
                    <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all active:scale-95">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-black tracking-[0.2em] uppercase">Location Manager</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{locations.length} Units Configured</p>
                    </div>
                    <button onClick={() => setIsAddingRoom(true)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/20 text-primary transition-all active:scale-95">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
                {/* Intro Pill */}
                <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4 animate-fade-in-up">
                    <span className="material-symbols-outlined text-indigo-400">help</span>
                    <p className="text-xs font-medium text-slate-300 leading-relaxed">
                        BiblioPi uses a <span className="text-white font-bold">3-level hierarchy</span>: Room &gt; Shelf &gt; Spot. Organize your library logically to find books instantly using the maintenance hub.
                    </p>
                </div>

                {isAddingRoom && (
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl animate-fade-in">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Add New Room</h3>
                        <div className="flex gap-2">
                            <input
                                className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full outline-none focus:border-primary font-bold"
                                placeholder="e.g. Living Room"
                                value={newRoomName}
                                onChange={e => setNewRoomName(e.target.value)}
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleAddRoom()}
                            />
                            <button onClick={handleAddRoom} className="px-6 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest">Add</button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {rooms.map(room => (
                        <div key={room.id} className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                            <LocationItem loc={room} allLocs={locations} onUpdate={onUpdate} onDelete={handleDelete} />
                        </div>
                    ))}
                </div>

                {rooms.length === 0 && !isAddingRoom && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">location_off</span>
                        <p className="text-lg font-bold">No Locations</p>
                        <p className="text-sm">Click + to add your first room</p>
                    </div>
                )}
            </div>
        </div>
    );
};