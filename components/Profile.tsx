import React from 'react';
import { User, Book, ReadStatus } from '../types';

interface ProfileProps {
  users: User[];
  allBooks: Book[];
  onEditUser: (u: User) => void;
  onSettings: () => void;
  onAddUser: () => void;
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ users, allBooks, onSettings, onAddUser, onBack, onEditUser }) => {
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col animate-fade-in relative pb-32">
      <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-white active:scale-95">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Family Profiles</h1>
          <button onClick={onSettings} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-white active:scale-95">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 rounded-xl border-none bg-white dark:bg-surface-card/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-surface-card transition-all shadow-sm"
              placeholder="Find a family member..."
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Family Members</h2>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Sort by: Role
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            {showSortMenu && (
              <div className="absolute top-6 right-0 w-32 bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2 z-50">
                {['Role', 'Name', 'Activity'].map(opt => (
                  <button key={opt} onClick={() => setShowSortMenu(false)} className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredUsers.map(u => {
            const completedCount = u.history.filter(h => h.status === ReadStatus.COMPLETED).length;
            const readingBook = allBooks.find(b => u.history.some(h => h.bookId === b.id && h.status === ReadStatus.READING));
            const age = u.dob ? Math.floor((new Date().getTime() - new Date(u.dob).getTime()) / 3.15576e+10) : null;

            return (
              <div
                key={u.id}
                onClick={() => onEditUser(u)}
                className="group relative bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all cursor-pointer hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl border-2 border-primary shadow-lg shadow-primary/20 overflow-hidden">
                        {u.avatarSeed ? (
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed}`} alt={u.name} />
                        ) : (
                          u.name.charAt(0)
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full p-1 border-2 border-white dark:border-surface-card flex items-center justify-center w-6 h-6">
                        <span className="material-symbols-outlined text-[12px] text-white">person</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{u.name}</h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">
                        {u.role === 'Admin' ? 'Parent' : 'Child'} • {age !== null ? `${age} yrs` : u.educationLevel}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                </div>

                {readingBook ? (
                  <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-3 mb-4 flex items-center gap-3 border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {readingBook.coverUrl ? (
                        <img src={readingBook.coverUrl} className="w-full h-full object-cover" alt="Reading" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-500">book</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-primary font-bold mb-0.5">Reading Now</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                        {readingBook.title}
                      </p>
                      <div className="mt-1.5 w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-3 mb-4 flex items-center justify-center border border-dashed border-slate-300 dark:border-white/10">
                    <p className="text-xs text-slate-400 font-medium italic">No active reading sessions</p>
                  </div>
                )}

                <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div>
                    <span className="text-base font-bold text-slate-900 dark:text-white">{completedCount}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1.5">Books Read</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
                  <div>
                    <span className="text-base font-bold text-slate-900 dark:text-white">{u.history.filter(h => h.status === ReadStatus.READING).length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1.5">In Progress</span>
                  </div>
                </div>

                {u.personas && u.personas.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-primary">psychology</span>
                      Reading Personas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {u.personas.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          <span>{p.character}</span>
                          <span className="text-[8px] opacity-60">({p.universe})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Member Button inside scroll area */}
        <div className="pt-4 pb-10">
          <button
            onClick={onAddUser}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-lg font-bold h-14 rounded-2xl shadow-[0_8px_20px_-6px_rgba(25,76,230,0.5)] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add New Member
          </button>
        </div>
      </div>
    </div>
  );
};