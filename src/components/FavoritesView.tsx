import { Star } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import TabList from './TabList';

export default function FavoritesView() {
  const getFavoriteTabs = useTabStore((s) => s.getFavoriteTabs);
  const favoriteTabs = getFavoriteTabs();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center">
          <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">收藏夹</h2>
          <p className="text-sm text-gray-500">{favoriteTabs.length} 个收藏的标签页</p>
        </div>
      </div>

      <TabList
        tabs={favoriteTabs}
        emptyMessage="还没有收藏的标签页"
      />
    </div>
  );
}
