import React, { useState } from 'react';
import { Location, generateId } from '../types';

interface LocationManagerProps {
    locations: Location[];
    onUpdate: (locs: Location[]) => void;
    onBack: () => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({ locations, onUpdate, onBack }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const rooms = locations.filter(l => !l.parentId);

    const handleAddRoom = () => {
        const name = prompt("Enter Room Name:");
        if (name) {
            onUpdate([...locations, { id: Math.random().toString(36).substr(2, 9), name, type: 'Room' }]);
        }
    };

    const handleAddSub = (parentId: string) => {
        const name = prompt("Enter Sub-Location (Shelf/Spot) Name:");
        if (name) {
            onUpdate([...locations, { id: Math.random().toString(36).substr(2, 9), name, type: 'Shelf', parentId }]);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this location and all its sub-locations?")) {
            onUpdate(locations.filter(l => l.id !== id && l.parentId !== id));
        }
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
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{rooms.length} Rooms Configured</p>
                    </div>
                    <button onClick={handleAddRoom} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/20 text-primary transition-all active:scale-95">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                {rooms.map(room => (
                    <div key={room.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-4 bg-white/5 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-xl">home</span>
                                </div>
                                <h3 className="font-bold text-lg">{room.name}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleAddSub(room.id)} className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all">
                                    <span className="material-symbols-outlined text-xl">add_box</span>
                                </button>
                                <button onClick={() => handleDelete(room.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            {locations.filter(l => l.parentId === room.id).map(spot => (
                                <div key={spot.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-3 ml-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></span>
                                        <span className="text-sm font-medium text-gray-300">{spot.name}</span>
                                    </div>
                                    <button onClick={() => handleDelete(spot.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all">
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                </div>
                            ))}
                            {locations.filter(l => l.parentId === room.id).length === 0 && (
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center py-2 italic">No sub-locations defined</p>
                            )}
                        </div>
                    </div>
                ))}

                {rooms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">location_off</span>
                        <p className="text-lg font-bold">No Rooms Defined</p>
                        <p className="text-sm">Start by adding your first room.</p>
                    </div>
                )}
            </div>
        </div>
    );
};