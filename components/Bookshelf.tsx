import React, { useState } from 'react';
import { Book, AppState } from '../types';

interface BookshelfProps {
    books: Book[];
    onBack: () => void;
    onSelectBook: (book: Book) => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ books, onBack, onSelectBook }) => {
    const [selectedShelf, setSelectedShelf] = useState<string | null>(null);

    // Group books by genres for shelves
    const genres = Array.from(new Set(books.flatMap(b => b.genres))).slice(0, 5);

    return (
        <div className="bg-[#1a1412] min-h-screen text-white font-display flex flex-col pb-32 overflow-hidden">
            {/* Wooden Header */}
            <div className="bg-[#2D1F1A] border-b-4 border-[#1a1412] px-4 h-20 flex items-center justify-between shadow-2xl relative z-10">
                <button onClick={onBack} className="size-12 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-all active:scale-95">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-[#D4A373] tracking-[0.3em] uppercase drop-shadow-lg">Grand Library</h1>
                    <p className="text-[10px] text-[#A98467] font-bold uppercase tracking-widest">{books.length} Volumes</p>
                </div>
                <div className="size-12"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-12 no-scrollbar relative">
                {/* Wood Texture Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>

                {genres.map(genre => {
                    const shelfBooks = books.filter(b => b.genres.includes(genre)).slice(0, 12);
                    if (shelfBooks.length === 0) return null;

                    return (
                        <div key={genre} className="relative group">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A98467] mb-2 ml-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">auto_stories</span>
                                {genre} Collection
                            </h3>

                            {/* The Shelf */}
                            <div className="relative pt-8 pb-2 px-4 bg-gradient-to-b from-[#3D2B1F] to-[#2D1F1A] rounded-lg shadow-2xl border-b-[12px] border-[#1a1412]">
                                <div className="flex items-end gap-1 min-h-[140px] overflow-x-auto no-scrollbar snap-x">
                                    {shelfBooks.map((book, idx) => (
                                        <div
                                            key={book.id}
                                            onClick={() => onSelectBook(book)}
                                            className="relative flex-none w-8 group/book cursor-pointer transition-all duration-300 hover:z-20 hover:-translate-y-4 snap-center origin-bottom"
                                            style={{
                                                height: `${100 + (idx % 4) * 10}px`,
                                                backgroundColor: `hsl(${(idx * 45) % 360}, 40%, 30%)`,
                                                borderRight: '1px solid rgba(0,0,0,0.3)',
                                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            {/* Spine Title */}
                                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                                <div className="rotate-90 whitespace-nowrap text-[10px] font-bold text-white/80 tracking-tighter w-[120px] text-center px-2 truncate leading-none">
                                                    {book.title}
                                                </div>
                                            </div>
                                            {/* Hover Detail Card */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-3 bg-slate-900 rounded-xl border border-white/10 opacity-0 group-hover/book:opacity-100 transition-all pointer-events-none shadow-2xl z-30 scale-90 group-hover/book:scale-100">
                                                <img src={book.coverUrl} className="w-full h-48 object-cover rounded-lg mb-2" />
                                                <p className="text-[10px] font-bold truncate">{book.title}</p>
                                                <p className="text-[8px] text-primary font-bold uppercase">{book.author}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Shelf Shadow */}
                                <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/40 blur-sm"></div>
                            </div>
                        </div>
                    );
                })}

                {books.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">shelves</span>
                        <p className="text-lg font-bold">The Shelf is Empty</p>
                        <p className="text-sm">Scan some books to fill it up</p>
                    </div>
                )}
            </div>
        </div>
    );
};
