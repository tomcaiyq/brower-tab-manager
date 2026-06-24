import { Search, X, ArrowUpDown, AArrowDown, Globe, Clock } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import type { SortMode } from '@/types';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, sortMode, setSortMode, tabs } = useTabStore();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCount = useTabStore((s) => s.getFilteredTabs().length);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions: { id: SortMode; label: string; icon: typeof Clock }[] = [
    { id: 'recent', label: '最近访问', icon: Clock },
    { id: 'title', label: '按标题', icon: AArrowDown },
    { id: 'domain', label: '按域名', icon: Globe },
  ];

  const currentSort = sortOptions.find((o) => o.id === sortMode) || sortOptions[0];
  const CurrentSortIcon = currentSort.icon;

  return (
    <div className="flex items-center gap-4 p-5 border-b border-glass-border">
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索标签页... (标题、网址、域名)"
          className="w-full h-12 pl-12 pr-10 rounded-xl glass-card text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)] transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="px-4 py-2 rounded-lg glass-card">
          <span className="text-sm text-gray-400">
            共 <span className="text-neon-cyan font-semibold">{filteredCount}</span> / {tabs.length} 个
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={cn(
              'h-12 px-4 rounded-xl glass-card flex items-center gap-2 text-sm transition-all duration-200',
              showSortMenu
                ? 'border-neon-cyan/30 text-neon-cyan'
                : 'text-gray-400 hover:text-white hover:border-white/20'
            )}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline">{currentSort.label}</span>
          </button>

          {showSortMenu && (
            <div className="absolute top-full right-0 mt-2 w-40 glass-card rounded-xl py-2 z-50 animate-fade-in shadow-xl">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const isActive = sortMode === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortMode(option.id);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                      isActive
                        ? 'text-neon-cyan bg-neon-cyan/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
