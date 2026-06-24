import { create } from 'zustand';
import type { TabItem, ViewMode, SortMode } from '@/types';

interface TabStore {
  tabs: TabItem[];
  recentlyClosed: TabItem[];
  favorites: number[];
  searchQuery: string;
  activeView: ViewMode;
  sortMode: SortMode;
  selectedTabId?: number;
  loading: boolean;

  setSearchQuery: (query: string) => void;
  setActiveView: (view: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
  setSelectedTab: (id?: number) => void;

  loadTabs: () => Promise<void>;
  loadRecentlyClosed: () => Promise<void>;
  loadFavorites: () => Promise<void>;

  activateTab: (id: number) => Promise<void>;
  closeTab: (id: number) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;

  restoreTab: (tab: TabItem) => Promise<void>;
  clearRecentlyClosed: () => Promise<void>;

  getFilteredTabs: () => TabItem[];
  getTabsByDomain: () => Record<string, TabItem[]>;
  getFavoriteTabs: () => TabItem[];
  getDomainStats: () => { domain: string; count: number }[];
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function isExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.tabs;
}

// 将 chrome.tabs.Tab 转换为 TabItem
function chromeTabToTabItem(tab: chrome.tabs.Tab): TabItem {
  return {
    id: tab.id!,
    title: tab.title || tab.url || 'Untitled',
    url: tab.url || '',
    domain: extractDomain(tab.url || ''),
    favicon: tab.favIconUrl || '',
    isActive: tab.active,
    isPinned: tab.pinned,
    isFavorite: false,
    createdAt: 0,
    lastAccessed: Date.now(),
  };
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  recentlyClosed: [],
  favorites: [],
  searchQuery: '',
  activeView: 'all',
  sortMode: 'recent',
  selectedTabId: undefined,
  loading: true,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveView: (view) => set({ activeView: view }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setSelectedTab: (id) => set({ selectedTabId: id }),

  loadTabs: async () => {
    if (!isExtensionContext()) {
      set({ loading: false });
      return;
    }
    try {
      const chromeTabs = await chrome.tabs.query({});
      const result = await chrome.storage.local.get('favorites');
      const favorites: number[] = (result.favorites as number[]) || [];
      const tabs = chromeTabs
        .filter((t) => !t.url?.startsWith('chrome://') && !t.url?.startsWith('chrome-extension://'))
        .map((t) => {
          const item = chromeTabToTabItem(t);
          item.isFavorite = favorites.includes(t.id!);
          return item;
        });
      set({ tabs, loading: false });
    } catch (error) {
      console.error('Failed to load tabs:', error);
      set({ loading: false });
    }
  },

  loadRecentlyClosed: async () => {
    if (!isExtensionContext()) return;
    try {
      const result = await chrome.storage.local.get('recentlyClosed');
      const recentlyClosed: TabItem[] = (result.recentlyClosed as TabItem[]) || [];
      set({ recentlyClosed });
    } catch (error) {
      console.error('Failed to load recently closed:', error);
    }
  },

  loadFavorites: async () => {
    if (!isExtensionContext()) return;
    try {
      const result = await chrome.storage.local.get('favorites');
      const favorites: number[] = (result.favorites as number[]) || [];
      set({ favorites });
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  },

  activateTab: async (id) => {
    if (!isExtensionContext()) return;
    try {
      await chrome.tabs.update(id, { active: true });
      // 获取标签所在的窗口并聚焦
      const tab = await chrome.tabs.get(id);
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      window.close();
    } catch (error) {
      console.error('Failed to activate tab:', error);
    }
  },

  closeTab: async (id) => {
    if (!isExtensionContext()) return;
    try {
      await chrome.tabs.remove(id);
      // 更新本地状态
      const { tabs } = get();
      set({ tabs: tabs.filter((t) => t.id !== id) });
    } catch (error) {
      console.error('Failed to close tab:', error);
    }
  },

  toggleFavorite: async (id) => {
    if (!isExtensionContext()) return;
    try {
      const result = await chrome.storage.local.get('favorites');
      const favorites: number[] = (result.favorites as number[]) || [];
      const newFavorites = favorites.includes(id)
        ? favorites.filter((f: number) => f !== id)
        : [...favorites, id];
      await chrome.storage.local.set({ favorites: newFavorites });

      // 更新本地状态
      const { tabs } = get();
      set({
        favorites: newFavorites,
        tabs: tabs.map((t) =>
          t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
        ),
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  },

  restoreTab: async (tab) => {
    if (!isExtensionContext()) return;
    try {
      await chrome.tabs.create({ url: tab.url, active: true });
      // 从最近关闭列表中移除
      const { recentlyClosed } = get();
      const newRecentlyClosed = recentlyClosed.filter((t) => t.id !== tab.id);
      await chrome.storage.local.set({ recentlyClosed: newRecentlyClosed });
      set({ recentlyClosed: newRecentlyClosed });
      window.close();
    } catch (error) {
      console.error('Failed to restore tab:', error);
    }
  },

  clearRecentlyClosed: async () => {
    if (!isExtensionContext()) return;
    try {
      await chrome.storage.local.set({ recentlyClosed: [] });
      set({ recentlyClosed: [] });
    } catch (error) {
      console.error('Failed to clear recently closed:', error);
    }
  },

  getFilteredTabs: () => {
    const { tabs, searchQuery, sortMode, activeView } = get();
    let filtered = [...tabs];

    if (activeView === 'favorites') {
      filtered = filtered.filter((t) => t.isFavorite);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tab) =>
          tab.title.toLowerCase().includes(query) ||
          tab.url.toLowerCase().includes(query) ||
          tab.domain.toLowerCase().includes(query)
      );
    }

    switch (sortMode) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'domain':
        filtered.sort((a, b) => a.domain.localeCompare(b.domain));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => b.lastAccessed - a.lastAccessed);
        break;
    }

    return filtered;
  },

  getTabsByDomain: () => {
    const { getFilteredTabs } = get();
    const tabs = getFilteredTabs();
    const byDomain: Record<string, TabItem[]> = {};
    tabs.forEach((tab) => {
      if (!byDomain[tab.domain]) {
        byDomain[tab.domain] = [];
      }
      byDomain[tab.domain].push(tab);
    });
    return byDomain;
  },

  getFavoriteTabs: () => {
    const { getFilteredTabs } = get();
    return getFilteredTabs().filter((t) => t.isFavorite);
  },

  getDomainStats: () => {
    const { tabs } = get();
    const stats: Record<string, number> = {};
    tabs.forEach((tab) => {
      stats[tab.domain] = (stats[tab.domain] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  },
}));
