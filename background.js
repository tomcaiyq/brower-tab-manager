// Background service worker - 跟踪标签关闭事件

const MAX_RECENTLY_CLOSED = 50;

// 提取域名
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url || '';
  }
}

// 监听标签关闭事件，保存到 chrome.storage
chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    const result = await chrome.storage.local.get(['tabCache', 'recentlyClosed']);
    const tabCache = result.tabCache || {};
    const recentlyClosed = result.recentlyClosed || [];

    const closedTab = tabCache[tabId];
    if (closedTab) {
      const newRecentlyClosed = [
        { ...closedTab, closedAt: Date.now() },
        ...recentlyClosed,
      ].slice(0, MAX_RECENTLY_CLOSED);

      await chrome.storage.local.set({ recentlyClosed: newRecentlyClosed });

      // 清理缓存
      delete tabCache[tabId];
      await chrome.storage.local.set({ tabCache });
    }
  } catch (error) {
    console.error('保存关闭标签失败:', error);
  }
});

// 缓存标签信息，以便关闭时能获取到标题等数据
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.title || changeInfo.url) {
    try {
      const result = await chrome.storage.local.get('tabCache');
      const tabCache = result.tabCache || {};
      tabCache[tabId] = {
        id: tabId,
        title: tab.title || tab.url || 'Untitled',
        url: tab.url || '',
        domain: extractDomain(tab.url),
        favicon: tab.favIconUrl || '',
        lastAccessed: Date.now(),
      };
      await chrome.storage.local.set({ tabCache });
    } catch (error) {
      console.error('缓存标签失败:', error);
    }
  }
});

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['recentlyClosed', 'favorites']);
  if (!result.recentlyClosed) {
    await chrome.storage.local.set({ recentlyClosed: [] });
  }
  if (!result.favorites) {
    await chrome.storage.local.set({ favorites: [] });
  }
});
