
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useContentBySlug, useThemes } from '../contexts/ContentContext';
import { ContentType } from '../types';
import { ArrowLeft, GitBranch, FileCode, Layers, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { CitationBlock } from '../components/CitationBlock';
import { FadeIn } from '../components/FadeIn';

const ContentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = useContentBySlug(slug || '');
  const themes = useThemes();
  const { lang, t } = useLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!item) {
    return <Navigate to="/" replace />;
  }

  const theme = themes.find(t => t.id === item.themeId);
  const isProject = item.type === ContentType.PROJECT;

  return (
    <>
      {/* 1. Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-stone-900 dark:bg-stone-100 z-50 transition-all duration-100 ease-out" style={{ width: `${scrollProgress * 100}%` }}></div>

      <article className="fade-in mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 mb-10 font-mono tracking-wide no-print px-4 md:px-0">
          <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300 uppercase transition-colors">Index</Link> 
          <span>/</span>
          <Link to="/topics" className="hover:text-stone-600 dark:hover:text-stone-300 uppercase transition-colors">{theme?.title[lang] || 'Theme'}</Link>
          <span>/</span>
          <span className="text-stone-600 dark:text-stone-400 uppercase">{item.id}</span>
        </div>

        {/* 2. Header Area */}
        <header className="max-w-4xl mx-auto mb-16 px-4 md:px-0">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-8 leading-tight transition-colors">
            {item.title[lang]}
          </h1>
          
          {isProject ? (
              // --- PROJECT SPEC SHEET STYLE ---
              <div className="bg-stone-50 dark:bg-ink-900 border border-stone-200 dark:border-ink-800 p-6 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-sm">
                  <div className="space-y-4">
                      <div>
                          <div className="text-[10px] uppercase text-stone-400 tracking-widest mb-1">Abstract</div>
                          <div className="text-stone-700 dark:text-stone-300 italic">{item.abstract[lang]}</div>
                      </div>
                      <div className="flex gap-4">
                        {item.metadata?.repoUrl && (
                            <a href={`https://${item.metadata.repoUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-900 dark:text-stone-100 hover:underline">
                                <GitBranch size={14} /> Repository
                            </a>
                        )}
                         {/* Fake Demo Link for visualization */}
                         <span className="flex items-center gap-2 text-stone-400 cursor-not-allowed">
                            <ExternalLink size={14} /> Live Demo (Offline)
                        </span>
                      </div>
                  </div>
                  <div className="space-y-2 border-t md:border-t-0 md:border-l border-stone-200 dark:border-ink-800 pt-4 md:pt-0 md:pl-8">
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                          <span className="text-stone-400 uppercase text-[10px] pt-0.5">Stack</span>
                          <div className="flex flex-wrap gap-2">
                              {item.metadata?.techStack?.map(t => (
                                  <span key={t} className="px-1.5 py-0.5 bg-stone-200 dark:bg-ink-800 rounded-sm text-[11px] text-stone-700 dark:text-stone-300">{t}</span>
                              ))}
                          </div>
                      </div>
                       <div className="grid grid-cols-[80px_1fr] gap-2">
                          <span className="text-stone-400 uppercase text-[10px] pt-0.5">Date</span>
                          <span className="text-stone-600 dark:text-stone-400">{item.date}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                          <span className="text-stone-400 uppercase text-[10px] pt-0.5">Status</span>
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Archived
                          </span>
                      </div>
                  </div>
              </div>
          ) : (
              // --- STANDARD ACADEMIC HEADER ---
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
                </div>
              </div>
          )}
        </header>

        {/* Hero Image */}
        {item.coverImage && (
            <figure className="max-w-5xl mx-auto mb-16">
                <img src={item.coverImage} alt="Figure 1" className="w-full h-auto border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900" />
                <figcaption className="text-center text-xs text-stone-400 dark:text-stone-500 mt-3 font-mono">Figure 1: {item.title[lang]}</figcaption>
            </figure>
        )}

        {/* 3. Deep Reading Layout (Content + TOC) */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 px-4 md:px-0">
            {/* Main Column */}
            <div className="flex-1 min-w-0">
                <div className="prose-academic pb-12 mx-auto lg:mx-0">
                    {item.content && (
                        <MarkdownRenderer content={item.content[lang]} />
                    )}
                </div>

                {/* Citation Section */}
                <CitationBlock item={item} />

                {/* Footer / Context */}
                <hr className="my-12 border-stone-200 dark:border-stone-800 no-print" />
                <div className="flex justify-between items-center no-print">
                    <Link to={item.type === ContentType.PROJECT ? "/projects" : "/topics"} className="group inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    {item.type === ContentType.PROJECT ? t('back.artifacts') : t('back.topics')}
                    </Link>
                </div>
            </div>

            {/* Sidebar Column (Desktop Only) */}
            <div className="hidden lg:block w-64 shrink-0">
                 {item.content && <TableOfContents content={item.content[lang]} />}
            </div>
        </div>
      </article>
    </>
  );
};

export default ContentDetail;
