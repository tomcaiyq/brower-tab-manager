// ===== 状态管理 =====
const state = {
  tabs: [],
  recentlyClosed: [],
  favorites: [],
  searchQuery: '',
  activeView: 'all',
  sortMode: 'recent',
  loading: true,
};

// ===== DOM 元素 =====
const dom = {
  searchInput: document.getElementById('search-input'),
  searchClear: document.getElementById('search-clear'),
  filteredCount: document.getElementById('filtered-count'),
  totalCount: document.getElementById('total-count'),
  sortBtn: document.getElementById('sort-btn'),
  sortLabel: document.getElementById('sort-label'),
  sortMenu: document.getElementById('sort-menu'),
  navItems: document.querySelectorAll('.nav-item'),
  tabList: document.getElementById('tab-list'),
  groupList: document.getElementById('group-list'),
  recentList: document.getElementById('recent-list'),
  emptyState: document.getElementById('empty-state'),
  loadingState: document.getElementById('loading-state'),
  content: document.getElementById('content'),
  countAll: document.getElementById('count-all'),
  countGroups: document.getElementById('count-groups'),
  countFavorites: document.getElementById('count-favorites'),
  countRecent: document.getElementById('count-recent'),
  totalTabs: document.getElementById('total-tabs'),
  storageFill: document.getElementById('storage-fill'),
  domainStats: document.getElementById('domain-stats'),
  domainList: document.getElementById('domain-list'),
};

// ===== 工具函数 =====
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url || '';
  }
}

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return '刚刚';
  if (min < 60) return min + ' 分钟前';
  if (hr < 24) return hr + ' 小时前';
  if (day < 7) return day + ' 天前';
  const d = new Date(timestamp);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function highlightText(text, query) {
  if (!query.trim()) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lower.indexOf(lowerQuery);
  if (idx === -1) return escaped;
  return escaped.slice(0, idx) +
    '<mark>' + escaped.slice(idx, idx + query.length) + '</mark>' +
    escaped.slice(idx + query.length);
}

// ===== 数据加载 =====
async function loadTabs() {
  try {
    const chromeTabs = await chrome.tabs.query({});
    state.tabs = chromeTabs
      .filter(t => !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
      .map(t => ({
        id: t.id,
        title: t.title || t.url || 'Untitled',
        url: t.url,
        domain: extractDomain(t.url),
        favicon: t.favIconUrl || '',
        isActive: t.active,
        isPinned: t.pinned,
        isFavorite: state.favorites.includes(t.id),
        lastAccessed: Date.now(),
      }));
  } catch (e) {
    console.error('加载标签失败:', e);
    state.tabs = [];
  }
  state.loading = false;
  render();
}

async function loadFavorites() {
  try {
    const result = await chrome.storage.local.get('favorites');
    state.favorites = result.favorites || [];
  } catch (e) {
    state.favorites = [];
  }
}

async function loadRecentlyClosed() {
  try {
    const result = await chrome.storage.local.get('recentlyClosed');
    state.recentlyClosed = result.recentlyClosed || [];
  } catch (e) {
    state.recentlyClosed = [];
  }
}

// ===== 标签操作 =====
async function activateTab(id) {
  try {
    await chrome.tabs.update(id, { active: true });
    const tab = await chrome.tabs.get(id);
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
    window.close();
  } catch (e) {
    console.error('切换标签失败:', e);
  }
}

async function closeTab(id) {
  try {
    await chrome.tabs.remove(id);
    state.tabs = state.tabs.filter(t => t.id !== id);
    render();
  } catch (e) {
    console.error('关闭标签失败:', e);
  }
}

async function toggleFavorite(id) {
  const idx = state.favorites.indexOf(id);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
  } else {
    state.favorites.push(id);
  }
  await chrome.storage.local.set({ favorites: state.favorites });
  state.tabs = state.tabs.map(t =>
    t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
  );
  render();
}

async function restoreTab(tab) {
  try {
    await chrome.tabs.create({ url: tab.url, active: true });
    state.recentlyClosed = state.recentlyClosed.filter(t => t.id !== tab.id);
    await chrome.storage.local.set({ recentlyClosed: state.recentlyClosed });
    window.close();
  } catch (e) {
    console.error('恢复标签失败:', e);
  }
}

async function clearRecentlyClosed() {
  state.recentlyClosed = [];
  await chrome.storage.local.set({ recentlyClosed: [] });
  render();
}

// ===== 过滤与排序 =====
function getFilteredTabs() {
  let filtered = [...state.tabs];

  if (state.activeView === 'favorites') {
    filtered = filtered.filter(t => t.isFavorite);
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.url.toLowerCase().includes(q) ||
      t.domain.toLowerCase().includes(q)
    );
  }

  switch (state.sortMode) {
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'domain':
      filtered.sort((a, b) => a.domain.localeCompare(b.domain));
      break;
    default:
      filtered.sort((a, b) => b.lastAccessed - a.lastAccessed);
  }

  return filtered;
}

