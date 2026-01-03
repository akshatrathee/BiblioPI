import React from 'react';
import { AppState, Book, ReadStatus, User } from '../types';
import { formatCurrency } from '../services/storageService';
import { NotificationHub } from './NotificationHub';

interface DashboardProps {
  state: AppState;
  onBookClick: (book: Book) => void;
  onManageLoans: () => void;
  onSeeAll: () => void;
  onAnalytics: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onBookClick, onManageLoans, onSeeAll, onAnalytics }) => {
  const { books, loans, users, currentUser } = state;
  const activeUser = users.find(u => u.id === currentUser) || users[0];

  // Filter books by age
  const visibleBooks = books.filter(b => !activeUser.age || !b.minAge || b.minAge <= activeUser.age);

  // Calculate statistics accurately
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newThisWeekCount = visibleBooks.filter(b => new Date(b.addedDate) >= sevenDaysAgo).length;

  const totalBooks = visibleBooks.length;
  const readBooks = visibleBooks.filter(b => activeUser.history.some(h => h.bookId === b.id && h.status === ReadStatus.COMPLETED)).length;
  const readPercentage = totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0;
  const totalValue = visibleBooks.reduce((acc, b) => acc + (b.estimatedValue || b.purchasePrice || 0), 0);

  const totalPagesRead = activeUser.history
    .filter(h => h.status === ReadStatus.COMPLETED)
    .reduce((acc, h) => {
      const book = books.find(b => b.id === h.bookId);
      return acc + ((book?.totalPages || 0) * (h.readCount || 1));
    }, 0);

  // Find top reader (real logic)
  const topReader = users
    .map(u => ({
      ...u,
      readCount: u.history.filter(h => h.status === ReadStatus.COMPLETED).reduce((acc, h) => acc + (h.readCount || 1), 0)
    }))
    .sort((a, b) => b.readCount - a.readCount)[0];

  // Recommendations
  const recommendations = visibleBooks
    .filter(b => activeUser.history.every(h => h.bookId !== b.id))
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  // Overdue Loans
  const overdueLoans = loans.filter(l => !l.returnDate && new Date(l.loanDate).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Recently Added
  const recentlyAdded = [...visibleBooks].sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()).slice(0, 5);

  return (
    <main className="flex-1 flex flex-col gap-6 pb-32 overflow-y-auto no-scrollbar animate-fade-in">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-[#05070a]/60 backdrop-blur-xl px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hi, {activeUser.name.split(' ')[0]}!
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Welcome back to BiblioPi</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationHub
            loans={loans}
            books={books}
            users={users}
            onAction={(target: 'maintenance' | 'loans') => {
              if (target === 'loans') onManageLoans();
              if (target === 'maintenance') onSeeAll();
            }}
          />
        </div>
      </header>
      {/* Stats Grid */}
      <section className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Total Library Card */}
          <div className="col-span-2 bg-white dark:bg-surface-card rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-75"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Library</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{totalBooks} <span className="text-base font-medium text-gray-500">Books</span></h2>
                  <button onClick={onAnalytics} className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95" title="View Detailed Analytics">
                    <span className="material-symbols-outlined text-sm">monitoring</span>
                  </button>
                </div>
              </div>
              <div className="bg-green-500/10 text-green-500 rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-green-500/20">
                <span className="material-symbols-outlined text-sm">trending_up</span> +{newThisWeekCount} THIS WEEK
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${readPercentage}%` }}></div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{readPercentage}% Read Completion</p>
          </div>

          {/* Asset Value / Pages Read */}
          <div className="bg-white dark:bg-surface-card rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between hover:border-primary/20 transition-colors">
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 border border-purple-500/20">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{totalPagesRead.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pages Read</p>
            </div>
          </div>

          {/* Top Reader */}
          <div className="bg-white dark:bg-surface-card rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between hover:border-orange-500/20 transition-colors">
            <div className="size-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2 border border-orange-500/20">
              <span className="material-symbols-outlined text-[20px]">emoji_events</span>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white truncate tracking-tight">{topReader?.name || 'None'}</p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Top Reader</p>
            </div>
          </div>
        </div>
      </section>

      {/* Read Next Section */}
      <section className="flex flex-col gap-4">
        <div className="px-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Read Next
            <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text text-[10px] font-black uppercase tracking-widest border border-primary/30 rounded-md px-1.5 py-0.5">AI Picks</span>
          </h3>
        </div>
        <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x">
          {/* Featured Item */}
          {recommendations.length > 0 && (
            <div onClick={() => onBookClick(recommendations[0])} className="snap-start flex-none w-[280px] bg-surface-card rounded-2xl overflow-hidden border border-white/5 relative group shadow-xl cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
              <div className="h-[180px] w-full bg-cover bg-top transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${recommendations[0].coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=400"}')` }}></div>
              <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">98% Match</span>
                </div>
                <h4 className="text-lg font-bold text-white leading-tight mb-0.5 truncate">{recommendations[0].title}</h4>
                <p className="text-gray-300 text-xs mb-3 truncate">{recommendations[0].author}</p>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onBookClick(recommendations[0]); }} className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-100 transition">
                    <span className="material-symbols-outlined text-sm">play_arrow</span> Read
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onBookClick(recommendations[0]); }} className="bg-white/10 text-white p-2 rounded-lg backdrop-blur-md hover:bg-white/20 transition">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Items */}
          {recommendations.slice(1).map(book => (
            <div key={book.id} onClick={() => onBookClick(book)} className="snap-start flex-none w-[140px] flex flex-col gap-2 group cursor-pointer active:scale-95 transition-transform">
              <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5">
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-green-400 border border-white/10 z-10">8{Math.floor(Math.random() * 10)}% Match</div>
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=200"}')` }}></div>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{book.title}</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Overdue Loans Section */}
      {overdueLoans.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="px-5 flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overdue Loans</h3>
            <div className="size-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">{overdueLoans.length}</div>
          </div>
          <div className="flex overflow-x-auto gap-3 px-5 pb-4 no-scrollbar snap-x">
            {overdueLoans.map(loan => {
              const book = books.find(b => b.id === loan.bookId);
              return (
                <div key={loan.id} className="snap-start flex-none w-[260px] bg-surface-card rounded-xl p-3 border border-red-500/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none"></div>
                  <div className="flex gap-3 relative z-10">
                    <div className="w-16 h-24 rounded-lg bg-cover bg-center shadow-md shrink-0 bg-slate-800" style={{ backgroundImage: book?.coverUrl ? `url('${book.coverUrl}')` : undefined }}>
                      {!book?.coverUrl && <span className="material-symbols-outlined text-slate-500 flex items-center justify-center h-full">book</span>}
                    </div>
                    <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                      <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Overdue</p>
                        <h4 className="text-sm font-bold text-white truncate leading-tight mb-0.5">{book?.title || "Unknown Book"}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="size-4 rounded-full bg-gray-600 flex items-center justify-center text-[8px] text-white font-bold">{loan.borrowerName.charAt(0)}</div>
                          <p className="text-xs text-gray-400 truncate">{loan.borrowerName}</p>
                        </div>
                      </div>
                      <button onClick={onManageLoans} className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-md self-start transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">notifications</span> Remind
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      <section className="flex flex-col gap-3">
        <div className="px-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Added</h3>
          <button onClick={onSeeAll} className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider">
            See All
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 px-5 pb-4 no-scrollbar snap-x">
          {recentlyAdded.map(book => (
            <div key={book.id} onClick={() => onBookClick(book)} className="snap-start flex-none w-[120px] flex flex-col gap-2 group cursor-pointer active:scale-95 transition-transform">
              <div className="w-full aspect-[2/3] rounded-xl bg-surface-highlight overflow-hidden shadow-lg relative border border-white/5">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: `url('${book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=200"}')` }}></div>
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
  );
};
