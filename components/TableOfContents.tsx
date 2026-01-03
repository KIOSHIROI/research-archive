
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string; // Used as a dependency trigger to re-scan
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const { lang } = useLanguage();

  // 1. Scan the DOM for actual headings rendered by Markdown
  // This ensures IDs match exactly (handling Unicode/Chinese correctly via rehype-slug)
  useEffect(() => {
    // Small delay to allow MarkdownRenderer to paint
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('.prose-academic h2, .prose-academic h3'));
      const headingData = elements.map((el) => ({
        id: el.id,
        text: el.textContent || '',
        level: Number(el.tagName.substring(1)), // h2 -> 2, h3 -> 3
      }));
      setHeadings(headingData);
    }, 150);

    return () => clearTimeout(timer);
  }, [content]);

  // 2. Intersection Observer for Scroll Spy
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        // Trigger when the heading enters the top 20% of the screen
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1
      }
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
      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 transition-colors">
        {lang === 'en' ? 'On this page' : '目录'}
      </h4>
      <ul className="space-y-3 relative">
         {/* Active Indicator Line (Optional visual flair) */}
         <div 
            className="absolute left-[-33px] w-[2px] bg-stone-900 dark:bg-stone-100 transition-all duration-300 ease-out h-4"
            style={{ 
                top: headings.findIndex(h => h.id === activeId) !== -1 
                     ? `${headings.findIndex(h => h.id === activeId) * 28}px` // Approx height based on leading-snug + margin
                     : '0px',
                opacity: activeId ? 1 : 0
            }}
         />

        {headings.map((heading) => (
          <li key={heading.id} className={`${heading.level === 3 ? 'pl-4' : ''}`}>
            <a
              href={`#${heading.id}`}
              className={`block text-xs transition-colors duration-300 leading-snug ${
                activeId === heading.id
                  ? 'text-stone-900 dark:text-stone-100 font-bold'
                  : 'text-stone-500 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                // Immediately set active to avoid lag
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
