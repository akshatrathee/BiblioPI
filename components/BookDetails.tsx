import React, { useState } from 'react';
import { Book, Location, User, ReadStatus, BookCondition } from '../types';
import { formatCurrency } from '../services/storageService';

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
    onResetHistory: (bookId: string, type: 'undo' | 'reset') => void;
    onOpenReader: () => void;
    showValue: boolean;
}

export const BookDetails: React.FC<BookDetailsProps> = ({
    book, currentUser, users, locations, getLocationName, onClose, onLoan, onDelete, onUpdateBook, onToggleRead, onResetHistory, onOpenReader, showValue
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBook, setEditedBook] = useState<Book>(book);
    const [showCoverLightbox, setShowCoverLightbox] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [synopsisExpanded, setSynopsisExpanded] = useState(false);

    const isRead = currentUser.history.some(h => h.bookId === book.id && h.status === ReadStatus.COMPLETED);

    const handleSave = () => {
        onUpdateBook(editedBook);
        setIsEditing(false);
    };

    const handleChange = (field: keyof Book, value: any) => {
        setEditedBook(prev => ({ ...prev, [field]: value }));
    };

    if (isEditing) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-white dark:bg-[#1e293b] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up no-scrollbar">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Edit Book</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editedBook.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Author</label>
                                    <input
                                        type="text"
                                        value={editedBook.author}
                                        onChange={e => handleChange('author', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">ISBN</label>
                                    <input
                                        type="text"
                                        value={editedBook.isbn || ''}
                                        onChange={e => handleChange('isbn', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Summary</label>
                                <textarea
                                    value={editedBook.summary || ''}
                                    onChange={e => handleChange('summary', e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Location</label>
                                    <select
                                        value={editedBook.locationId || ''}
                                        onChange={e => handleChange('locationId', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white transition-colors"
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {locations.filter(l => !l.parentId).map(room => (
                                            <optgroup key={room.id} label={room.name}>
                                                <option value={room.id}>{room.name} (Entire Room)</option>
                                                {locations.filter(l => l.parentId === room.id).map(spot => (
                                                    <option key={spot.id} value={spot.id}>{spot.name}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Condition</label>
                                    <select
                                        value={editedBook.condition || BookCondition.GOOD}
                                        onChange={e => {
                                            const val = e.target.value as BookCondition;
                                            handleChange('condition', val);
                                            if (val === BookCondition.POOR || val === BookCondition.DAMAGED) {
                                                const currentDesc = editedBook.summary || '';
                                                if (!currentDesc.includes('[DAMAGE REPORT]')) {
                                                    const detail = prompt("Enter damage details (optional):");
                                                    if (detail) handleChange('summary', currentDesc + `\n\n[DAMAGE REPORT]: ${detail}`);
                                                }
                                            }
                                        }}
                                        className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white transition-colors"
                                    >
                                        {Object.values(BookCondition).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Purchase Price</label>
                                    <input
                                        type="number"
                                        value={editedBook.purchasePrice || ''}
                                        onChange={e => handleChange('purchasePrice', parseFloat(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Est. Value</label>
                                    <input
                                        type="number"
                                        value={editedBook.estimatedValue || ''}
                                        onChange={e => handleChange('estimatedValue', parseFloat(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-[#0f172a] border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5 mt-6">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/30 transition-all active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Design based on page3.html
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-[#0f172a] text-slate-900 dark:text-white font-display overflow-y-auto no-scrollbar animate-fade-in">
            {/* Background Blur */}
            <div className="fixed inset-0 z-0 h-[65vh] overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-80 dark:opacity-40 scale-110 transform transition-transform duration-1000" style={{ backgroundImage: `url('${book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=400"}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-gray-50 dark:to-[#0f172a]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#0f172a] via-gray-50/10 dark:via-[#0f172a]/30 to-transparent"></div>
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 pt-6 transition-all bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-95 hover:bg-white/20 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex gap-2">
                    <button onClick={() => { if (confirm("Delete this book?")) onDelete(); }} className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-red-100 border border-white/10 active:scale-95 hover:bg-red-500/20 transition-all">
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full min-h-screen pt-24 px-5 flex flex-col items-center pb-32">
                <div className="w-full flex flex-col items-center mb-8 animate-fade-in-up">
                    {/* Cover - Click to Lightbox */}
                    <div className="relative w-44 md:w-56 aspect-[2/3] mb-6 group perspective-1000 cursor-pointer" onClick={() => setShowCoverLightbox(true)}>
                        <div className="absolute inset-0 bg-white/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 dark:opacity-100"></div>
                        <img alt="Book Cover" className="relative w-full h-full object-cover rounded-lg shadow-2xl transform group-hover:scale-[1.03] transition-transform duration-500 ring-1 ring-white/10" src={book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=400"} />
                        {book.isFirstEdition && (
                            <div className="absolute -top-3 -right-3 z-20">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute animate-ping inline-flex h-full w-full rounded-full bg-amber-400 opacity-20"></div>
                                    <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-amber-300/30 flex items-center gap-1 backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-[12px] fill-1">verified</span>
                                        <span>1st Ed.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {showCoverLightbox && (
                        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in p-4" onClick={(e) => { e.stopPropagation(); setShowCoverLightbox(false); }}>
                            <img src={book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=800"} className="max-w-full max-h-full rounded-lg shadow-2xl animate-scale-in" />
                            <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}

                    {showQRCode && (
                        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in p-4" onClick={(e) => { e.stopPropagation(); setShowQRCode(false); }}>
                            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-scale-in max-w-sm w-full relative">
                                <button onClick={() => setShowQRCode(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <span className="material-symbols-outlined text-gray-500">close</span>
                                </button>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Book QR Code</h3>
                                <p className="text-sm text-gray-500 mb-6 text-center">Scan to view details on another device</p>
                                <div className="bg-white p-2 rounded-xl border-4 border-gray-100">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({ id: book.id, isbn: book.isbn, title: book.title }))}`}
                                        alt="QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="mt-4 text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-500">{book.isbn}</p>
                            </div>
                        </div>
                    )}

                    {/* Title & Author */}
                    <div className="text-center space-y-2 mb-4 max-w-sm">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-lg">{book.title}</h1>
                        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium drop-shadow-md">{book.author}</p>
                    </div>

                    {/* Pills */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            {book.publishedDate ? new Date(book.publishedDate).getFullYear() : "Unknown"}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-sm">
                            <span className="material-symbols-outlined text-[14px]">category</span>
                            {book.genres?.[0] || "General"}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-sm">
                            <span className="material-symbols-outlined text-[14px] text-amber-400 fill-1">star</span>
                            4.8
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="flex items-center justify-center gap-3 w-full max-w-md">
                        <button onClick={() => onToggleRead(book.id)} className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl ${isRead ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-white text-slate-900'} hover:opacity-90 font-bold text-sm shadow-xl transition-all active:scale-95`}>
                            <span className="material-symbols-outlined text-[22px]">{isRead ? 'check_circle' : 'circle'}</span>
                            <span>{isRead ? 'Read' : 'Mark Read'}</span>
                        </button>
                        <button onClick={onLoan} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10 font-bold text-sm shadow-xl transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[22px]">bookmark_add</span>
                            <span>Loan</span>
                        </button>
                        {(book.fileUrl || book.fileType) && (
                            <button onClick={onOpenReader} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-indigo-500 text-white font-bold text-sm shadow-xl transition-all active:scale-95">
                                <span className="material-symbols-outlined text-[22px]">menu_book</span>
                                <span>Reader</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Details Cards */}
                <div className="w-full max-w-2xl space-y-6">
                    {/* Synopsis */}
                    {book.summary && (
                        <div className="relative bg-white/50 dark:bg-[#020617]/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-100 dark:border-white/5 cursor-pointer" onClick={() => setSynopsisExpanded(!synopsisExpanded)}>
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                                Synopsis
                            </h3>
                            <div className="relative group">
                                <p className={`text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${!synopsisExpanded ? 'line-clamp-3' : ''} transition-all duration-300`}>
                                    {book.summary}
                                </p>
                                {!synopsisExpanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-[#131829] to-transparent flex items-end justify-center pointer-events-none">
                                        <span className="text-[10px] text-primary font-bold bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-sm mb-1">Tap to read more</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Media Adaptations / YouTube Trailers */}
                    {book.mediaAdaptations && book.mediaAdaptations.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">movie</span>
                                Media Adaptations
                            </h3>
                            {book.mediaAdaptations.map((adaptation, index) => {
                                const getYouTubeEmbedUrl = (link?: string) => {
                                    if (!link) return null;
                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                    const match = link.match(regExp);
                                    const videoId = (match && match[2].length === 11) ? match[2] : link;
                                    return `https://www.youtube-nocookie.com/embed/${videoId}`;
                                };

                                const embedUrl = getYouTubeEmbedUrl(adaptation.youtubeLink);

                                return (
                                    <div key={index} className="p-4 rounded-2xl bg-white/50 dark:bg-[#020617]/50 backdrop-blur-sm border border-gray-100 dark:border-white/5">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                                <span className="material-symbols-outlined text-lg">
                                                    {adaptation.type === 'Movie' ? 'movie' : adaptation.type === 'TV Series' ? 'tv' : 'theaters'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{adaptation.title}</h4>
                                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{adaptation.type}</p>
                                            </div>
                                        </div>
                                        {adaptation.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{adaptation.description}</p>
                                        )}
                                        {embedUrl && (
                                            <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden bg-black">
                                                <iframe
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    src={embedUrl}
                                                    title={adaptation.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Reading Status Card - if someone is reading */}
                    {users.map(u => {
                        const history = u.history.find(h => h.bookId === book.id);
                        if (!history) return null;
                        const progress = history.status === ReadStatus.COMPLETED ? 100 : 45;
                        return (
                            <div key={u.id} className="flex items-center p-3 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="relative mr-4 bg-gray-200 rounded-full">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed || u.name}`} className="size-12 rounded-full" />
                                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ring-2 ring-white dark:ring-[#1e293b] flex items-center justify-center ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`}>
                                        <span className="material-symbols-outlined text-[12px] text-white">{progress === 100 ? 'check' : 'menu_book'}</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</span>
                                        {progress === 100 ? (
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center bg-green-500/10 px-2 py-1 rounded-full text-[10px] font-bold text-green-600 dark:text-green-400 border border-green-500/20">FINISHED</span>
                                                {history.readCount && history.readCount > 1 && (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">x{history.readCount}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{progress}%</span>
                                        )}
                                    </div>
                                    {progress < 100 && (
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-1.5">
                                            <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                                        <span>{progress === 100 ? `Finished ${new Date(history.dateFinished!).toLocaleDateString()}` : 'Currently Reading'}</span>
                                        {u.id === currentUser.id && (
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); onResetHistory(book.id, 'undo'); }} className="hover:text-primary transition-colors font-bold uppercase tracking-tighter">Undo</button>
                                                <button onClick={(e) => { e.stopPropagation(); onResetHistory(book.id, 'reset'); }} className="hover:text-red-500 transition-colors font-bold uppercase tracking-tighter">Reset</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}


                    {/* Location & Value Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-[#1e293b] border border-indigo-100 dark:border-indigo-500/20 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-4 opacity-10 pointer-events-none">
                                <span className="material-symbols-outlined text-6xl text-indigo-500">map</span>
                            </div>
                            <div className="flex items-start gap-3 relative z-10">
                                <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 shrink-0">
                                    <span className="material-symbols-outlined">location_on</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Physical Location</p>
                                    <div className="flex flex-wrap items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                                        {getLocationName(book.locationId || '').split('>').map((part, i, arr) => (
                                            <React.Fragment key={i}>
                                                <span>{part.trim()}</span>
                                                {i < arr.length - 1 && <span className="material-symbols-outlined text-[14px] text-gray-400">chevron_right</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Value Card */}
                        {showValue && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <span className="material-symbols-outlined text-xl">payments</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-[12px]">trending_up</span>
                                        20%
                                    </span>
                                </div>
                                <p className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Est. Value</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white animate-fade-in-up">{formatCurrency(book.estimatedValue || book.purchasePrice || 0)}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Paid: {formatCurrency(book.purchasePrice || 0)}</p>
                            </div>
                        )}

                        <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <span className="material-symbols-outlined text-xl">history_edu</span>
                                </div>
                            </div>
                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Collector Details</p>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span> {book.condition || "Good"}
                                </span>
                                {book.isSigned && <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span> Signed Copy
                                </span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-6"></div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 rounded-full bg-slate-900/90 dark:bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up delay-100">
                <button onClick={() => {
                    if (navigator.share) {
                        navigator.share({ title: book.title, text: `Check out ${book.title}`, url: window.location.href });
                    } else {
                        alert("Sharing not supported on this browser");
                    }
                }} className="size-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
                <div className="w-px h-4 bg-white/20 mx-1"></div>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 h-10 rounded-full bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span>Edit</span>
                </button>
                <div className="w-px h-4 bg-white/20 mx-1"></div>
                <button onClick={() => setShowQRCode(true)} className="size-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </button>
            </div>
        </div>
    );
};