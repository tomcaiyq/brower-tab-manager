// Background service worker - 跟踪标签关闭事件

const MAX_RECENTLY_CLOSED = 50;

interface CachedTab {
  id: number;
  title: string;
  url: string;
  domain: string;
  favicon: string;
  windowId: number;
  updatedAt: number;
}

// 监听标签关闭事件，保存到 chrome.storage
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    const result = await chrome.storage.local.get(['tabCache', 'recentlyClosed']);
    const tabCache: Record<number, CachedTab> = (result.tabCache as Record<number, CachedTab>) || {};
    const recentlyClosed: CachedTab[] = (result.recentlyClosed as CachedTab[]) || [];

    const closedTab = tabCache[tabId];
    if (closedTab) {
      const newRecentlyClosed = [
        { ...closedTab, closedAt: Date.now() },
        ...recentlyClosed,
      ].slice(0, MAX_RECENTLY_CLOSED);

      await chrome.storage.local.set({ recentlyClosed: newRecentlyClosed });

      delete tabCache[tabId];
      await chrome.storage.local.set({ tabCache });
    }
  } catch (error) {
    console.error('Error saving closed tab:', error);
  }
});

// 定期缓存所有标签信息，以便关闭时能获取到标题等数据
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.title || changeInfo.url) {
    try {
      const result = await chrome.storage.local.get('tabCache');
      const tabCache: Record<number, CachedTab> = (result.tabCache as Record<number, CachedTab>) || {};
      tabCache[tabId] = {
        id: tab.id!,
        title: tab.title || tab.url || 'Untitled',
        url: tab.url || '',
        domain: extractDomain(tab.url || ''),
        favicon: tab.favIconUrl || '',
        windowId: tab.windowId!,
        updatedAt: Date.now(),
      };
      await chrome.storage.local.set({ tabCache });
    } catch (error) {
      console.error('Error caching tab:', error);
    }
  }
});

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get('recentlyClosed');
  if (!result.recentlyClosed) {
    await chrome.storage.local.set({ recentlyClosed: [] });
  }
});
