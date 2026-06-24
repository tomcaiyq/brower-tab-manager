import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import { formatTimeAgo } from '@/lib/utils';

export default function RecentlyClosedView() {
  const { recentlyClosed, restoreTab, clearRecentlyClosed } = useTabStore();

  if (recentlyClosed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Clock className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">最近没有关闭的标签页</p>
        <p className="text-xs mt-1 text-gray-600">关闭的标签页会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">最近关闭</h2>
        <button
          onClick={() => clearRecentlyClosed()}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          清空全部
        </button>
      </div>

      <div className="space-y-1.5">
        {recentlyClosed.map((tab, index) => (
          <div
            key={`${tab.id}-${index}`}
            className="glass-card rounded-lg p-2.5 flex items-center gap-2.5 group hover:border-white/20 transition-all duration-300"
            style={{
              animation: `slideUp 0.3s ease-out ${index * 30}ms both`,
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {tab.favicon ? (
                <img
                  src={tab.favicon}
                  alt=""
                  className="w-3.5 h-3.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-[10px] text-gray-500">{tab.domain[0]?.toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-white truncate">{tab.title}</h3>
              <p className="text-[10px] text-gray-500 truncate">{tab.domain}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600">
                {formatTimeAgo(tab.closedAt || tab.lastAccessed)}
              </span>
              <button
                onClick={() => restoreTab(tab)}
                className="p-1.5 rounded-md text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors opacity-0 group-hover:opacity-100"
                title="恢复标签"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
