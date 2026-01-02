import React from 'react';
import { AppState, Book, Loan, ReadStatus } from '../types';
import { formatCurrency } from '../services/storageService';

interface MaintenanceProps {
    state: AppState;
    onBack: () => void;
    onSelectBook: (book: Book) => void;
    onManageLocations: () => void;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ state, onBack, onSelectBook, onManageLocations }) => {
    const { books, loans, users } = state;

    // 1. Books with no location
    const unlocatedBooks = books.filter(b => !b.locationId);

    // 2. Overdue loans (> 30 days)
    const overdueLoans = loans.filter(l => !l.returnDate && new Date(l.loanDate).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 3. Damaged books
    const damagedBooks = books.filter(b => b.condition === 'Damaged');

    return (
        <div className="bg-[#0a0c10] min-h-screen text-white font-display flex flex-col">
            <div className="sticky top-0 z-20 bg-[#0a0c10]/95 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-16">
                    <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all active:scale-95">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-black tracking-[0.2em] uppercase">Maintenance Hub</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">
                            {unlocatedBooks.length + overdueLoans.length + damagedBooks.length} Tasks Pending
                        </p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 pb-32">
                {/* Overdue Loans */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">alarm_on</span>
                        Overdue Loans ({overdueLoans.length})
                    </h3>
                    <div className="space-y-3">
                        {overdueLoans.length === 0 ? (
                            <div className="bg-white/5 rounded-2xl p-4 border border-dashed border-white/10 text-center">
                                <p className="text-xs text-gray-500 font-bold uppercase">All loans are up to date</p>
                            </div>
                        ) : overdueLoans.map(loan => {
                            const book = books.find(b => b.id === loan.bookId);
                            const user = users.find(u => u.id === loan.userId);
                            return (
                                <div key={loan.id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-14 bg-slate-800 rounded-lg overflow-hidden border border-white/5">
                                            {book?.coverUrl && <img src={book.coverUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold truncate max-w-[150px]">{book?.title || 'Unknown'}</p>
                                            <p className="text-[10px] text-red-400 font-bold uppercase">with {user?.name || 'Guest'}</p>
                                        </div>
                                    </div>
                                    <button className="h-9 px-4 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
                                        Recall
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Missing Locations */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_off</span>
                        Unassigned Books ({unlocatedBooks.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {unlocatedBooks.length === 0 ? (
                            <div className="col-span-2 bg-white/5 rounded-2xl p-4 border border-dashed border-white/10 text-center">
                                <p className="text-xs text-gray-500 font-bold uppercase">Every book has a home</p>
                            </div>
                        ) : unlocatedBooks.map(book => (
                            <div key={book.id} onClick={() => onSelectBook(book)} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 cursor-pointer hover:bg-white/[0.08] transition-all">
                                <div className="h-24 w-full bg-slate-800 rounded-lg overflow-hidden border border-white/5">
                                    {book.coverUrl && <img src={book.coverUrl} className="w-full h-full object-cover" />}
                                </div>
                                <p className="text-[10px] font-bold text-center truncate">{book.title}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Damaged Report */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">build</span>
                        Maintenance Required ({damagedBooks.length})
                    </h3>
                    <div className="space-y-3">
                        {damagedBooks.length === 0 ? (
                            <div className="bg-white/5 rounded-2xl p-4 border border-dashed border-white/10 text-center">
                                <p className="text-xs text-gray-500 font-bold uppercase">No damage reports</p>
                            </div>
                        ) : damagedBooks.map(book => (
                            <div key={book.id} className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{book.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Marked as Damaged</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onSelectBook(book)}
                                    className="size-9 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="bg-gradient-to-tr from-primary/10 to-indigo-500/10 border border-primary/20 rounded-3xl p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-primary mb-3">analytics</span>
                    <h3 className="text-lg font-bold">Library Health: <span className="text-green-500">Good</span></h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 mb-6">{((books.length - unlocatedBooks.length) / books.length * 100).toFixed(0)}% Organized • {((books.length - damagedBooks.length) / books.length * 100).toFixed(0)}% Mint Condition</p>
                    <button
                        onClick={onManageLocations}
                        className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        Manage Locations
                    </button>
                </div>        </div>
        </div>
        </div >
    );
};
