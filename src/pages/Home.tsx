import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import MainContent from '@/components/MainContent';

export default function Home() {
  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      <div className="bg-orb w-96 h-96 bg-neon-cyan/20 -top-48 -left-48" />
      <div className="bg-orb w-80 h-80 bg-neon-purple/20 top-1/4 -right-40" />
      <div className="bg-orb w-72 h-72 bg-blue-500/15 bottom-0 left-1/3" />

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