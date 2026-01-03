import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { Scanner } from './components/Scanner';
import { Profile } from './components/Profile';
import { BuyNext } from './components/BuyNext';
import { Maintenance } from './components/Maintenance';
import { LocationManager } from './components/LocationManager';
import { Onboarding } from './components/Onboarding';
import { LoansManager } from './components/LoansManager';
import { Bookshelf } from './components/Bookshelf';
import { Analytics } from './components/Analytics';
import { DigitalReader } from './components/DigitalReader';
import { BookDetails } from './components/BookDetails';
import { Settings } from './components/Settings';
import { UserModal } from './components/UserModal';
import { LoanModal } from './components/LoanModal';
import { Icons } from './components/Icons';
import { loadState, saveState, generateId, downloadBackup, restoreFromBackup, generateAutoTags } from './services/storageService';
import { fetchBookByIsbn } from './services/openLibraryService';
import { useLaserScanner } from './hooks/useLaserScanner';
import { AppState, Book, User, Loan, ReadStatus, ReadEntry, BookCondition } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());

  // LASER SCANNER SUPPORT
  useLaserScanner(async (isbn) => {
    try {
      const bookData = await fetchBookByIsbn(isbn);
      if (bookData) {
        const activeUser = state.users.find(u => u.id === state.currentUser) || state.users[0];
        const autoTags = generateAutoTags(bookData.title || '', bookData.summary || '');
        const newBook: Book = {
          ...bookData,
          id: generateId(),
          isbn: isbn,
          addedByUserId: activeUser.id,
          addedByUserName: activeUser.name,
          addedDate: new Date().toISOString(),
          status: ReadStatus.UNREAD,
          condition: BookCondition.GOOD,
          tags: autoTags,
          purchasePrice: 0,
        } as Book;

        setState(prev => ({ ...prev, books: [...prev.books, newBook] }));
        setSelectedBook(newBook);
        alert(`New book scanned: ${newBook.title}`);
      }
    } catch (err) {
      console.error("Scan error:", err);
    }
  });

  type CurrentView = 'dashboard' | 'library' | 'loans' | 'profile' | 'scanner' | 'buy-next' | 'maintenance' | 'locations' | 'bookshelf' | 'analytics' | 'reader';
  const [currentView, setCurrentViewState] = useState<CurrentView>('dashboard');

  // Helper to change view and push to history
  const setCurrentView = (view: CurrentView) => {
    setCurrentViewState(view);
    window.history.pushState({ view }, '', `#${view}`);
  };

  // Global Overlays
  const [selectedBook, setSelectedBookState] = useState<Book | null>(null);

  const setSelectedBook = (book: Book | null) => {
    setSelectedBookState(book);
    if (book) {
      window.history.pushState({ view: currentView, bookId: book.id }, '', `#book/${book.id}`);
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const [libraryTab, setLibraryTab] = useState<'all' | 'unread' | 'favorites' | 'recent'>('all');

  // Handle Browser Back Button & Keyboard Shortcuts
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we are navigating back and there was a book selected, deselect it
      if (selectedBook && !event.state?.bookId) {
        setSelectedBookState(null);
        return;
      }

      if (event.state?.view) {
        setCurrentViewState(event.state.view);
      } else {
        // Fallback or Initial Load
        const hash = window.location.hash.replace('#', '');
        const validViews = ['dashboard', 'library', 'scanner', 'profile', 'maintenance'];
        if (validViews.includes(hash)) {
          setCurrentViewState(hash as any);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBook) {
          setSelectedBookState(null);
          window.history.back();
        } else if (currentView !== 'dashboard') {
          setCurrentView('dashboard');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    // Initial Push
    if (!window.history.state) {
      window.history.replaceState({ view: currentView }, '', `#${currentView}`);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedBook, currentView]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Persist state
  useEffect(() => {
    saveState(state);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  // ONBOARDING FLOW
  if (!state.isSetupComplete) {
    return <Onboarding
      onComplete={(data) => {
        setState(prev => ({
          ...prev,
          isSetupComplete: true,
          isDemoMode: false,
          aiSettings: { provider: data.aiProvider, ollamaUrl: data.ollamaUrl, ollamaModel: data.ollamaModel },
          users: data.users,
          locations: data.rooms,
          books: data.starterBooks,
          dbSettings: data.dbSettings,
          currentUser: data.users.find(u => u.role === 'Admin')?.id || null
        }));
      }}
      onConfigure={() => setShowSettings(true)}
    />;
  }

  const activeUser = state.users.find(u => u.id === state.currentUser) || state.users[0];

  // --- HANDLERS ---
  /**
   * Updates a book's metadata in the global state.
   * @param {Book} updatedBook - The book object with new values.
   */
  const handleUpdateBook = (updatedBook: Book) => {
    setState(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === updatedBook.id ? updatedBook : b)
    }));
    // If we updated the currently selected book, update it locally too so UI refreshes
    if (selectedBook && selectedBook.id === updatedBook.id) {
      setSelectedBook(updatedBook);
    }
  };

  /**
   * Deletes the currently selected book after confirmation.
   */
  const handleDeleteBook = () => {
    if (selectedBook) {
      if (confirm("Are you sure you want to delete this book?")) {
        setState(prev => ({ ...prev, books: prev.books.filter(b => b.id !== selectedBook.id) }));
        setSelectedBook(null);
      }
    }
  };

  /**
   * Records a new book loan in the global state.
   * @param {Loan} loan - The loan record.
   */
  const handleCreateLoan = (loan: Loan) => {
    setState(prev => ({ ...prev, loans: [...prev.loans, loan] }));
    setLoanBook(null);
  };

  /**
   * Saves or updates a user profile.
   * @param {User} user - The user object to save.
   */
  const handleUpdateUser = (user: User) => {
    const exists = state.users.find(u => u.id === user.id);
    setState(prev => ({
      ...prev,
      users: exists
        ? prev.users.map(u => u.id === user.id ? user : u)
        : [...prev.users, user]
    }));
    setShowUserModal(false);
    setEditingUser(null);
  };

  /**
   * Toggles the read status of a book for the active user.
   * Updates both the user's reading history and the book's status.
   * @param {string} bookId - ID of the book to toggle.
   */
  const handleToggleRead = (bookId: string) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === prev.currentUser || (!prev.currentUser && u.id === prev.users[0]?.id)) {
          const historyEntry = u.history.find(h => h.bookId === bookId);
          if (historyEntry) {
            const isFinishing = historyEntry.status !== ReadStatus.COMPLETED;
            return {
              ...u,
              history: u.history.map(h => h.bookId === bookId ? {
                ...h,
                status: isFinishing ? ReadStatus.COMPLETED : ReadStatus.READING,
                dateFinished: isFinishing ? new Date().toISOString() : h.dateFinished,
                readCount: isFinishing ? (h.readCount || 1) + 1 : h.readCount,
                readDates: isFinishing ? [...(h.readDates || []), new Date().toISOString()] : h.readDates
              } : h)
            };
          } else {
            return {
              ...u,
              history: [...u.history, {
                bookId,
                status: ReadStatus.COMPLETED,
                dateFinished: new Date().toISOString(),
                readCount: 1,
                readDates: [new Date().toISOString()]
              }]
            };
          }
        }
        return u;
      });

      const updatedBooks = prev.books.map(b => b.id === bookId ? { ...b, status: ReadStatus.COMPLETED } : b);

      // Update selected book if it's the one we toggled
      if (selectedBook && selectedBook.id === bookId) {
        setSelectedBook(updatedBooks.find(b => b.id === bookId) || null);
      }

      return {
        ...prev,
        users: updatedUsers,
        books: updatedBooks
      };
    });
  };

  /**
   * Finalizes a book scan by adding user attribution and auto-generated tags.
   * @param {Book} newBook - The raw book data from the scanner.
   */
  const handleScanComplete = (newBook: Book) => {
    const autoTags = generateAutoTags(newBook.title || '', newBook.summary || '');
    const bookWithUser = {
      ...newBook,
      id: generateId(),
      addedByUserId: activeUser.id,
      addedByUserName: activeUser.name,
      addedDate: new Date().toISOString(),
      tags: [...(newBook.tags || []), ...autoTags]
    };
    setState(prev => ({
      ...prev,
      books: [...prev.books, bookWithUser]
    }));
    setCurrentView('library');
    setSelectedBook(bookWithUser);
  };

  /**
   * Resolves a location name and its parent room into a breadcrumb string.
   * @param {string} id - The location ID.
   * @returns {string} Formatted location string (e.g., "Living Room > Shelf A").
   */
  const getLocationName = (id?: string) => {
    if (!id) return 'Unassigned';
    const loc = state.locations.find(l => l.id === id);
    if (!loc) return 'Unknown';

    if (loc.parentId) {
      const parent = state.locations.find(l => l.id === loc.parentId);
      return parent ? `${parent.name} > ${loc.name}` : loc.name;
    }
    return loc.name;
  };
  const handleResetHistory = (bookId: string, type: 'undo' | 'reset') => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === prev.currentUser || (!prev.currentUser && u.id === prev.users[0]?.id)) {
          const history = u.history.map(h => {
            if (h.bookId === bookId) {
              if (type === 'undo') {
                const newReadDates = [...(h.readDates || [])];
                newReadDates.pop();
                return {
                  ...h,
                  readCount: Math.max(0, (h.readCount || 1) - 1),
                  readDates: newReadDates,
                  dateFinished: newReadDates.length > 0 ? newReadDates[newReadDates.length - 1] : undefined,
                  status: newReadDates.length > 0 ? ReadStatus.COMPLETED : ReadStatus.UNREAD
                };
              } else {
                return null; // Remove from history
              }
            }
            return h;
          }).filter(Boolean) as ReadEntry[];
          return { ...u, history };
        }
        return u;
      });
      return { ...prev, users: updatedUsers };
    });
  };

  return (
    <div className={`min-h-screen font-display bg-background-dark text-white ${state.qolSettings.vibrantUi ? 'vibrant-ui' : 'vibrant-ui-off'}`}>
      {state.qolSettings.vibrantUi && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
      )}

      {state.isDemoMode && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-black py-1.5 px-4 flex items-center justify-center gap-3 shadow-lg">
          <span className="material-symbols-outlined text-lg">warning</span>
          <p className="text-[10px] font-black uppercase tracking-widest text-center">
            Demo Mode Enabled: Library is populated with example items. Please complete setup to personalize.
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="ml-4 px-3 py-1 rounded-full bg-black text-white text-[9px] font-bold uppercase transition-all active:scale-95 shadow-md"
          >
            Configure AI
          </button>
        </div>
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          state={state}
          onManageLoans={() => setCurrentView('maintenance')}
          onBookClick={setSelectedBook}
          onAnalytics={() => setCurrentView('analytics')}
          onSeeAll={() => {
            setLibraryTab('recent');
            setCurrentView('library');
          }}
        />
      )}

      {currentView === 'library' && (
        <Library
          state={state}
          onSelectBook={setSelectedBook}
          onScan={() => setCurrentView('scanner')}
          onProfile={() => setCurrentView('profile')}
          onBookshelf={() => setCurrentView('bookshelf')}
          initialTab={libraryTab}
        />
      )}

      {currentView === 'loans' && <LoansManager state={state} onUpdateState={setState} />}

      {currentView === 'profile' && (
        <Profile
          users={state.users}
          allBooks={state.books}
          onEditUser={(u) => { setEditingUser(u); setShowUserModal(true); }}
          onSettings={() => setShowSettings(true)}
          onAddUser={() => { setEditingUser(null); setShowUserModal(true); }}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'bookshelf' && (
        <Bookshelf
          books={state.books}
          onBack={() => setCurrentView('library')}
          onSelectBook={setSelectedBook}
        />
      )}

      {currentView === 'analytics' && (
        <Analytics
          state={state}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'buy-next' && (
        <BuyNext
          onBack={() => setCurrentView('dashboard')}
          onSelectBook={setSelectedBook}
        />
      )}

      {currentView === 'maintenance' && (
        <Maintenance
          state={state}
          onBack={() => setCurrentView('dashboard')}
          onSelectBook={setSelectedBook}
          onManageLocations={() => setCurrentView('locations')}
        />
      )}

      {currentView === 'locations' && (
        <LocationManager
          locations={state.locations}
          onUpdate={(locs) => setState(prev => ({ ...prev, locations: locs }))}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'scanner' && (
        <Scanner
          onClose={() => setCurrentView('dashboard')}
          onScanComplete={handleScanComplete}
          existingBooks={state.books}
          onSelectBook={setSelectedBook}
        />
      )}

      {currentView === 'reader' && selectedBook && (
        <DigitalReader
          book={selectedBook}
          onClose={() => setCurrentView('library')}
        />
      )}

      {/* --- MODALS & OVERLAYS --- */}

      {selectedBook && (
        <BookDetails
          book={selectedBook}
          currentUser={activeUser}
          users={state.users}
          locations={state.locations}
          getLocationName={getLocationName}
          showValue={state.qolSettings.showValue}
          onClose={() => setSelectedBook(null)}
          onUpdateBook={handleUpdateBook}
          onDelete={handleDeleteBook}
          onLoan={() => setLoanBook(selectedBook)}
          onToggleRead={handleToggleRead}
          onResetHistory={handleResetHistory}
          onOpenReader={() => setCurrentView('reader')}
        />
      )}

      {showSettings && (
        <Settings
          state={state}
          onUpdateState={(partial) => setState(prev => ({ ...prev, ...partial }))}
          onClose={() => setShowSettings(false)}
          onDownloadBackup={() => downloadBackup(state)}
          onRestoreBackup={(json) => {
            try {
              const newState = restoreFromBackup(json);
              setState(newState);
              alert("Database restored successfully!");
            } catch (e) {
              alert("Restore failed: Invalid backup file");
            }
          }}
        />
      )}

      {showUserModal && (
        <UserModal
          user={editingUser || undefined}
          onSave={handleUpdateUser}
          onClose={() => { setShowUserModal(false); setEditingUser(null); }}
        />
      )}

      {loanBook && (
        <LoanModal
          book={loanBook}
          users={state.users}
          onConfirm={handleCreateLoan}
          onClose={() => setLoanBook(null)}
        />
      )}

      {/* --- NAVIGATION --- */}

      {currentView !== 'scanner' && !selectedBook && (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 pb-safe safe-area-bottom">
          <div className="flex justify-around items-center h-20 px-2">
            <button onClick={() => setCurrentView('dashboard')} className={`relative flex flex-col items-center justify-center w-full h-full gap-1 group ${currentView === 'dashboard' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              {currentView === 'dashboard' && <div className="absolute -top-[1px] w-10 h-1 bg-primary rounded-b-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>}
              <span className="material-symbols-outlined text-[26px] transition-transform group-active:scale-95">dashboard</span>
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button onClick={() => { setLibraryTab('all'); setCurrentView('library'); }} className={`relative flex flex-col items-center justify-center w-full h-full gap-1 group ${currentView === 'library' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              {currentView === 'library' && <div className="absolute -top-[1px] w-10 h-1 bg-primary rounded-b-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>}
              <span className="material-symbols-outlined text-[26px] transition-transform group-active:scale-95">library_books</span>
              <span className="text-[10px] font-bold">Library</span>
            </button>

            <div className="relative -top-6">
              <button onClick={() => setCurrentView('scanner')} className="size-16 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-4 border-white dark:border-[#0f1117]">
                <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
              </button>
            </div>

            <button onClick={() => setCurrentView('loans')} className={`relative flex flex-col items-center justify-center w-full h-full gap-1 group ${currentView === 'loans' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              {currentView === 'loans' && <div className="absolute -top-[1px] w-10 h-1 bg-primary rounded-b-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>}
              <span className="material-symbols-outlined text-[26px] transition-transform group-active:scale-95">swap_horiz</span>
              <span className="text-[10px] font-bold">Loans</span>
            </button>
            <button onClick={() => setCurrentView('profile')} className={`relative flex flex-col items-center justify-center w-full h-full gap-1 group ${currentView === 'profile' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              {currentView === 'profile' && <div className="absolute -top-[1px] w-10 h-1 bg-primary rounded-b-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>}
              {/* Use Avatar if available for profile icon, else Icon */}
              {activeUser.avatarSeed ? (
                <div className={`size-6 rounded-full overflow-hidden border ${currentView === 'profile' ? 'border-primary' : 'border-transparent'}`}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.avatarSeed}`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <span className="material-symbols-outlined text-[26px] transition-transform group-active:scale-95">person</span>
              )}
              <span className="text-[10px] font-bold">Profile</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;