import React, { useState } from 'react';
import { AppState, Book, ReadStatus } from '../types';
import { formatCurrency } from '../services/storageService';

interface LibraryProps {
  state: AppState;
  onSelectBook: (b: Book) => void;
  onScan: () => void;
  onProfile: () => void;
  initialTab?: 'all' | 'unread' | 'favorites' | 'recent';
}

export const Library: React.FC<LibraryProps> = ({ state, onSelectBook, onScan, onProfile, initialTab = 'all' }) => {
  const { books, currentUser, users } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'favorites' | 'recent'>(initialTab);
  const [visibleCount, setVisibleCount] = useState(10);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const activeUser = users.find(u => u.id === currentUser) || users[0];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'unread' && !activeUser.history.find(h => h.bookId === b.id && h.status === ReadStatus.COMPLETED)) ||
      (activeTab === 'favorites' && activeUser.favorites.includes(b.id));

    // Age Gating
    const matchesAge = !activeUser.age || !b.minAge || b.minAge <= activeUser.age;

    return matchesSearch && matchesTab && matchesAge;
  });

  const sortedBooks = activeTab === 'recent'
    ? [...filteredBooks].sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    : filteredBooks;

  return (
    <div className="relative flex h-full w-full flex-col bg-gray-50 dark:bg-background-dark min-h-screen pb-32">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 animate-fade-in">
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Library</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{books.length} Books • {books.filter(b => activeUser.history.some(h => h.bookId === b.id && h.status === ReadStatus.READING)).length} Reading</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onScan}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-surface-dark text-slate-500 dark:text-slate-400 hover:text-primary transition-all active:scale-95"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>qr_code_scanner</span>
              </button>
              <div
                onClick={onProfile}
                className="w-10 h-10 rounded-2xl bg-primary border border-primary/20 shadow-lg shadow-primary/20 cursor-pointer overflow-hidden active:scale-95 transition-all"
              >
                {activeUser.avatarSeed ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.avatarSeed}`} alt={activeUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">{activeUser.name.charAt(0)}</div>
                )}
              </div >
            </div >
          </div >
        </div >

        <div className="px-5 py-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
            </div>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-surface-dark border-0 rounded-xl focus:ring-2 focus:ring-primary placeholder-slate-400 dark:placeholder-slate-500 transition-shadow shadow-sm"
              placeholder="Title, author, ISBN..."
              type="text"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
              <button
                onClick={() => {
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.onresult = (event: any) => {
                      setSearchTerm(event.results[0][0].transcript);
                    };
                    recognition.start();
                  } else {
                    alert("Voice search is not supported in your browser.");
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-primary transition-colors"
                title="Voice Search"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mic</span>
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-surface-dark">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`flex shrink-0 items-center gap-1.5 h-8 px-3 rounded-lg border transition-all active:scale-95 ${showSortMenu ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-100 dark:bg-surface-dark border-transparent text-slate-700 dark:text-slate-300'}`}
            >
              <span className="text-xs font-semibold">Sort: Recent</span>
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>arrow_drop_down</span>
            </button>
            {showSortMenu && (
              <div className="absolute top-10 left-0 w-32 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-2 z-50">
                {['Recent', 'Title', 'Author', 'Rating'].map(opt => (
                  <button key={opt} onClick={() => setShowSortMenu(false)} className="w-full px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0 mx-1"></div>
          {['Genre', 'Status', 'Owner', 'Author'].map((label) => (
            <button key={label} className="flex shrink-0 items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-100 dark:bg-surface-dark border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>expand_more</span>
            </button>
          ))}
        </div>
      </header >

      <main className="flex-1 overflow-y-auto p-5 pb-32 no-scrollbar animate-fade-in-up">
        <div className="flex gap-4 mb-6 sticky top-0 z-10 bg-inherit py-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'all' ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
          >
            All Books
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'unread' ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
          >
            Unread
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'favorites' ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'recent' ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
          >
            Recently Added
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {sortedBooks.slice(0, visibleCount).map(book => {
            const readingEntry = activeUser.history.find(h => h.bookId === book.id);
            const isRead = readingEntry?.status === ReadStatus.COMPLETED;
            const isReading = readingEntry?.status === ReadStatus.READING;
            const isLoaned = state.loans.some(l => l.bookId === book.id && !l.returnDate);

            return (
              <div key={book.id} onClick={() => onSelectBook(book)} className="group flex flex-col gap-3 cursor-pointer">
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-800 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:-translate-y-1">
                  <div
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${isLoaned ? 'grayscale-[0.5]' : ''}`}
                    style={{ backgroundImage: `url('${book.coverUrl || "https://images.unsplash.com/photo-1543004218-ee141104975a?auto=format&fit=crop&q=80&w=200"}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                  {/* Status Indicators */}
                  {isRead && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                        <span className="material-symbols-outlined text-emerald-400 block" style={{ fontSize: '16px' }}>check_circle</span>
                      </div>
                    </div>
                  )}

                  {isReading && (
                    <>
                      <div className="absolute top-2 left-2">
                        <div className="w-6 h-6 rounded-full bg-primary border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {activeUser.name.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-primary w-[45%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                      </div>
                      <div className="absolute bottom-2 right-2 text-[10px] font-bold text-white/90">45%</div>
                    </>
                  )}

                  {isLoaned && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <div className="bg-red-500/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_outward</span> Loaned
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(book.estimatedValue || 0)}</p>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">
                      <span className="material-symbols-outlined text-[10px]">check_circle</span> {book.condition}
                    </div>
                  </div>
                </div>
                );
          })}
              </div>

        {
              filteredBooks.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-5xl">search_off</span>
                  <p className="text-slate-500">No books found in your library.</p>
                  <button onClick={() => { setSearchTerm(''); setActiveTab('all'); }} className="text-primary text-sm font-bold mt-2">Clear filters</button>
                </div>
              )
            }

            {
              sortedBooks.length > visibleCount && (
                <div className="mt-8 flex justify-center pb-10">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    See more books <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform" style={{ fontSize: '16px' }}>expand_more</span>
                  </button>
                </div>
              )
            }
      </main>

      <div className="fixed bottom-24 right-5 z-40">
        <button
          onClick={onScan}
          className="flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:scale-105 transition-all focus:ring-4 focus:ring-primary/30 group active:scale-95"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300" style={{ fontSize: '28px' }}>add</span>
        </button>
      </div>
    </div >
  );
};