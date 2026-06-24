import { X, Star, Pin, ExternalLink } from 'lucide-react';
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
  const { activateTab, closeTab, toggleFavorite, togglePin, selectedTabId } = useTabStore();
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

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(tab.id);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <mark className="bg-neon-cyan/30 text-neon-cyan rounded px-0.5">
          {text.slice(index, index + query.length)}
        </mark>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative p-4 rounded-xl cursor-pointer transition-all duration-300 glass-card group',
        'hover:border-neon-cyan/30 hover:shadow-[0_4px_24px_rgba(0,245,255,0.12)]',
        'hover:-translate-y-0.5',
        isSelected && 'border-neon-cyan/50 bg-neon-cyan/5 shadow-[0_0_20px_rgba(0,245,255,0.15)]',
        tab.isActive && 'border-neon-purple/40'
      )}
      style={{
        animation: `slideUp 0.4s ease-out ${Math.min(index * 30, 300)}ms both`,
      }}
    >
      {tab.isActive && (
        <div className="absolute -left-px top-3 bottom-3 w-0.5 bg-gradient-to-b from-neon-cyan to-neon-purple rounded-full" />
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={tab.favicon}
            alt=""
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-white truncate flex-1">
              {highlightMatch(tab.title, highlightText || '')}
            </h3>
            {tab.isPinned && (
              <Pin className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" fill="currentColor" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mb-2">
            {highlightMatch(tab.domain, highlightText || '')}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {formatTimeAgo(tab.lastAccessed)}
            </span>
            <div
              className={cn(
                'flex items-center gap-1 transition-opacity duration-200',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <button
                onClick={handlePin}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  tab.isPinned
                    ? 'text-neon-cyan bg-neon-cyan/10'
                    : 'text-gray-500 hover:text-white hover:bg-white/10'
                )}
                title={tab.isPinned ? '取消固定' : '固定标签'}
              >
                <Pin className="w-3.5 h-3.5" fill={tab.isPinned ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleFavorite}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  tab.isFavorite
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10'
                )}
                title={tab.isFavorite ? '取消收藏' : '收藏'}
              >
                <Star className="w-3.5 h-3.5" fill={tab.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="关闭标签"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isHovered && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
        </div>
      )}
    </div>
  );
}
