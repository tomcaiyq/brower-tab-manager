export interface TabItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon: string;
  isActive: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  lastAccessed: number;
  groupId?: string;
}

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
}

export type ViewMode = 'all' | 'groups' | 'favorites' | 'recent';

export type SortMode = 'recent' | 'title' | 'domain';

export interface AppState {
  tabs: TabItem[];
  groups: TabGroup[];
  recentlyClosed: TabItem[];
  searchQuery: string;
  activeView: ViewMode;
  sortMode: SortMode;
  selectedTabId?: string;
}
