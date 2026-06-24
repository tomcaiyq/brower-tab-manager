import { useTabStore } from '@/store/useTabStore';
import TabList from './TabList';
import DomainGroupView from './DomainGroupView';
import FavoritesView from './FavoritesView';
import RecentlyClosedView from './RecentlyClosedView';

export default function MainContent() {
  const { activeView, getFilteredTabs } = useTabStore();
  const filteredTabs = getFilteredTabs();

  const renderContent = () => {
    switch (activeView) {
      case 'groups':
        return <DomainGroupView />;
      case 'favorites':
        return <FavoritesView />;
      case 'recent':
        return <RecentlyClosedView />;
      case 'all':
      default:
        return <TabList tabs={filteredTabs} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {renderContent()}
    </div>
  );
}
