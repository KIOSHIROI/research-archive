
import React, { useState } from 'react';
import { ContentItem } from '../types';
import { useAuthor } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Quote, Check, Copy } from 'lucide-react';

interface CitationBlockProps {
  item: ContentItem;
}

export const CitationBlock: React.FC<CitationBlockProps> = ({ item }) => {
  const author = useAuthor();
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const year = item.date.split('-')[0];
  const url = `${window.location.origin}/#/articles/${item.slug}`;
  const authorNameEn = author.name.en;

  // Generate BibTeX
  const bibtex = `@article{${item.slug.replace(/-/g, '_')}_${year},
  author = {${authorNameEn}},
  title = {${item.title.en}},
  journal = {${item.metadata?.journal || 'Personal Research Archive'}},
  year = {${year}},
  month = {${item.date.split('-')[1]}},
  url = {${url}}
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 no-print">
      <div className="flex items-center gap-2 mb-4 text-stone-400 dark:text-stone-500">
        <Quote size={16} />
        <span className="text-xs font-bold tracking-widest uppercase">
            {lang === 'en' ? 'Cite this work' : '引用本文'}
        </span>
      </div>

      <div className="bg-stone-100 dark:bg-stone-900/50 p-4 rounded-sm border border-stone-200 dark:border-stone-800 relative group">
        <button 
          onClick={handleCopy}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          title="Copy BibTeX"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
        
        <div className="font-mono text-[10px] md:text-xs text-stone-600 dark:text-stone-400 whitespace-pre-wrap leading-relaxed select-all">
          {bibtex}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-stone-500 dark:text-stone-500 italic">
        {lang === 'en' 
            ? `${authorNameEn}. (${year}). "${item.title.en}". ${item.metadata?.journal || 'Personal Research Archive'}.`
            : `${author.name.zh}. (${year}). "${item.title.zh}". ${item.metadata?.journal || '个人研究存档'}.`
        }
      </div>
    </div>
  );
};
