import { Book, BookCondition, ReadStatus } from '../types';
import { generateId } from './storageService';

/**
 * Parses a bulk import file (CSV or JSON) and returns an array of partial book objects.
 * CSV files should use pipes (|) for list-based fields like genres and tags.
 * @param {File} file - The file uploaded by the user.
 * @returns {Promise<Partial<Book>[]>} Array of parsed book data.
 * @throws {Error} If the file format is invalid or unsupported.
 */
export const parseBulkFile = async (file: File): Promise<Partial<Book>[]> => {
    const text = await file.text();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'json') {
        try {
            const data = JSON.parse(text);
            return Array.isArray(data) ? data : [data];
        } catch (e) {
            throw new Error('Invalid JSON format');
        }
    }

    if (extension === 'csv') {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        return lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const book: any = {};
            headers.forEach((header, i) => {
                if (header === 'genres' || header === 'tags') {
                    book[header] = values[i] ? values[i].split('|') : [];
                } else if (header === 'estimatedvalue' || header === 'purchaseprice' || header === 'totalpages' || header === 'minage') {
                    book[header] = parseFloat(values[i]) || 0;
                } else {
                    book[header] = values[i];
                }
            });
            return book as Partial<Book>;
        });
    }

    throw new Error('Unsupported file format. Use CSV or JSON.');
};

/**
 * Validates if a parsed book object contains the minimum required fields for import.
 * @param {Partial<Book>} book - The book data to validate.
 * @returns {boolean} True if the book is valid for import.
 */
export const validateImportedBook = (book: Partial<Book>): book is Book => {
    return !!(book.title && book.author);
};
