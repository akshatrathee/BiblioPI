import React, { useState } from 'react';
import { Book, User, Location, BookCondition, ReadStatus } from '../types';

interface BookDetailsProps {
    book: Book;
    currentUser: User;
    users: User[];
    locations: Location[];
    getLocationName: (id?: string) => string;
    onClose: () => void;
    onLoan: () => void;
    onDelete: () => void;
    onUpdateBook: (book: Book) => void;
    onToggleRead: (bookId: string) => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({ book, currentUser, users, getLocationName, locations, onClose, onUpdateBook, onDelete, onLoan }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBook, setEditedBook] = useState<Book>(book);
    const [synopsisExpanded, setSynopsisExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Logic to find who is reading or has read this book
    const readers = users.filter(u => u.history.some(h => h.bookId === book.id));

    const handleToggleRead = () => {
        onToggleRead(book.id);
    };

    const handleSave = () => {
        onUpdateBook(editedBook);
        setIsEditing(false);
    };

    const handleChange = (field: keyof Book, value: any) => {
        setEditedBook(prev => ({ ...prev, [field]: value }));
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: book.title,
                text: `Check out ${book.title} by ${book.author} on BiblioPi!`,
                url: window.location.href
            }).catch(() => { });
        } else {
            alert(`Sharing: ${book.title} by ${book.author}`);
        }
    };

    return (
        <div
            id="book-details-overlay"
            onClick={(e) => {
                if ((e.target as HTMLElement).id === 'book-details-overlay') onClose();
            }}
            className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-md text-white font-display overflow-y-auto no-scrollbar animate-fade-in pb-32"
        >
            <div className="min-h-screen w-full flex flex-col items-center">
                {/* Dynamic Background */}
                <div className="fixed inset-0 z-0 h-[75vh] w-full overflow-hidden pointer-events-none">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 scale-110 blur-3xl saturate-150 transition-all duration-1000"
                        style={{ backgroundImage: `url('${book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=400"}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
                </div>

                {/* Top Navigation */}
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-6 transition-all">
                    <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-95 hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <button onClick={handleSave} className="flex size-10 items-center justify-center rounded-full bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400/20 active:scale-95 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                                <span className="material-symbols-outlined text-[20px]">save</span>
                            </button>
                        ) : (
                            <button onClick={() => {
                                if (confirm("Are you sure you want to delete this book?")) onDelete();
                            }} className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-red-400 border border-white/10 active:scale-95 hover:bg-red-500/20 transition-all">
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        )}
                        <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-95 hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 w-full px-5 pt-28 flex flex-col items-center animate-fade-in-up pb-32">

                    {/* Hero Section */}
                    <div className="w-full flex flex-col items-center mb-8">
                        <div className="relative w-48 md:w-64 aspect-[2/3] mb-8 group perspective-1000">
                            <div className={`absolute inset-0 bg-primary/20 rounded-xl blur-[40px] opacity-20 group-hover:opacity-30 transition-opacity duration-700`}></div>
                            <img
                                alt={book.title}
                                className="relative w-full h-full object-cover rounded-xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 ring-1 ring-white/10"
                                src={book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=400"}
                            />
                            {book.isFirstEdition && (
                                <div className="absolute -top-3 -right-3 z-20">
                                    <div className="bg-black/60 backdrop-blur-md border border-amber-400 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px] fill-1">verified</span>
                                        <span>First Ed.</span>
                                    </div>
                                </div>
                            )}
                            {book.isSigned && (
                                <div className="absolute top-8 -right-3 z-20">
                                    <div className="bg-black/60 backdrop-blur-md border border-indigo-400 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px] fill-1">history_edu</span>
                                        <span>Signed</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center space-y-2 mb-5 max-w-sm w-full">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input
                                        value={editedBook.title}
                                        onChange={e => handleChange('title', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-center text-xl font-bold text-white focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Title"
                                    />
                                    <input
                                        value={editedBook.author}
                                        onChange={e => handleChange('author', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-2 text-center text-md text-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Author"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white drop-shadow-xl tracking-tight">{book.title}</h1>
                                    <p className="text-lg text-gray-300 font-medium tracking-wide">{book.author}</p>
                                    <div className="flex items-center justify-center gap-1.5 mt-2">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Added by</span>
                                        <span className="text-[10px] text-primary uppercase tracking-widest font-extrabold">{book.addedByUserName || 'System Manager'}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Stats Pills */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm">
                                <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedBook.publishedDate || ''}
                                        onChange={e => handleChange('publishedDate', e.target.value)}
                                        className="bg-transparent border-none text-xs text-white p-0 w-24 outline-none"
                                    />
                                ) : (
                                    book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown'
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm">
                                <span className="material-symbols-outlined text-[16px] text-primary">category</span>
                                {book.genres[0] || 'Uncategorized'}
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm">
                                <span className="material-symbols-outlined text-[16px] text-primary fill-1">star</span>
                                {book.rating || '4.5'}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm">
                                <span className="material-symbols-outlined text-[16px] text-primary fill-1">person</span>
                                {book.addedByUserName || 'System'}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {!isEditing && (
                            <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-4">
                                <button
                                    onClick={handleToggleRead}
                                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-amber-400 text-black hover:brightness-110 font-bold text-sm shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[20px] fill-1">play_circle</span>
                                    <span>{book.status === ReadStatus.COMPLETED ? 'Reread' : 'Read Now'}</span>
                                </button>
                                <button
                                    onClick={onLoan}
                                    className="size-12 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 font-bold shadow-lg transition-all active:scale-95"
                                    title="Loan Book"
                                >
                                    <span className="material-symbols-outlined text-[22px]">bookmark_add</span>
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="size-12 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 font-bold shadow-lg transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[22px]">more_vert</span>
                                    </button>
                                    {showMenu && (
                                        <div className="absolute right-0 top-14 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                                            <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-gray-200 hover:bg-white/5 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400">edit</span> Edit Book
                                            </button>
                                            <button onClick={() => { handleShare(); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-gray-200 hover:bg-white/5 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400">share</span> Share
                                            </button>
                                            <div className="h-px bg-white/5 my-1 mx-2"></div>
                                            <button onClick={() => { if (confirm("Archive this book?")) setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-gray-200 hover:bg-white/5 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400">archive</span> Archive
                                            </button>
                                            <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                                                <span className="material-symbols-outlined">delete</span> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full max-w-xl space-y-4">

                        {/* Synopsis */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 opacity-90">
                                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                                    Summary & AI Analysis
                                </h3>
                                {!isEditing && book.summary && (
                                    <button
                                        onClick={() => {
                                            if (window.speechSynthesis.speaking) {
                                                window.speechSynthesis.cancel();
                                            } else {
                                                const utterance = new SpeechSynthesisUtterance(book.summary);
                                                window.speechSynthesis.speak(utterance);
                                            }
                                        }}
                                        className="p-2 rounded-full hover:bg-white/5 text-amber-400 transition-colors"
                                        title="Read Aloud"
                                    >
                                        <span className="material-symbols-outlined text-base">volume_up</span>
                                    </button>
                                )}
                            </div>
                            {isEditing ? (
                                <textarea
                                    value={editedBook.summary || ''}
                                    onChange={e => handleChange('summary', e.target.value)}
                                    className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Book summary..."
                                />
                            ) : (
                                <div className="relative">
                                    <p className={`text-sm leading-relaxed text-gray-300 ${synopsisExpanded ? '' : 'line-clamp-3'}`}>
                                        {book.summary || "No summary available."}
                                    </p>
                                    {book.summary && book.summary.length > 150 && (
                                        <button
                                            onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                                            className="text-amber-400 text-xs font-bold mt-2 flex items-center gap-1 hover:text-amber-300 transition-colors"
                                        >
                                            {synopsisExpanded ? 'Show Less' : 'Read Full Synopsis'}
                                            <span className="material-symbols-outlined text-sm">{synopsisExpanded ? 'expand_less' : 'expand_more'}</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* AI Insights & Guide */}
                        {!isEditing && (book.understandingGuide || book.parentalAdvice || book.culturalReference) && (
                            <div className="space-y-3">
                                {book.understandingGuide && (
                                    <div className="bg-primary/5 backdrop-blur-md border border-primary/20 p-5 rounded-3xl">
                                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-sm">lightbulb</span> Understanding Guide
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed italic">"{book.understandingGuide}"</p>
                                    </div>
                                )}

                                {book.culturalReference && (
                                    <div className="bg-purple-500/5 backdrop-blur-md border border-purple-500/20 p-5 rounded-3xl">
                                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-sm">auto_awesome</span> Cultural Context
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed">{book.culturalReference}</p>
                                    </div>
                                )}

                                {book.parentalAdvice && (
                                    <div className="bg-orange-500/5 backdrop-blur-md border border-orange-500/20 p-5 rounded-3xl">
                                        <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-sm">family_restroom</span> Parental Advice
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed">{book.parentalAdvice}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Media Adaptations */}
                        {!isEditing && book.mediaAdaptations && book.mediaAdaptations.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Media Adaptations</h3>
                                <div className="flex flex-col gap-2">
                                    {book.mediaAdaptations.map((media, i) => (
                                        <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined">{media.type === 'Movie' ? 'movie' : 'desktop_windows'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{media.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{media.type}</p>
                                                </div>
                                            </div>
                                            {media.youtubeLink && (
                                                <a href={media.youtubeLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/5 text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined">play_circle</span>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reading Activity */}
                        {!isEditing && (
                            <div>
                                <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Family Reading Activity</h3>
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
                                    {users.filter(u => u.history.some(h => h.bookId === book.id)).map((user) => {
                                        const entry = user.history.find(h => h.bookId === book.id)!;
                                        const isFinished = entry.status === ReadStatus.COMPLETED;
                                        const progress = isFinished ? 100 : 45;

                                        return (
                                            <div key={user.id} className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-colors ${progress === 100 ? 'bg-white/[0.02]' : ''}`}>
                                                <div className="relative shrink-0">
                                                    <div className={`size-10 rounded-full bg-cover bg-center ring-2 ring-white/10 ${progress < 100 ? '' : 'grayscale opacity-70'}`} style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.name}')` }}></div>
                                                    <div className={`absolute -bottom-1 -right-1 p-[2px] rounded-full flex items-center justify-center shadow-sm ${progress === 100 ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                                                        <span className="material-symbols-outlined text-[10px]">{progress === 100 ? 'check' : 'menu_book'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-sm font-bold ${progress === 100 ? 'text-gray-400' : 'text-white'}`}>{user.name}</span>
                                                        <div className="flex flex-col items-end">
                                                            <span className={`text-[10px] font-bold ${progress === 100 ? 'text-green-400' : 'text-primary'}`}>
                                                                {progress === 100 ? 'FINISHED' : 'IN PROGRESS'}
                                                            </span>
                                                            <span className="text-[8px] text-gray-500 uppercase font-bold">Read {entry.readCount || 1} times</span>
                                                        </div>
                                                    </div>
                                                    {progress < 100 ? (
                                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="flex text-amber-400">
                                                                {[1, 2, 3, 4, 5].map(i => <span key={i} className={`material-symbols-outlined text-[10px] ${i <= (entry.rating || 5) ? 'fill-1' : ''}`}>star</span>)}
                                                            </div>
                                                            <span className="text-[8px] text-gray-500 font-bold">{entry.dateFinished ? new Date(entry.dateFinished).toLocaleDateString() : ''}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Location */}
                            <div className="col-span-2 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-7xl text-white">shelves</span>
                                </div>
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary shrink-0">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Library Location</p>
                                        {isEditing ? (
                                            <select
                                                value={editedBook.locationId || ''}
                                                onChange={e => handleChange('locationId', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {locations.filter(l => !l.parentId).map(room => (
                                                    <optgroup key={room.id} label={room.name}>
                                                        <option value={room.id}>[Entire Room]</option>
                                                        {locations.filter(l => l.parentId === room.id).map(spot => (
                                                            <option key={spot.id} value={spot.id}>{spot.name}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase w-12">Room:</span>
                                                    <span className="text-sm font-bold text-white">{getLocationName(book.locationId).split('>')[0] || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 text-[10px] font-bold uppercase w-12">Spot:</span>
                                                    <span className="text-sm font-bold text-white">{getLocationName(book.locationId).split('>').pop() || 'Unassigned'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Value */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <span className="material-symbols-outlined text-lg">payments</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-[10px]">trending_up</span> 20%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500">Value</p>
                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <input
                                                type="number"
                                                value={editedBook.purchasePrice || 0}
                                                onChange={e => handleChange('purchasePrice', parseFloat(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                                                placeholder="Purchase Price"
                                            />
                                            <input
                                                type="number"
                                                value={editedBook.estimatedValue || 0}
                                                onChange={e => handleChange('estimatedValue', parseFloat(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                                                placeholder="Current Value"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <p className="text-lg font-bold text-white">₹{book.estimatedValue || book.purchasePrice || 0}</p>
                                            <p className="text-[8px] text-gray-400 font-bold uppercase">Bought: ₹{book.purchasePrice || 0}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Condition */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                        <span className="material-symbols-outlined text-lg">report_problem</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Condition</p>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <select
                                                value={editedBook.condition}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    handleChange('condition', val);
                                                    if (val === 'Damaged') {
                                                        const detail = prompt("Enter damage details:");
                                                        if (detail) handleChange('summary', (editedBook.summary || '') + `\n\n[DAMAGE REPORT]: ${detail}`);
                                                    }
                                                }}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white"
                                            >
                                                {Object.values(BookCondition).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <p className={`text-sm font-bold ${book.condition === 'Damaged' ? 'text-red-500' : 'text-white'}`}>{book.condition}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Action Bar */}
                    {!isEditing && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                            <button
                                onClick={handleShare}
                                className="size-11 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1"></div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-6 h-11 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-sm transition-colors shadow-lg"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                <span>Edit Details</span>
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1"></div>
                            <button
                                onClick={() => alert("QR Code for " + book.isbn)}
                                className="size-11 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            );
};