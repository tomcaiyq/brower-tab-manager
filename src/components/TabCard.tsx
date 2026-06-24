import { X, Star, Pin } from 'lucide-react';
import type { TabItem } from '@/types';
import { useTabStore } from '@/store/useTabStore';
import { cn, formatTimeAgo } from '@/lib/utils';
import { useState } from 'react';

interface TabCardProps {
  tab: TabItem;
  index?: number;
  highlightText?: string;
}

export default function TabCard({ tab, index = 0, highlightText }: TabCardProps) {
  const { activateTab, closeTab, toggleFavorite, selectedTabId } = useTabStore();
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedTabId === tab.id;

  const handleClick = () => {
    activateTab(tab.id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tab.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(tab.id);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-neon-cyan/30 text-neon-cyan rounded px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative p-3 rounded-lg cursor-pointer transition-all duration-300 glass-card group',
        'hover:border-neon-cyan/30 hover:shadow-[0_4px_20px_rgba(0,245,255,0.1)]',
        isSelected && 'border-neon-cyan/50 bg-neon-cyan/5',
        tab.isActive && 'border-neon-purple/40'
      )}
      style={{
        animation: `slideUp 0.3s ease-out ${Math.min(index * 25, 250)}ms both`,
      }}
    >
      {tab.isActive && (
        <div className="absolute -left-px top-2 bottom-2 w-0.5 bg-gradient-to-b from-neon-cyan to-neon-purple rounded-full" />
      )}

      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {tab.favicon ? (
            <img
              src={tab.favicon}
              alt=""
              className="w-4 h-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-xs text-gray-500">{tab.domain[0]?.toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-xs font-medium text-white truncate flex-1">
              {highlightMatch(tab.title, highlightText || '')}
            </h3>
            {tab.isPinned && (
              <Pin className="w-3 h-3 text-neon-cyan flex-shrink-0" fill="currentColor" />
            )}
          </div>
          <p className="text-[10px] text-gray-500 truncate mb-1.5">
            {highlightMatch(tab.domain, highlightText || '')}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-600">
              {formatTimeAgo(tab.lastAccessed)}
            </span>
            <div
              className={cn(
                'flex items-center gap-0.5 transition-opacity duration-200',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <button
                onClick={handleFavorite}
                className={cn(
                  'p-1 rounded-md transition-colors',
                  tab.isFavorite
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10'
                )}
                title={tab.isFavorite ? '取消收藏' : '收藏'}
              >
                <Star className="w-3 h-3" fill={tab.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleClose}
                className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="关闭标签"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
