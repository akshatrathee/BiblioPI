import { AppState, Book, User, Location, BookCondition, ReadStatus } from '../types';

const STORAGE_KEY = 'home_librarian_v5';

// Helpers
/**
 * Generates a unique 9-character alphanumeric ID.
 * @returns {string} The generated ID.
 */
export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Calculates current age based on a date of birth.
 * @param {string} dob - ISO date string of birth.
 * @returns {number} Age in years.
 */
export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Determines a student's grade or category based on birth date.
 * @param {string} dob - ISO date string of birth.
 * @returns {string} Grade string (e.g., "Class 5", "Preschool").
 */
export const calculateGrade = (dob: string): string => {
  const age = calculateAge(dob);
  if (age < 3) return 'Toddler';
  if (age < 5) return 'Preschool';
  if (age < 11) return `Class ${age - 5}`;
  if (age < 18) return `Class ${age - 5} (Secondary)`;
  return `Graduate`;
};

/**
 * Formats a number as INR currency (₹).
 * @param {number} val - The numeric value to format.
 * @returns {string} Formatted currency string.
 */
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
    genres: ['Classic', 'Romance'], tags: ['Essential', 'example', 'dummy'], minAge: 12,
    coverUrl: 'https://covers.openlibrary.org/b/id/14549557-L.jpg',
    estimatedValue: 450, summary: "A romantic novel of manners following Elizabeth Bennet.",
    status: ReadStatus.UNREAD, addedByUserName: 'Dad'
  },
  {
    isbn: '9780743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald',
    genres: ['Classic', 'Fiction'], tags: ['American Dream', 'example', 'dummy'], minAge: 14,
    coverUrl: 'https://covers.openlibrary.org/b/id/8408332-L.jpg',
    estimatedValue: 600, summary: "Jay Gatsby's pursuit of Daisy Buchanan in the Jazz Age.",
    status: ReadStatus.UNREAD, addedByUserName: 'Mom'
  },
  {
    isbn: '9780439139601', title: 'Harry Potter & Sorcerer\'s Stone', author: 'J.K. Rowling',
    genres: ['Fantasy', 'Kid'], tags: ['Magic', 'example', 'dummy'], minAge: 9,
    coverUrl: 'https://covers.openlibrary.org/b/id/10522194-L.jpg',
    estimatedValue: 800, summary: "A young wizard's first year at Hogwarts.",
    status: ReadStatus.UNREAD, addedByUserName: 'Teenage Kid'
  },
  {
    isbn: '9780141381381', title: 'Diary of a Wimpy Kid', author: 'Jeff Kinney',
    genres: ['Comedy', 'Kid'], tags: ['School', 'example', 'dummy'], minAge: 7,
    coverUrl: 'https://covers.openlibrary.org/b/id/11130384-L.jpg',
    estimatedValue: 299, summary: "Middle school life as told by Greg Heffley.",
    status: ReadStatus.UNREAD, addedByUserName: 'Teenage Kid'
  },
  {
    isbn: '9780345391803', title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams',
    genres: ['Sci-Fi', 'Comedy'], tags: ['Space', 'example', 'dummy'], minAge: 10,
    coverUrl: 'https://covers.openlibrary.org/b/id/12632205-L.jpg',
    estimatedValue: 350, summary: "Arthur Dent travels the galaxy after Earth's destruction.",
    status: ReadStatus.UNREAD, addedByUserName: 'Dad'
  },
  {
    isbn: '9780064404990', title: 'The Giver', author: 'Lois Lowry',
    genres: ['Dystopian', 'Young Adult'], tags: ['example', 'dummy'], minAge: 12,
    coverUrl: 'https://covers.openlibrary.org/b/id/14540455-L.jpg',
    estimatedValue: 400, summary: "In a world with no pain or color, Jonas receives memories.",
    status: ReadStatus.UNREAD, addedByUserName: 'Teenage Kid'
  },
  {
    isbn: '9780140228021', title: 'Malgudi Days', author: 'R.K. Narayan',
    genres: ['Indian Fiction', 'Classic'], tags: ['example', 'India', 'dummy'], minAge: 10,
    coverUrl: 'https://covers.openlibrary.org/b/id/14352123-L.jpg',
    estimatedValue: 250, summary: "Short stories set in the town of Malgudi.",
    status: ReadStatus.UNREAD, addedByUserName: 'Mom'
  },
  {
    isbn: '9780060244194', title: 'Where the Wild Things Are', author: 'Maurice Sendak',
    genres: ['Picture Book', 'Preschool'], tags: ['example', 'dummy'], minAge: 3,
    coverUrl: 'https://covers.openlibrary.org/b/id/10123512-L.jpg',
    estimatedValue: 300, summary: "Max's journey to the land of wild things.",
    status: ReadStatus.UNREAD, addedByUserName: 'Preschool Kid'
  }
];