function getTabsByDomain() {
  const tabs = getFilteredTabs();
  const groups = {};
  tabs.forEach(t => {
    if (!groups[t.domain]) groups[t.domain] = [];
    groups[t.domain].push(t);
  });
  return groups;
}

function getDomainStats() {
  const stats = {};
  state.tabs.forEach(t => {
    stats[t.domain] = (stats[t.domain] || 0) + 1;
  });
  return Object.entries(stats)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);
}

// ===== 渲染 =====
function render() {
  renderCounts();
  renderSearchInfo();
  renderDomainStats();

  // 隐藏所有视图
  dom.tabList.style.display = 'none';
  dom.groupList.style.display = 'none';
  dom.recentList.style.display = 'none';
  dom.emptyState.style.display = 'none';
  dom.loadingState.style.display = 'none';

  if (state.loading) {
    dom.loadingState.style.display = 'flex';
    return;
  }

  switch (state.activeView) {
    case 'groups':
      renderGroupView();
      break;
    case 'favorites':
      renderTabList();
      break;
    case 'recent':
      renderRecentView();
      break;
    default:
      renderTabList();
  }
}

function renderCounts() {
  dom.countAll.textContent = state.tabs.length;
  dom.countGroups.textContent = getDomainStats().length;
  dom.countFavorites.textContent = state.tabs.filter(t => t.isFavorite).length;
  dom.countRecent.textContent = state.recentlyClosed.length;
  dom.totalTabs.textContent = state.tabs.length + ' 个';
  dom.storageFill.style.width = Math.min(state.tabs.length, 100) + '%';
}

function renderSearchInfo() {
  const filtered = getFilteredTabs();
  dom.filteredCount.textContent = filtered.length;
  dom.totalCount.textContent = state.tabs.length;
}

function renderDomainStats() {
  if (state.activeView !== 'all') {
    dom.domainStats.style.display = 'none';
    return;
  }
  const stats = getDomainStats().slice(0, 6);
  if (stats.length === 0) {
    dom.domainStats.style.display = 'none';
    return;
  }
  dom.domainStats.style.display = 'block';
  dom.domainList.innerHTML = stats.map(s => `
    <div class="domain-item" data-domain="${escapeHtml(s.domain)}">
      <span class="domain-name">${escapeHtml(s.domain)}</span>
      <span class="domain-count">${s.count}</span>
    </div>
  `).join('');

  // 点击域名搜索
  dom.domainList.querySelectorAll('.domain-item').forEach(el => {
    el.addEventListener('click', () => {
      state.searchQuery = el.dataset.domain;
      dom.searchInput.value = state.searchQuery;
      dom.searchClear.style.display = 'block';
      render();
    });
  });
}

function renderTabList() {
  const tabs = getFilteredTabs();
  if (tabs.length === 0) {
    dom.emptyState.style.display = 'flex';
    return;
  }
  dom.tabList.style.display = 'grid';
  dom.tabList.innerHTML = tabs.map((tab, i) => createTabCard(tab, i)).join('');
  bindTabCardEvents();
}

