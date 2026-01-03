import React, { useState, useEffect } from 'react';
import { Book } from '../types';

interface DigitalReaderProps {
    book: Book;
    onClose: () => void;
    onProgressUpdate?: (page: number) => void;
}

export const DigitalReader: React.FC<DigitalReaderProps> = ({ book, onClose, onProgressUpdate }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'single' | 'double'>('single');
    const [fontSize, setFontSize] = useState(16);
    const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');

    const totalPages = book.totalPages || 300; // Simulated

    useEffect(() => {
        // Track progress when page changes
        onProgressUpdate?.(currentPage);
    }, [currentPage]);

    const themes = {
        light: "bg-[#ffffff] text-[#1a1a1a]",
        sepia: "bg-[#f4ecd8] text-[#5b4636]",
        dark: "bg-[#1a1a1a] text-[#d1d1d1]"
    };

    return (
        <div className={`fixed inset-0 z-[120] flex flex-col ${themes[theme]} animate-fade-in`}>
            {/* Immersive Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-black/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-sm font-black truncate max-w-[200px]">{book.title}</h2>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{book.author}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setTheme('light')} className={`size-6 rounded-full bg-white border ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}></button>
                    <button onClick={() => setTheme('sepia')} className={`size-6 rounded-full bg-[#f4ecd8] border ${theme === 'sepia' ? 'ring-2 ring-primary' : ''}`}></button>
                    <button onClick={() => setTheme('dark')} className={`size-6 rounded-full bg-[#1a1a1a] border ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}></button>
                    <div className="w-px h-6 bg-black/10 mx-2"></div>
                    <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 hover:bg-black/5"><span className="material-symbols-outlined text-sm">text_decrease</span></button>
                    <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-2 hover:bg-black/5"><span className="material-symbols-outlined text-sm">text_increase</span></button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto no-scrollbar p-8 flex justify-center">
                <div
                    className={`w-full max-w-3xl leading-relaxed space-y-6 transition-all duration-300`}
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {book.fileType === 'pdf' && book.fileUrl ? (
                        <iframe
                            src={`${book.fileUrl}#page=${currentPage}`}
                            className="w-full h-full min-h-[80vh] rounded-xl shadow-2xl border-none"
                            title="PDF Reader"
                        />
                    ) : (
                        <div className="space-y-8 animate-fade-in-up">
                            <h1 className="text-4xl font-serif font-black mb-12">Chapter {Math.floor(currentPage / 10) + 1}</h1>
                            <p>
                                In the heart of the library, where the dust motes danced in the shafts of golden light, Ishani found the old tome. It was bound in leather as dark as a moonless night, with silver etchings that seemed to shimmer as she approached.
                            </p>
                            <p>
                                The air grew cool around her. This wasn't just a book; it was a portal. BiblioPi had whispered about this specific spine—the one that had been lost between dimensions for centuries.
                            </p>
                            <p>
                                {book.summary || "As the pages turned, the familiar world of the living room began to fade. The soft hum of the humidifier was replaced by the distant roar of a prehistoric ocean. She felt a tingle in her fingertips. The AI hadn't just indexed this book; it had prepared her for the knowledge within."}
                            </p>
                            <div className="py-20 text-center opacity-20">
                                <span className="material-symbols-outlined text-4xl">auto_stories</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Navigation Footer */}
            <footer className="h-20 border-t border-black/5 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_left</span> Previous
                    </button>
                    <div className="h-1.5 w-48 bg-black/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(currentPage / totalPages) * 100}%` }}
                        ></div>
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        Next <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>

                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    Page {currentPage} of {totalPages} ({Math.round((currentPage / totalPages) * 100)}%)
                </div>
            </footer>
        </div>
    );
};
