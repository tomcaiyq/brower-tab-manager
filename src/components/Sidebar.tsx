import {
  LayoutGrid,
  Layers,
  Star,
  Clock,
  Globe2,
  Hash,
} from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import type { ViewMode } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: typeof LayoutGrid;
  count?: number;
}

export default function Sidebar() {
  const {
    tabs,
    activeView,
    setActiveView,
    groups,
    recentlyClosed,
    getDomainStats,
    toggleGroupExpand,
  } = useTabStore();

  const favoriteCount = tabs.filter((t) => t.isFavorite).length;
  const domainStats = getDomainStats();
  const totalTabs = tabs.length;

  const navItems: NavItem[] = [
    { id: 'all', label: '全部标签', icon: LayoutGrid, count: totalTabs },
    { id: 'groups', label: '按域名分组', icon: Layers, count: domainStats.length },
    { id: 'favorites', label: '收藏夹', icon: Star, count: favoriteCount },
    { id: 'recent', label: '最近关闭', icon: Clock, count: recentlyClosed.length },
  ];

  return (
    <aside className="w-64 h-full flex flex-col glass-card border-r border-glass-border flex-shrink-0">
      <div className="p-5 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Tab Manager</h1>
            <p className="text-xs text-gray-400">高效管理你的标签页</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-neon-cyan')} />
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      isActive
                        ? 'bg-neon-cyan/20 text-neon-cyan'
                        : 'bg-white/5 text-gray-500 group-hover:text-gray-300'
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 mb-2 px-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            手动分组
          </span>
        </div>

        <div className="space-y-1">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => toggleGroupExpand(group.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: group.color, boxShadow: `0 0 8px ${group.color}40` }}
              />
              <span className="flex-1 text-left text-sm">{group.name}</span>
              <span className="text-xs text-gray-500 group-hover:text-gray-400">
                {tabs.filter((t) => t.groupId === group.id).length}
              </span>
            </button>
          ))}
        </div>

        {activeView === 'all' && domainStats.length > 0 && (
          <>
            <div className="mt-6 mb-2 px-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                热门域名
              </span>
            </div>
            <div className="space-y-1 px-1">
              {domainStats.slice(0, 6).map((stat) => (
                <div
                  key={stat.domain}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <Globe2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="flex-1 text-xs text-gray-400 group-hover:text-gray-300 truncate">
                    {stat.domain}
                  </span>
                  <span className="text-xs text-gray-600">{stat.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-glass-border">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>存储使用</span>
          <span>{totalTabs} 个标签</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-500"
            style={{ width: `${Math.min((totalTabs / 100) * 100, 100)}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
