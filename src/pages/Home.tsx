import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import MainContent from '@/components/MainContent';
import { useTabStore } from '@/store/useTabStore';

export default function Home() {
  const { loadTabs, loadRecentlyClosed, loadFavorites } = useTabStore();

  useEffect(() => {
    loadTabs();
    loadRecentlyClosed();
    loadFavorites();
  }, [loadTabs, loadRecentlyClosed, loadFavorites]);

  return (
    <div className="h-[600px] w-[720px] flex overflow-hidden relative">
      <div className="bg-orb w-72 h-72 bg-neon-cyan/20 -top-36 -left-36" />
      <div className="bg-orb w-64 h-64 bg-neon-purple/20 top-1/3 -right-32" />

      <div className="relative z-10 flex w-full h-full">
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <SearchBar />
          <MainContent />
        </main>
      </div>
    </div>
  );
}