function createTabCard(tab, index) {
  const delay = Math.min(index * 25, 250);
  const faviconHtml = tab.favicon
    ? `<img src="${escapeHtml(tab.favicon)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="fallback" style="display:none">${escapeHtml(tab.domain[0] || '?').toUpperCase()}</span>`
    : `<span class="fallback">${escapeHtml(tab.domain[0] || '?').toUpperCase()}</span>`;

  return `
    <div class="tab-card ${tab.isActive ? 'active-tab' : ''}" data-id="${tab.id}" style="animation-delay:${delay}ms">
      <div class="tab-card-header">
        <div class="tab-favicon">${faviconHtml}</div>
        <div class="tab-info">
          <div class="tab-title-row">
            <span class="tab-title">${highlightText(tab.title, state.searchQuery)}</span>
            ${tab.isPinned ? '<svg class="tab-pin-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/></svg>' : ''}
          </div>
          <div class="tab-domain">${highlightText(tab.domain, state.searchQuery)}</div>
          <div class="tab-footer">
            <span class="tab-time">${formatTimeAgo(tab.lastAccessed)}</span>
            <div class="tab-actions">
              <button class="tab-action-btn fav-btn ${tab.isFavorite ? 'fav-active' : ''}" data-id="${tab.id}" title="${tab.isFavorite ? '取消收藏' : '收藏'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${tab.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
              <button class="tab-action-btn close-btn" data-id="${tab.id}" title="关闭标签">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindTabCardEvents() {
  dom.tabList.querySelectorAll('.tab-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    card.addEventListener('click', e => {
      if (e.target.closest('.tab-action-btn')) return;
      activateTab(id);
    });
  });

  dom.tabList.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(parseInt(btn.dataset.id));
    });
  });

  dom.tabList.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeTab(parseInt(btn.dataset.id));
    });
  });
}

function renderGroupView() {
  const groups = getTabsByDomain();
  const domains = Object.keys(groups).sort();

  if (domains.length === 0) {
    dom.emptyState.style.display = 'flex';
    return;
  }

  dom.groupList.style.display = 'flex';

  dom.groupList.innerHTML = domains.map((domain, i) => {
    const tabs = groups[domain];
    const delay = Math.min(i * 50, 300);
    return `
      <div class="group-section" data-domain="${escapeHtml(domain)}" style="animation-delay:${delay}ms">
        <button class="group-header">
          <div class="group-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <span class="group-name">${escapeHtml(domain)}</span>
          <span class="group-count">${tabs.length} 个标签</span>
          <svg class="group-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="group-content">
          ${tabs.map((tab, j) => createTabCard(tab, j)).join('')}
        </div>
      </div>
    `;
  }).join('');

  // 分组展开/收起
  dom.groupList.querySelectorAll('.group-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('collapsed');
    });
  });

  // 绑定卡片事件
  dom.groupList.querySelectorAll('.tab-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    card.addEventListener('click', e => {
      if (e.target.closest('.tab-action-btn')) return;
      activateTab(id);
    });
  });

  dom.groupList.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(parseInt(btn.dataset.id));
    });
  });

  dom.groupList.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeTab(parseInt(btn.dataset.id));
    });
  });
}

function renderRecentView() {
  if (state.recentlyClosed.length === 0) {
    dom.emptyState.querySelector('.empty-title').textContent = '最近没有关闭的标签页';
    dom.emptyState.querySelector('.empty-desc').textContent = '关闭的标签页会显示在这里';
    dom.emptyState.style.display = 'flex';
    return;
  }

  dom.recentList.style.display = 'flex';
  dom.recentList.innerHTML = `
    <div class="recent-header">
      <h2>最近关闭</h2>
      <button class="recent-clear-btn" id="clear-recent-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        清空全部
      </button>
    </div>
    ${state.recentlyClosed.map((tab, i) => {
      const delay = Math.min(i * 30, 250);
      const faviconHtml = tab.favicon
        ? `<img src="${escapeHtml(tab.favicon)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="fallback" style="display:none">${escapeHtml(tab.domain[0] || '?').toUpperCase()}</span>`
        : `<span class="fallback">${escapeHtml(tab.domain[0] || '?').toUpperCase()}</span>`;
      return `
        <div class="recent-item" data-id="${tab.id}" style="animation-delay:${delay}ms">
          <div class="recent-favicon">${faviconHtml}</div>
          <div class="recent-info">
            <div class="recent-title">${escapeHtml(tab.title)}</div>
            <div class="recent-domain">${escapeHtml(tab.domain)}</div>
          </div>
          <span class="recent-time">${formatTimeAgo(tab.closedAt || tab.lastAccessed)}</span>
          <button class="recent-restore" data-id="${tab.id}" title="恢复标签">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
        </div>
      `;
    }).join('')}
  `;

  document.getElementById('clear-recent-btn').addEventListener('click', clearRecentlyClosed);

  dom.recentList.querySelectorAll('.recent-restore').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const tab = state.recentlyClosed.find(t => t.id === id);
      if (tab) restoreTab(tab);
    });
  });
}

// ===== 事件绑定 =====
function bindEvents() {
  // 搜索
  dom.searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    dom.searchClear.style.display = state.searchQuery ? 'block' : 'none';
    render();
  });

  dom.searchClear.addEventListener('click', () => {
    state.searchQuery = '';
    dom.searchInput.value = '';
    dom.searchClear.style.display = 'none';
    render();
    dom.searchInput.focus();
  });

  // 导航切换
  dom.navItems.forEach(item => {
    item.addEventListener('click', () => {
      dom.navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      state.activeView = item.dataset.view;
      render();
    });
  });

  // 排序
  dom.sortBtn.addEventListener('click', e => {
    e.stopPropagation();
    dom.sortMenu.style.display = dom.sortMenu.style.display === 'none' ? 'block' : 'none';
  });

  dom.sortMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sortMode = btn.dataset.sort;
      dom.sortLabel.textContent = btn.textContent;
      dom.sortMenu.style.display = 'none';
      dom.sortMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  // 点击外部关闭排序菜单
  document.addEventListener('click', e => {
    if (!e.target.closest('.sort-wrap')) {
      dom.sortMenu.style.display = 'none';
    }
  });

  // 键盘快捷键
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.searchQuery) {
      state.searchQuery = '';
      dom.searchInput.value = '';
      dom.searchClear.style.display = 'none';
      render();
    }
  });
}

// ===== 初始化 =====
async function init() {
  bindEvents();
  await loadFavorites();
  await loadRecentlyClosed();
  await loadTabs();
  dom.searchInput.focus();
}

init();
