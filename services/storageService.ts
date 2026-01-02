import { AppState, Book, User, Location, BookCondition, ReadStatus } from '../types';

const STORAGE_KEY = 'home_librarian_v5';

// Helpers
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

export const calculateGrade = (dob: string): string => {
  const age = calculateAge(dob);
  if (age < 3) return 'Toddler';
  if (age < 5) return 'Preschool';
  if (age < 11) return `Class ${age - 5}`;
  if (age < 18) return `Class ${age - 5} (Secondary)`;
  return `Graduate`;
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

// Core Library Starter Pack
export const STARTER_BOOKS: Partial<Book>[] = [
  {
    isbn: '9780141439518', title: 'Pride and Prejudice', author: 'Jane Austen',
    genres: ['Classic', 'Romance'], tags: ['Essential', 'example'], minAge: 12,
    coverUrl: 'https://covers.openlibrary.org/b/id/14549557-L.jpg',
    estimatedValue: 450, summary: "A romantic novel of manners following Elizabeth Bennet.",
    status: ReadStatus.UNREAD, addedByUserName: 'Dad'
  },
  {
    isbn: '9780743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald',
    genres: ['Classic', 'Fiction'], tags: ['American Dream', 'example'], minAge: 14,
    coverUrl: 'https://covers.openlibrary.org/b/id/8408332-L.jpg',
    estimatedValue: 600, summary: "Jay Gatsby's pursuit of Daisy Buchanan in the Jazz Age.",
    status: ReadStatus.UNREAD, addedByUserName: 'Mom'
  },
  {
    isbn: '9780439139601', title: 'Harry Potter & Sorcerer\'s Stone', author: 'J.K. Rowling',
    genres: ['Fantasy', 'Kid'], tags: ['Magic', 'example'], minAge: 9,
    coverUrl: 'https://covers.openlibrary.org/b/id/10522194-L.jpg',
    estimatedValue: 800, summary: "A young wizard's first year at Hogwarts.",
    status: ReadStatus.UNREAD, addedByUserName: 'Teenage Kid'
  },
  {
    isbn: '9780141381381', title: 'Diary of a Wimpy Kid', author: 'Jeff Kinney',
    genres: ['Comedy', 'Kid'], tags: ['School', 'example'], minAge: 7,
    coverUrl: 'https://covers.openlibrary.org/b/id/11130384-L.jpg',
    estimatedValue: 299, summary: "Middle school life as told by Greg Heffley.",
    status: ReadStatus.UNREAD, addedByUserName: 'Teenage Kid'
  },
  {
    isbn: '9780345391803', title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams',
    genres: ['Sci-Fi', 'Comedy'], tags: ['Space', 'example'], minAge: 10,
    coverUrl: 'https://covers.openlibrary.org/b/id/12632205-L.jpg',
    estimatedValue: 350, summary: "Arthur Dent travels the galaxy after Earth's destruction.",
    status: ReadStatus.UNREAD, addedByUserName: 'Dad'
  },
  {
    isbn: '9780064404990', title: 'The Giver', author: 'Lois Lowry',
    genres: ['Dystopian', 'Young Adult'], tags: ['example'], minAge: 12,
    coverUrl: 'https://covers.openlibrary.org/b/id/14540455-L.jpg',
    estimatedValue: 400, summary: "In a world with no pain or color, Jonas receives memories.",
    status: ReadStatus.UNREAD, addedByUserName: 'Teenage Kid'
  },
  {
    isbn: '9780140228021', title: 'Malgudi Days', author: 'R.K. Narayan',
    genres: ['Indian Fiction', 'Classic'], tags: ['example', 'India'], minAge: 10,
    coverUrl: 'https://covers.openlibrary.org/b/id/14352123-L.jpg',
    estimatedValue: 250, summary: "Short stories set in the town of Malgudi.",
    status: ReadStatus.UNREAD, addedByUserName: 'Mom'
  },
  {
    isbn: '9780060244194', title: 'Where the Wild Things Are', author: 'Maurice Sendak',
    genres: ['Picture Book', 'Preschool'], tags: ['example'], minAge: 3,
    coverUrl: 'https://covers.openlibrary.org/b/id/10123512-L.jpg',
    estimatedValue: 300, summary: "Max's journey to the land of wild things.",
    status: ReadStatus.UNREAD, addedByUserName: 'Preschool Kid'
  }
];

const INITIAL_STATE: AppState = {
  isSetupComplete: false,
  isDemoMode: false,
  books: [],
  users: [],
  locations: [],
  loans: [],
  currentUser: null,
  theme: 'dark',
  aiSettings: { provider: 'gemini', ollamaUrl: 'http://localhost:11434', ollamaModel: 'llama3.2' },
  dbSettings: { type: 'sqlite', host: 'localhost', name: 'homelibrary' },
  backupSettings: { frequency: 'weekly', location: 'local', googleDriveConnected: false }
};

export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_STATE;
    const state = JSON.parse(stored);

    // Ensure all required fields exist (Migration)
    if (!state.dbSettings) state.dbSettings = INITIAL_STATE.dbSettings;
    if (!state.backupSettings) state.backupSettings = INITIAL_STATE.backupSettings;

    // Auto-update ages/grades based on DOB
    if (state.users) {
      state.users = state.users.map((u: User) => ({
        ...u,
        age: calculateAge(u.dob),
        grade: u.role === 'User' ? calculateGrade(u.dob) : u.educationLevel
      }));
    }

    return state;
  } catch (e) {
    console.error("Failed to load state", e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const resetToProduction = () => {
  saveState(INITIAL_STATE);
  return INITIAL_STATE;
};