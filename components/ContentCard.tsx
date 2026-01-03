
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentItem, ContentType } from '../types';
import { ArrowUpRight, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ContentCardProps {
  item: ContentItem;
  showTheme?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const isProject = item.type === ContentType.PROJECT;
  const notionUrl = item.metadata?.notionUrl;
  const linkPath = isProject ? `/projects/${item.slug}` : `/articles/${item.slug}`;
  const { lang, t } = useLanguage();

  return (
    <article className="group mb-12 relative pl-0 md:pl-6 border-l-2 border-transparent hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-500">
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
        <Link to={linkPath} className="block group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug font-serif flex items-center gap-2">
            {item.title[lang]}
            {isProject && (
              <span className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300">
                <ArrowUpRight size={14} />
              </span>
            )}
            {notionUrl && (
              <span className="text-blue-500/50 group-hover:text-blue-500 transition-colors" title="External Notion Document">
                <Share2 size={14} />
              </span>
            )}
          </h3>
        </Link>
        <span className="text-xs text-stone-400 dark:text-stone-500 font-mono shrink-0 md:ml-4 mt-1 md:mt-0 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors">
          {item.date.split('-')[0]}
        </span>
      </div>

      <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-2xl mt-2 line-clamp-3 group-hover:text-stone-800 dark:group-hover:text-stone-300 transition-colors duration-500">
        {item.abstract[lang]}
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-stone-400 dark:text-stone-600 uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">
         <span className={`${notionUrl ? 'text-blue-500' : 'text-stone-500 dark:text-stone-500'}`}>
            {notionUrl ? 'Notion Lab' : (isProject ? t('label.artifact') : t('label.article'))}
         </span>
         {item.metadata?.journal && (
           <>
             <span className="select-none text-stone-300 dark:text-stone-700">•</span>
             <span>{item.metadata.journal}</span>
           </>
         )}
         {item.metadata?.techStack && (
            <>
             <span className="select-none text-stone-300 dark:text-stone-700">•</span>
             <span>{item.metadata.techStack[0]}</span>
            </>
         )}
      </div>
    </article>
  );
};
