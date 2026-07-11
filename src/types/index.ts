export type BookStatus = 'prelude' | 'andante' | 'finale';
export type ReadingStatus = BookStatus;

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  cover: string;
  description: string;
  publishedYear: number;
  publisher: string;
  pageCount: number;
  currentPage?: number;
  status: BookStatus;
  startDate: string | null;
  finishDate: string | null;
  progress: number;
  rating: number;
  review: string;
  tags: string[];
  readingOrder?: number;
  genre?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Excerpt {
  id: string;
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
  content: string;
  thought: string;
  pageNumber?: number;
  page?: number;
  chapter: string;
  tags: string[];
  isVoiceInput?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Character {
  id: string;
  name: string;
  bookIds: string[];
  description: string;
  notes: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

export interface KnowledgeLink {
  id: string;
  sourceId: string;
  targetId: string;
  sourceType: 'book' | 'character' | 'tag';
  targetType: 'book' | 'character' | 'tag';
  relation: string;
  strength: number;
  createdAt: string;
}

export interface ReadingActivity {
  date: string;
  pagesRead: number;
  excerptsAdded: number;
}

export interface DailyGreeting {
  text: string;
  subtext: string;
}

export interface ReadingGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type SortOption = 'newest' | 'oldest' | 'title' | 'rating' | 'progress' | 'book';

export interface FilterChip {
  id: string;
  label: string;
  active: boolean;
}
