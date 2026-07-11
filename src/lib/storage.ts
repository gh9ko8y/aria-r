import type { Book, Excerpt, Tag, Character, KnowledgeLink, ReadingGoal } from '@/types';
import { mockBooks, mockExcerpts, mockTags, mockCharacters, mockKnowledgeLinks } from '@/data/mockData';

const STORAGE_KEYS = {
  BOOKS: 'aria-r:books',
  EXCERPTS: 'aria-r:excerpts',
  TAGS: 'aria-r:tags',
  CHARACTERS: 'aria-r:characters',
  KNOWLEDGE_LINKS: 'aria-r:knowledge-links',
  READING_GOALS: 'aria-r:reading-goals',
  INITIALIZED: 'aria-r:initialized',
} as const;

function getItem<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function initializeData(): void {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (initialized) return;

  setItem(STORAGE_KEYS.BOOKS, mockBooks);
  setItem(STORAGE_KEYS.EXCERPTS, mockExcerpts);
  setItem(STORAGE_KEYS.TAGS, mockTags);
  setItem(STORAGE_KEYS.CHARACTERS, mockCharacters);
  setItem(STORAGE_KEYS.KNOWLEDGE_LINKS, mockKnowledgeLinks);
  setItem(STORAGE_KEYS.READING_GOALS, []);
  setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export const initMockData = initializeData;
export const initMockDataIfEmpty = initializeData;

export function getBooks(): Book[] {
  return getItem<Book[]>(STORAGE_KEYS.BOOKS, []);
}

export function saveBooks(books: Book[]): void {
  setItem(STORAGE_KEYS.BOOKS, books);
}

export function getExcerpts(): Excerpt[] {
  return getItem<Excerpt[]>(STORAGE_KEYS.EXCERPTS, []);
}

export function saveExcerpts(excerpts: Excerpt[]): void {
  setItem(STORAGE_KEYS.EXCERPTS, excerpts);
}

export function getTags(): Tag[] {
  return getItem<Tag[]>(STORAGE_KEYS.TAGS, []);
}

export const getAllTags = getTags;

export function saveTags(tags: Tag[]): void {
  setItem(STORAGE_KEYS.TAGS, tags);
}

export function getCharacters(): Character[] {
  return getItem<Character[]>(STORAGE_KEYS.CHARACTERS, []);
}

export function saveCharacters(characters: Character[]): void {
  setItem(STORAGE_KEYS.CHARACTERS, characters);
}

export function getKnowledgeLinks(): KnowledgeLink[] {
  return getItem<KnowledgeLink[]>(STORAGE_KEYS.KNOWLEDGE_LINKS, []);
}

export function saveKnowledgeLinks(links: KnowledgeLink[]): void {
  setItem(STORAGE_KEYS.KNOWLEDGE_LINKS, links);
}

export function getReadingGoals(): ReadingGoal[] {
  return getItem<ReadingGoal[]>(STORAGE_KEYS.READING_GOALS, []);
}

export function saveReadingGoals(goals: ReadingGoal[]): void {
  setItem(STORAGE_KEYS.READING_GOALS, goals);
}

export function addBook(book: Book): void {
  const books = getBooks();
  books.push(book);
  saveBooks(books);
}

export function updateBook(updated: Book): void {
  const books = getBooks();
  const idx = books.findIndex(b => b.id === updated.id);
  if (idx !== -1) {
    books[idx] = { ...updated, updatedAt: new Date().toISOString() };
    saveBooks(books);
  }
}

export function deleteBook(id: string): void {
  const books = getBooks().filter(b => b.id !== id);
  saveBooks(books);
  const excerpts = getExcerpts().filter(e => e.bookId !== id);
  saveExcerpts(excerpts);
}

export function addExcerpt(excerpt: Excerpt): void {
  const excerpts = getExcerpts();
  excerpts.unshift(excerpt);
  saveExcerpts(excerpts);
}

export function updateExcerpt(updated: Excerpt): void {
  const excerpts = getExcerpts();
  const idx = excerpts.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    excerpts[idx] = updated;
    saveExcerpts(excerpts);
  }
}

export function deleteExcerpt(id: string): void {
  const excerpts = getExcerpts().filter(e => e.id !== id);
  saveExcerpts(excerpts);
}

export function getBookById(id: string): Book | undefined {
  return getBooks().find(b => b.id === id);
}

export function getExcerptsByBookId(bookId: string): Excerpt[] {
  return getExcerpts().filter(e => e.bookId === bookId);
}

export function getRecentExcerpts(limit: number = 4): Excerpt[] {
  return getExcerpts()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getCurrentlyReading(): Book[] {
  return getBooks().filter(b => b.status === 'andante');
}

export function getFinishedThisMonth(): Book[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return getBooks().filter(
    b => b.status === 'finale' && b.finishDate && b.finishDate >= monthStart
  );
}

export function getReadingStats(): {
  totalBooks: number;
  currentlyReading: number;
  totalExcerpts: number;
  finishedThisMonth: number;
} {
  const books = getBooks();
  const excerpts = getExcerpts();
  return {
    totalBooks: books.length,
    currentlyReading: books.filter(b => b.status === 'andante').length,
    totalExcerpts: excerpts.length,
    finishedThisMonth: getFinishedThisMonth().length,
  };
}