/**
 * Automatically generates descriptive tags based on book title and summary.
 * Simulates KaraKeep-style intelligence for content categorization.
 * @param {string} title - The book title.
 * @param {string} summary - The book summary or description.
 * @returns {string[]} An array of generated tags.
 */
export const generateAutoTags = (title: string, summary: string = ''): string[] => {
  const content = (title + ' ' + summary).toLowerCase();
  const tags: string[] = [];

  const rules = [
    { pattern: /war|battle|soldier|army|king|empire/i, tag: 'History' },
    { pattern: /magic|wizard|witch|dragon|spell/i, tag: 'Fantasy' },
    { pattern: /space|alien|galaxy|future|robot/i, tag: 'Sci-Fi' },
    { pattern: /love|romantic|marriage|heart/i, tag: 'Romance' },
    { pattern: /kill|murder|crime|detective|mystery/i, tag: 'Thriller' },
    { pattern: /children|kid|young|boy|girl/i, tag: 'Kids' },
    { pattern: /india|bharat|desi|indian/i, tag: 'India' },
    { pattern: /money|invest|rich|wealth|market/i, tag: 'Finance' },
    { pattern: /cook|food|recipe|kitchen/i, tag: 'Lifestyle' }
  ];

  rules.forEach(rule => {
    if (rule.pattern.test(content)) {
      tags.push(rule.tag);
    }
  });

  return Array.from(new Set(tags));
};

const INITIAL_STATE: AppState = {
  isSetupComplete: false,
  isDemoMode: true,
  books: STARTER_BOOKS as Book[],
  users: [],
  locations: [],
  loans: [],
  currentUser: null,
  theme: 'dark',
  aiSettings: { provider: 'gemini', ollamaUrl: 'http://localhost:11434', ollamaModel: 'llama3.2' },
  dbSettings: { type: 'sqlite', host: 'localhost', name: 'homelibrary' },
  backupSettings: { frequency: 'weekly', location: 'local', googleDriveConnected: false },
  apiSettings: { googleKey: '', whisperUrl: 'https://api.openai.com/v1', whisperKey: '' },
  qolSettings: { showValue: true, vibrantUi: true, autoAnalyze: false }
};

/**
 * Loads the application state from localStorage or returns the initial state.
 * Performs simple migrations for older state versions.
 * @returns {AppState} The current application state.
 */
export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_STATE;
    const state = JSON.parse(stored);

    // Ensure all required fields exist (Migration)
    if (!state.dbSettings) state.dbSettings = INITIAL_STATE.dbSettings;
    if (!state.backupSettings) state.backupSettings = INITIAL_STATE.backupSettings;
    if (!state.apiSettings) state.apiSettings = INITIAL_STATE.apiSettings;
    if (!state.qolSettings) state.qolSettings = INITIAL_STATE.qolSettings;

    // Auto-update ages/grades based on DOB
    if (state.users) {
      state.users = state.users.map((u: User) => ({
        ...u,
        age: calculateAge(u.dob),
        grade: u.role === 'User' ? calculateGrade(u.dob) : u.educationLevel
      }));
    }

    // Ensure isDemoMode reflects setup status if missing or mismatched
    state.isDemoMode = !state.isSetupComplete;

    return state;
  } catch (e) {
    console.error("Failed to load state", e);
    return INITIAL_STATE;
  }
};

/**
 * Triggers a download of the current application state as a JSON file.
 * @param {AppState} state - The state to backup.
 */
export const downloadBackup = (state: AppState) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `bibliopi_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

/**
 * Restores the application state from a JSON string.
 * @param {string} json - The JSON string to restore from.
 * @returns {AppState} The restored state.
 * @throws {Error} If the JSON is invalid.
 */
export const restoreFromBackup = (json: string): AppState => {
  const state = JSON.parse(json);
  saveState(state);
  return state;
};

/**
 * Saves the current application state to localStorage.
 * @param {AppState} state - The state object to persist.
 */
export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

/**
 * Resets the application state to the initial production-ready version.
 * @returns {AppState} The initial state.
 */
export const resetToProduction = () => {
  saveState(INITIAL_STATE);
  return INITIAL_STATE;
};