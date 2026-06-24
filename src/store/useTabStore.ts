import { create } from 'zustand';
import type { TabItem, TabGroup, ViewMode, SortMode } from '@/types';
import { mockTabs, mockGroups, generateRecentlyClosedTabs } from '@/data/mockTabs';

interface TabStore {
  tabs: TabItem[];
  groups: TabGroup[];
  recentlyClosed: TabItem[];
  searchQuery: string;
  activeView: ViewMode;
  sortMode: SortMode;
  selectedTabId?: string;

  setSearchQuery: (query: string) => void;
  setActiveView: (view: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
  setSelectedTab: (id?: string) => void;

  activateTab: (id: string) => void;
  closeTab: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;

  restoreTab: (id: string) => void;
  clearRecentlyClosed: () => void;

  toggleGroupExpand: (groupId: string) => void;
  addGroup: (name: string, color: string) => void;
  removeGroup: (groupId: string) => void;

  getFilteredTabs: () => TabItem[];
  getTabsByDomain: () => Record<string, TabItem[]>;
  getFavoriteTabs: () => TabItem[];
  getDomainStats: () => { domain: string; count: number }[];
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: mockTabs,
  groups: mockGroups,
  recentlyClosed: generateRecentlyClosedTabs(),
  searchQuery: '',
  activeView: 'all',
  sortMode: 'recent',
  selectedTabId: undefined,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveView: (view) => set({ activeView: view }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setSelectedTab: (id) => set({ selectedTabId: id }),

  activateTab: (id) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => ({
        ...tab,
        isActive: tab.id === id,
        lastAccessed: tab.id === id ? Date.now() : tab.lastAccessed,
      })),
      selectedTabId: id,
    })),

  closeTab: (id) =>
    set((state) => {
      const tabToClose = state.tabs.find((t) => t.id === id);
      if (!tabToClose) return state;
      return {
        tabs: state.tabs.filter((t) => t.id !== id),
        recentlyClosed: [
          { ...tabToClose, lastAccessed: Date.now() },
          ...state.recentlyClosed.slice(0, 19),
        ],
      };
    }),

  toggleFavorite: (id) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, isFavorite: !tab.isFavorite } : tab
      ),
    })),

  togglePin: (id) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, isPinned: !tab.isPinned } : tab
      ),
    })),

  restoreTab: (id) =>
    set((state) => {
      const tabToRestore = state.recentlyClosed.find((t) => t.id === id);
      if (!tabToRestore) return state;
      return {
        recentlyClosed: state.recentlyClosed.filter((t) => t.id !== id),
        tabs: [{ ...tabToRestore, lastAccessed: Date.now() }, ...state.tabs],
      };
    }),

  clearRecentlyClosed: () => set({ recentlyClosed: [] }),

  toggleGroupExpand: (groupId) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
      ),
    })),

  addGroup: (name, color) =>
    set((state) => ({
      groups: [
        ...state.groups,
        {
          id: `group-${Date.now()}`,
          name,
          color,
          isExpanded: true,
        },
      ],
    })),

  removeGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      tabs: state.tabs.map((t) =>
        t.groupId === groupId ? { ...t, groupId: undefined } : t
      ),
    })),

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
