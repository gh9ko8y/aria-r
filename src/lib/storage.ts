import type { Book, Excerpt, Tag, Character, KnowledgeLink, ReadingGoal, Essay, User, ReadingLog } from '@/types';
import { mockBooks, mockExcerpts, mockTags, mockCharacters, mockKnowledgeLinks, mockEssays, mockUser, mockReadingLogs } from '@/data/mockData';

const STORAGE_KEYS = {
  BOOKS: 'aria-r:books',
  EXCERPTS: 'aria-r:excerpts',
  TAGS: 'aria-r:tags',
  CHARACTERS: 'aria-r:characters',
  KNOWLEDGE_LINKS: 'aria-r:knowledge-links',
  READING_GOALS: 'aria-r:reading-goals',
  ESSAYS: 'aria-r:essays',
  USER: 'aria-r:user',
  READING_LOGS: 'aria-r:reading-logs',
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
  setItem(STORAGE_KEYS.ESSAYS, mockEssays);
  setItem(STORAGE_KEYS.USER, mockUser);
  setItem(STORAGE_KEYS.READING_LOGS, mockReadingLogs);
  setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// Aliases for compatibility
export const initMockData = initializeData;
export const initMockDataIfEmpty = initializeData;

// ─── Books ─────────────────────────────────────

export function getBooks(): Book[] {
  return getItem<Book[]>(STORAGE_KEYS.BOOKS, []);
}

export function saveBooks(books: Book[]): void {
  setItem(STORAGE_KEYS.BOOKS, books);
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

export function getBookById(id: string): Book | undefined {
  return getBooks().find(b => b.id === id);
}

// ─── Excerpts ──────────────────────────────────

export function getExcerpts(): Excerpt[] {
  return getItem<Excerpt[]>(STORAGE_KEYS.EXCERPTS, []);
}

export function saveExcerpts(excerpts: Excerpt[]): void {
  setItem(STORAGE_KEYS.EXCERPTS, excerpts);
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

export function getExcerptsByBookId(bookId: string): Excerpt[] {
  return getExcerpts().filter(e => e.bookId === bookId);
}

export function getRecentExcerpts(limit: number = 4): Excerpt[] {
  return getExcerpts()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// ─── Tags ──────────────────────────────────────

export function getTags(): Tag[] {
  return getItem<Tag[]>(STORAGE_KEYS.TAGS, []);
}

export const getAllTags = getTags;

export function saveTags(tags: Tag[]): void {
  setItem(STORAGE_KEYS.TAGS, tags);
}

// ─── Characters ────────────────────────────────

export function getCharacters(): Character[] {
  return getItem<Character[]>(STORAGE_KEYS.CHARACTERS, []);
}

export function saveCharacters(characters: Character[]): void {
  setItem(STORAGE_KEYS.CHARACTERS, characters);
}

// ─── Knowledge Links ───────────────────────────

export function getKnowledgeLinks(): KnowledgeLink[] {
  return getItem<KnowledgeLink[]>(STORAGE_KEYS.KNOWLEDGE_LINKS, []);
}

export function saveKnowledgeLinks(links: KnowledgeLink[]): void {
  setItem(STORAGE_KEYS.KNOWLEDGE_LINKS, links);
}

// ─── Reading Goals ─────────────────────────────

export function getReadingGoals(): ReadingGoal[] {
  return getItem<ReadingGoal[]>(STORAGE_KEYS.READING_GOALS, []);
}

export function saveReadingGoals(goals: ReadingGoal[]): void {
  setItem(STORAGE_KEYS.READING_GOALS, goals);
}

// ─── Essays (随笔) ─────────────────────────────

export function getEssays(): Essay[] {
  return getItem<Essay[]>(STORAGE_KEYS.ESSAYS, []);
}

export function saveEssays(essays: Essay[]): void {
  setItem(STORAGE_KEYS.ESSAYS, essays);
}

export function addEssay(essay: Essay): void {
  const essays = getEssays();
  essays.unshift(essay);
  saveEssays(essays);
}

export function updateEssay(updated: Essay): void {
  const essays = getEssays();
  const idx = essays.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    essays[idx] = updated;
    saveEssays(essays);
  }
}

export function deleteEssay(id: string): void {
  const essays = getEssays().filter(e => e.id !== id);
  saveEssays(essays);
}

export function getPinnedEssays(): Essay[] {
  return getEssays().filter(e => e.isPinned);
}

// ─── User (用户) ───────────────────────────────

export function getUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.USER, null);
}

export function saveUser(user: User): void {
  setItem(STORAGE_KEYS.USER, user);
}

// ─── Reading Logs (阅读日志) ───────────────────

export function getReadingLogs(): ReadingLog[] {
  return getItem<ReadingLog[]>(STORAGE_KEYS.READING_LOGS, []);
}

export function saveReadingLogs(logs: ReadingLog[]): void {
  setItem(STORAGE_KEYS.READING_LOGS, logs);
}

export function addReadingLog(log: ReadingLog): void {
  const logs = getReadingLogs();
  logs.unshift(log);
  saveReadingLogs(logs);
}

export function getReadingLogsByBookId(bookId: string): ReadingLog[] {
  return getReadingLogs().filter(l => l.bookId === bookId);
}

export function getReadingLogsByDate(date: string): ReadingLog[] {
  return getReadingLogs().filter(l => l.date === date);
}

// ─── Stats ─────────────────────────────────────

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
  totalEssays: number;
  preludeCount: number;
  finaleCount: number;
} {
  const books = getBooks();
  const excerpts = getExcerpts();
  const essays = getEssays();
  return {
    totalBooks: books.length,
    currentlyReading: books.filter(b => b.status === 'andante').length,
    totalExcerpts: excerpts.length,
    finishedThisMonth: getFinishedThisMonth().length,
    totalEssays: essays.length,
    preludeCount: books.filter(b => b.status === 'prelude').length,
    finaleCount: books.filter(b => b.status === 'finale').length,
  };
}

// ─── Greeting ──────────────────────────────────

export function getGreeting(): { text: string; subtext: string } {
  const hour = new Date().getHours();
  const user = getUser();
  const name = user?.nickname || '读者';

  if (hour >= 6 && hour < 12) {
    return { text: `早上好，${name} ☀️`, subtext: '新的一天，从阅读开始' };
  } else if (hour >= 12 && hour < 14) {
    return { text: `午安，${name} 🍃`, subtext: '午后时光，适合静下心来读书' };
  } else if (hour >= 14 && hour < 18) {
    return { text: `下午好，${name} 🌤️`, subtext: '继续你的阅读之旅吧' };
  } else if (hour >= 18 && hour < 22) {
    return { text: `晚上好，${name} 🌙`, subtext: '夜晚是阅读的最佳时光' };
  } else {
    return { text: `夜深了，${name} ✨`, subtext: '一盏灯，一本书，一段静谧时光' };
  }
}
