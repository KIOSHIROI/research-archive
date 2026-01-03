
import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useContentBySlug, useThemes } from '../contexts/ContentContext';
import { ContentType } from '../types';
import { ArrowLeft, GitBranch, ExternalLink, Share2, Maximize2, Monitor } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { CitationBlock } from '../components/CitationBlock';

const ContentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = useContentBySlug(slug || '');
  const themes = useThemes();
  const { lang, t } = useLanguage();

  // Reset scroll on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!item) {
    return <Navigate to="/" replace />;
  }

  const theme = themes.find(t => t.id === item.themeId);
  const isProject = item.type === ContentType.PROJECT;
  const notionUrl = item.metadata?.notionUrl;

  return (
    <>
      <article className="fade-in mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 mb-10 font-mono tracking-wide no-print px-4 md:px-0">
          <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300 uppercase transition-colors">Index</Link> 
          <span>/</span>
          <Link to="/topics" className="hover:text-stone-600 dark:hover:text-stone-300 uppercase transition-colors">{theme?.title[lang] || 'Theme'}</Link>
          <span>/</span>
          <span className="text-stone-600 dark:text-stone-400 uppercase">{item.id}</span>
        </div>

        {/* Header Area */}
        <header className="max-w-4xl mx-auto mb-16 px-4 md:px-0">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-8 leading-tight transition-colors">
            {item.title[lang]}
          </h1>
          
          <div className={`
              p-6 rounded-sm grid grid-cols-1 ${isProject || notionUrl ? 'md:grid-cols-2' : ''} gap-8 font-mono text-sm
              ${(isProject || notionUrl) ? 'bg-stone-50 dark:bg-ink-900 border border-stone-200 dark:border-ink-800' : 'border-t border-stone-200 dark:border-stone-800 pt-6'}
          `}>
              <div className="space-y-4">
                  <div>
                      <div className="text-[10px] uppercase text-stone-400 tracking-widest mb-1">Abstract</div>
                      <div className="text-stone-700 dark:text-stone-300 italic leading-relaxed">{item.abstract[lang]}</div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {item.metadata?.repoUrl && (
                        <a href={`https://${item.metadata.repoUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-900 dark:text-stone-100 hover:underline">
                            <GitBranch size={14} /> Repository
                        </a>
                    )}
                    {notionUrl && (
                        <a href={notionUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                            <ExternalLink size={14} /> View Original
                        </a>
                    )}
                     {!isProject && !notionUrl && item.metadata?.journal && (
                         <div className="text-stone-500">
                             <span className="text-stone-400 uppercase text-[10px] block mb-1">Published In</span>
                             {item.metadata.journal}
                         </div>
                     )}
                  </div>
              </div>

              {(isProject || notionUrl) && (
                  <div className="space-y-2 border-t md:border-t-0 md:border-l border-stone-200 dark:border-ink-800 pt-4 md:pt-0 md:pl-8">
                      {item.metadata?.techStack && (
                          <div className="grid grid-cols-[80px_1fr] gap-2">
                              <span className="text-stone-400 uppercase text-[10px] pt-0.5">Stack</span>
                              <div className="flex flex-wrap gap-2">
                                  {item.metadata.techStack.map(t => (
                                      <span key={t} className="px-1.5 py-0.5 bg-stone-200 dark:bg-ink-800 rounded-sm text-[11px] text-stone-700 dark:text-stone-300">{t}</span>
                                  ))}
                              </div>
                          </div>
                      )}
                       <div className="grid grid-cols-[80px_1fr] gap-2">
                          <span className="text-stone-400 uppercase text-[10px] pt-0.5">Date</span>
                          <span className="text-stone-600 dark:text-stone-400">{item.date}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                          <span className="text-stone-400 uppercase text-[10px] pt-0.5">Source</span>
                          <span className={`${notionUrl ? 'text-blue-500' : 'text-emerald-500'} flex items-center gap-2`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${notionUrl ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`}></span>
                              {notionUrl ? 'Notion Link' : 'Native Archive'}
                          </span>
                      </div>
                  </div>
              )}
          </div>
        </header>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-4 md:px-0">
            {notionUrl ? (
                /* --- NOTION FALLBACK INTERFACE --- */
                <div className="my-12">
                    <div className="bg-stone-50 dark:bg-ink-900/50 border border-stone-200 dark:border-ink-800 rounded-sm p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Monitor size={28} />
                            </div>
                            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">
                                {lang === 'en' ? 'Open Research Document' : '打开研究文档'}
                            </h2>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 leading-relaxed font-mono">
                                {lang === 'en' 
                                    ? "Due to Notion's security policies, external embedding is restricted. Please click below to view the full research log in a secure environment."
                                    : "由于 Notion 的安全策略限制，外部嵌入受到约束。请点击下方按钮，在安全环境中查看完整的研究日志。"}
                            </p>
                            <a 
                                href={notionUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-6 py-3 rounded-sm font-mono text-xs uppercase tracking-widest hover:bg-stone-700 dark:hover:bg-white transition-all shadow-lg shadow-stone-200 dark:shadow-none"
                            >
                                <Share2 size={14} />
                                {lang === 'en' ? 'Access Document' : '访问文档'}
                            </a>
                        </div>
                    </div>
                    
                    {/* Optional: Show static summary even if it's a Notion link */}
                    <div className="mt-16 prose-academic mx-auto opacity-50 select-none pointer-events-none">
                        <div className="h-4 bg-stone-100 dark:bg-stone-800 w-3/4 mb-4 rounded"></div>
                        <div className="h-4 bg-stone-100 dark:bg-stone-800 w-full mb-4 rounded"></div>
                        <div className="h-4 bg-stone-100 dark:bg-stone-800 w-5/6 mb-4 rounded"></div>
                    </div>
                </div>
            ) : (
                /* --- NATIVE MARKDOWN MODE --- */
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 min-w-0">
                        {item.coverImage && (
                            <figure className="mb-12">
                                <img src={item.coverImage} alt="Figure 1" className="w-full h-auto border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900" />
                                <figcaption className="text-center text-xs text-stone-400 dark:text-stone-500 mt-3 font-mono">Figure 1: {item.title[lang]}</figcaption>
                            </figure>
                        )}
                        <div className="prose-academic pb-12 mx-auto lg:mx-0">
                            {item.content && (
                                <MarkdownRenderer content={item.content[lang]} />
                            )}
                        </div>
                        <CitationBlock item={item} />
                    </div>
                    <div className="hidden lg:block w-64 shrink-0">
                        {item.content && <TableOfContents content={item.content[lang]} />}
                    </div>
                </div>
            )}

            {/* Common Footer */}
            <footer className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 no-print pb-24">
                <div className="flex justify-between items-center">
                    <Link to={item.type === ContentType.PROJECT ? "/projects" : "/topics"} className="group inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {item.type === ContentType.PROJECT ? t('back.artifacts') : t('back.topics')}
                    </Link>
                    <div className="text-[10px] font-mono text-stone-300 dark:text-stone-700 uppercase tracking-widest">
                        Document ID: {item.id}
                    </div>
                </div>
            </footer>
        </div>
      </article>
    </>
  );
};

export default ContentDetail;
