import { useState } from 'react';
import { ChevronDown, Globe2 } from 'lucide-react';
import { useTabStore } from '@/store/useTabStore';
import TabCard from './TabCard';
import { cn } from '@/lib/utils';

export default function DomainGroupView() {
  const getTabsByDomain = useTabStore((s) => s.getTabsByDomain);
  const searchQuery = useTabStore((s) => s.searchQuery);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

  const tabsByDomain = getTabsByDomain();
  const domains = Object.keys(tabsByDomain).sort();

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: prev[domain] === undefined ? false : !prev[domain],
    }));
  };

  const isExpanded = (domain: string) => {
    return expandedDomains[domain] !== false;
  };

  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Globe2 className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">没有找到相关域名</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {domains.map((domain, domainIndex) => {
        const tabs = tabsByDomain[domain];
        const expanded = isExpanded(domain);

        return (
          <div
            key={domain}
            className="glass-card rounded-2xl overflow-hidden"
            style={{
              animation: `slideUp 0.4s ease-out ${domainIndex * 100}ms both`,
            }}
          >
            <button
              onClick={() => toggleDomain(domain)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                <Globe2 className="w-4 h-4 text-neon-cyan" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm font-semibold text-white">{domain}</h3>
                <p className="text-xs text-gray-500">{tabs.length} 个标签页</p>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-400 transition-transform duration-300',
                  expanded ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>

            {expanded && (
              <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 animate-fade-in">
                {tabs.map((tab, index) => (
                  <TabCard
                    key={tab.id}
                    tab={tab}
                    index={index}
                    highlightText={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
