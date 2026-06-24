import { Star } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import TabList from './TabList';

export default function FavoritesView() {
  const getFavoriteTabs = useTabStore((s) => s.getFavoriteTabs);
  const favoriteTabs = getFavoriteTabs();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center">
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">收藏夹</h2>
          <p className="text-[10px] text-gray-500">{favoriteTabs.length} 个收藏的标签页</p>
        </div>
      </div>

      <TabList tabs={favoriteTabs} emptyMessage="还没有收藏的标签页" />
    </div>
  );
}
