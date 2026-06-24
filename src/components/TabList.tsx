import TabCard from './TabCard';
import type { TabItem } from '@/types';
import { useTabStore } from '@/store/useTabStore';
import { Inbox, Loader2 } from 'lucide-react';

interface TabListProps {
  tabs: TabItem[];
  emptyMessage?: string;
}

export default function TabList({ tabs, emptyMessage = '暂无标签页' }: TabListProps) {
  const searchQuery = useTabStore((s) => s.searchQuery);
  const loading = useTabStore((s) => s.loading);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 mb-3 text-neon-cyan animate-spin" />
        <p className="text-sm">加载标签页中...</p>
      </div>
    );
  }

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Inbox className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">{emptyMessage}</p>
        <p className="text-xs mt-1 text-gray-600">尝试调整搜索条件或视图</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {tabs.map((tab, index) => (
        <TabCard key={tab.id} tab={tab} index={index} highlightText={searchQuery} />
      ))}
    </div>
  );
}
