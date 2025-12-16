
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TableOfContentsProps {
  content: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const { lang } = useLanguage();

  useEffect(() => {
    // Simple regex to parse H2 and H3 from markdown
    const regex = /^(##|###) (.*$)/gm;
    const found: Heading[] = [];
    let match;
    
    // Reset regex index
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      // Generate ID compatible with rehype-slug (lowercase, remove chars, replace spaces with dash)
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
        
      found.push({ id, text, level });
    }
    setHeadings(found);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden lg:block sticky top-32 w-64 self-start pl-8 border-l border-stone-200 dark:border-stone-800">
      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
        {lang === 'en' ? 'On this page' : '目录'}
      </h4>
      <ul className="space-y-3">
        {headings.map((heading) => (
          <li key={heading.id} className={`${heading.level === 3 ? 'pl-4' : ''}`}>
            <a
              href={`#${heading.id}`}
              className={`block text-xs transition-colors duration-300 leading-snug ${
                activeId === heading.id
                  ? 'text-stone-900 dark:text-stone-100 font-medium'
                  : 'text-stone-500 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
