
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllContent, useThemes } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, FileText, Archive, Hash, ArrowRight } from 'lucide-react';
import { ContentType } from '../types';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const navigate = useNavigate();
  const content = useAllContent();
  const themes = useThemes();
  const { lang, t } = useLanguage();

  // Toggle logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search Logic
  const results = useMemo(() => {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    
    // Search Content
    const matchedContent = content.filter(item => 
      item.title[lang].toLowerCase().includes(lowerQuery) || 
      item.slug.includes(lowerQuery)
    ).map(item => ({
      id: item.id,
      title: item.title[lang],
      type: item.type === ContentType.PROJECT ? 'Project' : 'Article',
      path: item.type === ContentType.PROJECT ? `/projects/${item.slug}` : `/articles/${item.slug}`,
      icon: item.type === ContentType.PROJECT ? Archive : FileText
    }));

    // Search Themes
    const matchedThemes = themes.filter(theme => 
      theme.title[lang].toLowerCase().includes(lowerQuery)
    ).map(theme => ({
      id: theme.id,
      title: theme.title[lang],
      type: 'Theme',
      path: `/topics#${theme.id}`,
      icon: Hash
    }));

    return [...matchedThemes, ...matchedContent].slice(0, 8);
  }, [query, content, themes, lang]);

  // Navigation Logic
  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Arrow key navigation inside palette
  useEffect(() => {
    if (!isOpen) return;
    const handleNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelect(results[activeIndex].path);
      }
    };
    window.addEventListener('keydown', handleNav);
    return () => window.removeEventListener('keydown', handleNav);
  }, [isOpen, results, activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-stone-900/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      
      <div className="relative w-full max-w-xl bg-white dark:bg-ink-900 rounded-lg shadow-2xl border border-stone-200 dark:border-ink-800 overflow-hidden animate-fade-in-up">
        <div className="flex items-center px-4 border-b border-stone-100 dark:border-ink-800">
          <Search className="text-stone-400" size={20} />
          <input 
            autoFocus
            className="w-full py-4 px-4 text-lg bg-transparent outline-none text-stone-800 dark:text-stone-100 placeholder-stone-400 font-sans"
            placeholder={lang === 'en' ? "Search research, themes, code..." : "搜索研究、主题、代码..."}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="text-xs font-mono text-stone-400 border border-stone-200 dark:border-ink-700 px-1.5 py-0.5 rounded">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && query && (
             <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm">
                No results found.
             </div>
          )}
          {results.length === 0 && !query && (
              <div className="py-8 px-8">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Suggested</div>
                  <div className="flex gap-2">
                      <button onClick={() => handleSelect('/topics')} className="text-xs bg-stone-100 dark:bg-ink-800 px-3 py-1.5 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-ink-700 transition-colors">Research Map</button>
                      <button onClick={() => handleSelect('/projects')} className="text-xs bg-stone-100 dark:bg-ink-800 px-3 py-1.5 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-ink-700 transition-colors">Artifacts</button>
                  </div>
              </div>
          )}

          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(result.path)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                idx === activeIndex 
                  ? 'bg-stone-100 dark:bg-ink-800' 
                  : 'hover:bg-stone-50 dark:hover:bg-ink-800/50'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <result.icon size={16} className={`shrink-0 ${idx === activeIndex ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'}`} />
                <div className="truncate">
                    <div className={`text-sm font-medium ${idx === activeIndex ? 'text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}`}>
                        {result.title}
                    </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400">{result.type}</span>
                  {idx === activeIndex && <ArrowRight size={14} className="text-stone-400" />}
              </div>
            </button>
          ))}
        </div>
        
        {results.length > 0 && (
            <div className="px-4 py-2 bg-stone-50 dark:bg-ink-950 border-t border-stone-100 dark:border-ink-800 text-[10px] text-stone-400 flex justify-between">
                <span>Navigate with <span className="font-mono">↑↓</span></span>
                <span>Select with <span className="font-mono">↵</span></span>
            </div>
        )}
      </div>
    </div>
  );
};
