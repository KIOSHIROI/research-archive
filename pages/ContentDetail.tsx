import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { getContentBySlug, THEMES } from '../services/data';
import { ContentType } from '../types';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ContentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = getContentBySlug(slug || '');
  const { lang, t } = useLanguage();

  // Reset scroll on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!item) {
    return <Navigate to="/" replace />;
  }

  const theme = THEMES.find(t => t.id === item.themeId);

  // Simple renderer
  const renderPseudoMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimLine = line.trim();
      if (trimLine.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-12 mb-6 border-b border-stone-100 dark:border-stone-800 pb-2 transition-colors">{trimLine.replace('## ', '')}</h2>;
      }
      if (trimLine.startsWith('$$')) {
        return (
            <div key={idx} className="my-8 py-4 bg-stone-50 dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800 overflow-x-auto text-center font-mono text-stone-700 dark:text-stone-300 text-sm transition-colors">
                {trimLine.replace(/\$\$/g, '')}
            </div>
        )
      }
      if (trimLine.startsWith('1. ')) {
        return <li key={idx} className="ml-4 list-decimal pl-4 mb-3 text-stone-700 dark:text-stone-300 marker:text-stone-400 dark:marker:text-stone-600">{trimLine.replace('1. ', '')}</li>;
      }
      if (trimLine === '') return <br key={idx} />;
      
      const codeBlockMatch = trimLine.match(/^```(.*)/);
      if (codeBlockMatch) return null; // Very basic skip for start
      if (trimLine === '```') return null; // Very basic skip for end

      // Inline code
      const parts = trimLine.split('`');
      if (parts.length > 1) {
          return (
              <p key={idx} className="mb-4 text-stone-700 dark:text-stone-300 leading-8">
                  {parts.map((part, i) => i % 2 === 1 ? <code key={i} className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded text-xs font-mono border border-stone-200 dark:border-stone-700 mx-0.5">{part}</code> : part)}
              </p>
          )
      }

      return <p key={idx} className="mb-5 text-stone-700 dark:text-stone-300 leading-8 text-[1.05rem]">{trimLine}</p>;
    });
  };

  return (
    <article className="fade-in max-w-3xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 mb-10 font-mono tracking-wide">
        <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300 uppercase transition-colors">Index</Link> 
        <span>/</span>
        <Link to="/topics" className="hover:text-stone-600 dark:hover:text-stone-300 uppercase transition-colors">{theme?.title[lang] || 'Theme'}</Link>
        <span>/</span>
        <span className="text-stone-600 dark:text-stone-400 uppercase">{item.id}</span>
      </div>

      {/* Header */}
      <header className="mb-16">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-8 leading-tight transition-colors">
          {item.title[lang]}
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8 border-t border-stone-200 dark:border-stone-800 pt-6 transition-colors">
           <div className="flex-1">
               <span className="text-xs font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase block mb-2">Abstract</span>
               <div className="text-stone-600 dark:text-stone-300 italic text-lg font-serif leading-relaxed transition-colors">
                 {item.abstract[lang]}
               </div>
           </div>
           
           <div className="w-full md:w-48 shrink-0 flex flex-col gap-4 text-xs font-mono text-stone-500 dark:text-stone-400">
               <div>
                   <span className="block text-stone-400 dark:text-stone-600 mb-1">Date</span>
                   {item.date}
               </div>
               {item.metadata?.journal && (
                   <div>
                       <span className="block text-stone-400 dark:text-stone-600 mb-1">{t('meta.journal')}</span>
                       {item.metadata.journal}
                   </div>
               )}
                {item.metadata?.techStack && (
                   <div>
                       <span className="block text-stone-400 dark:text-stone-600 mb-1">Tech</span>
                       {item.metadata.techStack.join(', ')}
                   </div>
               )}
           </div>
        </div>

        {/* Action Buttons */}
        {item.type === ContentType.PROJECT && item.metadata?.repoUrl && (
          <div className="mt-8">
            <a href={`https://${item.metadata.repoUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-300 text-white dark:text-stone-900 text-sm font-medium rounded-sm transition-colors">
              <GitBranch size={16} />
              {t('meta.code')}
            </a>
          </div>
        )}
      </header>

      {/* Hero Image */}
      {item.coverImage && (
          <figure className="mb-16 -mx-0 md:-mx-12">
              <img src={item.coverImage} alt="Figure 1" className="w-full h-auto border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900" />
              <figcaption className="text-center text-xs text-stone-400 dark:text-stone-500 mt-3 font-mono">Figure 1: Visualization of the core concept.</figcaption>
          </figure>
      )}

      {/* Body Content */}
      <div className="prose-academic pb-12">
        {item.content && renderPseudoMarkdown(item.content[lang])}
      </div>

      {/* Footer / Context */}
      <hr className="my-12 border-stone-200 dark:border-stone-800" />
      <div className="flex justify-between items-center">
        <Link to={item.type === ContentType.PROJECT ? "/projects" : "/topics"} className="group inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {item.type === ContentType.PROJECT ? t('back.artifacts') : t('back.topics')}
        </Link>
      </div>
    </article>
  );
};

export default ContentDetail;