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
  progress: number; // 0-100
  rating: number; // 0-5
  review: string;
  tags: string[];
  readingOrder?: number;
  genre?: string;
  content?: string; // 书籍内容，用于线上阅读
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

export interface Essay {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  tags: string[];
  relatedBookId?: string;
  relatedExcerptId?: string;
  mood?: string;
  location?: string;
  weather?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female' | 'other' | '';
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingLog {
  id: string;
  bookId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  startPage?: number;
  endPage?: number;
  note?: string;
  createdAt: string;
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
  strength: number; // 1-10
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
