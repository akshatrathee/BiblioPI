import React from 'react';
import { AppState, ReadStatus } from '../types';
import { formatCurrency } from '../services/storageService';

interface AnalyticsProps {
    state: AppState;
    onBack: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ state, onBack }) => {
    const { books, users, loans } = state;

    // 1. Books by Genre
    const genreData: Record<string, number> = {};
    books.forEach(b => {
        b.genres.forEach(g => {
            genreData[g] = (genreData[g] || 0) + 1;
        });
    });
    const sortedGenres = Object.entries(genreData).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // 2. Reading Activity (Recent Months)
    // For demo, we'll just mock current trends based on history
    const totalRead = users.reduce((acc, u) => acc + u.history.filter(h => h.status === ReadStatus.COMPLETED).length, 0);

    // 3. Asset Distribution
    const totalValue = books.reduce((acc, b) => acc + (b.estimatedValue || b.purchasePrice || 0), 0);
    const avgValue = books.length > 0 ? totalValue / books.length : 0;

    return (
        <div className="bg-[#0f172a] min-h-screen text-white font-display flex flex-col pb-32 animate-fade-in">
            <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Library Analytics</h1>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
                {/* Intro Pill */}
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4 animate-fade-in-up">
                    <span className="material-symbols-outlined text-primary">insights</span>
                    <p className="text-xs font-medium text-slate-300 leading-relaxed">
                        Track your family's reading progress and library value in real-time. Use these insights to optimize your future book purchases.
                    </p>
                </div>

                {/* Global Stats Overview */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Assets</p>
                        <p className="text-2xl font-black text-white">{formatCurrency(totalValue)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Avg. Value</p>
                        <p className="text-2xl font-black text-white">{formatCurrency(avgValue)}</p>
                    </div>
                </div>

                {/* Genre Distribution (Bar Chart) */}
                <section className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary ml-1">Genre Distribution</h2>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                        {sortedGenres.map(([genre, count]) => {
                            const percentage = Math.round((count / books.length) * 100);
                            return (
                                <div key={genre} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span>{genre}</span>
                                        <span className="text-slate-500 tracking-normal">{count} Books ({percentage}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Family Contribution (Pie Chart Representation) */}
                <section className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary ml-1">Family Shares</h2>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center gap-6">
                            <div className="size-24 rounded-full border-[8px] border-primary flex items-center justify-center relative">
                                <span className="text-xl font-black">{users.length}</span>
                                <div className="absolute inset-0 border-[8px] border-indigo-500 rounded-full clip-path-half rotate-45"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                                {users.slice(0, 3).map(u => {
                                    const uBooks = books.filter(b => b.addedByUserId === u.id).length;
                                    const share = books.length > 0 ? Math.round((uBooks / books.length) * 100) : 0;
                                    return (
                                        <div key={u.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-primary"></div>
                                                <span className="text-xs font-bold text-slate-300">{u.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500">{share}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Loan Status */}
                <section className="bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-white">Loan Efficiency</h3>
                        <p className="text-xs text-slate-400 font-medium">Tracking returns & circulation</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-primary">{loans.filter(l => l.returnDate).length}/{loans.length}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Returned</p>
                    </div>
                </section>
            </div>
        </div>
    );
};
