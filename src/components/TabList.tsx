import TabCard from './TabCard';
import type { TabItem } from '@/types';
import { useTabStore } from '@/store/useTabStore';
import { Inbox } from 'lucide-react';

interface TabListProps {
  tabs: TabItem[];
  emptyMessage?: string;
}

export default function TabList({ tabs, emptyMessage = '暂无标签页' }: TabListProps) {
  const searchQuery = useTabStore((s) => s.searchQuery);

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Inbox className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">{emptyMessage}</p>
        <p className="text-sm mt-1 text-gray-600">尝试调整搜索条件或视图</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {tabs.map((tab, index) => (
        <TabCard key={tab.id} tab={tab} index={index} highlightText={searchQuery} />
      ))}
    </div>
  );
}
