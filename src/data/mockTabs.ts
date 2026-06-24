import type { TabItem, TabGroup } from '@/types';

const websites = [
  { domain: 'github.com', title: 'GitHub', icon: 'https://github.com/favicon.ico' },
  { domain: 'stackoverflow.com', title: 'Stack Overflow', icon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico' },
  { domain: 'google.com', title: 'Google', icon: 'https://www.google.com/favicon.ico' },
  { domain: 'youtube.com', title: 'YouTube', icon: 'https://www.youtube.com/favicon.ico' },
  { domain: 'zhihu.com', title: '知乎', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
  { domain: 'bilibili.com', title: '哔哩哔哩', icon: 'https://www.bilibili.com/favicon.ico' },
  { domain: 'developer.mozilla.org', title: 'MDN Web Docs', icon: 'https://developer.mozilla.org/favicon.ico' },
  { domain: 'react.dev', title: 'React', icon: 'https://react.dev/favicon.ico' },
  { domain: 'vitejs.dev', title: 'Vite', icon: 'https://vitejs.dev/favicon.ico' },
  { domain: 'tailwindcss.com', title: 'Tailwind CSS', icon: 'https://tailwindcss.com/favicons/favicon.ico' },
  { domain: 'npmjs.com', title: 'npm', icon: 'https://static.npmjs.com/attachments/ck3uwesd0c5yb8874yugm6h6y-logo-square-light-bg.svg' },
  { domain: 'figma.com', title: 'Figma', icon: 'https://static.figma.com/app/icon/1/favicon.png' },
  { domain: 'notion.so', title: 'Notion', icon: 'https://www.notion.so/images/favicon.ico' },
  { domain: 'medium.com', title: 'Medium', icon: 'https://cdn-static-1.medium.com/_/fp/icons/Medium-Avatar-500x500.svg' },
  { domain: 'juejin.cn', title: '掘金', icon: 'https://juejin.cn/favicon.ico' },
  { domain: 'csdn.net', title: 'CSDN', icon: 'https://csdnimg.cn/favicon.ico' },
  { domain: 'leetcode.cn', title: '力扣', icon: 'https://leetcode.cn/favicon.ico' },
  { domain: 'vercel.com', title: 'Vercel', icon: 'https://assets.vercel.com/image/upload/q_auto/front/favicon/vercel/favicon.ico' },
  { domain: 'typescriptlang.org', title: 'TypeScript', icon: 'https://www.typescriptlang.org/favicon.ico' },
  { domain: 'nodejs.org', title: 'Node.js', icon: 'https://nodejs.org/static/favicon.ico' },
];

const tabTitles: Record<string, string[]> = {
  'github.com': [
    'facebook/react: The library for web and native user interfaces',
    'vitejs/vite: Next generation frontend tooling',
    'tailwindlabs/tailwindcss: A utility-first CSS framework',
    'vercel/next.js: The React Framework',
    'microsoft/vscode: Visual Studio Code',
    'facebook/create-react-app',
    'DefinitelyTyped/DefinitelyTyped',
    'axios/axios: Promise based HTTP client',
    'expressjs/express: Fast, unopinionated minimalist web framework',
    'nodejs/node: Node.js JavaScript runtime',
  ],
  'stackoverflow.com': [
    'javascript - How to use useState hook in React?',
    'css - Flexbox vs Grid: when to use which?',
    'typescript - Interface vs Type alias',
    'reactjs - useEffect cleanup function best practices',
    'node.js - How to handle async errors properly?',
    'html - Semantic HTML5 elements guide',
    'javascript - Promises vs async/await',
  ],
  'google.com': [
    'Google Search',
    'Gmail',
    'Google Drive',
    'Google Calendar',
    'Google Photos',
  ],
  'youtube.com': [
    'React Tutorial for Beginners 2024',
    'Build a Full Stack App with Next.js 14',
    'TypeScript Crash Course - Learn TypeScript',
    'Tailwind CSS Full Course for Beginners',
    'Advanced JavaScript Concepts',
    'CSS Grid Layout Tutorial',
    'Node.js Express Tutorial',
  ],
  'zhihu.com': [
    '2024年前端开发趋势有哪些？',
    '如何系统学习React？',
    'TypeScript真的有必要吗？',
    '程序员如何保持竞争力？',
    '有哪些值得推荐的前端博客？',
    'Vite和Webpack的区别是什么？',
  ],
  'bilibili.com': [
    '【前端】Vue3+TypeScript实战教程',
    'React18新特性详解',
    '一口气学完CSS Grid布局',
    '面试官系列：前端高频面试题',
    '从零搭建个人博客网站',
  ],
  'developer.mozilla.org': [
    'MDN Web Docs - JavaScript',
    'CSS: Cascading Style Sheets | MDN',
    'HTML: HyperText Markup Language | MDN',
    'Web APIs | MDN',
    'React - MDN Web Docs Glossary',
  ],
  'react.dev': [
    'React 官方文档 - 学习 React',
    'useState – React',
    'useEffect – React',
    'useRef – React',
    'React Server Components',
  ],
  'vitejs.dev': [
    'Vite 中文文档',
    '配置 Vite',
    '插件 API',
    '命令行界面',
  ],
  'tailwindcss.com': [
    'Tailwind CSS - Rapidly build modern websites',
    'Installation - Tailwind CSS',
    'Core Concepts - Tailwind CSS',
    'Customization - Tailwind CSS',
  ],
  'npmjs.com': [
    'npm: The package manager for JavaScript',
    'react - npm',
    'typescript - npm',
    'lodash - npm',
    'dayjs - npm',
  ],
  'figma.com': [
    '设计系统 - Figma',
    'UI组件库',
    '产品原型设计',
    '图标库',
  ],
  'notion.so': [
    '我的工作空间 - Notion',
    '项目管理模板',
    '读书笔记',
    '待办事项清单',
    '知识库',
  ],
  'medium.com': [
    'Why I switched from Vue to React',
    'The Future of Web Development in 2024',
    'Understanding JavaScript Closures',
    'Building Scalable React Applications',
  ],
  'juejin.cn': [
    '2024前端面试题汇总',
    '深入理解JavaScript事件循环',
    'React性能优化完全指南',
    '从零实现一个简易版Webpack',
    'CSS进阶：你不知道的选择器',
    'Vue3组合式API最佳实践',
  ],
  'csdn.net': [
    'React18+TypeScript项目实战',
    '前端工程化：Webpack5配置详解',
    'Node.js后端开发入门教程',
    '微信小程序开发全攻略',
  ],
  'leetcode.cn': [
    '力扣 (LeetCode) 官网',
    '两数之和 - 力扣',
    '反转链表 - 力扣',
    '二叉树遍历 - 力扣',
    '动态规划入门 - 力扣',
  ],
  'vercel.com': [
    'Vercel: Build and deploy the best web experiences',
    'Dashboard - Vercel',
    'Deployments - Vercel',
  ],
  'typescriptlang.org': [
    'TypeScript: JavaScript With Syntax For Types',
    'Documentation - TypeScript',
    'TypeScript Playground',
  ],
  'nodejs.org': [
    'Node.js — Run JavaScript Everywhere',
    'API Reference Documentation',
    'About Node.js',
  ],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockTabs(): TabItem[] {
  const tabs: TabItem[] = [];
  const now = Date.now();

  websites.forEach((site) => {
    const titles = tabTitles[site.domain] || [site.title];
    const count = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < count; i++) {
      const title = titles[i % titles.length];
      const path = generateId().slice(0, 6);
      tabs.push({
        id: generateId(),
        title,
        url: `https://${site.domain}/${path}`,
        domain: site.domain,
        favicon: site.icon,
        isActive: false,
        isPinned: Math.random() > 0.85,
        isFavorite: Math.random() > 0.75,
        createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
        lastAccessed: now - Math.random() * 24 * 60 * 60 * 1000,
      });
    }
  });

  tabs[0].isActive = true;

  tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);

  return tabs;
}

function generateMockGroups(): TabGroup[] {
  return [
    {
      id: 'group-work',
      name: '工作项目',
      color: '#00f5ff',
      isExpanded: true,
    },
    {
      id: 'group-learning',
      name: '学习资料',
      color: '#a855f7',
      isExpanded: true,
    },
    {
      id: 'group-entertainment',
      name: '娱乐休闲',
      color: '#f472b6',
      isExpanded: false,
    },
  ];
}

export const mockTabs = generateMockTabs();
export const mockGroups = generateMockGroups();

export function generateRecentlyClosedTabs(count: number = 8): TabItem[] {
  const closedTabs: TabItem[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const site = getRandomItem(websites);
    const titles = tabTitles[site.domain] || [site.title];
    closedTabs.push({
      id: generateId(),
      title: getRandomItem(titles),
      url: `https://${site.domain}/closed-${i}`,
      domain: site.domain,
      favicon: site.icon,
      isActive: false,
      isPinned: false,
      isFavorite: false,
      createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
      lastAccessed: now - (i * 30 + Math.random() * 30) * 60 * 1000,
    });
  }

  return closedTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
}
