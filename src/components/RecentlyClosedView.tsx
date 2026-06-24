import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import { formatTimeAgo } from '@/lib/utils';

export default function RecentlyClosedView() {
  const { recentlyClosed, restoreTab, clearRecentlyClosed } = useTabStore();

  if (recentlyClosed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Clock className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">最近没有关闭的标签页</p>
        <p className="text-sm mt-1 text-gray-600">关闭的标签页会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">最近关闭</h2>
        <button
          onClick={clearRecentlyClosed}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          清空全部
        </button>
      </div>

      <div className="space-y-2">
        {recentlyClosed.map((tab, index) => (
          <div
            key={tab.id}
            className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:border-white/20 transition-all duration-300"
            style={{
              animation: `slideUp 0.3s ease-out ${index * 50}ms both`,
            }}
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={tab.favicon}
                alt=""
                className="w-5 h-5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>';
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">{tab.title}</h3>
              <p className="text-xs text-gray-500 truncate">{tab.domain}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">
                {formatTimeAgo(tab.lastAccessed)}
              </span>
              <button
                onClick={() => restoreTab(tab.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors opacity-0 group-hover:opacity-100"
                title="恢复标签"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
