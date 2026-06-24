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

  const isExpanded = (domain: string) => expandedDomains[domain] !== false;

  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Globe2 className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">没有找到相关域名</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {domains.map((domain, domainIndex) => {
        const tabs = tabsByDomain[domain];
        const expanded = isExpanded(domain);

        return (
          <div
            key={domain}
            className="glass-card rounded-xl overflow-hidden"
            style={{
              animation: `slideUp 0.3s ease-out ${domainIndex * 50}ms both`,
            }}
          >
            <button
              onClick={() => toggleDomain(domain)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
                <Globe2 className="w-3.5 h-3.5 text-neon-cyan" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="text-xs font-semibold text-white truncate">{domain}</h3>
                <p className="text-[10px] text-gray-500">{tabs.length} 个标签页</p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform duration-300',
                  expanded ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>

            {expanded && (
              <div className="px-3 pb-3 pt-0.5 grid grid-cols-2 gap-2 animate-fade-in">
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
