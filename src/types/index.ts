export interface TabItem {
  id: number;
  title: string;
  url: string;
  domain: string;
  favicon: string;
  isActive: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  lastAccessed: number;
  closedAt?: number;
}

export type ViewMode = 'all' | 'groups' | 'favorites' | 'recent';

export type SortMode = 'recent' | 'title' | 'domain';
