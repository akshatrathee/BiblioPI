import React, { useState } from 'react';
import { Book, Loan, User } from '../types';

interface NotificationHubProps {
    loans: Loan[];
    books: Book[];
    users: User[];
    onAction: (target: 'maintenance' | 'loans') => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({ loans, books, users, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);

    const overdueCount = loans.filter(l => !l.returnDate && new Date(l.loanDate).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000).length;
    const unassignedCount = books.filter(b => !b.locationId).length;
    const totalNotifications = overdueCount + unassignedCount;

    if (totalNotifications === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
                <span className="material-symbols-outlined text-white">notifications</span>
                <span className="absolute top-0 right-0 size-4 bg-red-500 rounded-full border-2 border-[#05070a] text-[10px] font-black flex items-center justify-center text-white">
                    {totalNotifications}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-12 right-0 w-72 bg-[#131829] border border-white/10 rounded-[2rem] shadow-2xl z-50 p-4 animate-scale-in origin-top-right">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Notifications</h3>
                            <span className="text-[10px] font-bold text-primary">{totalNotifications} Active</span>
                        </div>

                        <div className="space-y-2">
                            {overdueCount > 0 && (
                                <button
                                    onClick={() => { onAction('loans'); setIsOpen(false); }}
                                    className="w-full text-left p-3 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-sm">priority_high</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">Overdue Loans</p>
                                            <p className="text-[10px] text-red-400 font-medium">{overdueCount} items require return</p>
                                        </div>
                                    </div>
                                </button>
                            )}

                            {unassignedCount > 0 && (
                                <button
                                    onClick={() => { onAction('maintenance'); setIsOpen(false); }}
                                    className="w-full text-left p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">Unplaced Books</p>
                                            <p className="text-[10px] text-amber-400 font-medium">{unassignedCount} items need locations</p>
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
