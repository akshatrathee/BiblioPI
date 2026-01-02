import React from 'react';
import { AppState, ReadStatus, Book } from '../types';
import { formatCurrency } from '../services/storageService';

interface DashboardProps {
  state: AppState;
  onProfile: () => void;
  onNotifications: () => void;
  onSelectBook: (book: Book) => void;
  onSeeAll: () => void;
  onBuyNext: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onProfile, onNotifications, onSelectBook, onSeeAll, onBuyNext }) => {
  const { books, users, loans, currentUser } = state;
  const activeUser = users.find(u => u.id === currentUser) || users[0];

  // Filter books by age for child safety
  const visibleBooks = books.filter(b => !activeUser.age || !b.minAge || b.minAge <= activeUser.age);

  const totalValue = visibleBooks.reduce((sum, b) => sum + (b.purchasePrice || b.estimatedValue || 0), 0);
  const totalRead = visibleBooks.filter(b => activeUser.history.some(h => h.bookId === b.id && h.status === ReadStatus.COMPLETED)).length;
  const readPercentage = visibleBooks.length > 0 ? Math.round((totalRead / visibleBooks.length) * 100) : 0;

  const overdueLoans = loans.filter(l => !l.returnDate && new Date(l.loanDate).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Placeholder recommendations (age filtered)
  const recommendations = visibleBooks.filter(b => activeUser.history.every(h => h.bookId !== b.id)).slice(0, 5);

  const recentlyAdded = [...books]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 5);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col pb-32 animate-fade-in relative">
      <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between px-5 h-20">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">BiblioPi</h1>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Digital Library</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onNotifications} className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-card border border-gray-100 dark:border-white/10 shadow-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-all active:scale-95">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {overdueLoans.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-card"></span>
              )}
            </button>
            <button onClick={onProfile} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 border border-primary/20 overflow-hidden active:scale-95 transition-all">
              {activeUser.avatarSeed ? (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.avatarSeed}`} alt={activeUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold">{activeUser.name.charAt(0)}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-4 space-y-8">
        <section className="px-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Collection Status</p>
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white">{visibleBooks.length}</h2>
                    <p className="text-white/80 text-xs font-bold mt-1">Total Books Available</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl px-3 py-1 flex items-center gap-1 text-[10px] font-black text-white uppercase border border-white/20">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> Localised
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${readPercentage}%` }}></div>
                  </div>
                </div>
                <p className="text-[10px] text-white/60 mt-2 font-black uppercase tracking-widest">{readPercentage}% Read & Mastered</p>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-card rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-all hover:translate-y-[-2px]">
              <div className="size-10 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4 border border-green-500/20">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{formatCurrency(totalValue)}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Asset Value</p>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-card rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between group hover:border-orange-500/30 transition-all hover:translate-y-[-2px]">
              <div className="size-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 border border-orange-500/20">
                <span className="material-symbols-outlined text-[20px]">emoji_events</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white truncate uppercase tracking-tighter">{activeUser.name}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Family Hero</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="px-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Read Next
              <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text text-xs font-extrabold uppercase tracking-wide border border-primary/30 rounded px-1.5 py-0.5">AI</span>
            </h3>
          </div>
          <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x">
            {recommendations.map((rec, i) => (
              <div key={rec.id} onClick={() => onSelectBook(rec)} className="snap-start flex-none w-[280px] bg-surface-card rounded-2xl overflow-hidden border border-white/5 relative group shadow-xl cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                <div className="h-[180px] w-full bg-cover bg-top transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${rec.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=400"}')` }}></div>
                <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">{i === 0 ? '98% Match' : 'Suggested'}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white leading-tight mb-0.5 line-clamp-1">{rec.title}</h4>
                  <p className="text-gray-300 text-xs mb-3 truncate">{rec.author}</p>
                  <p className="text-gray-400 text-[10px] line-clamp-2 italic mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    "Based on your recent library additions and genres..."
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-100 transition">
                      <span className="material-symbols-outlined text-sm">play_arrow</span> Read
                    </button>
                    <button className="bg-white/10 text-white p-2 rounded-lg backdrop-blur-md hover:bg-white/20 transition">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div
              onClick={onBuyNext}
              className="snap-start flex-none w-[180px] bg-primary/10 rounded-2xl border border-primary/20 flex flex-col items-center justify-center gap-3 p-4 cursor-pointer hover:bg-primary/20 transition-all group"
            >
              <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[30px]">shopping_cart</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white uppercase tracking-tight">Buy Next</p>
                <p className="text-[10px] text-primary font-bold">Recommended</p>
              </div>
            </div>
          </div>
        </section>

        {overdueLoans.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="px-5 flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overdue Loans</h3>
              <div className="size-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">{overdueLoans.length}</div>
            </div>
            <div className="flex overflow-x-auto gap-3 px-5 pb-4 no-scrollbar snap-x">
              {overdueLoans.map(loan => (
                <div key={loan.id} className="snap-start flex-none w-[260px] bg-surface-card rounded-xl p-3 border border-red-500/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none"></div>
                  <div className="flex gap-3 relative z-10">
                    <div className="w-16 h-24 rounded-lg bg-cover bg-center shadow-md shrink-0 bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-500">book</span>
                    </div>
                    <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                      <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Overdue</p>
                        <h4 className="text-sm font-bold text-white truncate leading-tight mb-0.5">{books.find(b => b.id === loan.bookId)?.title || "Unknown Book"}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="size-4 rounded-full bg-gray-600 flex items-center justify-center text-[8px]">{loan.borrowerName.charAt(0)}</div>
                          <p className="text-xs text-gray-400 truncate">{loan.borrowerName}</p>
                        </div>
                      </div>
                      <button className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-md self-start transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">notifications</span> Remind
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="px-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Added</h3>
            <button
              onClick={onSeeAll}
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider"
            >
              See All
            </button>
          </div>
          <div className="flex overflow-x-auto gap-4 px-5 pb-10 no-scrollbar snap-x">
            {recentlyAdded.map(book => (
              <div key={book.id} onClick={() => onSelectBook(book)} className="snap-start flex-none w-[120px] flex flex-col gap-2 group cursor-pointer active:scale-95 transition-transform">
                <div className="w-full aspect-[2/3] rounded-xl bg-surface-highlight overflow-hidden shadow-lg relative border border-white/5">
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url('${book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=200"}')` }}></div>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{book.title}</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
